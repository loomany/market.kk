/**
 * AUDIT-ONLY diagnostic script — runs real FLUX Kontext edits against Fal for
 * one exact source image and reports luminance/dimensions of each output.
 *
 * This file is intentionally a one-off audit tool. It is NOT wired into the
 * app, NOT committed to CI, and has no side effects on the production code.
 * Build artifacts excluded via tsconfig.json (same pattern as other test:* scripts).
 *
 * Usage (Windows PowerShell):
 *   $env:FAL_KEY = "<key>"; node --experimental-strip-types scripts/audit-blackOutput.ts
 *
 * What it does (4-way audit, FLUX Kontext only, single short prompt):
 *   1. Decodes baseline luminance of the source image (sanity check).
 *   2. fal.storage.upload(file) → FAL_HOSTED_URL.
 *   3. Test C: fal.subscribe(flux-pro/kontext, { image_url: FAL_HOSTED_URL }).
 *   4. Test D: fal.subscribe(flux-pro/kontext, { image_url: <Blob> }).
 *   5. For each output: download, decode dimensions, mean/P5/P50/P95 luminance,
 *      isProbablyDark flag (matches our route's debug heuristic).
 *
 * Test A (UI) and Test B (our API) require, respectively, a human in the loop
 * and a running dev server. We surface a clear instruction block at the end.
 */

import { fal } from "@fal-ai/client";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  buildFluxKontextEditPrompt,
} from "../lib/studio/kontextEnhancePrompts.ts";
import {
  FINAL_PROMPT_LENGTH_CAPS,
  clampFinalPromptLength,
  sanitizeFinalImageEnhancePromptForFal,
} from "../lib/studio/imageEnhanceFinalPromptSanitizer.ts";

const SOURCE_PATH = "C:/dev/kaspi/66a156af-2b89-4af6-99fb-c5fd440c7e56 (2).png";
const OUT_DIR = "C:/dev/kaspi/.audit-outputs";

const USER_PROMPT =
  "Place the same model in a bright luxury apartment near a large window. Add soft natural daylight, warm neutral interior, realistic shadows, and premium lifestyle fashion atmosphere.";
const ASPECT_RATIO = "9:16" as const;
const OUTPUT_FORMAT = "png" as const;
const PRESERVE_PRODUCT = true;
const GUIDANCE_SCALE = 3.7; // FLUX_KONTEXT_GUIDANCE_PRESERVE
const SAFETY_TOLERANCE = "6" as const;

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY is not set in the environment. Source .env.local first.");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

type LuminanceMetrics = {
  meanLuminance: number;
  luminanceMin: number;
  luminanceMax: number;
  luminanceP5: number;
  luminanceP50: number;
  luminanceP95: number;
  likelyDarkOutput: boolean;
  alphaMean: number | null;
  alphaPercentZero: number | null;
  rgbPercentZero: number;
  isTransparentLike: boolean;
};

