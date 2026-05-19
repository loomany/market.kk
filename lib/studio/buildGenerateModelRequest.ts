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
  productDescriptionRu?: string;
  shortAiSummaryEn?: string;
  productSetType?: GenerateModelRequest["productSetType"];
  productSourcePresentation?: GenerateModelRequest["productSourcePresentation"];
  productMustPreserve?: GenerateModelRequest["productMustPreserve"];
  productFitNotes?: GenerateModelRequest["productFitNotes"];
  sourceModelPromptEn?: string;
  sourceModelSizeClass?: string;
  sourceModelPose?: string;
  sourceModelCrop?: string;
  sourceModelCameraAngle?: string;
  sourceModelHandsPosition?: string;
  sourceModelFraming?: string;
  cameraAnglePromptOverride?: string;
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
    productDescriptionRu,
    shortAiSummaryEn,
    productSetType,
    productSourcePresentation,
    productMustPreserve,
    productFitNotes,
    sourceModelPromptEn,
    sourceModelSizeClass,
    sourceModelPose,
    sourceModelCrop,
    sourceModelCameraAngle,
    sourceModelHandsPosition,
    sourceModelFraming,
    cameraAnglePromptOverride,
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
    cameraAnglePrompt: angle?.prompt ?? cameraAnglePromptOverride,
    sourceModelPromptEn,
    sourceModelSizeClass,
    sourceModelPose,
    sourceModelCrop,
    sourceModelCameraAngle,
    sourceModelHandsPosition,
    sourceModelFraming,
    productPoseDescriptionRu: productPoseDescriptionRu?.trim() || undefined,
    productDescriptionRu: productDescriptionRu?.trim() || undefined,
    shortAiSummaryEn: shortAiSummaryEn?.trim() || undefined,
    productSetType,
    productSourcePresentation,
    productMustPreserve,
    productFitNotes,
    referenceImageUrl: referenceImageUrl ?? undefined,
    promptLocale,
  };
}
