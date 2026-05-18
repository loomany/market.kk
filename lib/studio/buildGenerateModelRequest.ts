import type { ModelGenerationSettings } from "@/components/studio/types";
import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";

export function buildGenerateModelRequestBody(input: {
  settings: ModelGenerationSettings;
  outputSize: ModelOutputSizeSelection;
  modelDescription?: string;
  promptLocale: PromptLocale;
  seed: number;
  angle?: ResolvedModelAngle;
  referenceImageUrl?: string | null;
  productPoseDescriptionRu?: string;
}): GenerateModelRequest {
  const {
    settings,
    outputSize,
    modelDescription,
    promptLocale,
    seed,
    angle,
    referenceImageUrl,
    productPoseDescriptionRu,
  } = input;

  return {
    gender: settings.gender,
    modelNationality: settings.modelNationality.trim() || undefined,
    bodyType: settings.bodyType,
    bodyTypeCustom: settings.bodyTypeCustom.trim() || undefined,
    modelAge: settings.modelAge,
    pose: settings.pose,
    poseCustom: settings.poseCustom.trim() || undefined,
    crop: settings.crop,
    cropCustom: settings.cropCustom.trim() || undefined,
    background: settings.background,
    lighting: settings.lighting,
    lightingCustom: settings.lightingCustom.trim() || undefined,
    categoryContext: settings.categoryContext,
    aspectRatio: outputSize.aspectRatio,
    outputFormat: "png",
    resolution: outputSize.resolution,
    numImages: 1,
    seed,
    customDescription: modelDescription?.trim() || undefined,
    cameraAnglePrompt: angle?.prompt,
    productPoseDescriptionRu: productPoseDescriptionRu?.trim() || undefined,
    referenceImageUrl: referenceImageUrl ?? undefined,
    promptLocale,
  };
}
