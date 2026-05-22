import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { ModelCategoryContext } from "@/components/studio/types";
import {
  buildClothingPipelineBillingHeaders,
  type ClothingPipelineBillingHints,
} from "@/lib/tokens/clothingPipelineBilling";

export function buildClothingPipelineHints(input: {
  productAnalysis: ProductDescriptionAnalysis | null;
  /** Override auto-detect from analysis presence. */
  needsProductAnalyze?: boolean;
  needsModelGeneration: boolean;
  categoryContext: ModelCategoryContext;
  modelInputMode: "create" | "upload";
  tryOnMaxExperimental: boolean;
}): ClothingPipelineBillingHints {
  return {
    needsProductAnalyze:
      input.needsProductAnalyze ?? !input.productAnalysis,
    needsModelGeneration: input.needsModelGeneration,
    useModelIdentityVision:
      input.categoryContext === "lingerie" && input.modelInputMode === "create",
    tryOnMaxExperimental: input.tryOnMaxExperimental,
  };
}

export function clothingPipelineBillingHeadersFromHints(
  hints: ClothingPipelineBillingHints
): Record<string, string> {
  return buildClothingPipelineBillingHeaders(hints);
}