async function computeLuminance(buf: Buffer): Promise<LuminanceMetrics> {
  // Full-resolution decode → downsample to 128×128 keeping aspect (≈ 16k samples).
  // Decode RGBA to inspect alpha. Keep alpha intact.
  const meta = await sharp(buf).metadata();
  const channels = meta.channels ?? 3;
  const hasAlpha = channels === 4;

  // Decode full to RGBA for alpha analysis.
  const fullRgba = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const totalPixels = fullRgba.info.width * fullRgba.info.height;
  let alphaSum = 0;
  let alphaZero = 0;
  let rgbZero = 0;
  for (let i = 0; i < fullRgba.data.length; i += 4) {
    const r = fullRgba.data[i]!;
    const g = fullRgba.data[i + 1]!;
    const b = fullRgba.data[i + 2]!;
    const a = fullRgba.data[i + 3]!;
    alphaSum += a;
    if (a === 0) alphaZero++;
    if (r === 0 && g === 0 && b === 0) rgbZero++;
  }
  const alphaMean = hasAlpha ? alphaSum / totalPixels : null;
  const alphaPercentZero = hasAlpha ? (alphaZero * 100) / totalPixels : null;
  const rgbPercentZero = (rgbZero * 100) / totalPixels;

  // Luminance via grayscale at small size for speed.
  const grayBuf = await sharp(buf)
    .resize(128, 128, { fit: "inside", withoutEnlargement: false })
    .removeAlpha()
    .grayscale()
    .raw()
    .toBuffer();
  const samples = new Uint8Array(grayBuf);
  let sum = 0;
  let min = 255;
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i]!;
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = sum / samples.length;
  const sorted = new Uint8Array(samples).sort();
  const pct = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))))]!;

  const meanRounded = Math.round(mean * 100) / 100;
  const p50 = pct(50);
  const likelyDarkOutput = meanRounded < 12 || p50 < 10;

  // "Transparent-like" → mean alpha low AND mean luminance low → browser shows black on dark theme.
  const isTransparentLike =
    alphaMean !== null && alphaMean < 64 && meanRounded < 30;

  return {
    meanLuminance: meanRounded,
    luminanceMin: min,
    luminanceMax: max,
    luminanceP5: pct(5),
    luminanceP50: p50,
    luminanceP95: pct(95),
    likelyDarkOutput,
    alphaMean: alphaMean === null ? null : Math.round(alphaMean * 100) / 100,
    alphaPercentZero:
      alphaPercentZero === null ? null : Math.round(alphaPercentZero * 100) / 100,
    rgbPercentZero: Math.round(rgbPercentZero * 100) / 100,
    isTransparentLike,
  };
}

async function probeOutputUrl(url: string): Promise<{
  status: number;
  contentType: string | null;
  contentLength: number | null;
  width: number;
  height: number;
  format: string;
  bytes: Buffer;
  metrics: LuminanceMetrics;
}> {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const metrics = await computeLuminance(buf);
  return {
    status: res.status,
    contentType: res.headers.get("content-type"),
    contentLength: buf.length,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? "unknown",
    bytes: buf,
    metrics,
  };
}

