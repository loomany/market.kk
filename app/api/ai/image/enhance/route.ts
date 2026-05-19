import { NextResponse } from "next/server";
import {
  IMAGE_EDITOR_CAPABILITIES,
  editorSupportsAspectRatio,
  editorSupportsOutputFormat,
  imageEnhanceRequestSchema,
  type ImageEnhanceErrorResponse,
  type ImageEnhanceSuccessResponse,
  type ImageEditorId,
} from "@/lib/ai/imageEnhanceSchemas";
import {
  estimateNanoBananaEnhanceCostUsd,
  runNanoBananaEnhance,
} from "@/lib/ai/imageEnhance";
import {
  estimateFluxKontextEditCostUsd,
  runFluxKontextEdit,
} from "@/lib/ai/fluxKontextEdit";
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
} from "@/lib/ai/paidAiGuard";
import { MOCK_PRODUCT_SHOT_IMAGES } from "@/lib/ai/mockResults";
import { buildNanoBananaEnhancePrompt } from "@/lib/studio/imageEnhancementPrompts";
import { buildFluxKontextEditPrompt } from "@/lib/studio/kontextEnhancePrompts";
import {
  FINAL_PROMPT_LENGTH_CAPS,
  clampFinalPromptLength,
  sanitizeFinalImageEnhancePromptForFal,
} from "@/lib/studio/imageEnhanceFinalPromptSanitizer";
import {
  FLUX_KONTEXT_PRO_MODEL,
  MODEL_GENERATION_EDIT_MODEL,
} from "@/lib/ai/falClient";
import type { FalDebugSink } from "@/lib/ai/fluxKontextEdit";
import {
  isImageEnhanceDebugEnabled,
  logTraceStage,
  newImageEnhanceTraceId,
  probeOutputImage,
  probeSourceImage,
  redactUrl,
  summarizeFalError,
  summarizeFalSuccess,
  summarizePromptStages,
  type FalErrorSummary,
  type FalResponseSummary,
  type ImageEnhanceDebugTrace,
  type OutputImageCheck,
  type SourceImageCheck,
} from "@/lib/ai/imageEnhanceDebug";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/image/enhance";

function isDev() {
  return process.env.NODE_ENV === "development";
}

function jsonError(
  status: number,
  body: ImageEnhanceErrorResponse
): NextResponse {
  return NextResponse.json(body, { status });
}

function modelIdForEditor(editor: ImageEditorId): string {
  if (editor === "flux-kontext-pro") return FLUX_KONTEXT_PRO_MODEL;
  return MODEL_GENERATION_EDIT_MODEL;
}

function estimateCostForEditor(
  editor: ImageEditorId,
  quality: "fast" | "balanced" | "high"
): number {
  if (editor === "flux-kontext-pro") return estimateFluxKontextEditCostUsd();
  return estimateNanoBananaEnhanceCostUsd(quality);
}

/** Build the diagnostic trace incrementally so partial errors still carry context. */
type TraceBuilder = {
  traceId: string;
  enabled: boolean;
  partial: Partial<ImageEnhanceDebugTrace> & {
    falPayloadSummary: Record<string, unknown>;
  };
};

function newTrace(traceId: string, enabled: boolean): TraceBuilder {
  return {
    traceId,
    enabled,
    partial: {
      enabled: true,
      traceId,
      falPayloadSummary: {},
      falResponseSummary: null,
      falErrorSummary: null,
      outputImageCheck: null,
    },
  };
}

function finalizeTrace(t: TraceBuilder): ImageEnhanceDebugTrace | undefined {
  if (!t.enabled) return undefined;
  // Coerce: any field still missing at the very end means we never got there.
  return t.partial as ImageEnhanceDebugTrace;
}

