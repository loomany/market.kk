import type {
  GarmentPhotoType,
  ProductCategory,
  QualityMode,
} from "@/components/studio/types";

export const LINGERIE_TRYON_DEFAULTS = {
  productCategory: "auto" as ProductCategory,
  garmentPhotoType: "model" as GarmentPhotoType,
  qualityMode: "quality" as QualityMode,
} as const;

export function isLingerieTryOnSettingsWeakened(
  garmentPhotoType: GarmentPhotoType,
  qualityMode: QualityMode
): boolean {
  return garmentPhotoType === "auto" || qualityMode !== "quality";
}
