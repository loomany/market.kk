import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type {
  GarmentPhotoType,
  ProductCategory,
  QualityMode,
} from "@/components/studio/types";

export const LINGERIE_TRYON_DEFAULTS = {
  /** Комплект bra+brief на одном flat lay */
  productCategory: "one-pieces" as ProductCategory,
  garmentPhotoType: "flat-lay" as GarmentPhotoType,
  modelResolution: "2K" as FalModelResolution,
} as const;

export function isLingerieTryOnSettingsWeakened(
  garmentPhotoType: GarmentPhotoType,
  qualityMode: QualityMode
): boolean {
  if (qualityMode !== "quality") return true;
  /** Flat lay на карточке — «на человеке» часто даёт неверный крой низа */
  return garmentPhotoType === "model";
}
