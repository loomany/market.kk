import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import {
  shotSizePresetToDimensions,
  type ShotSizePreset,
} from "@/lib/ai/productShotSchemas";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Не удалось загрузить PNG без фона"));
    img.src = url;
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  return loadImage(objectUrl).finally(() => URL.revokeObjectURL(objectUrl));
}

function drawImageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }
  ctx.drawImage(img, 0, 0, srcW, srcH);
  return canvas;
}

function trimTransparentBounds(
  source: HTMLCanvasElement,
  alphaThreshold = 32
): HTMLCanvasElement {
  const ctx = source.getContext("2d");
  if (!ctx) return source;
  const { width, height } = source;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a >= alphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return source;
  }
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const x1 = Math.min(width - 1, maxX + pad);
  const y1 = Math.min(height - 1, maxY + pad);
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const outCtx = out.getContext("2d");
  if (!outCtx) return source;
  outCtx.drawImage(source, x0, y0, w, h, 0, 0, w, h);
  return out;
}

/** Remove near-white halos left by background removal (common on edges). */
export function defringeCutoutImageData(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    let a = d[i + 3];
    if (a < 4) {
      d[i + 3] = 0;
      continue;
    }
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    // Only edge halos — opaque nude/beige fabric must stay (product card lingerie).
    if (lum > 175 && sat < 50 && a < 220) {
      const whiteAmount = Math.min(1, (lum - 155) / 85);
      const edgeFactor = 1 - a / 255;
      const remove = whiteAmount * (0.45 + edgeFactor * 0.4);
      a = Math.round(a * (1 - remove));
      if (a < 10) {
        d[i] = 0;
        d[i + 1] = 0;
        d[i + 2] = 0;
        d[i + 3] = 0;
      } else {
        d[i + 3] = a;
      }
    }
  }
}

function zeroRgbWhereTransparent(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
    }
  }
}

/** Light post-process: defringe + trim (safe after Fal). */
export function prepareCutoutCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = drawImageToCanvas(img);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    defringeCutoutImageData(imageData);
    zeroRgbWhereTransparent(imageData);
    ctx.putImageData(imageData, 0, 0);
  }
  return trimTransparentBounds(canvas, 40);
}

/**
 * Keep Fal cutout inside the user's mask (contour limits the object, Fal cleans edges).
 */
export async function refineCutoutWithUserMask(
  cutoutUrl: string,
  maskedProductFile: File
): Promise<string> {
  const [cutoutImg, maskImg] = await Promise.all([
    loadImage(cutoutUrl),
    loadImageFromFile(maskedProductFile),
  ]);

  const width = cutoutImg.naturalWidth || cutoutImg.width;
  const height = cutoutImg.naturalHeight || cutoutImg.height;

  const cutoutCanvas = drawImageToCanvas(cutoutImg);
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }
  maskCtx.drawImage(maskImg, 0, 0, width, height);

  const cutoutData = cutoutCanvas
    .getContext("2d")!
    .getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height);

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const maskA = maskData.data[o + 3] / 255;
    if (maskA < 0.02) {
      cutoutData.data[o] = 0;
      cutoutData.data[o + 1] = 0;
      cutoutData.data[o + 2] = 0;
      cutoutData.data[o + 3] = 0;
      continue;
    }
    cutoutData.data[o + 3] = Math.round(cutoutData.data[o + 3] * maskA);
    if (cutoutData.data[o + 3] < 8) {
      cutoutData.data[o] = 0;
      cutoutData.data[o + 1] = 0;
      cutoutData.data[o + 2] = 0;
      cutoutData.data[o + 3] = 0;
    }
  }

  defringeCutoutImageData(cutoutData);
  zeroRgbWhereTransparent(cutoutData);
  cutoutCanvas.getContext("2d")!.putImageData(cutoutData, 0, 0);

  return trimTransparentBounds(cutoutCanvas, 40).toDataURL("image/png");
}

/** Trim empty margins so the product sits in the middle of the PNG. */
export async function centerTransparentCutout(imageUrl: string): Promise<string> {
  const img = await loadImage(imageUrl);
  const trimmed = prepareCutoutCanvas(img);

  const pad = Math.round(Math.max(trimmed.width, trimmed.height) * 0.06);
  const outW = trimmed.width + pad * 2;
  const outH = trimmed.height + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }
  ctx.clearRect(0, 0, outW, outH);
  ctx.drawImage(trimmed, pad, pad);

  return canvas.toDataURL("image/png");
}

/** Place cutout on a transparent canvas matching the selected export size. */
export async function fitCutoutToShotSize(
  imageUrl: string,
  preset: ShotSizePreset,
  quality: FalModelResolution = "1K"
): Promise<string> {
  const [width, height] = shotSizePresetToDimensions(preset, quality);
  const img = await loadImage(imageUrl);
  const trimmed = prepareCutoutCanvas(img);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }
  ctx.clearRect(0, 0, width, height);

  const padding = Math.round(Math.min(width, height) * 0.08);
  const maxW = width - padding * 2;
  const maxH = height - padding * 2;
  const scale = Math.min(maxW / trimmed.width, maxH / trimmed.height, 1);
  const drawW = trimmed.width * scale;
  const drawH = trimmed.height * scale;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.drawImage(trimmed, x, y, drawW, drawH);

  return canvas.toDataURL("image/png");
}
