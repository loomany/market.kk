/**
 * Client-safe studio generation cost estimates (USD → display tokens).
 * 1 token = $1 by default (NEXT_PUBLIC_TOKEN_USD_RATE).
 */

import {
  DEFAULT_MOTION_REFERENCE_SECONDS,
  FAL_IMAGE_COST,
  OPENAI_COST,
  imageEnhanceFalCostUsd,
  videoFalCostUsd,
} from "@/lib/ai/generationCostPricing";
import type { ImageEditorId, ImageEnhanceQualityTier } from "@/lib/ai/imageEnhanceSchemas";
import type { VideoQuality, VideoVariantId } from "@/lib/ai/videoCatalog";
import { getVideoVariant } from "@/lib/ai/videoCatalog";
import { tokenUsdRate, usdToTokenAmount } from "@/lib/tokens/tokenAmount";

export type CostLineId =
  | "openai_product_analyze"
  | "openai_preservation"
  | "openai_image_prompt"
  | "openai_video_prompt"
  | "openai_model_compose"
  | "openai_model_identity"
  | "openai_tryon_judge"
  | "openai_garment_refine"
  | "fal_image_enhance"
  | "fal_image_retry"
  | "fal_video"
  | "fal_model_generation"
  | "fal_tryon"
  | "fal_tryon_repair"
  | "fal_garment_prep"
  | "fal_background_remove";

export type CostLine = {
  id: CostLineId;
  usd: number;
  /** Included in totalTokens / totalUsd */
  includedInTotal: boolean;
};

export type StudioCostEstimate = {
  totalUsd: number;
  /** Legacy single value (= tokensMax when range). */
  tokens: number;
  /** Minimum charge when optional provider steps are skipped. */
  tokensMin?: number;
  /** Maximum charge (preflight + pipeline billing). */
  tokensMax?: number;
  lines: CostLine[];
  /** Optional steps (retry, repair) — shown as upper bound */
  optionalLines: CostLine[];
};

/** @deprecated Use tokenUsdRate() from lib/tokens/tokenAmount */
export function tokenUsdRateForDisplay(): number {
  return tokenUsdRate();
}

/** Exact tokens for UI (1 token = $1 by default, no rounding up). */
export function usdToDisplayTokens(usd: number): number {
  const tokens = usdToTokenAmount(usd);
  if (tokens <= 0) return 0;
  return Number(tokens.toFixed(2));
}

function buildEstimate(
  lines: CostLine[],
  optionalLines: CostLine[] = [],
  options?: { includeOptionalInTotal?: boolean }
): StudioCostEstimate {
  const baseUsd = lines
    .filter((l) => l.includedInTotal)
    .reduce((sum, l) => sum + l.usd, 0);
  const optionalUsd = options?.includeOptionalInTotal
    ? optionalLines.reduce((sum, l) => sum + l.usd, 0)
    : 0;
  const maxUsd = baseUsd + optionalUsd;
  const minUsd = baseUsd;
  const includeOptional = Boolean(options?.includeOptionalInTotal);
  return {
    totalUsd: Number(maxUsd.toFixed(4)),
    tokens: usdToDisplayTokens(maxUsd),
    tokensMin: usdToDisplayTokens(minUsd),
    tokensMax: usdToDisplayTokens(maxUsd),
    lines,
    optionalLines: includeOptional ? [] : optionalLines,
  };
}

