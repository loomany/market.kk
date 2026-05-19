import type { StudioSessionAsset } from "@/components/studio/types";

const ANGLE_LABELS_TO_HIDE = new Set(["Стандартная поза"]);

/** User-facing type badge for file list (ignores technical try-on angle labels). */
export function getAssetTypeBadge(asset: StudioSessionAsset): string {
  switch (asset.type) {
    case "video":
      return "Видео";
    case "tryon":
      return "Фото на модели";
    case "exact-card":
      return "Товарная карточка";
    case "creative-card":
      return "Рекламный кадр";
    case "background-removed":
      return "Фон заменён";
    case "scene":
      return "Сцена";
    default:
      return "Фото";
  }
}

export function getAssetStatusBadge(asset: StudioSessionAsset): string | null {
  if (asset.status === "processing") return "Создаётся";
  if (asset.status === "error") return "Ошибка";
  return null;
}

/** Short title under preview — never show internal angle names. */
export function getAssetDisplayTitle(asset: StudioSessionAsset): string {
  if (asset.label && !ANGLE_LABELS_TO_HIDE.has(asset.label)) {
    return asset.label;
  }
  return getAssetTypeBadge(asset);
}

export function isVideoAsset(asset: StudioSessionAsset): boolean {
  return asset.type === "video";
}

export function assetPreviewUrl(asset: StudioSessionAsset): string | null {
  if (asset.status === "processing") {
    return asset.sourceImageUrl ?? (asset.url || null);
  }
  if (asset.url) return asset.url;
  return asset.sourceImageUrl ?? null;
}

/** Image URL suitable as source for video/scene APIs. */
export function assetProcessingSourceUrl(asset: StudioSessionAsset): string | null {
  if (isVideoAsset(asset)) {
    return asset.sourceImageUrl ?? null;
  }
  return asset.url || asset.sourceImageUrl || null;
}
