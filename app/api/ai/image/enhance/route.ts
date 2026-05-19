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
  FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
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
      darkRetry: null,
      nanoSoftRetry: null,
      effectiveResolution: null,
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

  /**
   * Build the FLUX prompt. The second call (after a dark-output retry) reuses
   * the same inputs with `brightenForRetry: true` so the prompt text changes
   * by exactly one appended sentence (audit Sec. 7, medium fix).
   */
  function buildFluxPrompt(brightenForRetry: boolean): string {
    return buildFluxKontextEditPrompt({
      userPrompt: data.userPrompt,
      enhancedPrompt: data.enhancedPrompt ?? null,
      preserveProduct: data.preserveProduct,
      productPreservationBlock: data.productPreservationBlock ?? null,
      brightenForRetry,
    });
  }

  const builderOutput =
    editor === "flux-kontext-pro"
      ? buildFluxPrompt(false)
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
  let result =
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

  if (editor === "nano-banana-pro") {
    // Default tier: the first Nano call sent the native payload (resolution
    // + limit_generations). If the retry path below replaces the result, we
    // update this to "soft".
    trace.partial.effectiveResolution = "native";
  }

  // ---- Nano Banana soft retry ----
  // Audit (Nov 2026): each of `resolution: "2K"` and `limit_generations: true`
  // independently triggers `no_media_generated` from Nano on
  // adult-on-model sources; dropping BOTH unlocks the same source/prompt.
  // We do at most ONE retry, only when:
  //   - the editor is Nano (FLUX has its own placeholder/dark-output paths),
  //   - the first call returned FAL_CONTENT_REJECTED (covers Fal's
  //     `no_media_generated`, 422, "did not generate the expected output",
  //     "unsafe content", etc. — see isFalContentOrValidationError).
  // The retry preserves prompt / image / aspect_ratio / output_format /
  // safety_tolerance / num_images and ONLY omits `resolution` +
  // `limit_generations`. The user-visible response is the retry's result if
  // it succeeds; otherwise we fall through to the standard error branch with
  // the FIRST call's error code so the existing UI mapping still applies.
  if (
    editor === "nano-banana-pro" &&
    !result.ok &&
    result.code === "FAL_CONTENT_REJECTED"
  ) {
    logTraceStage(traceId, "nano.soft_retry.start", {
      firstCallCode: result.code,
      firstCallProviderError: result.providerError,
    });

    const softResult = await runNanoBananaEnhance({
      prompt: finalPrompt,
      sourceImageUrl: data.sourceImageUrl,
      aspectRatio: data.aspectRatio,
      outputFormat: data.outputFormat,
      quality: data.quality,
      guard,
      softRetry: true,
      // No debugSink for the retry: keeps the original payload/response in
      // the trace; the retry is captured under `trace.nanoSoftRetry` below.
    });

    if (softResult.ok) {
      // Promote the retry result. We still need to probe the image — but
      // that happens in the unconditional `probeOutputImage` block below,
      // which now sees the retry URL. We populate the soft-retry trace
      // entry once we have that probe.
      const softProbe = await probeOutputImage(softResult.url);
      trace.partial.nanoSoftRetry = {
        attempt: 1,
        reason: "FAL_CONTENT_REJECTED",
        removedResolution: true,
        removedLimitGenerations: true,
        requestId: softResult.requestId,
        success: true,
        retryProviderError: null,
        outputImageCheck: softProbe,
      };
      trace.partial.effectiveResolution = "soft";
      logTraceStage(traceId, "nano.soft_retry.success", {
        requestId: softResult.requestId,
        rgbPercentZero: softProbe.rgbPercentZero,
        meanLuminance: softProbe.meanLuminance,
        isFalSafetyPlaceholder: softProbe.isFalSafetyPlaceholder,
      });
      result = softResult;
    } else {
      trace.partial.nanoSoftRetry = {
        attempt: 1,
        reason: "FAL_CONTENT_REJECTED",
        removedResolution: true,
        removedLimitGenerations: true,
        requestId: null,
        success: false,
        retryProviderError: softResult.providerError,
        outputImageCheck: null,
      };
      logTraceStage(traceId, "nano.soft_retry.failed", {
        code: softResult.code,
        providerError: softResult.providerError,
      });
      // result stays as the original first-call rejection so the error-mapping
      // branch below returns the same FAL_CONTENT_REJECTED to the UI.
    }
  }

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
      // Nano Banana Pro has a stricter image-side moderation classifier (audit
      // Sec. 3). Steer the user toward FLUX, which is what we want them to
      // retry with when Nano rejects the source. FLUX rejections stay generic.
      const userMessage =
        editor === "nano-banana-pro"
          ? "AI-редактор не смог обработать это фото. Попробуйте FLUX Kontext или выберите менее откровенный исходный кадр."
          : "AI не смог обработать это фото. Попробуйте другой промт или более простой режим.";
      return builtError(422, {
        ok: false,
        error: userMessage,
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

  // Output image probe — ALWAYS runs (not debug-gated). The probe is the
  // only place that can detect Fal's silent safety placeholder (audit
  // confirmed: solid RGB(0,0,0) 1024×768 PNG returned with HTTP 200 + a
  // valid request id). The trace surfaces the probe only when debug is on;
  // the placeholder decision below uses it regardless.
  let outputImageCheck: OutputImageCheck = await probeOutputImage(result.url);
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
    meanLuminance: outputImageCheck.meanLuminance,
    luminanceP5: outputImageCheck.luminanceP5,
    luminanceP50: outputImageCheck.luminanceP50,
    luminanceP95: outputImageCheck.luminanceP95,
    likelyDarkOutput: outputImageCheck.likelyDarkOutput,
    rgbPercentZero: outputImageCheck.rgbPercentZero,
    isFalSafetyPlaceholder: outputImageCheck.isFalSafetyPlaceholder,
    luminanceError: outputImageCheck.luminanceError,
    error: outputImageCheck.error,
  });

  // ---- Fal safety-placeholder gate ----
  // Audit Sec. "root cause": Fal FLUX Kontext (and possibly Nano under the
  // same image-side moderation classifier) silently returns a solid black
  // 1024×768 PNG when the source image trips internal moderation. The
  // request status is 200 and there is no provider error — only the pixel
  // signature reveals the placeholder. We MUST NOT:
  //   - save the placeholder as a ready asset (it would look like a broken
  //     generation to the user, with no actionable message), or
  //   - attempt the dark-output retry (the source is the problem, not the
  //     guidance scale — a retry just spends another credit on the same
  //     placeholder).
  // Returning FAL_SAFETY_PLACEHOLDER lets the UI explain *why* it failed.
  if (outputImageCheck.isFalSafetyPlaceholder === true) {
    logTraceStage(traceId, "output.fal_safety_placeholder", {
      editor,
      rgbPercentZero: outputImageCheck.rgbPercentZero,
      meanLuminance: outputImageCheck.meanLuminance,
      width: outputImageCheck.width,
      height: outputImageCheck.height,
      bytesPerPixel: outputImageCheck.bytesPerPixel,
    });
    return jsonError(422, {
      ok: false,
      error:
        "AI-редактор не пропустил это фото. Попробуйте другой редактор или менее откровенный исходник.",
      code: "FAL_SAFETY_PLACEHOLDER",
      providerError: isDev()
        ? `Fal returned a uniform safety placeholder (${outputImageCheck.width}×${outputImageCheck.height}, rgbPercentZero=${outputImageCheck.rgbPercentZero}, meanLuminance=${outputImageCheck.meanLuminance})`
        : undefined,
      debug: finalizeTrace(trace),
    });
  }

  // ---- FLUX dark-output single retry ----
  // Audit Sec. 6/7: FLUX Kontext is the editor that drops to clip-to-black
  // shadows on portrait crops. Nano outputs are not affected by this
  // pattern, so the retry is FLUX-only by design. At most one retry per
  // request — the second call uses guidance 3.3 + a "bright daylight" hint.
  // The placeholder gate above already short-circuited the Fal-moderation
  // case, so the retry only runs for legitimately dark scenes.
  let finalImageUrl = result.url;
  let finalRequestId = result.requestId;

  if (
    editor === "flux-kontext-pro" &&
    outputImageCheck.likelyDarkOutput === true
  ) {
    logTraceStage(traceId, "dark.retry.start", {
      editor,
      guidanceScale: FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
      firstImageUrl: redactUrl(result.url),
    });

    const retryBuilderOutput = buildFluxPrompt(true);
    const retrySanitized =
      sanitizeFinalImageEnhancePromptForFal(retryBuilderOutput);
    const retryFinalPrompt = clampFinalPromptLength(
      retrySanitized.cleaned,
      FINAL_PROMPT_LENGTH_CAPS[editor]
    );

    const retryResult = await runFluxKontextEdit({
      prompt: retryFinalPrompt,
      sourceImageUrl: data.sourceImageUrl,
      aspectRatio: data.aspectRatio,
      outputFormat: data.outputFormat,
      preserveProduct: data.preserveProduct,
      guidanceScaleOverride: FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
      guard,
      // Intentionally NO debugSink — keeps the original payload/response in
      // the trace; the retry is captured under `trace.darkRetry` below.
    });

    if (retryResult.ok) {
      // Always probe the retry too, so the same placeholder gate applies.
      const retryProbe = await probeOutputImage(retryResult.url);

      // Safety placeholder on the retry? Treat exactly the same as on the
      // first attempt: hard fail with FAL_SAFETY_PLACEHOLDER. The retry
      // never repairs a moderation rejection.
      if (retryProbe.isFalSafetyPlaceholder === true) {
        trace.partial.darkRetry = {
          attempt: 1,
          reason: "dark_output",
          guidanceScale: FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
          outputImageCheck: retryProbe,
          usedRetryResult: false,
        };
        logTraceStage(traceId, "dark.retry.fal_safety_placeholder", {
          rgbPercentZero: retryProbe.rgbPercentZero,
          meanLuminance: retryProbe.meanLuminance,
        });
        return jsonError(422, {
          ok: false,
          error:
            "AI-редактор не пропустил это фото. Попробуйте другой редактор или менее откровенный исходник.",
          code: "FAL_SAFETY_PLACEHOLDER",
          providerError: isDev()
            ? `Fal returned a uniform safety placeholder on retry (${retryProbe.width}×${retryProbe.height}, rgbPercentZero=${retryProbe.rgbPercentZero})`
            : undefined,
          debug: finalizeTrace(trace),
        });
      }

      const retryLikelyDark = retryProbe.likelyDarkOutput;
      const useRetry = retryLikelyDark !== true;
      if (useRetry) {
        finalImageUrl = retryResult.url;
        finalRequestId = retryResult.requestId;
        // Replace the user-visible outputImageCheck with the retry's so the
        // UI sees the metrics of the file actually delivered.
        outputImageCheck = retryProbe;
        trace.partial.outputImageCheck = retryProbe;
      }

      trace.partial.darkRetry = {
        attempt: 1,
        reason: "dark_output",
        guidanceScale: FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
        outputImageCheck: retryProbe,
        usedRetryResult: useRetry,
      };
      logTraceStage(traceId, "dark.retry.done", {
        usedRetryResult: useRetry,
        retryLikelyDark,
      });
    } else {
      // Retry hit a Fal error: keep the first (dark) image, don't fail the
      // whole request. Surface the retry failure in the trace.
      trace.partial.darkRetry = {
        attempt: 1,
        reason: "dark_output",
        guidanceScale: FLUX_KONTEXT_GUIDANCE_RETRY_DARK,
        outputImageCheck: null,
        usedRetryResult: false,
      };
      logTraceStage(traceId, "dark.retry.failed", {
        code: retryResult.code,
        providerError: retryResult.providerError,
      });
    }
  }

  const response: ImageEnhanceSuccessResponse = {
    ok: true,
    imageUrl: finalImageUrl,
    provider: "fal",
    model: modelIdForEditor(editor),
    editor,
    promptUsed: finalPrompt,
    requestId: finalRequestId,
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
    requestId: finalRequestId,
    imageUrl: redactUrl(finalImageUrl),
    darkRetryUsed: trace.partial.darkRetry?.usedRetryResult ?? false,
    nanoSoftRetryUsed: trace.partial.nanoSoftRetry?.success ?? false,
    effectiveResolution: trace.partial.effectiveResolution,
  });
  return NextResponse.json(response);
}
