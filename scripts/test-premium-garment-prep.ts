/**
 * Unit tests: premium garment prep (FASHN Edit before Try-On).
 * Run: npm run test:premium-garment-prep
 */
import assert from "node:assert/strict";

import {
  buildFashnEditRunBody,
  FASHN_EDIT_MODEL_NAME,
  isPremiumGarmentEditFeatureEnabled,
  shouldRunPremiumGarmentPrep,
} from "../lib/ai/fashnEditSchemas.ts";
import {
  buildFashnGarmentPrepPrompt,
  FASHN_GARMENT_PREP_PROMPT,
} from "../lib/ai/fashnGarmentPrepPrompt.ts";
import { mockLingerieSetOnModelAnalysis } from "../lib/ai/mockLingerieProductAnalysis.ts";
import {
  createGarmentPreparationMaskPng,
  readImageDimensions,
} from "../lib/ai/garmentPreparationMask.ts";
import { resolveTryOnGarmentImageUrl } from "../lib/ai/fashnEditSchemas.ts";

const ORIGINAL = "https://fal.media/original-product.png";
const PREPARED = "https://cdn.fashn.ai/prepared-product.png";

function withEnv(key: string, value: string | undefined, fn: () => void) {
  const prev = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env[key];
    else process.env[key] = prev;
  }
}

function testFashnEditPayload() {
  const prepPrompt = buildFashnGarmentPrepPrompt({
    productAnalysis: mockLingerieSetOnModelAnalysis(),
  }).prompt;
  const body = buildFashnEditRunBody({
    imageUrl: ORIGINAL,
    maskUrl: "https://fal.media/mask.png",
    prompt: prepPrompt,
    resolution: "2k",
    generationMode: "balanced",
    outputFormat: "png",
  });

  assert.equal(body.model_name, FASHN_EDIT_MODEL_NAME);
  assert.equal(body.inputs.image, ORIGINAL);
  assert.equal(body.inputs.mask, "https://fal.media/mask.png");
  assert.match(String(body.inputs.prompt), /TWO-PIECE lingerie set/i);
  assert.equal(body.inputs.resolution, "2k");
  assert.equal(body.inputs.generation_mode, "balanced");
  assert.equal(body.inputs.output_format, "png");
  console.log("[ok] FASHN Edit payload shape");
}

function testFeatureFlagGating() {
  withEnv("AI_PREMIUM_GARMENT_EDIT_ENABLED", undefined, () => {
    assert.equal(isPremiumGarmentEditFeatureEnabled(), false);
    assert.equal(shouldRunPremiumGarmentPrep("premium"), false);
  });
  withEnv("AI_PREMIUM_GARMENT_EDIT_ENABLED", "true", () => {
    assert.equal(isPremiumGarmentEditFeatureEnabled(), true);
    assert.equal(shouldRunPremiumGarmentPrep("premium"), true);
    assert.equal(shouldRunPremiumGarmentPrep("fast"), false);
    assert.equal(shouldRunPremiumGarmentPrep(undefined), false);
  });
  console.log("[ok] feature flag gating");
}

function testTryOnGarmentUrlResolution() {
  withEnv("AI_PREMIUM_GARMENT_EDIT_ENABLED", "true", () => {
    assert.equal(
      resolveTryOnGarmentImageUrl({
        productImageUrl: ORIGINAL,
        preparedGarmentImageUrl: PREPARED,
        garmentPrepMode: "premium",
      }),
      PREPARED
    );
    assert.equal(
      resolveTryOnGarmentImageUrl({
        productImageUrl: ORIGINAL,
        preparedGarmentImageUrl: PREPARED,
        garmentPrepMode: "fast",
      }),
      ORIGINAL
    );
  });
  console.log("[ok] try-on uses prepared garment only in premium+flag");
}

function testMaskPngDimensions() {
  const png = createGarmentPreparationMaskPng(120, 80, {
    strategy: "center_product_zone",
    marginRatio: 0.05,
  });
  assert.ok(png.length > 100);
  const dims = readImageDimensions(png, "image/png");
  assert.equal(dims.width, 120);
  assert.equal(dims.height, 80);
  console.log("[ok] mask PNG encodes expected dimensions");
}

function testFastModeDoesNotRequireEdit() {
  withEnv("AI_PREMIUM_GARMENT_EDIT_ENABLED", "true", () => {
    assert.equal(shouldRunPremiumGarmentPrep("fast"), false);
  });
  console.log("[ok] fast mode skips FASHN Edit");
}

function main() {
  testFashnEditPayload();
  testFeatureFlagGating();
  testTryOnGarmentUrlResolution();
  testMaskPngDimensions();
  testFastModeDoesNotRequireEdit();
  console.log("\nAll premium garment prep unit checks passed.");
}

main();
