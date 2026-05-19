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
};
