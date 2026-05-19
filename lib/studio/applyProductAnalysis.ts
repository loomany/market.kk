import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type {
  GarmentPhotoType,
  ModelGenerationSettings,
  ProductCategory,
} from "@/components/studio/types";

export function applyConfidentProductAnalysis(input: {
  analysis: ProductDescriptionAnalysis;
  modelSettings: ModelGenerationSettings;
}): {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  modelSettings: ModelGenerationSettings;
} {
  const { analysis, modelSettings } = input;
  const categoryContext = analysis.categoryContext;

  return {
    productCategory: analysis.productCategory,
    garmentPhotoType: analysis.garmentPhotoType,
    modelSettings: {
      ...modelSettings,
      categoryContext,
      ...(categoryContext === "lingerie" ? { crop: "full-body" } : {}),
    },
  };
}
