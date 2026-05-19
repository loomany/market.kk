import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { mapFashnCategoryForTryOn } from "@/lib/ai/productAnalysisShared";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
  ProductCategory,
} from "@/components/studio/types";
import { garmentPhotoTypeFromSourcePresentation } from "@/lib/studio/garmentPhotoTypeFromPresentation";

export function resolveStudioTryOnSettings(input: {
  isLingerie: boolean;
  garmentPhotoType: GarmentPhotoType;
  garmentPhotoTypeManualOverride: boolean;
  categoryContext: ModelCategoryContext;
  productAnalysis: ProductDescriptionAnalysis | null;
}): {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  fashnCategory: ReturnType<typeof mapFashnCategoryForTryOn>;
} {
  const productCategory: ProductCategory = input.isLingerie
    ? "auto"
    : ((input.productAnalysis?.productCategory as ProductCategory) ?? "auto");

  let garmentPhotoType: GarmentPhotoType;
  if (input.garmentPhotoTypeManualOverride) {
    garmentPhotoType = input.garmentPhotoType;
  } else if (input.productAnalysis) {
    garmentPhotoType = garmentPhotoTypeFromSourcePresentation(
      input.productAnalysis.sourcePresentation
    );
  } else {
    garmentPhotoType = input.garmentPhotoType;
  }

  return {
    productCategory,
    garmentPhotoType,
    fashnCategory: mapFashnCategoryForTryOn({
      productCategory,
      categoryContext: input.categoryContext,
      productAnalysis: input.productAnalysis,
    }),
  };
}
