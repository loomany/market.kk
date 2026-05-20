import type { ModelCrop } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

export const LINGERIE_CROP_CATALOG_HINT =
  "Каталожный кадр белья: голова, весь комплект, верх бёдер — рекомендуемый формат";

export const LINGERIE_CROP_PRODUCT_ZONE_HINT =
  "Низ кадра как на товарном фото (без ног), сверху — голова и руки. Формат 9:16 и др. не удлиняют тело.";

export const SOURCE_PRODUCT_ZONE_CROP_BADGE =
  "Кадр будет адаптирован под товарное фото";

const LINGERIE_CROP_HINTS: Partial<Record<ModelCrop, string>> = {
  "upper-thigh": LINGERIE_CROP_CATALOG_HINT,
  "upper-body": "Только верх тела — если низ комплекта не нужен в кадре",
  "full-body": "Весь силуэт с ногами — только если нужен полный рост",
};

/** Select trigger label when server adapts crop to the product photo (default upper-thigh). */
export function getLingerieCropSelectLabel(input: {
  crop: ModelCrop;
  defaultLabel: string;
  sourceProductZoneFramingActive: boolean;
}): string {
  if (
    input.sourceProductZoneFramingActive &&
    input.crop === "upper-thigh"
  ) {
    return SOURCE_PRODUCT_ZONE_CROP_BADGE;
  }
  return input.defaultLabel;
}

export function getLingerieCropDescription(input: {
  crop: ModelCrop;
  cropCustom: string;
  sourceProductZoneFramingActive: boolean;
  customEmptyHint?: string;
}): string {
  if (input.crop === MODEL_PARAM_CUSTOM) {
    return (
      input.cropCustom.trim() ||
      input.customEmptyHint ||
      "Опишите кадр своими словами"
    );
  }

  if (input.sourceProductZoneFramingActive) {
    return LINGERIE_CROP_PRODUCT_ZONE_HINT;
  }

  return LINGERIE_CROP_HINTS[input.crop] ?? LINGERIE_CROP_CATALOG_HINT;
}
