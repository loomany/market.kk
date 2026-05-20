import { loadImageElement } from "@/lib/studio/productMask";

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImageElement(url).finally(() => URL.revokeObjectURL(url));
}

/**
 * Crop to non-transparent bounds so Fal sees mostly the garment, not the full frame.
 */
export async function cropImageToAlphaBounds(
  file: File,
  paddingRatio = 0.08
): Promise<File> {
  const img = await loadImageFromFile(file);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается");
  }
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3]!;
      if (a >= 32) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return file;
  }

  const pad = Math.round(
    Math.max(maxX - minX, maxY - minY) * paddingRatio
  );
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const x1 = Math.min(width - 1, maxX + pad);
  const y1 = Math.min(height - 1, maxY + pad);
  const cropW = x1 - x0 + 1;
  const cropH = y1 - y0 + 1;

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext("2d");
  if (!outCtx) {
    return file;
  }
  outCtx.drawImage(canvas, x0, y0, cropW, cropH, 0, 0, cropW, cropH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    out.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Не удалось обрезать фрагмент"));
    }, "image/png");
  });

  return new File([blob], "product-crop.png", { type: "image/png" });
}