async function main() {
  console.log("=".repeat(80));
  console.log("AUDIT — FLUX Kontext, single exact source");
  console.log("=".repeat(80));

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  // ---- 0. Source baseline ----
  const sourceBuf = await readFile(SOURCE_PATH);
  const sourceMeta = await sharp(sourceBuf).metadata();
  const sourceMetrics = await computeLuminance(sourceBuf);
  console.log("\n[0] SOURCE FILE");
  console.log({
    path: SOURCE_PATH,
    bytes: sourceBuf.length,
    width: sourceMeta.width,
    height: sourceMeta.height,
    format: sourceMeta.format,
    channels: sourceMeta.channels,
    metrics: sourceMetrics,
  });

  // ---- Build the EXACT final prompt our route would send ----
  const builderOutput = buildFluxKontextEditPrompt({
    userPrompt: USER_PROMPT,
    enhancedPrompt: null,
    preserveProduct: PRESERVE_PRODUCT,
    productPreservationBlock: null,
  });
  const sanitized = sanitizeFinalImageEnhancePromptForFal(builderOutput);
  const finalPrompt = clampFinalPromptLength(
    sanitized.cleaned,
    FINAL_PROMPT_LENGTH_CAPS["flux-kontext-pro"]
  );
  console.log("\n[*] FINAL PROMPT (sent to Fal, identical for tests B/C/D):");
  console.log({
    length: finalPrompt.length,
    removedSensitive: sanitized.removedSensitiveWords,
    removedDuplicates: sanitized.removedDuplicatePatterns,
    text: finalPrompt,
  });

  // ---- Pre-step: upload to Fal storage ----
  console.log("\n[*] Uploading source to fal.storage …");
  // Node 20+ has global File class; fal client accepts File / Blob.
  // We use Blob to stay compatible with @fal-ai/client server SDK.
  const sourceBlob = new Blob([sourceBuf], { type: "image/png" });
  const FAL_HOSTED_URL = await fal.storage.upload(
    new File([sourceBlob], "source.png", { type: "image/png" })
  );
  console.log("FAL_HOSTED_URL =", FAL_HOSTED_URL);

  const fluxInputCommon = {
    prompt: finalPrompt,
    aspect_ratio: ASPECT_RATIO,
    output_format: OUTPUT_FORMAT,
    guidance_scale: GUIDANCE_SCALE,
    safety_tolerance: SAFETY_TOLERANCE,
    enhance_prompt: false,
    num_images: 1,
  };

  const results: Record<string, unknown> = {};

  // ---- Test C: Fal direct with image_url = FAL_HOSTED_URL ----
  console.log("\n[C] Fal direct — image_url = FAL_HOSTED_URL …");
  try {
    const tStart = Date.now();
    const resultC = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: { ...fluxInputCommon, image_url: FAL_HOSTED_URL },
      logs: false,
    });
    const elapsed = Date.now() - tStart;
    const outUrl = (resultC.data as { images?: { url?: string }[] })?.images?.[0]
      ?.url;
    console.log({
      requestId: resultC.requestId,
      elapsedMs: elapsed,
      outputUrl: outUrl,
    });
    if (outUrl) {
      const probe = await probeOutputUrl(outUrl);
      await writeFile(join(OUT_DIR, "test_C.png"), probe.bytes);
      results.C = {
        requestId: resultC.requestId,
        outputUrl: outUrl,
        elapsedMs: elapsed,
        ...probe,
        bytes: undefined,
      };
    } else {
      results.C = {
        requestId: resultC.requestId,
        outputUrl: null,
        error: "no image url in response",
      };
    }
  } catch (error) {
    const err = error as { status?: number; body?: unknown; message?: string };
    results.C = {
      error: true,
      status: err.status ?? null,
      message: err.message ?? String(error),
      body: err.body ?? null,
    };
  }

  // ---- Test D: Fal direct with image_url = Blob (auto-uploaded) ----
  console.log("\n[D] Fal direct — image_url = <Blob/File>  …");
  try {
    const tStart = Date.now();
    const file = new File([sourceBuf], "source.png", { type: "image/png" });
    const resultD = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: { ...fluxInputCommon, image_url: file },
      logs: false,
    });
    const elapsed = Date.now() - tStart;
    const outUrl = (resultD.data as { images?: { url?: string }[] })?.images?.[0]
      ?.url;
    console.log({
      requestId: resultD.requestId,
      elapsedMs: elapsed,
      outputUrl: outUrl,
    });
    if (outUrl) {
      const probe = await probeOutputUrl(outUrl);
      await writeFile(join(OUT_DIR, "test_D.png"), probe.bytes);
      results.D = {
        requestId: resultD.requestId,
        outputUrl: outUrl,
        elapsedMs: elapsed,
        ...probe,
        bytes: undefined,
      };
    } else {
      results.D = {
        requestId: resultD.requestId,
        outputUrl: null,
        error: "no image url in response",
      };
    }
  } catch (error) {
    const err = error as { status?: number; body?: unknown; message?: string };
    results.D = {
      error: true,
      status: err.status ?? null,
      message: err.message ?? String(error),
      body: err.body ?? null,
    };
  }

  // ---- Summary table ----
  console.log("\n", "=".repeat(80));
  console.log("RESULTS");
  console.log("=".repeat(80));
  console.log(JSON.stringify({ FAL_HOSTED_URL, source: sourceMetrics, results }, null, 2));

  console.log("\nSaved outputs to:", OUT_DIR);
  console.log(
    "Open test_C.png / test_D.png to visually verify dark vs normal."
  );
}

void main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
