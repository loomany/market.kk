import type { ModelCrop } from "@/components/studio/types";
import { toStudioLocale } from "@/lib/studio/i18n";
import {
  getLingerieCropDescription as getLingerieCropDescriptionI18n,
  getLingerieCropSelectLabel as getLingerieCropSelectLabelI18n,
  getLingerieCropCatalogHint,
  getLingerieCropProductZoneHint,
  getSourceProductZoneCropBadge,
} from "@/lib/studio/i18n/lingerieCropCopy";
import type { StudioLocale } from "@/lib/studio/i18n/studioCopyTypes";

export const LINGERIE_CROP_CATALOG_HINT = getLingerieCropCatalogHint(
  toStudioLocale("ru")
);
export const LINGERIE_CROP_PRODUCT_ZONE_HINT = getLingerieCropProductZoneHint(
  toStudioLocale("ru")
);
export const SOURCE_PRODUCT_ZONE_CROP_BADGE = getSourceProductZoneCropBadge(
  toStudioLocale("ru")
);

export function getLingerieCropSelectLabel(input: {
  crop: ModelCrop;
  defaultLabel: string;
  sourceProductZoneFramingActive: boolean;
  locale?: StudioLocale;
}): string {
  return getLingerieCropSelectLabelI18n(
    input.locale ?? toStudioLocale("ru"),
    input
  );
}

export function getLingerieCropDescription(input: {
  crop: ModelCrop;
  cropCustom: string;
  sourceProductZoneFramingActive: boolean;
  customEmptyHint?: string;
  locale?: StudioLocale;
}): string {
  return getLingerieCropDescriptionI18n(
    input.locale ?? toStudioLocale("ru"),
    input
  );
}
