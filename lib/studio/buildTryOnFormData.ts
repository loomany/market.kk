import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { tryOnQualityModeFromResolution } from "@/lib/studio/tryOnQuality";
import { resolveGarmentPrepMode } from "@/lib/studio/resolveGarmentPrepMode";
import { resolveStudioTryOnSettings } from "@/lib/studio/resolveStudioTryOnSettings";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
} from "@/components/studio/types";
export function appendStudioTryOnFields(
  formData: FormData,
  input: {
    productFile: File;
    modelFile: File | null;
    modelImageUrl: string | null;
    garmentPhotoType: GarmentPhotoType;
    garmentPhotoTypeManualOverride: boolean;
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
    garmentPhotoType: input.garmentPhotoType,
    garmentPhotoTypeManualOverride: input.garmentPhotoTypeManualOverride,
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

  const qualityMode = tryOnQualityModeFromResolution(input.modelResolution);
  formData.append("mode", qualityMode);
  formData.append(
    "garmentPrepMode",
    resolveGarmentPrepMode(qualityMode)
  );
  formData.append("modelResolution", input.modelResolution);
  formData.append("moderationLevel", "permissive");
  formData.append("numSamples", "1");
  formData.append("segmentationFree", "true");
  formData.append("outputFormat", "png");
  formData.append("seed", String(input.seed));
}
