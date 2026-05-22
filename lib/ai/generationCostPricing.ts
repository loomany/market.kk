/**
 * Provider list prices (USD) — single source of truth for studio cost hints.
 * Synced with fal.ai model pages + OpenAI API pricing (2026-05).
 * @see https://fal.ai/models
 * @see https://openai.com/api/pricing/
 */

import type { ImageEditorId, ImageEnhanceQualityTier } from "@/lib/ai/imageEnhanceSchemas";
import type { VideoQuality, VideoVariantId } from "@/lib/ai/videoCatalog";

/** Short OpenAI Responses / vision calls (prompt packages, judge, mask refine). */
export const OPENAI_COST = {
  imagePromptPackage: 0.01,
  videoPromptPackage: 0.01,
  modelPromptCompose: 0.012,
  promptEnhance: 0.01,
  visionSmall: 0.012,
  visionProductDescription: 0.025,
  productPreservationAnalyze: 0.012,
  tryOnJudge: 0.015,
  garmentMaskRefine: 0.012,
  modelIdentityVision: 0.008,
} as const;

/** Fal image — per generation unless noted. */
export const FAL_IMAGE_COST = {
  nanoBananaProT2i: 0.15,
  nanoBananaProEdit: 0.15,
  /** 4K is 2× on Fal; UI maps ultra/high to 2K today. */
  nanoBananaProEdit4k: 0.3,
  fluxKontext: 0.04,
  fashnTryOnV16: 0.075,
  fashnTryOnMax: 0.16,
  briaBackgroundRemove: 0.018,
  briaProductShot: 0.04,
  /** Try-on repair uses nano-banana-pro/edit @ 2K */
  tryOnRepairEdit: 0.15,
  /** Premium garment prep — direct FASHN Edit API (estimate; verify on FASHN dashboard). */
  fashnGarmentEdit: 0.12,
} as const;

export type KlingRateTier = {
  perSecondNoAudio: number;
  perSecondWithAudio: number;
};

/** Per-second video rates from Fal pricing pages. */
export const FAL_VIDEO_RATES: Record<
  VideoVariantId,
  | KlingRateTier
  | { perSecond: number }
  | {
      perSecond720NoAudio: number;
      perSecond720WithAudio: number;
      perSecond1080NoAudio: number;
      perSecond1080WithAudio: number;
      perSecond4kNoAudio: number;
      perSecond4kWithAudio: number;
    }
> = {
  "kling-v3-standard": { perSecondNoAudio: 0.084, perSecondWithAudio: 0.126 },
  "kling-v3-pro": { perSecondNoAudio: 0.112, perSecondWithAudio: 0.168 },
  "kling-v2.6-pro": { perSecondNoAudio: 0.07, perSecondWithAudio: 0.105 },
  "kling-v1.5-pro": { perSecondNoAudio: 0.095, perSecondWithAudio: 0.095 },
  "kling-v2.6-motion-control": { perSecond: 0.07 },
  "kling-v2.6-motion-pro": { perSecond: 0.112 },
  "kling-v3-motion-standard": { perSecond: 0.126 },
  "minimax-hailuo-02": { perSecond: 0.045 },
  "veo-3.1": {
    perSecond720NoAudio: 0.2,
    perSecond720WithAudio: 0.4,
    perSecond1080NoAudio: 0.2,
    perSecond1080WithAudio: 0.4,
    perSecond4kNoAudio: 0.4,
    perSecond4kWithAudio: 0.6,
  },
  "veo-3.1-fast": {
    perSecond720NoAudio: 0.1,
    perSecond720WithAudio: 0.2,
    perSecond1080NoAudio: 0.1,
    perSecond1080WithAudio: 0.2,
    perSecond4kNoAudio: 0.2,
    perSecond4kWithAudio: 0.3,
  },
  "veo-3-fast": {
    perSecond720NoAudio: 0.1,
    perSecond720WithAudio: 0.2,
    perSecond1080NoAudio: 0.1,
    perSecond1080WithAudio: 0.2,
    perSecond4kNoAudio: 0.1,
    perSecond4kWithAudio: 0.15,
  },
};

/** Default ref-video length when duration is unknown (motion control billing). */
export const DEFAULT_MOTION_REFERENCE_SECONDS = 5;

export function nanoBananaEditCostUsd(quality: ImageEnhanceQualityTier): number {
  return quality === "fast" ? FAL_IMAGE_COST.nanoBananaProEdit : FAL_IMAGE_COST.nanoBananaProEdit;
}

export function imageEnhanceFalCostUsd(
  editor: ImageEditorId,
  quality: ImageEnhanceQualityTier
): number {
  if (editor === "flux-kontext-pro") return FAL_IMAGE_COST.fluxKontext;
  return nanoBananaEditCostUsd(quality);
}

export function veoPerSecondRate(
  variantId: VideoVariantId,
  quality: VideoQuality,
  generateAudio: boolean
): number {
  const rates = FAL_VIDEO_RATES[variantId];
  if (!rates || !("perSecond720NoAudio" in rates)) return 0.2;
  const audio = generateAudio;
  if (quality === "ultra") {
    return audio ? rates.perSecond4kWithAudio : rates.perSecond4kNoAudio;
  }
  if (quality === "high") {
    return audio ? rates.perSecond1080WithAudio : rates.perSecond1080NoAudio;
  }
  return audio ? rates.perSecond720WithAudio : rates.perSecond720NoAudio;
}

export function klingPerSecondRate(
  variantId: VideoVariantId,
  generateAudio: boolean
): number {
  const rates = FAL_VIDEO_RATES[variantId];
  if (!rates) return 0.084;
  if ("perSecond" in rates) return rates.perSecond;
  if ("perSecondNoAudio" in rates) {
    return generateAudio ? rates.perSecondWithAudio : rates.perSecondNoAudio;
  }
  return 0.084;
}

export function videoFalCostUsd(input: {
  variantId: VideoVariantId;
  durationSeconds: number;
  quality: VideoQuality;
  generateAudio: boolean;
  referenceVideoDurationSeconds?: number;
}): number {
  const seconds = Math.max(1, input.durationSeconds);
  const rates = FAL_VIDEO_RATES[input.variantId];

  if (rates && "perSecond" in rates) {
    const motionSeconds =
      input.referenceVideoDurationSeconds ?? DEFAULT_MOTION_REFERENCE_SECONDS;
    return Number((rates.perSecond * motionSeconds).toFixed(4));
  }

  if (rates && "perSecondNoAudio" in rates && !("perSecond" in rates)) {
    const rate = input.generateAudio
      ? rates.perSecondWithAudio
      : rates.perSecondNoAudio;
    return Number((rate * seconds).toFixed(4));
  }

  const rate = veoPerSecondRate(
    input.variantId,
    input.quality,
    input.generateAudio
  );
  return Number((rate * seconds).toFixed(4));
}
