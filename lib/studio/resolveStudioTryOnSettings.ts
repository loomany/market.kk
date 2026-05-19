import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { mapCategoryForTryOn } from "@/lib/ai/falSchemas";
import { resolveTryOnGarmentSettings } from "@/lib/ai/productAnalysisShared";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
  ProductCategory,
} from "@/components/studio/types";
import { resolveLingerieTryOnSettings } from "@/lib/studio/resolveLingerieTryOnSettings";

export function resolveStudioTryOnSettings(input: {
  isLingerie: boolean;
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  categoryContext: ModelCategoryContext;
  productAnalysis: ProductDescriptionAnalysis | null;
}): {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  fashnCategory: ReturnType<
    typeof resolveTryOnGarmentSettings
  >["fashnCategory"];
} {
  const fromUi = resolveTryOnGarmentSettings(input.productAnalysis, {
    productCategory: input.productCategory,
    garmentPhotoType: input.garmentPhotoType,
    categoryContext: input.categoryContext,
  });

  let { productCategory, garmentPhotoType } = fromUi;

  if (
    garmentPhotoType === "auto" &&
    input.productAnalysis?.sourcePresentation === "on-model"
  ) {
    garmentPhotoType = "model";
  }

  if (input.isLingerie) {
    const lingerie = resolveLingerieTryOnSettings({
      productCategory,
      garmentPhotoType,
    });
    productCategory = lingerie.productCategory;
    garmentPhotoType =
      lingerie.garmentPhotoType === "flat-lay" &&
      input.productAnalysis?.sourcePresentation === "on-model"
        ? "model"
        : lingerie.garmentPhotoType;
  }

  return {
    productCategory,
    garmentPhotoType,
    fashnCategory: mapCategoryForTryOn(productCategory),
  };
}
