/**
 * One-shot paid test: FASHN Edit garment prep → FASHN Try-On (Fal).
 *
 * Requires:
 *   FAL_KEY, FASHN_API_KEY, ALLOW_PAID_AI_RUNS=true, AI_MOCK_MODE=0
 *   AI_PREMIUM_GARMENT_EDIT_ENABLED=true
 *
 * Usage:
 *   node --experimental-strip-types --import=./scripts/lib/registerTsAlias.mjs scripts/test-fashn-edit-before-tryon.ts \
 *     --product <path-or-url> --model <path-or-url>
 *
 * Outputs: .audit-outputs/premium-edit-before-tryon/
 */
import { fal } from "@fal-ai/client";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";
import { buildFashnEditRunBody } from "../lib/ai/fashnEditSchemas.ts";
import { FASHN_GARMENT_PREP_PROMPT } from "../lib/ai/fashnGarmentPrepPrompt.ts";
import {
  createGarmentPreparationMaskPng,
  garmentMaskDebugFilename,
  readImageDimensions,
} from "../lib/ai/garmentPreparationMask.ts";
import { runFashnEdit } from "../lib/ai/fashnEditClient.ts";

const FASHN_TRYON_MODEL = "fal-ai/fashn/tryon/v1.6";
const OUT_DIR = pathResolve(".audit-outputs/premium-edit-before-tryon");

function loadEnvLocal() {
  const envPath = pathResolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx < 0 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function uploadLocalOrUrl(
  pathOrUrl: string,
  label: string
): Promise<string> {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const abs = pathResolve(pathOrUrl);
  const buf = readFileSync(abs);
  const ext = abs.toLowerCase().endsWith(".png") ? "png" : "jpeg";
  const blob = new Blob([buf], { type: `image/${ext}` });
  const file = new File([blob], `${label}.${ext}`, { type: `image/${ext}` });
  return fal.storage.upload(file);
}

async function main() {
  loadEnvLocal();
  process.env.AI_PREMIUM_GARMENT_EDIT_ENABLED = "true";

  for (const key of ["FAL_KEY", "FASHN_API_KEY"]) {
    if (!process.env[key]) {
      console.error(`Missing ${key}. Abort before paid calls.`);
      process.exit(1);
    }
  }
  if (process.env.ALLOW_PAID_AI_RUNS !== "true") {
    console.error("Set ALLOW_PAID_AI_RUNS=true");
    process.exit(1);
  }
  process.env.AI_MOCK_MODE = "0";

  const productPath =
    parseArg("--product") ??
    ".audit-outputs/garment-ref-variants/A-original.jpg";
  const modelPath =
    parseArg("--model") ?? parseArg("--model-url");

  if (!modelPath) {
    console.error("Provide --model <path-or-url>");
    process.exit(1);
  }

  fal.config({ credentials: process.env.FAL_KEY! });
  await mkdir(OUT_DIR, { recursive: true });

  const originalProductUrl = await uploadLocalOrUrl(productPath, "product");
  const modelImageUrl = await uploadLocalOrUrl(modelPath, "model");

  const productRes = await fetch(originalProductUrl);
  const productBuf = Buffer.from(await productRes.arrayBuffer());
  const { width, height } = readImageDimensions(
    productBuf,
    productRes.headers.get("content-type")
  );
  const maskPng = createGarmentPreparationMaskPng(width, height, {
    strategy: "center_product_zone",
    marginRatio: 0.05,
  });
  const maskBlob = new Blob([Uint8Array.from(maskPng)], { type: "image/png" });
  const maskUrl = await fal.storage.upload(
    new File([maskBlob], garmentMaskDebugFilename(width, height, "center_product_zone"), {
      type: "image/png",
    })
  );

  const editBody = buildFashnEditRunBody({
    imageUrl: originalProductUrl,
    maskUrl,
    prompt: FASHN_GARMENT_PREP_PROMPT,
    resolution: "2k",
    generationMode: "balanced",
    outputFormat: "png",
  });

  await writeFile(
    join(OUT_DIR, "edit-payload.json"),
    JSON.stringify(editBody, null, 2)
  );
  await writeFile(join(OUT_DIR, "mask.png"), maskPng);

  console.log("[1/2] FASHN Edit…");
  const edit = await runFashnEdit({
    imageUrl: originalProductUrl,
    maskUrl,
    prompt: FASHN_GARMENT_PREP_PROMPT,
    resolution: "2k",
    generationMode: "balanced",
    outputFormat: "png",
  });

  if (!edit.ok) {
    console.error("FASHN Edit failed:", edit);
    process.exit(1);
  }

  const preparedGarmentImageUrl = edit.imageUrl;
  console.log("preparedGarmentImageUrl:", preparedGarmentImageUrl);

  const tryOnPayload = {
    model_image: modelImageUrl,
    garment_image: preparedGarmentImageUrl,
    category: "auto" as const,
    mode: "quality" as const,
    garment_photo_type: "auto" as const,
    moderation_level: "permissive" as const,
    num_samples: 1,
    segmentation_free: true,
    output_format: "png" as const,
  };

  await writeFile(
    join(OUT_DIR, "tryon-payload.json"),
    JSON.stringify(tryOnPayload, null, 2)
  );

  console.log("[2/2] FASHN Try-On v1.6 (Fal)…");
  const tryOn = await fal.subscribe(FASHN_TRYON_MODEL, {
    input: tryOnPayload,
    logs: true,
  });

  const finalImageUrl = (
    tryOn.data as { images?: { url: string }[] }
  ).images?.[0]?.url;

  const summary = {
    editModelId: editBody.model_name,
    editRequestId: edit.requestId,
    originalProductImageUrl: originalProductUrl,
    maskUrl,
    preparedGarmentImageUrl,
    tryOnRequestId: tryOn.requestId,
    tryOnModel: FASHN_TRYON_MODEL,
    garment_photo_type: tryOnPayload.garment_photo_type,
    finalImageUrl,
  };

  await writeFile(join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

  console.log("\n--- Summary ---");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nArtifacts: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