export function estimatePostProcessImageCost(input: {
  editor: ImageEditorId;
  quality: ImageEnhanceQualityTier;
  preserveProduct: boolean;
  hasPreservationCached: boolean;
  runOpenAiPromptPackage: boolean;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const lines: CostLine[] = [];
  const optional: CostLine[] = [];

  if (input.preserveProduct && !input.hasPreservationCached) {
    lines.push({
      id: "openai_preservation",
      usd: OPENAI_COST.productPreservationAnalyze,
      includedInTotal: true,
    });
  }

  if (input.runOpenAiPromptPackage) {
    lines.push({
      id: "openai_image_prompt",
      usd: OPENAI_COST.imagePromptPackage,
      includedInTotal: true,
    });
  }

  lines.push({
    id: "fal_image_enhance",
    usd: imageEnhanceFalCostUsd(input.editor, input.quality),
    includedInTotal: true,
  });

  if (input.editor === "nano-banana-pro") {
    optional.push({
      id: "fal_image_retry",
      usd: FAL_IMAGE_COST.nanoBananaProEdit,
      includedInTotal: false,
    });
  }

  return buildEstimate(lines, optional);
}

export function estimatePostProcessVideoCost(input: {
  variantId: VideoVariantId;
  durationSeconds: number;
  quality: VideoQuality;
  generateAudio: boolean;
  referenceVideoDurationSeconds?: number;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const variant = getVideoVariant(input.variantId);
  let seconds = input.durationSeconds;
  if (!variant.capabilities.supportsDuration) {
    seconds =
      input.referenceVideoDurationSeconds ?? DEFAULT_MOTION_REFERENCE_SECONDS;
  } else if (variant.durationOptions.length > 0 && seconds <= 0) {
    seconds = variant.durationOptions[0]!;
  }

  const falUsd = videoFalCostUsd({
    variantId: input.variantId,
    durationSeconds: seconds,
    quality: input.quality,
    generateAudio: input.generateAudio,
    referenceVideoDurationSeconds: input.referenceVideoDurationSeconds,
  });

  return buildEstimate([
    {
      id: "openai_video_prompt",
      usd: OPENAI_COST.videoPromptPackage,
      includedInTotal: true,
    },
    {
      id: "fal_video",
      usd: falUsd,
      includedInTotal: true,
    },
  ]);
}

export function estimateClothingPhotoOnModelCost(input: {
  needsProductAnalyze?: boolean;
  needsModelGeneration: boolean;
  useModelIdentityVision?: boolean;
  tryOnMaxExperimental: boolean;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const lines: CostLine[] = [];
  const optional: CostLine[] = [];

  if (input.needsModelGeneration) {
    lines.push({
      id: "openai_model_compose",
      usd: OPENAI_COST.modelPromptCompose,
      includedInTotal: true,
    });
    if (input.useModelIdentityVision) {
      lines.push({
        id: "openai_model_identity",
        usd: OPENAI_COST.modelIdentityVision,
        includedInTotal: true,
      });
    }
    lines.push({
      id: "fal_model_generation",
      usd: FAL_IMAGE_COST.nanoBananaProT2i,
      includedInTotal: true,
    });
  }

  lines.push({
    id: "fal_tryon",
    usd: input.tryOnMaxExperimental
      ? FAL_IMAGE_COST.fashnTryOnMax
      : FAL_IMAGE_COST.fashnTryOnV16,
    includedInTotal: true,
  });

  lines.push({
    id: "openai_tryon_judge",
    usd: OPENAI_COST.tryOnJudge,
    includedInTotal: true,
  });

  optional.push({
    id: "fal_tryon_repair",
    usd: FAL_IMAGE_COST.tryOnRepairEdit,
    includedInTotal: false,
  });

  optional.push({
    id: "fal_garment_prep",
    usd: FAL_IMAGE_COST.fashnGarmentEdit,
    includedInTotal: false,
  });

  return buildEstimate(lines, optional);
}

export function estimateModelGenerationCost(input: {
  useModelIdentityVision?: boolean;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const lines: CostLine[] = [
    {
      id: "openai_model_compose",
      usd: OPENAI_COST.modelPromptCompose,
      includedInTotal: true,
    },
    {
      id: "fal_model_generation",
      usd: FAL_IMAGE_COST.nanoBananaProT2i,
      includedInTotal: true,
    },
  ];

  if (input.useModelIdentityVision) {
    lines.push({
      id: "openai_model_identity",
      usd: OPENAI_COST.modelIdentityVision,
      includedInTotal: true,
    });
  }

  return buildEstimate(lines);
}

export function estimateProductCardCost(input: {
  useVisionGarmentRefine: boolean;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const lines: CostLine[] = [];
  if (input.useVisionGarmentRefine) {
    lines.push({
      id: "openai_garment_refine",
      usd: OPENAI_COST.garmentMaskRefine,
      includedInTotal: true,
    });
  }
  lines.push({
    id: "fal_background_remove",
    usd: FAL_IMAGE_COST.briaBackgroundRemove,
    includedInTotal: true,
  });

  return buildEstimate(lines);
}

/** Per-angle model generation (separate button flow). */
export function estimateModelGenerationAngleCost(input: {
  useModelIdentityVision?: boolean;
  mockMode?: boolean;
}): StudioCostEstimate {
  if (input.mockMode) {
    return buildEstimate([]);
  }

  const lines: CostLine[] = [
    {
      id: "openai_model_compose",
      usd: OPENAI_COST.modelPromptCompose,
      includedInTotal: true,
    },
    {
      id: "fal_model_generation",
      usd: FAL_IMAGE_COST.nanoBananaProT2i,
      includedInTotal: true,
    },
  ];
  if (input.useModelIdentityVision) {
    lines.push({
      id: "openai_model_identity",
      usd: OPENAI_COST.modelIdentityVision,
      includedInTotal: true,
    });
  }
  return buildEstimate(lines);
}
