/**
 * AUDIT-ONLY (local, NO paid calls): build alternative FASHN garment references
 * for the black/emerald lingerie set to test whether brief artefacts come from
 * an ambiguous on-model garment_image (vs the AI try-on model itself).
 *
 * Pattern mirrors scripts/audit-blackOutput.ts (one-off audit tool, NOT product
 * code, NOT wired into the app, NOT committed to CI).
 *
 * Usage (PowerShell):
 *   node --experimental-strip-types scripts/audit-garmentRefVariants.ts
 *
 * Inputs (relative to repo root):
 *   - photo_2026-05-18_18-22-49.jpg  (the current on-model source)
 *
 * Outputs (.audit-outputs/garment-ref-variants/):
 *   - A-original.jpg          — passthrough copy
 *   - B-cleaned.jpg           — tighter crop, distractions removed (necklace,
 *                                top background sliver, redundant chin area)
 *   - C-bottom-focus.jpg      — bottom-focus crop emphasising the high-waist
 *                                brief, central green panel, side panels and
 *                                waistband shape
 *   - D-bra-brief-stacked.jpg — bra + brief stacked on a clean white card-like
 *                                background, with the bare-skin gap between
 *                                them removed (closest to a clean garment
 *                                catalog card without external segmentation)
 *   - variants-metrics.json   — per-variant metrics (dims, mean luminance,
 *                                mean saturation in brief region, etc.)
 *
 * NO calls to Fal/OpenAI. NO product code modified.
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";

const SOURCE_PATH = pathResolve(
  process.cwd(),
  "photo_2026-05-18_18-22-49.jpg"
);
const OUT_DIR = pathResolve(process.cwd(), ".audit-outputs", "garment-ref-variants");

type RegionMetrics = {
  width: number;
  height: number;
  bytes: number;
  meanLuminance: number;
  /** Mean saturation (0–255) over the brief region only — proxy for "how
   *  much green lace contrast does FASHN see there". Higher is cleaner. */
  briefMeanSaturation: number;
  briefP50Luminance: number;
};

async function describeRegion(buf: Buffer, label: string): Promise<RegionMetrics> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  // Mean luminance over the whole image (small grey downsample)
  const greyBuf = await sharp(buf)
    .resize(128, 128, { fit: "inside" })
    .removeAlpha()
    .grayscale()
    .raw()
    .toBuffer();
  const greySamples = new Uint8Array(greyBuf);
  let sum = 0;
  for (let i = 0; i < greySamples.length; i++) sum += greySamples[i]!;
  const meanLuminance = Math.round((sum / greySamples.length) * 100) / 100;

  // Brief region: bottom ~45% of the image (rows from 0.55*h to h).
  const briefTop = Math.floor(h * 0.55);
  const briefHeight = h - briefTop;

  const briefRgba = await sharp(buf)
    .extract({ left: 0, top: briefTop, width: w, height: briefHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const data = briefRgba.data;
  let satSum = 0;
  let lumSum = 0;
  const lumSamples: number[] = [];
  const total = briefRgba.info.width * briefRgba.info.height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : ((max - min) * 255) / max;
    satSum += sat;
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    lumSum += lum;
    if (i % 16 === 0) lumSamples.push(lum); // sparse for p50
  }
  const briefMeanSaturation = Math.round((satSum / total) * 100) / 100;
  const briefMeanLum = Math.round((lumSum / total) * 100) / 100;
  lumSamples.sort((a, b) => a - b);
  const briefP50Luminance = lumSamples[Math.floor(lumSamples.length / 2)] ?? briefMeanLum;

  return {
    width: w,
    height: h,
    bytes: buf.length,
    meanLuminance,
    briefMeanSaturation,
    briefP50Luminance,
  };
}

async function buildVariantA(source: Buffer): Promise<{ buf: Buffer; notes: string }> {
  // Passthrough copy — but re-encode to JPEG quality 92 for parity (so file
  // size differences across variants come from content, not encoder defaults).
  const buf = await sharp(source).jpeg({ quality: 92 }).toBuffer();
  return {
    buf,
    notes:
      "Original 800×800 marketplace JPEG, on-model cropped reference. Used as-is by today's FASHN call.",
  };
}

async function buildVariantB(source: Buffer): Promise<{ buf: Buffer; notes: string }> {
  // Cleaned tight crop:
  //   - Drop top 8% (necklace + background strip + part of chest above bra V).
  //   - Drop bottom 2% (browser bar / artifact strip if any).
  //   - Drop 4% from each side (background slivers, redundant arm pixels).
  // Yields ~736×720, then re-letterboxed onto a neutral light-grey card so
  // FASHN sees a single rectangular reference with the same aspect.
  const width = 800;
  const height = 800;
  const cropTop = Math.round(height * 0.08);
  const cropBottom = Math.round(height * 0.02);
  const cropSide = Math.round(width * 0.04);
  const cropW = width - 2 * cropSide;
  const cropH = height - cropTop - cropBottom;

  const cropped = await sharp(source)
    .extract({ left: cropSide, top: cropTop, width: cropW, height: cropH })
    .toBuffer();

  // Letterbox to 800×800 onto a light-grey card (similar to marketplace card
  // backgrounds — FASHN treats this as flat-product-ish context).
  const buf = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 242, g: 242, b: 242 },
    },
  })
    .composite([
      {
        input: await sharp(cropped)
          .resize(width, height, { fit: "inside" })
          .toBuffer(),
        gravity: "center",
      },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  return {
    buf,
    notes:
      "Cleaned: top 8 % / bottom 2 % / sides 4 % trimmed (necklace + sliver background removed), then letterboxed onto a light-grey card. Same garment, less distraction around the edges.",
  };
}

async function buildVariantC(source: Buffer): Promise<{ buf: Buffer; notes: string }> {
  // Bottom-focused: keep only rows from 0.50*h to 1.00*h (the brief, the
  // waistband, the lace bottom edge of the bra). Upscale 2× so the lace
  // pattern, central green panel, side black panels are larger in the
  // garment_image FASHN ingests.
  const meta = await sharp(source).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 800;
  const top = Math.round(h * 0.5);
  const cropped = await sharp(source)
    .extract({ left: 0, top, width: w, height: h - top })
    .toBuffer();

  // Resize the crop to 1024×1024 with white letterbox (FASHN garment_image
  // benefits from being recognisable as a product photo).
  const resized = await sharp(cropped)
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255 },
    })
    .jpeg({ quality: 92 })
    .toBuffer();

  return {
    buf: resized,
    notes:
      "Bottom-focus 1024×1024: only rows 50–100 % of source kept (brief + waistband + bra lower lace edge), then upscaled to 1 K so FASHN sees the high-waist silhouette, central green panel and black side panels at higher pixel coverage.",
  };
}

