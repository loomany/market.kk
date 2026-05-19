import "server-only";
import {
  MODEL_GENERATION_EDIT_MODEL,
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
  ImageEnhanceQualityTier,
} from "@/lib/ai/imageEnhanceSchemas";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";
import type { FalDebugSink } from "@/lib/ai/fluxKontextEdit";

const EDIT_TIMEOUT_MS = 120_000;

/**
 * Quality tier mapping for nano-banana-pro/edit.
 * MVP: 4K is intentionally clamped to 2K to keep cost predictable.
 */
export function mapEnhanceQualityToResolution(
  quality: ImageEnhanceQualityTier
): "1K" | "2K" {
  if (quality === "fast") return "1K";
  return "2K";
}

/**
 * nano-banana-pro/edit supports all aspect ratios from `FAL_MODEL_ASPECT_RATIOS`.
 * The UI exposes the SaaS subset (9:16, 4:5, 1:1, 3:4, 16:9), all of which are
 * native ratios for this model — no silent conversion happens here.
 */
export function mapEnhanceAspectRatio(
  ratio: ImageEnhanceAspectRatio
): ImageEnhanceAspectRatio {
  return ratio;
}

export function mapEnhanceOutputFormat(
  format: ImageEnhanceOutputFormat
): "png" | "jpeg" | "webp" {
  if (format === "jpg") return "jpeg";
  return format;
}

/** USD cost estimate for budget guard — pricing must be verified with Fal pricing API before paid runs. */
export function estimateNanoBananaEnhanceCostUsd(
  quality: ImageEnhanceQualityTier
): number {
  if (quality === "fast") return 0.04;
  return 0.06;
}

export type ImageEnhanceFalResult =
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

/**
 * Effective payload tier for a single Nano Banana Pro call.
 *
 *   - `"native"` — full payload as designed: `resolution: "2K" | "1K"` plus
 *     `limit_generations: true`. This is what the first call sends.
 *   - `"soft"`   — same prompt / image / aspect / format / safety_tolerance,
 *     but `resolution` and `limit_generations` are OMITTED entirely (the
 *     server then defaults to `resolution: "1K"` and
 *     `limit_generations: false`). Audit (Nov 2026) isolated each of those
 *     two fields independently as a `no_media_generated` trigger on
 *     adult-on-model sources; dropping BOTH unlocks the same source/prompt
 *     pair without lowering `safety_tolerance` or rewriting the prompt.
 */
export type NanoBananaPayloadTier = "native" | "soft";

export async function runNanoBananaEnhance(input: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio: ImageEnhanceAspectRatio;
  outputFormat: ImageEnhanceOutputFormat;
  quality: ImageEnhanceQualityTier;
  guard: PaidAiGuardInput;
  /** Optional diagnostic hook. No-ops when omitted. */
  debugSink?: FalDebugSink;
  /**
   * When `true`, the runner sends the soft fallback payload (no `resolution`,
   * no `limit_generations`). Used by the route on a `FAL_CONTENT_REJECTED`
   * retry. Defaults to `false` (= native payload, identical to the previous
   * behaviour).
   */
  softRetry?: boolean;
}): Promise<ImageEnhanceFalResult> {
  const useSoft = input.softRetry === true;

  // Native payload includes resolution + limit_generations. Soft payload
  // omits both. Everything else stays identical so the only change between
  // the first call and the retry is exactly the two fields the audit pinned
  // as moderation triggers.
  const payload: {
    prompt: string;
    image_urls: string[];
    num_images: number;
    output_format: ReturnType<typeof mapEnhanceOutputFormat>;
    aspect_ratio: ReturnType<typeof mapEnhanceAspectRatio>;
    safety_tolerance: "1" | "2" | "3" | "4" | "5" | "6";
    resolution?: ReturnType<typeof mapEnhanceQualityToResolution>;
    limit_generations?: boolean;
  } = {
    prompt: input.prompt,
    image_urls: [input.sourceImageUrl],
    num_images: 1,
    output_format: mapEnhanceOutputFormat(input.outputFormat),
    aspect_ratio: mapEnhanceAspectRatio(input.aspectRatio),
    safety_tolerance: "6",
  };

  if (!useSoft) {
    payload.resolution = mapEnhanceQualityToResolution(input.quality);
    payload.limit_generations = true;
  }

  if (input.debugSink) {
    input.debugSink.onPayload({
      model: MODEL_GENERATION_EDIT_MODEL,
      image_urls_count: payload.image_urls.length,
      image_url: payload.image_urls[0],
      promptLength: payload.prompt.length,
      aspect_ratio: payload.aspect_ratio,
      output_format: payload.output_format,
      resolution: payload.resolution ?? null,
      safety_tolerance: payload.safety_tolerance,
      limit_generations: payload.limit_generations ?? null,
      num_images: payload.num_images,
      payloadTier: useSoft ? "soft" : "native",
    });
  }

  try {
    const fal = getFalClientOrThrow(input.guard);

    const subscribePromise = fal.subscribe(MODEL_GENERATION_EDIT_MODEL, {
      input: payload,
      logs: false,
    });

    const result = await withTimeout(
      subscribePromise,
      EDIT_TIMEOUT_MS,
      MODEL_GENERATION_EDIT_MODEL
    );

    const url = (
      result.data as { images?: { url: string }[] } | undefined
    )?.images?.[0]?.url;

    const requestId = result.requestId ?? null;

    input.debugSink?.onSuccess(result.data, requestId);

    if (!url) {
      return {
        ok: false,
        code: "FAL_NO_IMAGE",
        providerError: "Fal edit returned no image URL",
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
