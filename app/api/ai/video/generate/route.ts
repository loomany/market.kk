import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import { OPENAI_COST } from "@/lib/ai/generationCostPricing";
import { estimateVideoOrThrow } from "@/lib/ai/pricing";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { getVideoVariant } from "@/lib/ai/videoCatalog";
import {
  resolveVideoVariantId,
  videoGenerateRequestSchema,
} from "@/lib/ai/videoSchemas";
import { defaultLocale } from "@/lib/i18n/localeConfig";
import { prepareVideoPromptPackage } from "@/lib/ai/videoPromptPackage";
import { wrapAiPost } from "@/lib/tokens/wrapAiPost";
import { resolveVideoGenerateBillingCost } from "@/lib/tokens/resolveRouteBillingCost";
import { withGenerationIdempotency } from "@/lib/studio/withGenerationIdempotency";

export const runtime = "nodejs";
/** Kling/Veo can run several minutes; default serverless cap drops the HTTP response while Fal still finishes. */
export const maxDuration = 300;

const ROUTE_ID = "/api/ai/video/generate";

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

export async function POST(request: Request) {
  return wrapAiPost(request, "video", ROUTE_ID, handleVideoGeneratePost, {
    resolveCost: resolveVideoGenerateBillingCost,
  });
}

async function handleVideoGeneratePost(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = videoGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid video generation request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const variantId = resolveVideoVariantId(parsed.data);
  if (!variantId) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Unknown video model variant",
      },
      { status: 400 }
    );
  }

  const variant = getVideoVariant(variantId);
  const caps = variant.capabilities;
  const data = {
    ...parsed.data,
    variantId,
    generateAudio: caps.supportsNativeAudio
      ? Boolean(parsed.data.generateAudio)
      : false,
    useNegativePrompt: caps.supportsNegativePrompt
      ? Boolean(parsed.data.useNegativePrompt)
      : false,
    negativePrompt: caps.supportsNegativePrompt
      ? parsed.data.negativePrompt
      : undefined,
    keepReferenceSound: caps.supportsReferenceVideoSound
      ? Boolean(parsed.data.keepReferenceSound)
      : false,
    soundPrompt: caps.supportsNativeAudio ? parsed.data.soundPrompt : undefined,
  };
  const promptLocale = data.promptLocale ?? defaultLocale;

  let generationData = data;
  try {
    const packaged = await prepareVideoPromptPackage({
      userPrompt: data.prompt,
      soundPrompt: data.soundPrompt,
      negativePrompt: data.negativePrompt,
      useNegativePrompt: data.useNegativePrompt,
      generateAudio: data.generateAudio,
      motionPreset: data.motionPreset,
      targetPlatform:
        data.aspectRatio === "9:16" ? "reels" : "marketplace",
      locale: promptLocale,
      mockMode: isMockMode(),
    });
    generationData = {
      ...data,
      prompt: packaged.generationPrompt,
      negativePrompt: packaged.negativePromptForApi ?? data.negativePrompt,
    };
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    console.error("[video prompt package]", error);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VIDEO_PROMPT_PACKAGE_FAILED",
        message:
          "Не удалось подготовить промпт для видео. Попробуйте упростить текст и повторить.",
      },
      { status: 502 }
    );
  }

  const estimatedCost =
    estimateVideoOrThrow(variantId, data.durationSeconds, {
      quality: data.quality,
      generateAudio: data.generateAudio,
    }) + OPENAI_COST.videoPromptPackage;
  const { capabilities } = variant;

  return withGenerationIdempotency(
    {
      clientAssetId: data.clientAssetId,
      jobType: "video",
      route: ROUTE_ID,
      requestPayload: data as unknown as Record<string, unknown>,
      provider: "fal",
      model: variant.falEndpoint,
      estimatedCost,
    },
    async () => {
  if (
    capabilities.supportsDuration &&
    variant.durationOptions.length > 0 &&
    !variant.durationOptions.includes(data.durationSeconds)
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Эта видео-модель не поддерживает выбранную длительность.",
        estimatedCost,
      },
      { status: 400 }
    );
  }

  if (
    capabilities.supportsAspectRatio &&
    variant.aspectRatioOptions.length > 0 &&
    !variant.aspectRatioOptions.includes(data.aspectRatio)
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Эта видео-модель не поддерживает выбранный формат кадра.",
        estimatedCost,
      },
      { status: 400 }
    );
  }

  if (
    capabilities.supportsQuality &&
    variant.qualityOptions.length > 0 &&
    !variant.qualityOptions.some((option) => option.id === data.quality)
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Эта видео-модель не поддерживает выбранное качество.",
        estimatedCost,
      },
      { status: 400 }
    );
  }

  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model: variant.falEndpoint,
      video: {
        url: "/demo/video-placeholder.svg",
        posterUrl: data.sourceImageUrl,
        width: data.aspectRatio === "9:16" ? 1080 : 1200,
        height: data.aspectRatio === "9:16" ? 1920 : 1200,
        duration: data.durationSeconds,
        format: "mock",
      },
      requestId: "mock-video-request",
      estimatedCost,
    });
  }

  try {
    assertPaidAiAllowed({
      provider: "fal",
      route: "/api/ai/video/generate",
      estimatedCostUsd: estimatedCost,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    throw error;
  }

  if (!variant.realSchemaVerified) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_VIDEO_MODEL_NOT_CONFIGURED",
        message:
          "Эта video-модель ещё не включена для real calls: нужна проверка схемы и стоимости.",
        estimatedCost,
      },
      { status: 400 }
    );
  }

  try {
    getFalClientOrThrow({
      provider: "fal",
      route: "/api/ai/video/generate",
      estimatedCostUsd: estimatedCost,
    });
    let falInput: Record<string, unknown>;
    try {
      falInput = variant.inputMapper(generationData);
    } catch (mapError) {
      const msg =
        mapError instanceof Error ? mapError.message : "Invalid video input";
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message:
            msg === "REFERENCE_VIDEO_REQUIRED"
              ? "Для Motion Control нужна ссылка на референс-видео."
              : msg,
          estimatedCost,
        },
        { status: 400 }
      );
    }

    const result = await fal.subscribe(variant.falEndpoint, {
      input: falInput,
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log("[fal video] progress");
        }
      },
    });

    const resultData = result.data as {
      video?: { url: string; width?: number; height?: number; duration?: number };
    };

    if (!resultData.video?.url) {
      throw new Error("Video model returned no video URL");
    }

    return NextResponse.json({
      ok: true,
      provider: "fal",
      model: variant.falEndpoint,
      video: {
        url: resultData.video.url,
        width: resultData.video.width,
        height: resultData.video.height,
        duration: resultData.video.duration ?? data.durationSeconds,
        format: "mp4",
      },
      requestId: result.requestId,
      estimatedCost,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("FAL_KEY")) {
      console.error("[fal video] FAL_KEY missing");
      return NextResponse.json(
        {
          ok: false,
          errorCode: "FAL_KEY_MISSING",
          message: "Fal API key is not configured.",
          estimatedCost,
        },
        { status: 500 }
      );
    }

    console.error("[fal video] failed:", message);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_VIDEO_GENERATION_FAILED",
        message: "Не удалось создать видео. Проверьте изображение и попробуйте ещё раз.",
        estimatedCost,
      },
      { status: 500 }
    );
  }
    }
  );
}
