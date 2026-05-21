import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import type {
  GarmentPhotoType,
  ModelBodyType,
  ModelCategoryContext,
  ProductCategory,
  QualityMode,
  StudioMode,
} from "@/components/studio/types";
import { getStudioCopy, type StudioLocale } from "./index";

export function getStudioModes(locale: StudioLocale) {
  const copy = getStudioCopy(locale);
  return (["clothing-tryon", "product-shot", "post-processing"] as StudioMode[]).map(
    (id) => ({
      id,
      ...copy.modes[id],
    })
  );
}

export function getProductCategories(locale: StudioLocale) {
  const o = getStudioCopy(locale).options.productCategories;
  return (
    ["auto", "tops", "bottoms", "one-pieces", "accessory"] as ProductCategory[]
  ).map((id) => ({ id, label: o[id] ?? id }));
}

export function getGarmentPhotoTypes(locale: StudioLocale) {
  const o = getStudioCopy(locale).options.garmentPhotoTypes;
  return (["auto", "model", "flat-lay"] as GarmentPhotoType[]).map((id) => ({
    id,
    label: o[id] ?? id,
  }));
}

export function getQualityModes(locale: StudioLocale) {
  const o = getStudioCopy(locale).options.qualityModes;
  return (["performance", "balanced", "quality"] as QualityMode[]).map((id) => ({
    id,
    label: o[id] ?? id,
  }));
}

export function getTryOnQualityOptions(locale: StudioLocale) {
  const o = getStudioCopy(locale).options.tryOnQuality;
  return (["performance", "balanced", "quality"] as QualityMode[]).map((id) => ({
    id,
    label: id === "performance" ? "0.5K" : id === "balanced" ? "1K" : "2K",
    shortHint: o[id]?.shortHint ?? id,
    hint: o[id]?.hint ?? id,
  }));
}

export function getModelBodyTypes(locale: StudioLocale) {
  const o = getStudioCopy(locale).options.bodyTypes;
  const ids = [
    "custom",
    "size-s",
    "size-m",
    "size-l",
    "size-xl",
    "size-2xl",
    "standard",
    "plus-size",
    "slim",
    "athletic",
    "swimwear",
    "curvy",
    "petite",
    "tall",
  ] as const;
  return ids.map((id) => ({
    id: (id === "custom" ? MODEL_PARAM_CUSTOM : id) as ModelBodyType,
    label: o[id]?.label ?? id,
    hint: o[id]?.hint ?? "",
  }));
}

export function getModelScenarioLabel(
  locale: StudioLocale | string | null | undefined,
  id: ModelCategoryContext
): string {
  return getStudioCopy(locale).options.modelScenarios[id] ?? id;
}
