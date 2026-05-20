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
import { resolveLingerieSetType } from "@/lib/ai/lingerieSetType";

export type TryOnPipelineDebug = {
  analysis?: {
    detectedProductView?: string;
    detectedProductViewConfidence?: number | null;
    sourcePresentation?: string;
    sourceModelPose?: string;
    sourceModelCameraAngle?: string;
    sourceModelCrop?: string;
    lingerieSetType?: string;
    lingerieSetTypeConfidence?: number;
    lingerieSetTypeReason?: string;
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
    tryOnMaxExperimental?: boolean;
    fashnTryOnMaxPrompt?: string;
    promptPreview?: string;
    fashnTryOnMaxResolution?: string;
    fashnTryOnMaxGenerationMode?: string;
    garmentTypeLockApplied?: boolean;
    antiOnePieceApplied?: boolean;
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
    editPromptSummary?: string;
    editLingerieSetType?: string;
    editAntiOnePieceApplied?: boolean;
  };
  quality?: {
    judged: boolean;
    repaired: boolean;
    judgeScore?: number;
    judgeIssues?: string[];
    repairAttempted?: boolean;
    repairSucceeded?: boolean;
    repairErrorReason?: string;
  };
};

export function buildTryOnPipelineDebug(input: {
  productAnalysis: ProductDescriptionAnalysis | null;
  tryOnRequest: TryOnRequest;
  selectedQualityMode: QualityMode;
  tryOnEngine: TryOnEngine;
  garmentPrepMode: TryOnGarmentPrepMode;
  premiumGarmentEdit?: PremiumGarmentEditDebug;
  tryOnMaxExperimental?: boolean;
  fashnTryOnMaxPrompt?: string;
  promptPreview?: string;
  fashnTryOnMaxResolution?: string;
  fashnTryOnMaxGenerationMode?: string;
  garmentTypeLockApplied?: boolean;
  antiOnePieceApplied?: boolean;
  qualityMeta?: {
    judged: boolean;
    repaired: boolean;
    judgeScore?: number;
    judgeIssues?: string[];
    repairAttempted?: boolean;
    repairSucceeded?: boolean;
    repairErrorReason?: string;
  };
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

  const lingerieInfo = input.productAnalysis
    ? resolveLingerieSetType(input.productAnalysis)
    : null;

  return {
    analysis: input.productAnalysis
      ? {
          detectedProductView: productView,
          detectedProductViewConfidence: input.productAnalysis.confidence,
          sourcePresentation: input.productAnalysis.sourcePresentation,
          sourceModelPose: sourceModel?.pose ?? undefined,
          sourceModelCameraAngle: sourceModel?.cameraAngle ?? undefined,
          sourceModelCrop: sourceModel?.crop ?? undefined,
          lingerieSetType: lingerieInfo?.lingerieSetType,
          lingerieSetTypeConfidence: lingerieInfo?.lingerieSetTypeConfidence,
          lingerieSetTypeReason: lingerieInfo?.lingerieSetTypeReason,
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
      tryOnMaxExperimental: input.tryOnMaxExperimental,
      fashnTryOnMaxPrompt: input.fashnTryOnMaxPrompt,
      promptPreview: input.promptPreview ?? input.fashnTryOnMaxPrompt,
      fashnTryOnMaxResolution: input.fashnTryOnMaxResolution,
      fashnTryOnMaxGenerationMode: input.fashnTryOnMaxGenerationMode,
      garmentTypeLockApplied: input.garmentTypeLockApplied,
      antiOnePieceApplied: input.antiOnePieceApplied,
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
      editPromptSummary: input.premiumGarmentEdit?.editPromptSummary,
      editLingerieSetType: input.premiumGarmentEdit?.lingerieSetType,
      editAntiOnePieceApplied: input.premiumGarmentEdit?.editAntiOnePieceApplied,
    },
    ...(input.qualityMeta ? { quality: input.qualityMeta } : {}),
  };
}