async function buildVariantD(source: Buffer): Promise<{ buf: Buffer; notes: string }> {
  // Stacked bra + brief on a clean white card. We remove the bare-skin
  // band between the bra and the brief (rows ~0.40–0.60), then re-stack the
  // garment pieces with a small vertical gap. This isn't a true segmentation
  // — it just hides the ambiguity-region without faking pixels FASHN should
  // see. White background is used as a poor-man's catalog card.
  const meta = await sharp(source).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 800;

  // Top half: rows 0.00–0.45 (bra region, including the bottom lace edge)
  const braTop = 0;
  const braBottom = Math.round(h * 0.45);
  const braBuf = await sharp(source)
    .extract({
      left: 0,
      top: braTop,
      width: w,
      height: braBottom - braTop,
    })
    .toBuffer();

  // Bottom half: rows 0.55–1.00 (brief region)
  const briefTop = Math.round(h * 0.55);
  const briefBuf = await sharp(source)
    .extract({
      left: 0,
      top: briefTop,
      width: w,
      height: h - briefTop,
    })
    .toBuffer();

  // Compose on 1024×1024 white card with a tiny visible gap between them.
  const targetW = 1024;
  const targetH = 1024;
  // Bra resized to fit the top 48 % of the canvas
  const braDest = await sharp(braBuf)
    .resize(Math.round(targetW * 0.86), Math.round(targetH * 0.46), {
      fit: "inside",
    })
    .toBuffer();
  // Brief resized to fit the bottom 48 % of the canvas
  const briefDest = await sharp(briefBuf)
    .resize(Math.round(targetW * 0.86), Math.round(targetH * 0.46), {
      fit: "inside",
    })
    .toBuffer();
  const braMeta = await sharp(braDest).metadata();
  const briefMeta = await sharp(briefDest).metadata();
  const braLeft = Math.round((targetW - (braMeta.width ?? 0)) / 2);
  const briefLeft = Math.round((targetW - (briefMeta.width ?? 0)) / 2);
  const braTopDest = Math.round(targetH * 0.04);
  const briefTopDest = Math.round(targetH * 0.52);

  const buf = await sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: braDest, left: braLeft, top: braTopDest },
      { input: briefDest, left: briefLeft, top: briefTopDest },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  return {
    buf,
    notes:
      "Catalog-card composite 1024×1024: bra (0–45 %) and brief (55–100 %) stacked on white with a small gap, removing the bare-skin band in between. Poor-man's product card; no true segmentation, garment pixels untouched.",
  };
}

async function main() {
  console.log("=".repeat(72));
  console.log("AUDIT — garment reference variants (local, no paid calls)");
  console.log("=".repeat(72));

  if (!existsSync(SOURCE_PATH)) {
    console.error(`Source not found: ${SOURCE_PATH}`);
    process.exit(1);
  }
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const source = await readFile(SOURCE_PATH);
  const sourceMeta = await sharp(source).metadata();
  console.log("[0] SOURCE", {
    path: SOURCE_PATH,
    width: sourceMeta.width,
    height: sourceMeta.height,
    format: sourceMeta.format,
    bytes: source.length,
  });

  const variants = [
    { id: "A-original", build: buildVariantA },
    { id: "B-cleaned", build: buildVariantB },
    { id: "C-bottom-focus", build: buildVariantC },
    { id: "D-bra-brief-stacked", build: buildVariantD },
  ];

  const results: Array<{
    id: string;
    file: string;
    notes: string;
    metrics: RegionMetrics;
  }> = [];

  for (const { id, build } of variants) {
    const { buf, notes } = await build(source);
    const file = join(OUT_DIR, `${id}.jpg`);
    await writeFile(file, buf);
    const metrics = await describeRegion(buf, id);
    results.push({ id, file, notes, metrics });
    console.log(`\n[${id}]`, { file, metrics, notes });
  }

  const report = {
    source: {
      path: SOURCE_PATH,
      width: sourceMeta.width,
      height: sourceMeta.height,
      bytes: source.length,
    },
    outDir: OUT_DIR,
    variants: results,
  };
  await writeFile(
    join(OUT_DIR, "variants-metrics.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );

  console.log("\nSaved variants to:", OUT_DIR);
  console.log(
    "Inspect them visually before approving any FASHN run. No paid calls were made."
  );
}

void main().catch((error) => {
  console.error("FATAL:", error);
  process.exit(1);
});
