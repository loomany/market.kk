import type { ModelGenerationSettings } from "@/components/studio/types";
import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import {
  MODEL_CAMERA_ANGLE_PROMPT_MAX,
  PRODUCT_POSE_DESCRIPTION_RU_MAX,
} from "@/lib/ai/modelCustomParams";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";

function clampOptional(text: string | undefined, max: number): string | undefined {
  if (!text?.trim()) return undefined;
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

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
  neutralBaseFitGuidanceEn?: string;
  sourceFramingGuidanceEn?: string;
  sourceModelPromptEn?: string;
  sourceModelSizeClass?: string;
  sourceModelPose?: string;
  sourceModelCrop?: string;
  sourceModelCameraAngle?: string;
  sourceModelHandsPosition?: string;
  sourceModelFraming?: string;
  cameraAnglePromptOverride?: string;
  productView?: GenerateModelRequest["productView"];
  resolvedModelPose?: GenerateModelRequest["resolvedModelPose"];
  preferTextOnlyAngleFollowUp?: boolean;
  modelIdentityLockEn?: string;
  heroImageUrlForIdentity?: string | null;
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
    neutralBaseFitGuidanceEn,
    sourceFramingGuidanceEn,
    sourceModelPromptEn,
    sourceModelSizeClass,
    sourceModelPose,
    sourceModelCrop,
    sourceModelCameraAngle,
    sourceModelHandsPosition,
    sourceModelFraming,
    cameraAnglePromptOverride,
    productView,
    resolvedModelPose,
    preferTextOnlyAngleFollowUp,
    modelIdentityLockEn,
    heroImageUrlForIdentity,
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
    cameraAnglePrompt: clampOptional(
      angle?.prompt ?? cameraAnglePromptOverride,
      MODEL_CAMERA_ANGLE_PROMPT_MAX
    ),
    sourceModelPromptEn,
    sourceModelSizeClass,
    sourceModelPose,
    sourceModelCrop,
    sourceModelCameraAngle,
    sourceModelHandsPosition,
    sourceModelFraming,
    productPoseDescriptionRu: clampOptional(
      productPoseDescriptionRu,
      PRODUCT_POSE_DESCRIPTION_RU_MAX
    ),
    productDescriptionRu: productDescriptionRu?.trim() || undefined,
    shortAiSummaryEn: shortAiSummaryEn?.trim() || undefined,
    productSetType,
    productSourcePresentation,
    productMustPreserve,
    productFitNotes,
    neutralBaseFitGuidanceEn: neutralBaseFitGuidanceEn?.trim() || undefined,
    sourceFramingGuidanceEn: sourceFramingGuidanceEn?.trim() || undefined,
    productView,
    resolvedModelPose,
    referenceImageUrl: referenceImageUrl ?? undefined,
    preferTextOnlyAngleFollowUp: preferTextOnlyAngleFollowUp || undefined,
    modelIdentityLockEn: modelIdentityLockEn?.trim() || undefined,
    heroImageUrlForIdentity: heroImageUrlForIdentity?.trim() || undefined,
    promptLocale,
  };
}
