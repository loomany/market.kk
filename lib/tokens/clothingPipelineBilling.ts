import { estimateClothingPhotoOnModelCost } from "@/lib/ai/studioGenerationCostEstimate";
import { normalizeTokenAmount } from "@/lib/tokens/tokenAmount";

export const VITRINA_BILLING_GROUP_HEADER = "x-vitrina-billing-group";
export const CLOTHING_PHOTO_PIPELINE_GROUP = "clothing-photo-pipeline";

const H_NEEDS_ANALYZE = "x-vitrina-billing-needs-analyze";
const H_NEEDS_MODEL = "x-vitrina-billing-needs-model";
const H_LINGERIE_IDENTITY = "x-vitrina-billing-lingerie-identity";
const H_TRYON_MAX = "x-vitrina-billing-tryon-max";

export type ClothingPipelineBillingHints = {
  needsProductAnalyze: boolean;
  needsModelGeneration: boolean;
  useModelIdentityVision: boolean;
  tryOnMaxExperimental: boolean;
};

export function isClothingPhotoPipelineRequest(request: Request): boolean {
  return (
    request.headers.get(VITRINA_BILLING_GROUP_HEADER) ===
    CLOTHING_PHOTO_PIPELINE_GROUP
  );
}

export function readClothingPipelineBillingHints(
  request: Request
): ClothingPipelineBillingHints | null {
  if (!isClothingPhotoPipelineRequest(request)) return null;
  return {
    needsProductAnalyze:
      request.headers.get(H_NEEDS_ANALYZE) === "1",
    needsModelGeneration: request.headers.get(H_NEEDS_MODEL) === "1",
    useModelIdentityVision:
      request.headers.get(H_LINGERIE_IDENTITY) === "1",
    tryOnMaxExperimental: request.headers.get(H_TRYON_MAX) === "1",
  };
}

export function clothingPipelineCostTokens(
  hints: ClothingPipelineBillingHints,
  mockMode = false
): number {
  const estimate = estimateClothingPhotoOnModelCost({
    needsProductAnalyze: hints.needsProductAnalyze,
    needsModelGeneration: hints.needsModelGeneration,
    useModelIdentityVision: hints.useModelIdentityVision,
    tryOnMaxExperimental: hints.tryOnMaxExperimental,
    mockMode,
  });
  return normalizeTokenAmount(estimate.tokensMax ?? estimate.tokens);
}

function isMockMode(): boolean {
  return process.env.AI_MOCK_MODE !== "0";
}

export function clothingPipelineCostTokensFromRequest(
  request: Request
): number | null {
  const hints = readClothingPipelineBillingHints(request);
  if (!hints) return null;
  return clothingPipelineCostTokens(hints, isMockMode());
}

/** Infer pipeline hints from try-on multipart (fallback when headers absent). */
export function clothingPipelineHintsFromFormData(
  formData: FormData
): ClothingPipelineBillingHints {
  const hasAnalysis = Boolean(formData.get("productAnalysisJson")?.toString().trim());
  const hasModel =
    formData.has("modelImageFile") ||
    Boolean(formData.get("modelImageUrl")?.toString().trim());
  const tryOnMax =
    formData.get("tryOnMaxExperimental") === "true" ||
    formData.get("tryOnMaxExperimental") === "1";
  return {
    needsProductAnalyze: !hasAnalysis,
    needsModelGeneration: !hasModel,
    useModelIdentityVision: false,
    tryOnMaxExperimental: tryOnMax,
  };
}

export function buildClothingPipelineBillingHeaders(
  hints: ClothingPipelineBillingHints
): Record<string, string> {
  return {
    [VITRINA_BILLING_GROUP_HEADER]: CLOTHING_PHOTO_PIPELINE_GROUP,
    [H_NEEDS_ANALYZE]: hints.needsProductAnalyze ? "1" : "0",
    [H_NEEDS_MODEL]: hints.needsModelGeneration ? "1" : "0",
    [H_LINGERIE_IDENTITY]: hints.useModelIdentityVision ? "1" : "0",
    [H_TRYON_MAX]: hints.tryOnMaxExperimental ? "1" : "0",
  };
}
