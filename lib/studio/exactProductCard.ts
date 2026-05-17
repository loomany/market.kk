import type { ShotSizePreset } from "@/lib/ai/productShotSchemas";
import type { ProductShotScenePreset } from "@/components/studio/types";
import { shotSizePresetToDimensions } from "@/lib/ai/productShotSchemas";

export type ExactCardBackground = "white" | "light-gray";

export function scenePresetToExactBackground(
  preset: ProductShotScenePreset
): ExactCardBackground {
  if (preset === "light-gray-studio") {
    return "light-gray";
  }
  return "white";
}

function backgroundColorHex(background: ExactCardBackground): string {
  return background === "light-gray" ? "#f3f4f6" : "#ffffff";
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Не удалось загрузить изображение для карточки"));
    img.src = url;
  });
}

export type ComposeExactProductCardOptions = {
  background: ExactCardBackground;
  shotSizePreset: ShotSizePreset;
  /** Off by default — marketplace cards use a flat background without drop shadow. */
  showShadow?: boolean;
};

export async function composeExactProductCard(
  cutoutUrl: string,
  options: ComposeExactProductCardOptions
): Promise<string> {
  const [width, height] = shotSizePresetToDimensions(options.shotSizePreset);
  const img = await loadImage(cutoutUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas не поддерживается в этом браузере");
  }

  ctx.fillStyle = backgroundColorHex(options.background);
  ctx.fillRect(0, 0, width, height);

  const padding = Math.round(Math.min(width, height) * 0.08);
  const maxW = width - padding * 2;
  const maxH = height - padding * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;

  if (options.showShadow) {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.12)";
    ctx.filter = "blur(18px)";
    const shadowW = drawW * 0.72;
    const shadowH = Math.max(12, drawH * 0.08);
    ctx.beginPath();
    ctx.ellipse(
      width / 2,
      y + drawH - shadowH * 0.2,
      shadowW / 2,
      shadowH,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  ctx.drawImage(img, x, y, drawW, drawH);

  return canvas.toDataURL("image/png");
}
