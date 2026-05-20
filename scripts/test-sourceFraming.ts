/**
 * Regression checks for `deriveSourceFramingGuidance` and its wiring into
 * productAnalysisForModelGeneration + buildModelGenerationPrompt.
 *
 * Run: `npm run test:source-framing`
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  SOURCE_FRAMING_GUIDANCE_MAX_LEN,
  deriveSourceFramingGuidance,
  type FramingAwareCategoryContext,
} from "../lib/ai/sourceFramingGuidance.ts";
import type { ProductDescriptionAnalysis } from "../lib/ai/productDescriptionAnalysisSchemas.ts";
import { buildModelGenerationPrompt } from "../lib/ai/modelPrompts.ts";
import { MODEL_GENERATION_NO_GARMENT_COPY_RULE } from "../lib/ai/modelIdentityPipeline.ts";
import {
  generateModelRequestSchema,
  type GenerateModelRequest,
} from "../lib/ai/modelGenerationSchemas.ts";
import { productAnalysisForModelGeneration, isSourceProductZoneFramingActive } from "../lib/ai/productAnalysisShared.ts";
import { buildGenerateModelRequestBody } from "../lib/studio/buildGenerateModelRequest.ts";
import { DEFAULT_MODEL_GENERATION_SETTINGS } from "../components/studio/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseAnalysis(
  overrides: Partial<ProductDescriptionAnalysis> = {}
): ProductDescriptionAnalysis {
  return {
    descriptionRu:
      "На фото комплект нижнего белья на модели: чёрный поддерживающий бюстгальтер с широкими бретелями и высокие трусы с бирюзово-зелёным кружевным узором.",
    shortAiSummaryEn:
      "on-model lingerie set, bra + high-waist brief, preserve cup shape, preserve high-waist fit",
    categoryContext: "lingerie",
    productCategory: "auto",
    sourcePresentation: "on-model",
    garmentPhotoType: "model",
    setType: "bra_brief_set",
    baseColor: "black",
    accentColors: ["turquoise", "green"],
    pattern: "floral lace",
    materials: ["lace"],
    bra: {
      present: true,
      style: "supportive bra",
      cupShape: "full cup",
      straps: "wide",
    },
    bottoms: {
      present: true,
      style: "brief",
      rise: "high-waist",
    },
    mustPreserve: [
      "black base color",
      "turquoise-green floral lace pattern",
      "wide bra straps",
      "high-waist brief fit",
    ],
    fitNotes: ["preserve the high-waist silhouette of the briefs"],
    warnings: [],
    confidence: 0.92,
    sourceModel: {
      bodyType: "curvy hourglass",
      sizeClass: "curvy",
      pose: "front-facing standing pose, torso slightly angled",
      poseRu: "стоя, корпус слегка в полуоборот",
      crop: "upper-thigh",
      cameraAngle: "front catalog angle",
      handsPosition: "relaxed at sides",
      framing: "torso through upper thighs",
      bodyVisibility: "head, chest, waist, hips, briefs, upper thighs",
      descriptionRu: "кадр от головы до верхней части бёдер",
      promptEn:
        "Match similar body proportions and pose. Do not copy face or identity. Do not pre-wear the garment.",
    },
    ...overrides,
  };
}

function baseRequest(
  overrides: Partial<GenerateModelRequest> = {}
): GenerateModelRequest {
  return {
    gender: "female",
    bodyType: "curvy",
    modelAge: 25,
    pose: "front",
    crop: "upper-thigh",
    background: "white",
    lighting: "studio",
    categoryContext: "lingerie",
    aspectRatio: "3:4",
    outputFormat: "png",
    resolution: "2K",
    numImages: 1,
    ...overrides,
  } as GenerateModelRequest;
}

function assertContains(
  haystack: string,
  marker: RegExp,
  label: string,
  where: string
) {
  assert.ok(
    marker.test(haystack),
    `[${where}] expected to contain ${label} (${marker})\n--- text ---\n${haystack}\n--------------`
  );
}

function assertAbsent(
  haystack: string,
  marker: RegExp,
  label: string,
  where: string
) {
  assert.ok(
    !marker.test(haystack),
    `[${where}] expected NOT to contain ${label} (${marker})\n--- text ---\n${haystack}\n--------------`
  );
}

const FORBIDDEN_TOKENS: ReadonlyArray<readonly [string, RegExp]> = [
  ["lace", /\blace\b/i],
  ["emerald", /\bemerald\b/i],
  ["turquoise", /\bturquoise\b/i],
  ["floral", /\bfloral\b/i],
  ["black base", /\bblack base\b/i],
  ["scalloped", /\bscallop/i],
  ["embroidery", /\bembroider/i],
  ["decorative panels", /\bdecorative\s+panel/i],
  ["SKU-specific design", /\bSKU-specific design\b/i],
  ["pattern", /\bpattern\b/i],
  ["print", /\bprint\b/i],
];

function assertNoForbiddenTokens(text: string, where: string) {
  for (const [label, re] of FORBIDDEN_TOKENS) {
    assertAbsent(text, re, label, where);
  }
}

const HELPER_SIGNATURE = "tight product-zone crop|Tight product-zone crop";

const PRODUCT_ZONE_REQUIRED: ReadonlyArray<readonly [string, RegExp]> = [
  ["merchant bottom crop intro", /Match merchant product photo crop scale and bottom cut line/i],
  [
    "head rule",
    /entire head visible from behind|entire head and full face visible from hairline/i,
  ],
  [
    "bottom matches merchant photo",
    /bottom frame edge must match the merchant product photo exactly/i,
  ],
  ["bottom crop anchor", /Any aspect ratio \(9:16, 3:4, etc.\) must not extend the body below the merchant cut/i],
  ["not seated", /not seated/i],
  ["match merchant orientation", /Match the merchant product photo body orientation/i],
  [
    "no legs below reference",
    /never show knees, calves, feet|never widen or extend below the reference|legs, knees, feet, or floor/i,
  ],
  [
    "garment like reference",
    /bra, waist, brief large like the reference/i,
  ],
  ["do not copy seated", /do not copy (?:seated pose|source seated pose)/i],
  ["hands not on chest", /not on chest/i],
  ["no seated", /\bnot seated\b/i],
  ["match reference zoom and bottom", /match reference zoom/i],
];

const PRODUCT_ZONE_FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["lower face only", /\blower face\b/i],
  ["partially visible head", /head or face may be partially visible/i],
  ["partial face allowed", /may be partially visible/i],
  ["full-body studio photo", /Realistic full-body studio photo/i],
  ["head-to-toe in crop phrase", /\bfull-length head-to-toe framing\b/i],
  ["LINGERIE_CATALOG full head", /Commercial lingerie catalog crop from full head/i],
];

// ---------------------------------------------------------------------------
// A) on-model + lingerie + upper-thigh + high confidence
// ---------------------------------------------------------------------------

function caseUpperThighLingerie() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case A: applied");
  if (!result.applied) return;

  assert.equal(result.sourceCrop, "upper-thigh", "case A: sourceCrop");
  assert.equal(result.cropRisk, "low", "case A: cropRisk");

  for (const [label, re] of PRODUCT_ZONE_REQUIRED) {
    assertContains(result.text, re, label, "case A helper");
  }
  for (const [label, re] of PRODUCT_ZONE_FORBIDDEN) {
    assertAbsent(result.text, re, label, "case A helper");
  }

  assertNoForbiddenTokens(result.text, "case A");
  console.log("[ok] case A: upper-thigh lingerie on-model");
  console.log("     sample output:\n", result.text, "\n");
}

// ---------------------------------------------------------------------------
// B) full-body
// ---------------------------------------------------------------------------

function caseFullBody() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourceModel: {
        ...baseAnalysis().sourceModel!,
        crop: "full-body",
        framing: "full length head to toe",
        bodyVisibility: "head through feet",
      },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case B: applied");
  if (!result.applied) return;

  assert.equal(result.sourceCrop, "full-body", "case B: sourceCrop");
  assertContains(
    result.text,
    /full-length|head through both feet/i,
    "full-length framing allowed",
    "case B"
  );
  assertNoForbiddenTokens(result.text, "case B");
  console.log("[ok] case B: full-body allows head-to-toe");
}

// ---------------------------------------------------------------------------
// C) close-up + crop risk
// ---------------------------------------------------------------------------

function caseCloseUp() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourceModel: {
        ...baseAnalysis().sourceModel!,
        crop: "close-up",
        framing: "tight crop on garment zone",
      },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case C: applied");
  if (!result.applied) return;

  assert.equal(result.cropRisk, "high", "case C: cropRisk high");
  assert.match(
    result.reason,
    /high crop risk/i,
    "case C: reason mentions crop risk"
  );
  assertContains(
    result.text,
    /same tight torso or garment-zone cut as the reference/i,
    "close-up bottom crop",
    "case C"
  );
  for (const [label, re] of PRODUCT_ZONE_REQUIRED) {
    if (label === "lower face through upper thighs") continue;
    assertContains(result.text, re, label, "case C helper");
  }
  assertNoForbiddenTokens(result.text, "case C");
  console.log("[ok] case C: close-up + high crop risk");
}

// ---------------------------------------------------------------------------
// D) flat-lay
// ---------------------------------------------------------------------------

function caseFlatLay() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourcePresentation: "flat-lay",
      sourceModel: null,
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, false, "case D: not applied");
  assert.equal(result.text, "", "case D: empty text");
  console.log("[ok] case D: flat-lay gated out");
}

// ---------------------------------------------------------------------------
// E) jewelry
// ---------------------------------------------------------------------------

function caseJewelry() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({ categoryContext: "jewelry" }),
    categoryContext: "jewelry",
  });
  assert.equal(result.applied, false, "case E: not applied");
  console.log("[ok] case E: jewelry gated out");
}

// ---------------------------------------------------------------------------
// F) low confidence
// ---------------------------------------------------------------------------

function caseLowConfidence() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({ confidence: 0.5 }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, false, "case F: not applied");
  console.log("[ok] case F: low confidence gated out");
}

// ---------------------------------------------------------------------------
// G) unknown crop
// ---------------------------------------------------------------------------

function caseUnknownCrop() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourceModel: {
        ...baseAnalysis().sourceModel!,
        crop: "unknown",
      },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, false, "case G: not applied");
  console.log("[ok] case G: unknown crop gated out");
}

// ---------------------------------------------------------------------------
// H) forbidden design tokens
// ---------------------------------------------------------------------------

function caseForbiddenTokens() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case H: applied");
  if (result.applied) {
    assertNoForbiddenTokens(result.text, "case H");
  }

  // Adversarial: polluted sourceModel.framing must not leak into output
  const polluted = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourceModel: {
        ...baseAnalysis().sourceModel!,
        framing:
          "black lace emerald floral scalloped embroidery decorative panels SKU",
      },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(polluted.applied, true, "case H adversarial: still applied");
  if (polluted.applied) {
    assertNoForbiddenTokens(polluted.text, "case H adversarial");
  }
  console.log("[ok] case H: no forbidden design tokens in output");
}

// ---------------------------------------------------------------------------
// I) length <= 700
// ---------------------------------------------------------------------------

function caseLengthSafety() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "case I: applied");
  if (result.applied) {
    assert.ok(
      result.text.length <= SOURCE_FRAMING_GUIDANCE_MAX_LEN,
      `case I: length ${result.text.length} > ${SOURCE_FRAMING_GUIDANCE_MAX_LEN}`
    );
  }
  console.log("[ok] case I: text length within cap");
}

// ---------------------------------------------------------------------------
// waist-up maps like upper-thigh (current product case variant)
// ---------------------------------------------------------------------------

function caseWaistUp() {
  const result = deriveSourceFramingGuidance({
    analysis: baseAnalysis({
      sourceModel: {
        ...baseAnalysis().sourceModel!,
        crop: "waist-up",
      },
    }),
    categoryContext: "lingerie",
  });
  assert.equal(result.applied, true, "waist-up: applied");
  if (result.applied) {
  assertContains(
    result.text,
    /cut around hips or top of thighs/i,
    "product-zone waist-up bottom",
    "waist-up"
  );
  }
  console.log("[ok] waist-up: torso-to-upper-thigh guidance");
}

// ---------------------------------------------------------------------------
// J) baseline prompt without wiring field
// ---------------------------------------------------------------------------

function caseBaselinePromptWithoutField() {
  const prompt = buildModelGenerationPrompt(baseRequest(), {
    neutralBaseForTryOn: true,
  });
  assertAbsent(
    prompt,
    new RegExp(HELPER_SIGNATURE, "i"),
    "helper signature",
    "buildModelGenerationPrompt[baseline]"
  );
  console.log("[ok] case J: baseline prompt omits framing without sourceFramingGuidanceEn");
}

// ---------------------------------------------------------------------------
// K) productAnalysisForModelGeneration emits sourceFramingGuidanceEn
// ---------------------------------------------------------------------------

function checkProductAnalysisShimEmitsFramingGuidance() {
  const productGen = productAnalysisForModelGeneration(
    baseAnalysis(),
    { categoryContext: "lingerie" },
    "",
    false
  );
  assert.ok(
    typeof productGen.sourceFramingGuidanceEn === "string" &&
      productGen.sourceFramingGuidanceEn.length > 0,
    "case K: productGen.sourceFramingGuidanceEn must be non-empty"
  );
  assertContains(
    productGen.sourceFramingGuidanceEn!,
    /bottom frame edge must match the merchant product photo exactly/i,
    "framing marker",
    "case K shim"
  );
  assertNoForbiddenTokens(
    productGen.sourceFramingGuidanceEn!,
    "case K shim"
  );
  console.log(
    "[ok] case K: productAnalysisForModelGeneration emits sourceFramingGuidanceEn"
  );
}

// ---------------------------------------------------------------------------
// L) shim gates non-lingerie / low confidence
// ---------------------------------------------------------------------------

function checkProductAnalysisShimGates() {
  for (const ctx of ["jewelry", "general"] as const) {
    const productGen = productAnalysisForModelGeneration(
      baseAnalysis({ categoryContext: ctx }),
      { categoryContext: ctx },
      "",
      false
    );
    assert.equal(
      productGen.sourceFramingGuidanceEn,
      undefined,
      `case L: ctx=${ctx} must not get sourceFramingGuidanceEn`
    );
  }
  const clothingGen = productAnalysisForModelGeneration(
    baseAnalysis({ categoryContext: "clothing" }),
    { categoryContext: "clothing" },
    "",
    false
  );
  assert.ok(
    clothingGen.sourceFramingGuidanceEn?.length,
    "case L: clothing on-model gets sourceFramingGuidanceEn"
  );
  const lowConf = productAnalysisForModelGeneration(
    baseAnalysis({ confidence: 0.4 }),
    { categoryContext: "lingerie" },
    "",
    false
  );
  assert.equal(
    lowConf.sourceFramingGuidanceEn,
    undefined,
    "case L: low confidence must not emit framing guidance"
  );
  console.log(
    "[ok] case L: shim gates jewelry/general and low confidence; clothing on-model allowed"
  );
}

// ---------------------------------------------------------------------------
// M) buildGenerateModelRequestBody passes field
// ---------------------------------------------------------------------------

function checkBuildGenerateModelRequestBodyPassesField() {
  const helperResult = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case M: helper applied");
  if (!helperResult.applied) return;

  const body = buildGenerateModelRequestBody({
    settings: {
      ...DEFAULT_MODEL_GENERATION_SETTINGS,
      categoryContext: "lingerie",
      crop: "upper-thigh",
    },
    outputSize: { aspectRatio: "3:4", resolution: "2K" },
    promptLocale: "ru",
    seed: 42,
    sourceFramingGuidanceEn: helperResult.text,
  });
  assert.equal(
    body.sourceFramingGuidanceEn,
    helperResult.text,
    "case M: request body must carry sourceFramingGuidanceEn"
  );
  const parsed = generateModelRequestSchema.safeParse(body);
  assert.equal(
    parsed.success,
    true,
    `case M: request must pass generateModelRequestSchema (${parsed.success ? "" : JSON.stringify(parsed.error?.issues)})`
  );
  console.log("[ok] case M: buildGenerateModelRequestBody passes sourceFramingGuidanceEn");
}

// ---------------------------------------------------------------------------
// N) wired final prompt
// ---------------------------------------------------------------------------

function checkPromptWiringWithFramingGuidance() {
  const helperResult = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case N: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({
      sourceFramingGuidanceEn: helperResult.text,
      neutralBaseFitGuidanceEn: undefined,
    }),
    { neutralBaseForTryOn: true }
  );

  // Re-run with both fit + framing from productGen path
  const productGen = productAnalysisForModelGeneration(
    baseAnalysis(),
    { categoryContext: "lingerie" },
    "",
    false
  );
  const wiredFull = buildModelGenerationPrompt(
    baseRequest({
      sourceFramingGuidanceEn: productGen.sourceFramingGuidanceEn,
      neutralBaseFitGuidanceEn: productGen.neutralBaseFitGuidanceEn,
    }),
    { neutralBaseForTryOn: true }
  );

  for (const [label, prompt] of [
    ["wired framing only", wired],
    ["wired fit + framing", wiredFull],
  ] as const) {
    assertContains(
      prompt,
      /Match merchant product photo|Non-negotiable head framing/i,
      "product-zone signature",
      label
    );
    assertContains(
      prompt,
      /cropped head, headless model, forehead cut off/i,
      "head safety negatives",
      label
    );
    assertAbsent(
      prompt,
      /full-length catalog shot.*heels|elegant refined fashion heels/i,
      "no full-body heels with product-zone",
      label
    );
    assertContains(
      prompt,
      /standing front-facing toward the camera|standing back view/i,
      "merchant orientation pose",
      label
    );
    assertContains(
      prompt,
      /Source product-zone framing overrides/i,
      "crop override rule",
      label
    );
    assertContains(
      prompt,
      /Block only unsafe poses|match merchant crop scale and body orientation/i,
      "pose wins rule",
      label
    );
    assert.ok(
      prompt.includes(helperResult.text),
      `${label}: full helper text present`
    );
    assert.ok(
      prompt.includes(MODEL_GENERATION_NO_GARMENT_COPY_RULE),
      `${label}: no-garment-copy rule present`
    );

    const noCopyAt = prompt.indexOf(MODEL_GENERATION_NO_GARMENT_COPY_RULE);
    const fitAt = productGen.neutralBaseFitGuidanceEn
      ? prompt.indexOf(productGen.neutralBaseFitGuidanceEn)
      : -1;
    const framingAt = prompt.indexOf(helperResult.text);
    assert.ok(noCopyAt >= 0 && framingAt > noCopyAt, `${label}: framing after no-copy`);
    if (fitAt >= 0) {
      assert.ok(fitAt > noCopyAt, `${label}: fit after no-copy`);
      assert.ok(framingAt > fitAt, `${label}: framing after fit`);
    }

    const helperStart = prompt.indexOf(helperResult.text);
    const helperSlice = prompt.slice(
      helperStart,
      helperStart + helperResult.text.length
    );
    assertNoForbiddenTokens(helperSlice, `${label} helper slice`);

    for (const [markerLabel, re] of PRODUCT_ZONE_REQUIRED) {
      assertContains(prompt, re, markerLabel, `${label} full prompt`);
    }
    for (const [markerLabel, re] of PRODUCT_ZONE_FORBIDDEN) {
      assertAbsent(prompt, re, markerLabel, `${label} full prompt`);
    }

    assertAbsent(
      prompt,
      /Honor camera\/pose instruction:/i,
      "raw source camera angle honored",
      `${label}`
    );
    assertContains(
      prompt,
      /Never rotate a back or side merchant photo to front-facing/i,
      "pose wins over unsafe source",
      `${label}`
    );
  }

  console.log("[ok] case N: final prompt uses tight product-zone framing");
}

// ---------------------------------------------------------------------------
// O) no "full-body studio" opener when source framing active
// ---------------------------------------------------------------------------

function checkFullBodyOpenerSuppressed() {
  const helperResult = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case O: helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({
      crop: "full-body",
      sourceFramingGuidanceEn: helperResult.text,
    }),
    { neutralBaseForTryOn: true }
  );

  assertAbsent(
    wired,
    /Realistic full-body studio photo/i,
    "full-body studio opener",
    "case O wired"
  );
  assertContains(
    wired,
    /Realistic ecommerce product-zone studio photo/i,
    "product-zone opener",
    "case O wired"
  );
  assertContains(
    wired,
    /Source product-zone framing overrides/i,
    "override rule",
    "case O wired"
  );
  console.log(
    "[ok] case O: source framing suppresses full-body opener even when UI crop is full-body"
  );
}

// ---------------------------------------------------------------------------
// P) coexists with safety layers
// ---------------------------------------------------------------------------

function checkFramingCoexistsWithSafetyLayers() {
  const productGen = productAnalysisForModelGeneration(
    baseAnalysis(),
    { categoryContext: "lingerie" },
    "",
    false
  );
  const wired = buildModelGenerationPrompt(
    baseRequest({
      sourceFramingGuidanceEn: productGen.sourceFramingGuidanceEn,
      neutralBaseFitGuidanceEn: productGen.neutralBaseFitGuidanceEn,
    }),
    { neutralBaseForTryOn: true }
  );

  assertContains(
    wired,
    /shoulders square to camera/i,
    "try-on-safe pose",
    "case P"
  );
  assertContains(
    wired,
    /natural (?:human )?skin (?:grain and )?micro-detail/i,
    "model realism",
    "case P"
  );
  assertContains(
    wired,
    /high-waist full-brief bottom/i,
    "fit guidance",
    "case P"
  );
  console.log(
    "[ok] case P: framing coexists with fit, try-on-safe pose, and realism"
  );
}

// ---------------------------------------------------------------------------
// Q) clothing context ignores framing field on request
// ---------------------------------------------------------------------------

function checkClothingPromptUsesOrientationWhenFramingActive() {
  const helperResult = deriveSourceFramingGuidance({
    analysis: baseAnalysis({ categoryContext: "clothing" }),
    categoryContext: "clothing",
  });
  assert.equal(helperResult.applied, true, "case Q: clothing helper applied");
  if (!helperResult.applied) return;

  const wired = buildModelGenerationPrompt(
    baseRequest({
      categoryContext: "clothing",
      sourceFramingGuidanceEn: helperResult.text,
      resolvedModelPose: "back_view",
      productView: "back",
    }),
    { neutralBaseForTryOn: false }
  );

  assertContains(
    wired,
    /Match the merchant product photo body orientation|back facing the camera/i,
    "orientation",
    "case Q clothing"
  );
  console.log("[ok] case Q: clothing with product-zone uses orientation guidance");
}

// ---------------------------------------------------------------------------
// R) composeModelGenerationPrompt source wiring order
// ---------------------------------------------------------------------------

function checkComposeModelPromptSourceCarriesWiring() {
  const source = readFileSync(
    join(REPO_ROOT, "lib/ai/composeModelGenerationPrompt.ts"),
    "utf8"
  );
  const noCopyIdx = source.indexOf(
    "rules.push(MODEL_GENERATION_NO_GARMENT_COPY_RULE)"
  );
  const fitIdx = source.indexOf(
    "Neutral base fit guidance (silhouette only, never design):"
  );
  const framingIdx = source.indexOf(
    "Source framing guidance (match crop/framing only, never design):"
  );
  assert.ok(noCopyIdx >= 0, "case R: no-copy push exists");
  assert.ok(fitIdx > noCopyIdx, "case R: fit after no-copy");
  assert.ok(framingIdx > fitIdx, "case R: framing after fit");
  assertContains(
    source,
    /request\.sourceFramingGuidanceEn\?\.trim\(\)/,
    "sourceFramingGuidanceEn read",
    "case R compose source"
  );
  assertContains(
    source,
    /SOURCE_PRODUCT_ZONE_CROP_OVERRIDE_RULE/,
    "crop override rule import",
    "case R compose source"
  );
  assertContains(
    source,
    /SOURCE_TRY_ON_SAFE_POSE_WINS_RULE/,
    "pose wins rule import",
    "case R compose source"
  );
  console.log(
    "[ok] case R: composeModelGenerationPrompt.ts carries framing wiring after fit"
  );
}

// ---------------------------------------------------------------------------
// all non-lingerie contexts gated
// ---------------------------------------------------------------------------

function caseAllNonLingerieGated() {
  for (const ctx of ["general", "jewelry"] as FramingAwareCategoryContext[]) {
    const result = deriveSourceFramingGuidance({
      analysis: baseAnalysis({ categoryContext: ctx as "clothing" }),
      categoryContext: ctx,
    });
    assert.equal(result.applied, false, `non-on-model category ${ctx} gated`);
  }
  const clothing = deriveSourceFramingGuidance({
    analysis: baseAnalysis({ categoryContext: "clothing" }),
    categoryContext: "clothing",
  });
  assert.equal(clothing.applied, true, "clothing on-model applies orientation framing");
  console.log("[ok] jewelry/general gated; clothing on-model allowed");
}

// ---------------------------------------------------------------------------
// S) inactive source framing keeps catalog upper-thigh path
// ---------------------------------------------------------------------------

function checkInactiveCatalogFramingPreserved() {
  const prompt = buildModelGenerationPrompt(baseRequest(), {
    neutralBaseForTryOn: true,
  });

  assertContains(
    prompt,
    /Commercial lingerie catalog crop from top of head with generous headroom/i,
    "catalog crop in mandatory framing",
    "case S inactive"
  );
  assertContains(
    prompt,
    /Non-negotiable head framing/i,
    "dedicated head rule",
    "case S inactive"
  );
  assertContains(
    prompt,
    /full torso, waist, hips, bra band, and brief area fully visible/i,
    "catalog garment visibility",
    "case S inactive"
  );
  assertContains(
    prompt,
    /soft natural floor shadow/i,
    "floor shadow backdrop",
    "case S inactive"
  );
  assertAbsent(
    prompt,
    /Source product-zone crop overrides generic upper-thigh catalog framing/i,
    "product-zone override",
    "case S inactive"
  );
  console.log("[ok] case S: inactive framing keeps catalog upper-thigh path");
}

// ---------------------------------------------------------------------------
// U) 9:16 + product-zone — no full-body heels, tall-aspect override
// ---------------------------------------------------------------------------

function checkTallAspectProductZoneGuidance() {
  const helperResult = deriveSourceFramingGuidance({
    analysis: baseAnalysis(),
    categoryContext: "lingerie",
  });
  assert.equal(helperResult.applied, true, "case U: helper applied");
  if (!helperResult.applied) return;

  const prompt916 = buildModelGenerationPrompt(
    baseRequest({
      aspectRatio: "9:16",
      crop: "full-body",
      sourceFramingGuidanceEn: helperResult.text,
    }),
    { neutralBaseForTryOn: true }
  );

  assertContains(
    prompt916,
    /Tall vertical 9:16 output/i,
    "9:16 product-zone aspect rule",
    "case U"
  );
  assertContains(
    prompt916,
    /bottom frame edge must match the merchant product photo exactly/i,
    "merchant bottom crop in mandatory framing",
    "case U"
  );
  assertContains(
    prompt916,
    /cut at upper-mid thighs below/i,
    "tall aspect mid-thigh band",
    "case U"
  );
  assertAbsent(
    prompt916,
    /elegant refined fashion heels/i,
    "heels blocked when UI crop full-body + product-zone",
    "case U"
  );
  console.log("[ok] case U: 9:16 product-zone keeps mid-thigh scale, blocks heels");
}

// ---------------------------------------------------------------------------
// T) isSourceProductZoneFramingActive shim
// ---------------------------------------------------------------------------

function checkSourceProductZoneFramingActiveShim() {
  assert.equal(
    isSourceProductZoneFramingActive(baseAnalysis(), "lingerie"),
    true,
    "shim: active for confident on-model lingerie"
  );
  assert.equal(
    isSourceProductZoneFramingActive(baseAnalysis({ confidence: 0.5 }), "lingerie"),
    false,
    "shim: inactive for low confidence"
  );
  assert.equal(
    isSourceProductZoneFramingActive(
      baseAnalysis({ categoryContext: "clothing" }),
      "clothing"
    ),
    true,
    "shim: active for confident on-model clothing"
  );
  console.log("[ok] case T: isSourceProductZoneFramingActive shim");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  caseUpperThighLingerie();
  caseFullBody();
  caseCloseUp();
  caseFlatLay();
  caseJewelry();
  caseLowConfidence();
  caseUnknownCrop();
  caseForbiddenTokens();
  caseLengthSafety();
  caseWaistUp();
  caseBaselinePromptWithoutField();
  checkProductAnalysisShimEmitsFramingGuidance();
  checkProductAnalysisShimGates();
  checkBuildGenerateModelRequestBodyPassesField();
  checkPromptWiringWithFramingGuidance();
  checkFullBodyOpenerSuppressed();
  checkFramingCoexistsWithSafetyLayers();
  checkClothingPromptUsesOrientationWhenFramingActive();
  checkComposeModelPromptSourceCarriesWiring();
  caseAllNonLingerieGated();
  checkInactiveCatalogFramingPreserved();
  checkTallAspectProductZoneGuidance();
  checkSourceProductZoneFramingActiveShim();

  console.log("\nAll source-framing regression checks passed.");
}

main();
