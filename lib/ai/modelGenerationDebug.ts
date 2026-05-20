import type {
  GenerateModelRequest,
  ModelGenerationDebugInfo,
} from "@/lib/ai/modelGenerationSchemas";
import type { ProductViewResolverResult } from "@/lib/ai/productViewTypes";

export function buildModelGenerationDebug(input: {
  request: GenerateModelRequest;
  promptPreview: string;
  promptComposer?: "openai" | "template";
  resolver?: ProductViewResolverResult;
}): ModelGenerationDebugInfo {
  return {
    analysis: {
      detectedProductView: input.request.productView,
      detectedProductViewConfidence:
        input.resolver?.detectedProductViewConfidence ?? null,
      sourcePresentation: input.request.productSourcePresentation,
      sourceModelPose: input.request.sourceModelPose,
      sourceModelCameraAngle: input.request.sourceModelCameraAngle,
      sourceModelCrop: input.request.sourceModelCrop,
    },
    resolver: input.resolver
      ? {
          resolvedModelPose: input.resolver.resolvedModelPose,
          poseSource: input.resolver.poseSource,
          reason: input.resolver.reason,
          warnings: input.resolver.warnings,
        }
      : {
          resolvedModelPose: input.request.resolvedModelPose,
        },
    generation: {
      promptPreview: input.promptPreview,
      promptComposer: input.promptComposer,
      aspectRatio: input.request.aspectRatio,
      resolution: input.request.resolution,
      selectedQualityMode: input.request.resolution,
    },
  };
}
