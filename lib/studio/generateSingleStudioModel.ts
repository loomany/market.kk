import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";
import { productAnalysisForModelGeneration } from "@/lib/ai/productAnalysisShared";
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
  const productGen = productAnalysisForModelGeneration(
    input.productAnalysis,
    { categoryContext: input.settings.categoryContext },
    input.productDescription,
    input.userEditedProductDescription
  );

  const res = await fetch("/api/ai/generate-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildGenerateModelRequestBody({
        settings: {
          ...input.settings,
          categoryContext: productGen.categoryContext,
        },
        outputSize: input.outputSize,
        modelDescription: input.modelDescription,
        shortAiSummaryEn: productGen.shortAiSummaryEn,
        productSetType: productGen.productSetType,
        productSourcePresentation: productGen.productSourcePresentation,
        sourceModelPromptEn: productGen.sourceModelPromptEn,
        sourceModelSizeClass: productGen.sourceModelSizeClass,
        sourceModelPose: productGen.sourceModelPose,
        sourceModelCameraAngle: productGen.sourceModelCameraAngle,
        sourceModelHandsPosition: productGen.sourceModelHandsPosition,
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
