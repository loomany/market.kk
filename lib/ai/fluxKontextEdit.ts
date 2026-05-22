import "server-only";
import {
  FLUX_KONTEXT_PRO_MODEL,
  getFalClientOrThrow,
} from "@/lib/ai/falClient";
import {
  falErrorMessage,
  isFalContentOrValidationError,
  isFalTimeoutError,
  withTimeout,
} from "@/lib/ai/falErrorMessage";
import type {
  ImageEnhanceAspectRatio,
  ImageEnhanceOutputFormat,
} from "@/lib/ai/imageEnhanceSchemas";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";
import { FAL_IMAGE_COST } from "@/lib/ai/generationCostPricing";

/**
 * Optional diagnostic sink — injected by /api/ai/image/enhance when its
 * AI_IMAGE_ENHANCE_DEBUG flag is on. The runner stays a pure orchestrator;
 * the sink decides whether to console.log and/or stash data for the trace.
 */
export type FalDebugSink = {
  onPayload: (payload: Record<string, unknown>) => void;
  onSuccess: (rawData: unknown, requestId: string | null) => void;
  onError: (error: unknown) => void;
};

const EDIT_TIMEOUT_MS = 120_000;

/**
 * FLUX Kontext guidance_scale tiers.
 *
 * 3.5 is Fal's documented default. We previously used 4.5 for preserveProduct
 * runs, but CFG > 4 on Kontext is the documented trigger for clip-to-black
 * shadow outputs on portrait crops; 3.7 keeps product fidelity tight without
 * over-driving the model into dark/blocky shadows. Retry runs after a dark
 * output use the lower end (`FLUX_KONTEXT_GUIDANCE_RETRY_DARK`).
 */
export const FLUX_KONTEXT_GUIDANCE_DEFAULT = 3.5;
export const FLUX_KONTEXT_GUIDANCE_PRESERVE = 3.7;
export const FLUX_KONTEXT_GUIDANCE_RETRY_DARK = 3.3;

/** FLUX Kontext Pro — Fal list price per image. */
export function estimateFluxKontextEditCostUsd(): number {
  return FAL_IMAGE_COST.fluxKontext;
}

/** Maps SaaS jpg to Fal's `jpeg` enum. Kontext does NOT accept webp. */
export function mapKontextOutputFormat(
  format: ImageEnhanceOutputFormat
): "jpeg" | "png" {
  if (format === "jpg") return "jpeg";
  if (format === "png") return "png";
  // Defensive: should be filtered out by route validation before we reach here.
  return "jpeg";
}

/** Aspect ratios accepted by fal-ai/flux-pro/kontext. */
type KontextAspectRatio =
  | "21:9"
  | "16:9"
  | "4:3"
  | "3:2"
  | "1:1"
  | "2:3"
  | "3:4"
  | "9:16"
  | "9:21";

const KONTEXT_NATIVE_RATIOS: ReadonlySet<KontextAspectRatio> = new Set([
  "21:9",
  "16:9",
  "4:3",
  "3:2",
  "1:1",
  "2:3",
  "3:4",
  "9:16",
  "9:21",
]);

/** Pass-through if the UI ratio is native to Kontext; throws otherwise.
 *  Should never throw in practice — the route validates the editor capability
 *  before calling this helper. */
export function mapKontextAspectRatio(
  ratio: ImageEnhanceAspectRatio
): KontextAspectRatio {
  if (KONTEXT_NATIVE_RATIOS.has(ratio as KontextAspectRatio)) {
    return ratio as KontextAspectRatio;
  }
  throw new Error(`Kontext does not support aspect_ratio="${ratio}"`);
}

export type FluxKontextEditResult =
  | { ok: true; url: string; requestId: string | null }
  | {
      ok: false;
      code:
        | "FAL_KEY_MISSING"
        | "FAL_CONTENT_REJECTED"
        | "FAL_TIMEOUT"
        | "FAL_NO_IMAGE"
        | "FAL_GENERIC_ERROR";
      providerError: string;
    };

export async function runFluxKontextEdit(input: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio: ImageEnhanceAspectRatio;
  outputFormat: ImageEnhanceOutputFormat;
  preserveProduct: boolean;
  /**
   * Optional explicit override for `guidance_scale`. Used by the dark-output
   * retry path in `/api/ai/image/enhance` (FLUX-only, single attempt). When
   * omitted, the preserve/default pair above is used.
   */
  guidanceScaleOverride?: number;
  guard: PaidAiGuardInput;
  /** Optional diagnostic hook. No-ops when omitted. */
  debugSink?: FalDebugSink;
}): Promise<FluxKontextEditResult> {
  const guidanceScale =
    typeof input.guidanceScaleOverride === "number"
      ? input.guidanceScaleOverride
      : input.preserveProduct
        ? FLUX_KONTEXT_GUIDANCE_PRESERVE
        : FLUX_KONTEXT_GUIDANCE_DEFAULT;

  const payload: {
    prompt: string;
    image_url: string;
    aspect_ratio: ReturnType<typeof mapKontextAspectRatio>;
    output_format: ReturnType<typeof mapKontextOutputFormat>;
    guidance_scale: number;
    safety_tolerance: "1" | "2" | "3" | "4" | "5" | "6";
    enhance_prompt: boolean;
    num_images: number;
  } = {
    prompt: input.prompt,
    image_url: input.sourceImageUrl,
    aspect_ratio: mapKontextAspectRatio(input.aspectRatio),
    output_format: mapKontextOutputFormat(input.outputFormat),
    guidance_scale: guidanceScale,
    safety_tolerance: "6",
    enhance_prompt: false,
    num_images: 1,
  };

  if (input.debugSink) {
    input.debugSink.onPayload({
      model: FLUX_KONTEXT_PRO_MODEL,
      image_url_present: Boolean(payload.image_url),
      image_url: payload.image_url,
      promptLength: payload.prompt.length,
      aspect_ratio: payload.aspect_ratio,
      output_format: payload.output_format,
      guidance_scale: payload.guidance_scale,
      safety_tolerance: payload.safety_tolerance,
      enhance_prompt: payload.enhance_prompt,
      num_images: payload.num_images,
    });
  }

  try {
    const fal = getFalClientOrThrow(input.guard);

    const subscribePromise = fal.subscribe(FLUX_KONTEXT_PRO_MODEL, {
      input: payload,
      logs: false,
    });

    const result = await withTimeout(
      subscribePromise,
      EDIT_TIMEOUT_MS,
      FLUX_KONTEXT_PRO_MODEL
    );

    const url = (
      result.data as
        | { images?: { url: string }[] }
        | undefined
    )?.images?.[0]?.url;

    const requestId = result.requestId ?? null;

    input.debugSink?.onSuccess(result.data, requestId);

    if (!url) {
      return {
        ok: false,
        code: "FAL_NO_IMAGE",
        providerError: "Fal Kontext returned no image URL",
      };
    }

    return { ok: true, url, requestId };
  } catch (error) {
    input.debugSink?.onError(error);
    const providerError = falErrorMessage(error);

    if (providerError.includes("FAL_KEY")) {
      return {
        ok: false,
        code: "FAL_KEY_MISSING",
        providerError,
      };
    }

    if (isFalTimeoutError(providerError)) {
      return {
        ok: false,
        code: "FAL_TIMEOUT",
        providerError,
      };
    }

    if (isFalContentOrValidationError(providerError)) {
      return {
        ok: false,
        code: "FAL_CONTENT_REJECTED",
        providerError,
      };
    }

    return {
      ok: false,
      code: "FAL_GENERIC_ERROR",
      providerError,
    };
  }
}
