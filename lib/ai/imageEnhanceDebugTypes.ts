/**
 * Client-safe type definitions for the /api/ai/image/enhance debug trace.
 *
 * Kept in a separate file (no `server-only` import) so that React components
 * can `import type` from here without pulling in Node-only modules.
 */

export type SourceImageCheck = {
  ok: boolean;
  status: number | null;
  contentType: string | null;
  contentLength: number | null;
  fetchedVia: "head" | "range-get" | "none";
  error: string | null;
};

export type OutputImageCheck = {
  ok: boolean;
  status: number | null;
  contentType: string | null;
  contentLength: number | null;
  width: number | null;
  height: number | null;
  sniffedFormat: "png" | "jpeg" | "webp" | "gif" | "unknown" | null;
  bytesPerPixel: number | null;
  isProbablyUniform: boolean | null;
  /** True if the output image looks like a solid/near-solid colour (black, white, etc.).
   *  Best-effort signal: heuristic only — uses size/dimensions, never pixel data. */
  isProbablyBlack: boolean | null;
  /**
   * Pixel-decoded luminance metrics (0..255). Populated when `sharp` is
   * available at runtime (it is bundled with Next.js); null otherwise. These
   * are the only signal that can distinguish a "real dark scene" from a
   * "bright scene" — `isProbablyBlack` only catches solid/uniform frames.
   */
  meanLuminance: number | null;
  luminanceP5: number | null;
  luminanceP50: number | null;
  luminanceP95: number | null;
  /**
   * True when the decoded pixels indicate the output is visually dark
   * (mean < 12 / P50 < 10, on 0..255). The route uses this as the retry
   * trigger for FLUX. Null when the decoder did not run.
   */
  likelyDarkOutput: boolean | null;
  /**
   * Percentage of RGB-zero pixels (`r==0 && g==0 && b==0`) in the decoded
   * sample. Distinguishes "scene with shadows clipping to black" from
   * "Fal returned a uniform RGB(0,0,0) safety placeholder" — the audit
   * captured a 100.00 case for the latter.
   */
  rgbPercentZero: number | null;
  /**
   * True when the output matches Fal's silent safety-placeholder signature
   * (audit-confirmed pattern):
   *   - rgbPercentZero >= 95     — virtually every pixel is solid black, OR
   *   - meanLuminance < 5 AND bytesPerPixel < 0.02 AND width <= 1024 AND
   *     height <= 1024 — small, near-empty PNG that ignores requested aspect.
   * When true, the route returns a controlled FAL_SAFETY_PLACEHOLDER error
   * instead of saving the placeholder as a ready asset.
   */
  isFalSafetyPlaceholder: boolean | null;
  /** Diagnostic note from the luminance decoder (e.g. "sharp not available"). */
  luminanceError: string | null;
  fetchedVia: "head" | "range-get" | "none";
  error: string | null;
};

export type PromptDebugSummary = {
  userPrompt: string;
  normalizedUserIntent: string;
  enhancedPrompt: string | null;
  productPreservationBlock: string | null;
  /** finalPrompt = post-sanitize (== finalPromptSentToFal). Kept for back-compat. */
  finalPrompt: string;
  /** Builder output BEFORE the final-mile sanitizer was applied. */
  finalPromptBeforeFalSanitize: string;
  /** The EXACT prompt string sent to Fal (post sanitize + per-editor clamp). */
  finalPromptSentToFal: string;
  userPromptLength: number;
  normalizedUserIntentLength: number;
  enhancedPromptLength: number;
  productPreservationBlockLength: number;
  finalPromptLength: number;
  finalPromptLengthBefore: number;
  finalPromptLengthAfter: number;
  containsVideoWords: string[];
  containsSensitiveWords: string[];
  containsBrokenDuplicates: string[];
  /** Labels of sensitive rules that fired during sanitization. */
  removedSensitiveWords: string[];
  /** Labels of duplicate patterns that fired during sanitization. */
  removedDuplicatePatterns: string[];
};

export type FalResponseSummary = {
  providerRequestId: string | null;
  rawKeys: string[];
  imageUrl: string | null;
  imageCount: number;
  hasImageUrl: boolean;
  responseShape: string;
};

