import "server-only";

import { getFalClientOrThrow, MODEL_GENERATION_MODEL } from "@/lib/ai/falClient";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";
import {
  falErrorMessage,
  isFalContentOrValidationError,
  isFalTimeoutError,
  withTimeout,
} from "@/lib/ai/falErrorMessage";
import type {
  ImageEnhanceAspectRatio,
  ImageEnhanceOutputFormat,
  ImageEnhanceQualityTier,
} from "@/lib/ai/imageEnhanceSchemas";
import {
  mapEnhanceAspectRatio,
  mapEnhanceOutputFormat,
  mapEnhanceQualityToResolution,
} from "@/lib/ai/imageEnhance";

const GENERATE_TIMEOUT_MS = 120_000;

export type RunPostProcessTextToImageResult =
  | { ok: true; url: string; requestId: string | null; model: string }
  | {
      ok: false;
      code: string;
      providerError?: string;
    };

export async function runPostProcessTextToImage(input: {
  prompt: string;
  aspectRatio: ImageEnhanceAspectRatio;
  outputFormat: ImageEnhanceOutputFormat;
  quality: ImageEnhanceQualityTier;
  guard: PaidAiGuardInput;
  seed?: number;
}): Promise<RunPostProcessTextToImageResult> {
  try {
    const fal = getFalClientOrThrow(input.guard);
    const result = await withTimeout(
      fal.subscribe(MODEL_GENERATION_MODEL, {
        input: {
          prompt: input.prompt,
          num_images: 1,
          aspect_ratio: mapEnhanceAspectRatio(input.aspectRatio),
          output_format: mapEnhanceOutputFormat(input.outputFormat),
          safety_tolerance: "6",
          resolution: mapEnhanceQualityToResolution(input.quality),
          limit_generations: true,
          ...(typeof input.seed === "number" ? { seed: input.seed } : {}),
        },
        logs: false,
      }),
      GENERATE_TIMEOUT_MS,
      MODEL_GENERATION_MODEL
    );

    const url = (
      result.data as { images?: { url: string }[] } | undefined
    )?.images?.[0]?.url;

    if (!url) {
      return {
        ok: false,
        code: "FAL_NO_IMAGE",
        providerError: "Fal text-to-image returned no image URL",
      };
    }

    return {
      ok: true,
      url,
      requestId: result.requestId ?? null,
      model: MODEL_GENERATION_MODEL,
    };
  } catch (error) {
    const providerError = falErrorMessage(error);

    if (providerError.includes("FAL_KEY")) {
      return { ok: false, code: "FAL_KEY_MISSING", providerError };
    }
    if (isFalTimeoutError(providerError)) {
      return { ok: false, code: "FAL_TIMEOUT", providerError };
    }
    if (isFalContentOrValidationError(providerError)) {
      return { ok: false, code: "FAL_CONTENT_REJECTED", providerError };
    }
    return { ok: false, code: "FAL_GENERIC_ERROR", providerError };
  }
}
