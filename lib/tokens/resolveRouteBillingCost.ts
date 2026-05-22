import "server-only";

import {
  estimateClothingPhotoOnModelCost,
  estimateModelGenerationCost,
  estimatePostProcessImageCost,
  estimatePostProcessVideoCost,
  estimateProductCardCost,
} from "@/lib/ai/studioGenerationCostEstimate";
import { mapSaasQualityToVideoApi } from "@/lib/ai/videoCatalog";
import type { ImageEnhanceQualityTier } from "@/lib/ai/imageEnhanceSchemas";
import {
  resolveVideoVariantId,
  videoGenerateRequestSchema,
} from "@/lib/ai/videoSchemas";
import { getVideoVariant } from "@/lib/ai/videoCatalog";
import {
  clothingPipelineCostTokens,
  clothingPipelineCostTokensFromRequest,
  clothingPipelineHintsFromFormData,
  readClothingPipelineBillingHints,
} from "@/lib/tokens/clothingPipelineBilling";
import { getGenerationCost } from "@/lib/tokens/tokenLedger";
import type { GenerationOperationType } from "@/lib/tokens/generationCostConfig";
import { normalizeTokenAmount } from "@/lib/tokens/tokenAmount";

function isMockMode(): boolean {
  return process.env.AI_MOCK_MODE !== "0";
}

export async function resolveTryOnBillingCost(request: Request): Promise<number> {
  const fromHeaders = clothingPipelineCostTokensFromRequest(request);
  if (fromHeaders !== null) return fromHeaders;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.clone().formData();
    return clothingPipelineCostTokens(
      clothingPipelineHintsFromFormData(formData),
      isMockMode()
    );
  }

  return normalizeTokenAmount(getGenerationCost("try-on"));
}

export async function resolveModelGenerationBillingCost(
  request: Request
): Promise<number> {
  const pipeline = clothingPipelineCostTokensFromRequest(request);
  if (pipeline !== null) return pipeline;

  const hints = readClothingPipelineBillingHints(request);
  const useIdentity = hints?.useModelIdentityVision ?? false;
  return estimateModelGenerationCost({
    useModelIdentityVision: useIdentity,
    mockMode: isMockMode(),
  }).tokens;
}

export async function resolveVideoGenerateBillingCost(
  request: Request
): Promise<number> {
  try {
    const body = await request.clone().json();
    const parsed = videoGenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return normalizeTokenAmount(getGenerationCost("video"));
    }
    const variantId = resolveVideoVariantId(parsed.data);
    if (!variantId) {
      return normalizeTokenAmount(getGenerationCost("video"));
    }
    const variant = getVideoVariant(variantId);
    const apiQuality = mapSaasQualityToVideoApi(
      variantId,
      parsed.data.quality ?? "balanced"
    );
    const audioOn =
      parsed.data.generateAudio &&
      variant.capabilities.supportsNativeAudio;
    const estimate = estimatePostProcessVideoCost({
      variantId,
      durationSeconds: parsed.data.durationSeconds,
      quality: apiQuality,
      generateAudio: audioOn,
      mockMode: isMockMode(),
    });
    return normalizeTokenAmount(estimate.tokens);
  } catch {
    return normalizeTokenAmount(getGenerationCost("video"));
  }
}

export async function resolveImageEnhanceBillingCost(
  request: Request
): Promise<number> {
  try {
    const body = (await request.clone().json()) as Record<string, unknown>;
    const editor = (body.editor as string) ?? "nano-banana-pro";
    const quality = (body.quality as ImageEnhanceQualityTier) ?? "high";
    const preserveProduct = Boolean(body.preserveProduct);
    const hasPreservationCached = Boolean(body.hasPreservationCached);
    const runOpenAiPromptPackage = body.runOpenAiPromptPackage !== false;
    const estimate = estimatePostProcessImageCost({
      editor: editor as "nano-banana-pro",
      quality,
      preserveProduct,
      hasPreservationCached,
      runOpenAiPromptPackage,
      mockMode: isMockMode(),
    });
    return normalizeTokenAmount(estimate.tokens);
  } catch {
    return normalizeTokenAmount(getGenerationCost("enhance"));
  }
}

export async function resolveProductShotBillingCost(
  request: Request
): Promise<number> {
  const contentType = request.headers.get("content-type") ?? "";
  let useVision = false;
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.clone().formData();
    useVision = formData.has("productImageFile") || formData.has("productImage");
  }
  const estimate = estimateProductCardCost({
    useVisionGarmentRefine: useVision,
    mockMode: isMockMode(),
  });
  return normalizeTokenAmount(estimate.tokens);
}

export function resolveOperationBillingCost(
  operationType: GenerationOperationType
): (request: Request) => Promise<number> {
  switch (operationType) {
    case "try-on":
      return resolveTryOnBillingCost;
    case "model-generation":
      return resolveModelGenerationBillingCost;
    case "video":
      return resolveVideoGenerateBillingCost;
    case "enhance":
      return resolveImageEnhanceBillingCost;
    case "product-shot":
      return resolveProductShotBillingCost;
    default:
      return async () => normalizeTokenAmount(getGenerationCost(operationType));
  }
}
