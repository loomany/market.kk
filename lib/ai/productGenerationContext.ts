import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { ModelGenerationSettings } from "@/components/studio/types";
import {
  buildProductViewResolverInput,
  deriveProductView,
  resolveModelPose,
} from "@/lib/ai/productViewResolver";
import type { ProductViewResolverResult } from "@/lib/ai/productViewTypes";
import {
  type ProductAnalysisUiOverrides,
  productAnalysisForModelGeneration,
  resolveCategoryContext,
} from "@/lib/ai/productAnalysisShared";

export type StudioModelGenerationFields = Pick<
  GenerateModelRequest,
  | "categoryContext"
  | "shortAiSummaryEn"
  | "productSetType"
  | "productSourcePresentation"
  | "sourceModelPromptEn"
  | "sourceModelSizeClass"
  | "sourceModelPose"
  | "sourceModelCrop"
  | "sourceModelCameraAngle"
  | "sourceModelHandsPosition"
  | "sourceModelFraming"
  | "neutralBaseFitGuidanceEn"
  | "sourceFramingGuidanceEn"
  | "productView"
  | "resolvedModelPose"
> & {
  resolver: ProductViewResolverResult;
};

/**
 * Single source of truth for generate-model fields from product analysis + UI settings.
 * Used by one-click and manual "Сгенерировать AI-модель" paths.
 */
export function buildStudioModelGenerationFields(input: {
  analysis: ProductDescriptionAnalysis | null | undefined;
  overrides: ProductAnalysisUiOverrides;
  settings: ModelGenerationSettings;
  userDescriptionRu: string;
  userEditedProductDescription: boolean;
}): StudioModelGenerationFields {
  const productGen = productAnalysisForModelGeneration(
    input.analysis,
    input.overrides,
    input.userDescriptionRu,
    input.userEditedProductDescription
  );

  const sourceModel =
    input.analysis?.sourcePresentation === "on-model"
      ? input.analysis.sourceModel
      : null;

  const resolver = resolveModelPose(
    buildProductViewResolverInput(sourceModel, {
      confidence: input.analysis?.confidence,
      uiPose: input.settings.pose,
      poseCustom: input.settings.poseCustom,
    })
  );

  return {
    ...productGen,
    ...(sourceModel?.crop && sourceModel.crop !== "unknown"
      ? { sourceModelCrop: sourceModel.crop }
      : {}),
    ...(sourceModel?.framing?.trim()
      ? { sourceModelFraming: sourceModel.framing.trim() }
      : {}),
    productView: resolver.productView,
    resolvedModelPose: resolver.resolvedModelPose,
    resolver,
  };
}

export { deriveProductView };
