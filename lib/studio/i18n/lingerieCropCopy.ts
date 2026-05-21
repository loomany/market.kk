import type { ModelCrop } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import { getStudioCopy, type StudioLocale } from "./index";

export function getLingerieCropCatalogHint(locale: StudioLocale): string {
  return getStudioCopy(locale).lingerieCrop.catalogHint;
}

export function getLingerieCropProductZoneHint(locale: StudioLocale): string {
  return getStudioCopy(locale).lingerieCrop.productZoneHint;
}

export function getSourceProductZoneCropBadge(locale: StudioLocale): string {
  return getStudioCopy(locale).lingerieCrop.sourceZoneBadge;
}

export function getLingerieCropSelectLabel(
  locale: StudioLocale,
  input: {
    crop: ModelCrop;
    defaultLabel: string;
    sourceProductZoneFramingActive: boolean;
  }
): string {
  if (
    input.sourceProductZoneFramingActive &&
    input.crop === "upper-thigh"
  ) {
    return getSourceProductZoneCropBadge(locale);
  }
  return input.defaultLabel;
}

export function getLingerieCropDescription(
  locale: StudioLocale,
  input: {
    crop: ModelCrop;
    cropCustom: string;
    sourceProductZoneFramingActive: boolean;
    customEmptyHint?: string;
  }
): string {
  const lc = getStudioCopy(locale).lingerieCrop;
  if (input.crop === MODEL_PARAM_CUSTOM) {
    return (
      input.cropCustom.trim() ||
      input.customEmptyHint ||
      lc.customEmpty
    );
  }
  if (input.sourceProductZoneFramingActive) {
    return lc.productZoneHint;
  }
  const hints: Partial<Record<ModelCrop, string>> = {
    "upper-thigh": lc.catalogHint,
    "upper-body": lc.upperBody,
    "full-body": lc.fullBody,
  };
  return hints[input.crop] ?? lc.catalogHint;
}