export type FalErrorSummary = {
  status: number | string | null;
  code: string | null;
  message: string;
  providerError: string;
  rawErrorName: string | null;
  rawErrorMessage: string | null;
  rawErrorBody: unknown;
};

/**
 * Dark-output retry summary. Populated only when the FLUX-only retry path
 * fires (after the first Fal response was decoded and `likelyDarkOutput=true`).
 * The fields refer to the SECOND Fal call.
 */
export type DarkRetrySummary = {
  attempt: number;
  reason: "dark_output";
  /** guidance_scale used by the retry call. */
  guidanceScale: number;
  /** outputImageCheck of the retry result, if it was probed. */
  outputImageCheck: OutputImageCheck | null;
  /** Whether the retry response itself was returned to the user. */
  usedRetryResult: boolean;
};

/**
 * Nano Banana soft-retry summary. Populated only when the Nano-only soft-retry
 * path fires (first Nano call returned `FAL_CONTENT_REJECTED`, which maps to
 * Fal `no_media_generated` / 422). The fields refer to the SECOND Fal call,
 * which sends the soft payload (no `resolution`, no `limit_generations`).
 */
export type NanoSoftRetrySummary = {
  attempt: 1;
  /**
   * The provider error code from the FIRST Nano call that triggered the retry.
   * In practice this is always `"FAL_CONTENT_REJECTED"` (which the runner emits
   * for `no_media_generated`, 422, and other content/validation rejections).
   */
  reason: "FAL_CONTENT_REJECTED" | "no_media_generated" | "422";
  /** Soft payload omits `resolution` — always true when this summary exists. */
  removedResolution: true;
  /** Soft payload omits `limit_generations` — always true when this summary exists. */
  removedLimitGenerations: true;
  /** Fal request id of the soft-retry call (null if the call itself errored). */
  requestId: string | null;
  /** Was the soft-retry call successful and the image kept as the final result? */
  success: boolean;
  /**
   * Provider error text from the soft-retry call when it failed. Helps tell
   * apart "moderation still rejects" from "Fal timeout" on the retry.
   */
  retryProviderError: string | null;
  /** outputImageCheck of the soft-retry result, if it was probed. */
  outputImageCheck: OutputImageCheck | null;
};

/**
 * Tier of the payload that produced the FINAL image returned to the user.
 *   - `"native"` — first call (`resolution` + `limit_generations` set) succeeded.
 *   - `"soft"`   — first call failed with FAL_CONTENT_REJECTED and the soft
 *     retry (no `resolution`, no `limit_generations`) produced the result.
 *
 * FLUX runs never use this field; it is meaningful for Nano only.
 */
export type EffectiveNanoResolution = "native" | "soft";

export type ImageEnhanceDebugTrace = {
  enabled: true;
  traceId: string;
  editor: "flux-kontext-pro" | "nano-banana-pro";
  aspectRatio: string;
  outputFormat: string;
  quality: string;
  preserveProduct: boolean;
  request: {
    sourceImageUrl: string;
    sourceAssetId: string | null;
    hasUserPrompt: boolean;
    userPromptLength: number;
    hasEnhancedPrompt: boolean;
    enhancedPromptLength: number;
    hasProductPreservationBlock: boolean;
    productPreservationBlockLength: number;
  };
  sourceImageCheck: SourceImageCheck;
  promptDebug: PromptDebugSummary;
  falPayloadSummary: Record<string, unknown>;
  falResponseSummary: FalResponseSummary | null;
  falErrorSummary: FalErrorSummary | null;
  outputImageCheck: OutputImageCheck | null;
  /**
   * If the FLUX dark-output retry path ran, this carries the second
   * generation's metrics. Null when no retry was attempted.
   */
  darkRetry: DarkRetrySummary | null;
  /**
   * If the Nano Banana soft-retry path ran (first call returned
   * FAL_CONTENT_REJECTED), this carries the retry's metrics. Null otherwise.
   * Always null for FLUX runs.
   */
  nanoSoftRetry: NanoSoftRetrySummary | null;
  /**
   * Which Nano payload produced the final image. `"native"` when the first
   * call succeeded, `"soft"` when the soft-retry produced the result. Null
   * for FLUX runs (which never use this knob).
   */
  effectiveResolution: EffectiveNanoResolution | null;
};
