import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { isSourceModelPopulated } from "@/lib/ai/sourceModelPostProcess";
import { resolveSourceModelBodyTypeSettings } from "@/lib/studio/mapSourceModelToGenerationSettings";
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

  let nextSettings: ModelGenerationSettings = {
    ...modelSettings,
    categoryContext,
  };

  if (
    analysis.sourcePresentation === "on-model" &&
    isSourceModelPopulated(analysis.sourceModel)
  ) {
    nextSettings = {
      ...nextSettings,
      ...resolveSourceModelBodyTypeSettings(analysis.sourceModel!),
    };
  }

  return {
    productCategory: analysis.productCategory,
    garmentPhotoType: analysis.garmentPhotoType,
    modelSettings: nextSettings,
  };
}
