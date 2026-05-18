import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type { ShotSizePreset } from "@/lib/ai/productShotSchemas";
import type { ProductShotScenePreset } from "@/components/studio/types";
import { shotSizePresetToDimensions } from "@/lib/ai/productShotSchemas";
import { prepareCutoutCanvas } from "@/lib/studio/cutoutImage";

export type ExactCardBackground = "white" | "light-gray";

export function scenePresetToExactBackground(
  preset: ProductShotScenePreset,
  customDescription?: string
): ExactCardBackground {
  if (preset === "light-gray-studio") {
    return "light-gray";
  }
  if (preset === "custom" && customDescription?.trim()) {
    const text = customDescription.toLowerCase();
    if (/(сер|gray|grey|светло.?сер)/i.test(text)) {
      return "light-gray";
    }
  }
  return "white";
}

function backgroundColorHex(background: ExactCardBackground): string {
  return background === "light-gray" ? "#f3f4f6" : "#ffffff";
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Не удалось загрузить изображение для карточки"));
    img.src = url;
  });
}

export type ComposeExactProductCardOptions = {
  background: ExactCardBackground;
  shotSizePreset: ShotSizePreset;
  imageQuality?: FalModelResolution;
};

export async function composeExactProductCard(
  cutoutUrl: string,
  options: ComposeExactProductCardOptions
): Promise<string> {
  const [width, height] = shotSizePresetToDimensions(
    options.shotSizePreset,
    options.imageQuality ?? "1K"
  );
  const img = await loadImage(cutoutUrl);
  const cutout = prepareCutoutCanvas(img);
  const srcW = cutout.width;
  const srcH = cutout.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }

  const bg = backgroundColorHex(options.background);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const padding = Math.round(Math.min(width, height) * 0.08);
  const maxW = width - padding * 2;
  const maxH = height - padding * 2;
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;

  ctx.drawImage(cutout, x, y, drawW, drawH);

  const flat = document.createElement("canvas");
  flat.width = width;
  flat.height = height;
  const flatCtx = flat.getContext("2d");
  if (!flatCtx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }
  flatCtx.fillStyle = bg;
  flatCtx.fillRect(0, 0, width, height);
  flatCtx.drawImage(canvas, 0, 0);

  return flat.toDataURL("image/png");
}