export async function POST(request: Request) {
  const traceId = newImageEnhanceTraceId();
  const debugEnabled = isImageEnhanceDebugEnabled();
  const trace = newTrace(traceId, debugEnabled);

  logTraceStage(traceId, "route.start", { route: ROUTE_ID });

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonError(400, {
      ok: false,
      error: "Некорректный JSON.",
      code: "VALIDATION_ERROR",
      debug: finalizeTrace(trace),
    });
  }

  const parsed = imageEnhanceRequestSchema.safeParse(parsedBody);
  if (!parsed.success) {
    logTraceStage(traceId, "validation.failed", { issues: parsed.error.message });
    return jsonError(400, {
      ok: false,
      error: "Не удалось проверить параметры. Попробуйте ещё раз.",
      code: "VALIDATION_ERROR",
      providerError: isDev() ? parsed.error.message : undefined,
      debug: finalizeTrace(trace),
    });
  }

  const data = parsed.data;
  const editor = data.selectedEditor;

  trace.partial.editor = editor;
  trace.partial.aspectRatio = data.aspectRatio;
  trace.partial.outputFormat = data.outputFormat;
  trace.partial.quality = data.quality;
  trace.partial.preserveProduct = data.preserveProduct;
  trace.partial.request = {
    sourceImageUrl: redactUrl(data.sourceImageUrl),
    sourceAssetId: data.sourceAssetId ?? null,
    hasUserPrompt: Boolean(data.userPrompt),
    userPromptLength: data.userPrompt.length,
    hasEnhancedPrompt: Boolean(data.enhancedPrompt),
    enhancedPromptLength: (data.enhancedPrompt ?? "").length,
    hasProductPreservationBlock: Boolean(data.productPreservationBlock),
    productPreservationBlockLength: (data.productPreservationBlock ?? "").length,
  };
  logTraceStage(traceId, "request.parsed", {
    editor,
    aspectRatio: data.aspectRatio,
    outputFormat: data.outputFormat,
    quality: data.quality,
    preserveProduct: data.preserveProduct,
    sourceImageUrl: redactUrl(data.sourceImageUrl),
    sourceAssetId: data.sourceAssetId ?? null,
    hasEnhancedPrompt: Boolean(data.enhancedPrompt),
    hasProductPreservationBlock: Boolean(data.productPreservationBlock),
  });

  if (!editorSupportsAspectRatio(editor, data.aspectRatio)) {
    return jsonError(400, {
      ok: false,
      error: `Этот редактор не поддерживает формат кадра ${data.aspectRatio}. Выберите ${IMAGE_EDITOR_CAPABILITIES[editor].aspectRatios.join(", ")}.`,
      code: "EDITOR_UNSUPPORTED_OPTION",
      debug: finalizeTrace(trace),
    });
  }

  if (!editorSupportsOutputFormat(editor, data.outputFormat)) {
    return jsonError(400, {
      ok: false,
      error: `Этот редактор не поддерживает формат файла ${data.outputFormat.toUpperCase()}. Выберите ${IMAGE_EDITOR_CAPABILITIES[editor].outputFormats.map((f) => f.toUpperCase()).join(" / ")}.`,
      code: "EDITOR_UNSUPPORTED_OPTION",
      debug: finalizeTrace(trace),
    });
  }

  const estimatedCost = estimateCostForEditor(editor, data.quality);

  const builderOutput =
    editor === "flux-kontext-pro"
      ? buildFluxKontextEditPrompt({
          userPrompt: data.userPrompt,
          enhancedPrompt: data.enhancedPrompt ?? null,
          preserveProduct: data.preserveProduct,
          productPreservationBlock: data.productPreservationBlock ?? null,
        })
      : buildNanoBananaEnhancePrompt({
          userPrompt: data.userPrompt,
          enhancedPrompt: data.enhancedPrompt ?? null,
          preserveProduct: data.preserveProduct,
          productPreservationBlock: data.productPreservationBlock ?? null,
        });

  // ---- Final-mile sanitizer ----
  // After the builder runs we still might have user-typed sensitive words,
  // GPT-enhancer artifacts ("adult model", "natural skin texture"), or
  // adjacent duplicates from concatenation ("two-piece two-piece"). This
  // single pass is the last line of defence before Fal sees the prompt.
  const sanitized = sanitizeFinalImageEnhancePromptForFal(builderOutput);
  const finalPrompt = clampFinalPromptLength(
    sanitized.cleaned,
    FINAL_PROMPT_LENGTH_CAPS[editor]
  );

  const promptDebug = summarizePromptStages({
    userPrompt: data.userPrompt,
    normalizedUserIntent: data.userPrompt,
    enhancedPrompt: data.enhancedPrompt ?? null,
    productPreservationBlock: data.productPreservationBlock ?? null,
    finalPromptBeforeFalSanitize: builderOutput,
    finalPromptSentToFal: finalPrompt,
    removedSensitiveWords: sanitized.removedSensitiveWords,
    removedDuplicatePatterns: sanitized.removedDuplicatePatterns,
  });
  trace.partial.promptDebug = promptDebug;
  logTraceStage(traceId, "prompt.built", {
    finalPromptLength: promptDebug.finalPromptLength,
    finalPromptLengthBefore: promptDebug.finalPromptLengthBefore,
    finalPromptLengthAfter: promptDebug.finalPromptLengthAfter,
    enhancedPromptLength: promptDebug.enhancedPromptLength,
    productPreservationBlockLength: promptDebug.productPreservationBlockLength,
    containsVideoWords: promptDebug.containsVideoWords,
    containsSensitiveWords: promptDebug.containsSensitiveWords,
    containsBrokenDuplicates: promptDebug.containsBrokenDuplicates,
    removedSensitiveWords: promptDebug.removedSensitiveWords,
    removedDuplicatePatterns: promptDebug.removedDuplicatePatterns,
  });

  if (isMockMode()) {
    const mock = MOCK_PRODUCT_SHOT_IMAGES[0];
    const sourceImageCheck: SourceImageCheck = debugEnabled
      ? await probeSourceImage(data.sourceImageUrl)
      : {
          ok: true,
          status: 200,
          contentType: null,
          contentLength: null,
          fetchedVia: "none",
          error: null,
        };
    trace.partial.sourceImageCheck = sourceImageCheck;
    logTraceStage(traceId, "source.checked", sourceImageCheck);

    const mockResponse: ImageEnhanceSuccessResponse = {
      ok: true,
      imageUrl: mock.url,
      provider: "mock",
      model:
        editor === "flux-kontext-pro"
          ? "mock-flux-kontext-pro"
          : "mock-nano-banana-pro-edit",
      editor,
      promptUsed: finalPrompt,
      requestId: "mock-image-enhance",
      estimatedCostUsd: null,
      meta: {
        aspectRatio: data.aspectRatio,
        outputFormat: data.outputFormat,
        quality: data.quality,
        preserveProduct: data.preserveProduct,
      },
      debug: finalizeTrace(trace),
    };
    return NextResponse.json(mockResponse);
  }

  // Source image probe BEFORE any paid AI call. Helps tell apart "we sent Fal
  // a broken URL" vs "Fal returned a black image".
  const sourceImageCheck = debugEnabled
    ? await probeSourceImage(data.sourceImageUrl)
    : null;
  if (sourceImageCheck) {
    trace.partial.sourceImageCheck = sourceImageCheck;
    logTraceStage(traceId, "source.checked", sourceImageCheck);
  }

  try {
    assertPaidAiAllowed({
      provider: "fal",
      route: ROUTE_ID,
      estimatedCostUsd: estimatedCost,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return jsonError(error.status, {
        ok: false,
        error:
          "Real image enhancement is disabled. Включите ALLOW_PAID_AI_RUNS=true только после approval бюджета.",
        code: "PAID_AI_RUNS_DISABLED",
        providerError: isDev() ? error.message : undefined,
        debug: finalizeTrace(trace),
      });
    }
    throw error;
  }

  if (!process.env.FAL_KEY) {
    return jsonError(500, {
      ok: false,
      error: "FAL_KEY is not configured.",
      code: "FAL_KEY_MISSING",
      debug: finalizeTrace(trace),
    });
  }

  const guard = {
    provider: "fal" as const,
    route: ROUTE_ID,
    estimatedCostUsd: estimatedCost,
  };

  // Build the diagnostic sink (no-op if debug is off).
  let falResponseSummary: FalResponseSummary | null = null;
  let falErrorSummary: FalErrorSummary | null = null;
  const debugSink: FalDebugSink | undefined = debugEnabled
    ? {
        onPayload: (payload) => {
          // We log SAFE summaries — no API keys, no full image URLs in prod.
          const safe: Record<string, unknown> = { ...payload };
          if (typeof safe.image_url === "string") {
            safe.image_url = redactUrl(safe.image_url as string);
          }
          if (Array.isArray(safe.image_urls)) {
            safe.image_urls_redacted = (safe.image_urls as string[]).map(
              redactUrl
            );
            delete safe.image_urls;
          }
          trace.partial.falPayloadSummary = safe;
          logTraceStage(traceId, "fal.payload", safe);
        },
        onSuccess: (rawData, requestId) => {
          const url =
            typeof rawData === "object" && rawData !== null
              ? ((rawData as { images?: { url?: string }[] }).images?.[0]?.url ??
                null)
              : null;
          falResponseSummary = summarizeFalSuccess({
            rawData,
            requestId,
            resolvedImageUrl: url,
          });
          trace.partial.falResponseSummary = falResponseSummary;
          logTraceStage(traceId, "fal.success", {
            providerRequestId: falResponseSummary.providerRequestId,
            imageCount: falResponseSummary.imageCount,
            hasImageUrl: falResponseSummary.hasImageUrl,
            responseShape: falResponseSummary.responseShape,
          });
        },
        onError: (error) => {
          falErrorSummary = summarizeFalError(error);
          trace.partial.falErrorSummary = falErrorSummary;
          logTraceStage(traceId, "fal.error", {
            status: falErrorSummary.status,
            code: falErrorSummary.code,
            message: falErrorSummary.message,
            rawErrorName: falErrorSummary.rawErrorName,
          });
        },
      }
    : undefined;

  logTraceStage(traceId, "fal.start", { editor });
  const result =
    editor === "flux-kontext-pro"
      ? await runFluxKontextEdit({
          prompt: finalPrompt,
          sourceImageUrl: data.sourceImageUrl,
          aspectRatio: data.aspectRatio,
          outputFormat: data.outputFormat,
          preserveProduct: data.preserveProduct,
          guard,
          debugSink,
        })
      : await runNanoBananaEnhance({
          prompt: finalPrompt,
          sourceImageUrl: data.sourceImageUrl,
          aspectRatio: data.aspectRatio,
          outputFormat: data.outputFormat,
          quality: data.quality,
          guard,
          debugSink,
        });

  if (!result.ok) {
    console.error(
      `[${ROUTE_ID}] ${editor} failed (trace=${traceId}):`,
      result.code,
      result.providerError
    );

    const builtError = (
      status: number,
      body: ImageEnhanceErrorResponse
    ): NextResponse => jsonError(status, { ...body, debug: finalizeTrace(trace) });

    if (result.code === "FAL_KEY_MISSING") {
      return builtError(500, {
        ok: false,
        error: "FAL_KEY is not configured.",
        code: "FAL_KEY_MISSING",
        providerError: isDev() ? result.providerError : undefined,
      });
    }

    if (result.code === "FAL_CONTENT_REJECTED") {
      return builtError(422, {
        ok: false,
        error:
          "AI не смог обработать это фото. Попробуйте другой промт или более простой режим.",
        code: "FAL_CONTENT_REJECTED",
        providerError: isDev() ? result.providerError : undefined,
      });
    }

    if (result.code === "FAL_TIMEOUT") {
      return builtError(504, {
        ok: false,
        error:
          "AI слишком долго обрабатывал фото. Попробуйте ещё раз или выберите режим «Быстро».",
        code: "FAL_TIMEOUT",
        providerError: isDev() ? result.providerError : undefined,
      });
    }

    if (result.code === "FAL_NO_IMAGE") {
      return builtError(502, {
        ok: false,
        error:
          "AI не смог обработать это фото. Попробуйте другой промт или другой файл.",
        code: "FAL_NO_IMAGE",
        providerError: isDev() ? result.providerError : undefined,
      });
    }

    return builtError(500, {
      ok: false,
      error: "Не удалось улучшить фото. Попробуйте ещё раз.",
      code: "FAL_GENERIC_ERROR",
      providerError: isDev() ? result.providerError : undefined,
    });
  }

  // Output image probe — distinguishes "Fal really returned a black PNG" from
  // "frontend rendered it wrong" or "delivery URL is broken".
  const outputImageCheck: OutputImageCheck | null = debugEnabled
    ? await probeOutputImage(result.url)
    : null;
  if (outputImageCheck) {
    trace.partial.outputImageCheck = outputImageCheck;
    logTraceStage(traceId, "output.checked", {
      status: outputImageCheck.status,
      contentType: outputImageCheck.contentType,
      contentLength: outputImageCheck.contentLength,
      width: outputImageCheck.width,
      height: outputImageCheck.height,
      sniffedFormat: outputImageCheck.sniffedFormat,
      bytesPerPixel: outputImageCheck.bytesPerPixel,
      isProbablyUniform: outputImageCheck.isProbablyUniform,
      isProbablyBlack: outputImageCheck.isProbablyBlack,
      error: outputImageCheck.error,
    });
  }

  const response: ImageEnhanceSuccessResponse = {
    ok: true,
    imageUrl: result.url,
    provider: "fal",
    model: modelIdForEditor(editor),
    editor,
    promptUsed: finalPrompt,
    requestId: result.requestId,
    estimatedCostUsd: estimatedCost,
    meta: {
      aspectRatio: data.aspectRatio,
      outputFormat: data.outputFormat,
      quality: data.quality,
      preserveProduct: data.preserveProduct,
    },
    debug: finalizeTrace(trace),
  };

  logTraceStage(traceId, "route.done", {
    ok: true,
    requestId: result.requestId,
    imageUrl: redactUrl(result.url),
  });
  return NextResponse.json(response);
}
