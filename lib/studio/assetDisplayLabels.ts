import type { StudioSessionAsset } from "@/components/studio/types";
import { toStudioLocale } from "@/lib/studio/i18n";
import {
  getAssetDisplayTitle as getAssetDisplayTitleI18n,
  getAssetTypeBadge as getAssetTypeBadgeI18n,
} from "@/lib/studio/i18n/assetDisplayLabels";
import type { StudioLocale } from "@/lib/studio/i18n/studioCopyTypes";

export function getAssetTypeBadge(
  asset: StudioSessionAsset,
  locale?: StudioLocale
): string {
  return getAssetTypeBadgeI18n(asset, locale ?? toStudioLocale("ru"));
}

export function getAssetStatusBadge(_asset: StudioSessionAsset): string | null {
  return null;
}

export function getAssetDisplayTitle(
  asset: StudioSessionAsset,
  locale?: StudioLocale
): string {
  return getAssetDisplayTitleI18n(asset, locale ?? toStudioLocale("ru"));
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

export function assetProcessingSourceUrl(asset: StudioSessionAsset): string | null {
  if (isVideoAsset(asset)) {
    return asset.sourceImageUrl ?? null;
  }
  return asset.url || asset.sourceImageUrl || null;
}
