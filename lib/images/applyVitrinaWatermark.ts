import "server-only";

export const VITRINA_WATERMARK_TEXT = "vitrina.help";

export async function fetchImageBuffer(source: string | Buffer): Promise<Buffer> {
  if (Buffer.isBuffer(source)) return source;
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function buildCenterWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.max(22, Math.round(Math.min(width, height) * 0.055));
  const x = Math.round(width / 2);
  const y = Math.round(height / 2);
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${x}" y="${y}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="rgba(255,255,255,0.92)"
    stroke="rgba(15,23,42,0.55)"
    stroke-width="2"
    paint-order="stroke"
  >${VITRINA_WATERMARK_TEXT}</text>
</svg>`;
}

export async function applyVitrinaWatermark(input: string | Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const buffer = await fetchImageBuffer(input);
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const svg = buildCenterWatermarkSvg(width, height);

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

export async function applyVitrinaWatermarkToUrl(imageUrl: string): Promise<Buffer> {
  return applyVitrinaWatermark(imageUrl);
}

/** Semi-transparent PNG overlay for Fal ffmpeg compose (video watermark). */
export async function createVitrinaWatermarkOverlayPng(): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const width = 640;
  const height = 160;
  const svg = buildCenterWatermarkSvg(width, height);
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}
