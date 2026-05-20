import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";
import { buildStudioModelGenerationFields } from "@/lib/ai/productGenerationContext";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { productPoseDescriptionForGeneration } from "@/lib/ai/productPoseSummary";
import type { ModelGenerationSettings } from "@/components/studio/types";
import { buildGenerateModelRequestBody } from "@/lib/studio/buildGenerateModelRequest";

export async function fetchGenerateSingleStudioModel(input: {
  settings: ModelGenerationSettings;
  outputSize: ModelOutputSizeSelection;
  modelDescription: string;
  promptLocale: PromptLocale;
  seed: number;
  angle: ResolvedModelAngle;
  productAnalysis: ProductDescriptionAnalysis | null;
  productDescription: string;
  userEditedProductDescription: boolean;
  useProductSampleAngles: boolean;
  cameraAnglePromptOverride?: string;
  signal?: AbortSignal;
}): Promise<{ url: string; response: GenerateModelResponse }> {
  const fields = buildStudioModelGenerationFields({
    analysis: input.productAnalysis,
    overrides: { categoryContext: input.settings.categoryContext },
    settings: input.settings,
    userDescriptionRu: input.productDescription,
    userEditedProductDescription: input.userEditedProductDescription,
  });

  const res = await fetch("/api/ai/generate-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildGenerateModelRequestBody({
        settings: {
          ...input.settings,
          categoryContext: fields.categoryContext,
        },
        outputSize: input.outputSize,
        modelDescription: input.modelDescription,
        shortAiSummaryEn: fields.shortAiSummaryEn,
        productSetType: fields.productSetType,
        productSourcePresentation: fields.productSourcePresentation,
        neutralBaseFitGuidanceEn: fields.neutralBaseFitGuidanceEn,
        sourceFramingGuidanceEn: fields.sourceFramingGuidanceEn,
        sourceModelPromptEn: fields.sourceModelPromptEn,
        sourceModelSizeClass: fields.sourceModelSizeClass,
        sourceModelPose: fields.sourceModelPose,
        sourceModelCrop: fields.sourceModelCrop,
        sourceModelCameraAngle: fields.sourceModelCameraAngle,
        sourceModelHandsPosition: fields.sourceModelHandsPosition,
        sourceModelFraming: fields.sourceModelFraming,
        productView: fields.productView,
        resolvedModelPose: fields.resolvedModelPose,
        cameraAnglePromptOverride: input.cameraAnglePromptOverride,
        promptLocale: input.promptLocale,
        seed: input.seed,
        angle: input.angle,
        productPoseDescriptionRu: input.useProductSampleAngles
          ? productPoseDescriptionForGeneration(input.angle)
          : undefined,
      })
    ),
    signal: input.signal,
  });

  const data = (await res.json()) as GenerateModelResponse & {
    detail?: string;
  };

  if (!data.ok) {
    throw new Error(data.message ?? `Model generation failed (${res.status})`);
  }

  const url = data.images[0]?.url;
  if (!url) {
    throw new Error("Модель не вернула изображение.");
  }

  return { url, response: data };
}
