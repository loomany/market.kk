export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Не удалось загрузить изображение для выделения"));
    img.src = url;
  });
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
    const maskAlpha = maskData.data[offset + 3];
    imageData.data[offset + 3] = Math.round(
      (imageData.data[offset + 3] * maskAlpha) / 255
    );
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
