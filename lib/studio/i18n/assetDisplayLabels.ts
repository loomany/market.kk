import type { StudioSessionAsset } from "@/components/studio/types";
import { getStudioCopy, type StudioLocale } from "./index";

const ANGLE_LABELS_TO_HIDE = new Set(["Стандартная поза", "Standard pose"]);

export function getAssetTypeBadge(
  asset: StudioSessionAsset,
  locale: StudioLocale
): string {
  const a = getStudioCopy(locale).assets;
  switch (asset.type) {
    case "video":
      return a.video;
    case "tryon":
      return a.tryon;
    case "exact-card":
      return a.exactCard;
    case "creative-card":
      return a.creativeCard;
    case "background-removed":
      return a.bgRemoved;
    case "scene":
      return a.scene;
    default:
      return a.photo;
  }
}

export function getAssetDisplayTitle(
  asset: StudioSessionAsset,
  locale: StudioLocale
): string {
  if (asset.label && !ANGLE_LABELS_TO_HIDE.has(asset.label)) {
    return asset.label;
  }
  return getAssetTypeBadge(asset, locale);
}
