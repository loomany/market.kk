import type { StaticRouteKey } from "@/lib/i18n/routeSlugs";
import type { ExampleCategoryId } from "./exampleCases";

/** Indexable feature LPs → examples category checklists (text-only teaser, no /examples links). */
export const featureExamplesTeaserCategories: Partial<
  Record<StaticRouteKey, ExampleCategoryId | ExampleCategoryId[]>
> = {
  aiProductPhotoStudio: "product-photos",
  productPhotoForMarketplaces: "kaspi-product-cards",
  backgroundGenerator: "background-removal",
  fashionModelPhotos: ["clothing-on-model", "lingerie-on-ai-model"],
  jewelryProductPhotos: "product-photos",
};

export function getTeaserCategoriesForFeature(
  key: StaticRouteKey
): ExampleCategoryId[] {
  const entry = featureExamplesTeaserCategories[key];
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}
