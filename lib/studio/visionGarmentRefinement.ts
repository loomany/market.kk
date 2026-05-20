import type { GarmentSelectionRefinement } from "@/lib/ai/refineGarmentSelectionSchemas";
import { applyMaskToProductImage, loadImageElement } from "@/lib/studio/productMask";
import { excludeSkinFromMaskAlpha } from "@/lib/studio/skinMaskExclusion";

type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function pixelInNormalizedBox(
  x: number,
  y: number,
  width: number,
  height: number,
  box: NormalizedBox
): boolean {
  const px = x / width;
  const py = y / height;
  return (
    px >= box.x &&
    px <= box.x + box.width &&
    py >= box.y &&
    py <= box.y + box.height
  );
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return loadImageElement(url).finally(() => URL.revokeObjectURL(url));
}

/** White-on-black mask PNG for vision (user rough selection). */
export async function buildRoughMaskFileFromSelection(
  maskedSelectionFile: File
): Promise<File> {
  const img = await loadImageFromFile(maskedSelectionFile);
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
  const data = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < data.data.length; i += 4) {
    const a = data.data[i + 3]!;
    const on = a > 32 ? 255 : 0;
    data.data[i] = on;
    data.data[i + 1] = on;
    data.data[i + 2] = on;
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Не удалось создать маску"));
    }, "image/png");
  });

  return new File([blob], "rough-mask.png", { type: "image/png" });
}

export async function applyVisionGarmentRefinement(
  originalFile: File,
  maskedSelectionFile: File,
  refinement: GarmentSelectionRefinement
): Promise<File> {
  const [original, masked] = await Promise.all([
    loadImageFromFile(originalFile),
    loadImageFromFile(maskedSelectionFile),
  ]);

  const width = original.naturalWidth;
  const height = original.naturalHeight;

  const maskedCanvas = document.createElement("canvas");
  maskedCanvas.width = width;
  maskedCanvas.height = height;
  const maskedCtx = maskedCanvas.getContext("2d")!;
  maskedCtx.drawImage(masked, 0, 0, width, height);
  const maskedData = maskedCtx.getImageData(0, 0, width, height);

  const userMaskAlpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    userMaskAlpha[i] = maskedData.data[i * 4 + 3]!;
  }

  const useTightBox = refinement.confidence >= 0.35;
  const refinedAlpha = new Uint8ClampedArray(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let a = userMaskAlpha[i]!;
      if (a < 32) {
        refinedAlpha[i] = 0;
        continue;
      }

      if (
        useTightBox &&
        !pixelInNormalizedBox(x, y, width, height, refinement.tightGarmentBox)
      ) {
        refinedAlpha[i] = 0;
        continue;
      }

      for (const exclude of refinement.excludeRegions) {
        if (pixelInNormalizedBox(x, y, width, height, exclude)) {
          a = 0;
          break;
        }
      }
      refinedAlpha[i] = a;
    }
  }

  const originalCanvas = document.createElement("canvas");
  originalCanvas.width = width;
  originalCanvas.height = height;
  const originalCtx = originalCanvas.getContext("2d")!;
  originalCtx.drawImage(original, 0, 0);
  const originalData = originalCtx.getImageData(0, 0, width, height);

  excludeSkinFromMaskAlpha(originalData, refinedAlpha);

  const outMask = document.createElement("canvas");
  outMask.width = width;
  outMask.height = height;
  const outCtx = outMask.getContext("2d")!;
  const outMaskData = outCtx.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const a = refinedAlpha[i]!;
    const o = i * 4;
    outMaskData.data[o] = 255;
    outMaskData.data[o + 1] = 255;
    outMaskData.data[o + 2] = 255;
    outMaskData.data[o + 3] = a;
  }
  outCtx.putImageData(outMaskData, 0, 0);

  const { blob } = await applyMaskToProductImage(original, outMask);
  return new File([blob], "refined-product.png", { type: "image/png" });
}
