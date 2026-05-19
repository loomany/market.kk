import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { tryOnQualityModeFromResolution } from "@/lib/studio/tryOnQuality";
import { resolveStudioTryOnSettings } from "@/lib/studio/resolveStudioTryOnSettings";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
  ProductCategory,
} from "@/components/studio/types";

export function appendStudioTryOnFields(
  formData: FormData,
  input: {
    productFile: File;
    modelFile: File | null;
    modelImageUrl: string | null;
    productCategory: ProductCategory;
    garmentPhotoType: GarmentPhotoType;
    categoryContext: ModelCategoryContext;
    isLingerie: boolean;
    productAnalysis: ProductDescriptionAnalysis | null;
    productDescription: string;
    userEditedProductDescription: boolean;
    modelResolution: FalModelResolution;
    seed: number;
  }
): void {
  formData.append("productImageFile", input.productFile);
  if (input.modelFile) {
    formData.append("modelImageFile", input.modelFile);
  } else if (input.modelImageUrl) {
    formData.append("modelImageUrl", input.modelImageUrl);
  }

  const tryOnSettings = resolveStudioTryOnSettings({
    isLingerie: input.isLingerie,
    productCategory: input.productCategory,
    garmentPhotoType: input.garmentPhotoType,
    categoryContext: input.categoryContext,
    productAnalysis: input.productAnalysis,
  });

  formData.append("category", tryOnSettings.fashnCategory);
  formData.append("garmentPhotoType", tryOnSettings.garmentPhotoType);

  if (input.productAnalysis) {
    formData.append(
      "productAnalysisJson",
      JSON.stringify(input.productAnalysis)
    );
  }

  const userDesc = input.productDescription.trim();
  if (userDesc) {
    formData.append("userDescriptionRu", userDesc);
  }
  formData.append(
    "userEditedProductDescription",
    String(input.userEditedProductDescription)
  );

  formData.append(
    "mode",
    tryOnQualityModeFromResolution(input.modelResolution)
  );
  formData.append("modelResolution", input.modelResolution);
  formData.append("moderationLevel", "permissive");
  formData.append("numSamples", "1");
  formData.append("segmentationFree", "true");
  formData.append("outputFormat", "png");
  formData.append("seed", String(input.seed));
}
