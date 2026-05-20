import type { PremiumGarmentEditDebug } from "@/lib/ai/fashnEditSchemas";
import type { TryOnRequest } from "@/lib/ai/falSchemas";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import {
  buildProductViewResolverInput,
  deriveProductView,
  resolveModelPose,
} from "@/lib/ai/productViewResolver";
import type { QualityMode } from "@/components/studio/types";
import type { TryOnEngine } from "@/lib/ai/tryOnEngine";
import { tryOnEngineLabel } from "@/lib/ai/tryOnEngine";
import type { TryOnGarmentPrepMode } from "@/lib/ai/fashnEditSchemas";
import { isPremiumGarmentEditFeatureEnabled } from "@/lib/ai/fashnEditSchemas";

export type TryOnPipelineDebug = {
  analysis?: {
    detectedProductView?: string;
    detectedProductViewConfidence?: number | null;
    sourcePresentation?: string;
    sourceModelPose?: string;
    sourceModelCameraAngle?: string;
    sourceModelCrop?: string;
  };
  resolver?: {
    resolvedModelPose?: string;
    poseSource?: string;
    reason?: string;
    warnings?: string[];
  };
  tryOn?: {
    tryOnEngine: TryOnEngine;
    tryOnEngineLabel: string;
    tryOnMode: string;
    selectedQualityMode: QualityMode;
    outputFormat: string;
    garmentPhotoType: string;
    category: string;
    segmentationFree: boolean;
    numSamples: number;
  };
  premium?: {
    garmentPrepMode: TryOnGarmentPrepMode;
    premiumGarmentEditEnabled: boolean;
    premiumGarmentEditRan: boolean;
    preparedGarmentImageUrl?: string;
    maskUrl?: string;
    maskStrategy?: string;
    maskWarning?: string;
    editRequestId?: string;
  };
};

export function buildTryOnPipelineDebug(input: {
  productAnalysis: ProductDescriptionAnalysis | null;
  tryOnRequest: TryOnRequest;
  selectedQualityMode: QualityMode;
  tryOnEngine: TryOnEngine;
  garmentPrepMode: TryOnGarmentPrepMode;
  premiumGarmentEdit?: PremiumGarmentEditDebug;
}): TryOnPipelineDebug {
  const sourceModel =
    input.productAnalysis?.sourcePresentation === "on-model"
      ? input.productAnalysis.sourceModel
      : null;
  const productView = deriveProductView(sourceModel);
  const resolver = resolveModelPose(
    buildProductViewResolverInput(sourceModel, {
      confidence: input.productAnalysis?.confidence,
      uiPose: "auto",
      poseCustom: null,
    })
  );

  return {
    analysis: input.productAnalysis
      ? {
          detectedProductView: productView,
          detectedProductViewConfidence: input.productAnalysis.confidence,
          sourcePresentation: input.productAnalysis.sourcePresentation,
          sourceModelPose: sourceModel?.pose ?? undefined,
          sourceModelCameraAngle: sourceModel?.cameraAngle ?? undefined,
          sourceModelCrop: sourceModel?.crop ?? undefined,
        }
      : undefined,
    resolver: {
      resolvedModelPose: resolver.resolvedModelPose,
      poseSource: resolver.poseSource,
      reason: resolver.reason,
      warnings: resolver.warnings,
    },
    tryOn: {
      tryOnEngine: input.tryOnEngine,
      tryOnEngineLabel: tryOnEngineLabel(input.tryOnEngine),
      tryOnMode: input.tryOnRequest.mode,
      selectedQualityMode: input.selectedQualityMode,
      outputFormat: input.tryOnRequest.outputFormat,
      garmentPhotoType: input.tryOnRequest.garmentPhotoType,
      category: input.tryOnRequest.category,
      segmentationFree: input.tryOnRequest.segmentationFree,
      numSamples: input.tryOnRequest.numSamples,
    },
    premium: {
      garmentPrepMode: input.garmentPrepMode,
      premiumGarmentEditEnabled: isPremiumGarmentEditFeatureEnabled(),
      premiumGarmentEditRan: Boolean(input.premiumGarmentEdit?.premiumGarmentPrepRan),
      preparedGarmentImageUrl: input.premiumGarmentEdit?.preparedGarmentImageUrl,
      maskUrl: input.premiumGarmentEdit?.maskUrl,
      maskStrategy: input.premiumGarmentEdit?.maskStrategy,
      maskWarning: input.premiumGarmentEdit?.maskWarning,
      editRequestId: input.premiumGarmentEdit?.editRequestId,
    },
  };
}
