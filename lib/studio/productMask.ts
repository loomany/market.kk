export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      if (img.naturalWidth < 1 || img.naturalHeight < 1) {
        reject(new Error("Изображение имеет нулевой размер"));
        return;
      }
      resolve(img);
    };
    img.onerror = () =>
      reject(new Error("Не удалось загрузить изображение для выделения"));
    img.src = url;
  });
}

export function maskHasSelection(maskCanvas: HTMLCanvasElement): boolean {
  return getMaskCoverageRatio(maskCanvas) > 0.0001;
}

export function getMaskCoverageRatio(maskCanvas: HTMLCanvasElement): number {
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return 0;
  const { width, height } = maskCanvas;
  if (width === 0 || height === 0) return 0;
  const data = ctx.getImageData(0, 0, width, height).data;
  let selected = 0;
  const total = width * height;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 32) selected++;
  }
  return selected / total;
}

const MASK_ALPHA_THRESHOLD = 32;

function dilateMaskForClose(
  source: HTMLCanvasElement,
  blurPx: number
): ImageData {
  const { width, height } = source;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается");
  }
  ctx.drawImage(source, 0, 0);
  if (blurPx > 0) {
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(source, 0, 0);
    ctx.filter = "none";
  }
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = data[i] > 48 ? 255 : 0;
  }
  return imageData;
}

/**
 * Fill only pixels inside a closed outline (exterior flood from bbox edges).
 * Avoids filling the whole bounding box when the contour has gaps to the outside.
 */
export function fillMaskInterior(maskCanvas: HTMLCanvasElement): void {
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = maskCanvas;
  const strokeData = ctx.getImageData(0, 0, width, height);
  const boundaryData = dilateMaskForClose(maskCanvas, 1.5);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasMask = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = boundaryData.data[(y * width + x) * 4 + 3];
      if (a > MASK_ALPHA_THRESHOLD) {
        hasMask = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasMask) return;

  const pad = Math.max(2, Math.round(Math.max(maxX - minX, maxY - minY) * 0.01));
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const idx = (x: number, y: number) => y * width + x;
  const isBoundary = (x: number, y: number) =>
    boundaryData.data[idx(x, y) * 4 + 3] > MASK_ALPHA_THRESHOLD;

  const outside = new Uint8Array(width * height);
  const queue: number[] = [];

  const tryEnqueue = (x: number, y: number) => {
    if (x < minX || y < minY || x > maxX || y > maxY) return;
    const id = idx(x, y);
    if (outside[id] || isBoundary(x, y)) return;
    outside[id] = 1;
    queue.push(x, y);
  };

  for (let x = minX; x <= maxX; x++) {
    tryEnqueue(x, minY);
    tryEnqueue(x, maxY);
  }
  for (let y = minY; y <= maxY; y++) {
    tryEnqueue(minX, y);
    tryEnqueue(maxX, y);
  }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  const out = strokeData.data;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const id = idx(x, y);
      if (outside[id] || isBoundary(x, y)) continue;
      const o = id * 4;
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = 255;
    }
  }

  ctx.putImageData(strokeData, 0, 0);
}

export type MaskSelectionMethod = "paint" | "contour" | "rectangle";

/** Whether apply step should flood-fill inside a closed stroke. */
export function shouldFillMaskInterior(method: MaskSelectionMethod): boolean {
  return method === "contour";
}

export function fillRectangleOnMask(
  maskCanvas: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): void {
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return;
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  if (w < 2 || h < 2) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(x, y, w, h);
}

export async function createSelectionPreviewBlob(
  image: HTMLImageElement,
  maskCanvas: HTMLCanvasElement,
  options?: { skipInteriorFill?: boolean; selectionMethod?: MaskSelectionMethod }
): Promise<Blob> {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const workMask = document.createElement("canvas");
  workMask.width = width;
  workMask.height = height;
  const workCtx = workMask.getContext("2d");
  if (!workCtx) {
    throw new Error("Canvas не поддерживается");
  }
  workCtx.drawImage(maskCanvas, 0, 0);
  if (
    options?.selectionMethod === "contour" ||
    (!options?.selectionMethod && !options?.skipInteriorFill)
  ) {
    fillMaskInterior(workMask);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается");
  }

  ctx.drawImage(image, 0, 0);

  const dim = document.createElement("canvas");
  dim.width = width;
  dim.height = height;
  const dimCtx = dim.getContext("2d");
  if (!dimCtx) {
    throw new Error("Canvas не поддерживается");
  }
  dimCtx.fillStyle = "rgba(15, 23, 42, 0.5)";
  dimCtx.fillRect(0, 0, width, height);
  dimCtx.globalCompositeOperation = "destination-out";
  dimCtx.drawImage(workMask, 0, 0);
  dimCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(dim, 0, 0);

  const tint = document.createElement("canvas");
  tint.width = width;
  tint.height = height;
  const tintCtx = tint.getContext("2d");
  if (!tintCtx) {
    throw new Error("Canvas не поддерживается");
  }
  tintCtx.fillStyle = "rgba(20, 184, 166, 0.35)";
  tintCtx.fillRect(0, 0, width, height);
  tintCtx.globalCompositeOperation = "destination-in";
  tintCtx.drawImage(workMask, 0, 0);
  tintCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(tint, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Не удалось создать превью выделения"));
    }, "image/png");
  });
}

export async function applyMaskToProductImage(
  image: HTMLImageElement,
  maskCanvas: HTMLCanvasElement
): Promise<{ blob: Blob; coverageRatio: number }> {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (maskCanvas.width !== width || maskCanvas.height !== height) {
    throw new Error("Размер маски не совпадает с изображением");
  }

  const coverageRatio = getMaskCoverageRatio(maskCanvas);
  if (coverageRatio < 0.001) {
    throw new Error("Сначала выделите товар на фото.");
  }

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const ctx = output.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается");
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const maskData = maskCanvas.getContext("2d")!.getImageData(0, 0, width, height);

  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    const maskAlpha = maskData.data[offset + 3] / 255;
    if (maskAlpha < 0.04) {
      imageData.data[offset] = 0;
      imageData.data[offset + 1] = 0;
      imageData.data[offset + 2] = 0;
      imageData.data[offset + 3] = 0;
      continue;
    }
    const newAlpha = Math.round(imageData.data[offset + 3] * maskAlpha);
    imageData.data[offset + 3] = newAlpha;
    if (newAlpha < 8) {
      imageData.data[offset] = 0;
      imageData.data[offset + 1] = 0;
      imageData.data[offset + 2] = 0;
      imageData.data[offset + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    output.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Не удалось экспортировать PNG"));
    }, "image/png");
  });

  return { blob, coverageRatio };
}
