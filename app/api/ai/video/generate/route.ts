import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import { canSpendEstimated, estimateVideoOrThrow } from "@/lib/ai/pricing";
import { getVideoModel } from "@/lib/ai/videoModels";
import { videoGenerateRequestSchema } from "@/lib/ai/videoSchemas";

export const runtime = "nodejs";

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

export async function POST(request: Request) {
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

  const data = parsed.data;
  const model = getVideoModel(data.modelKey);
  const estimatedCost = estimateVideoOrThrow(data.modelKey, data.durationSeconds);

  if (
    !model.durationOptions.includes(data.durationSeconds) ||
    !model.aspectRatioOptions.includes(data.aspectRatio) ||
    !model.qualityOptions.some((option) => option.id === data.quality)
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Р­С‚Р° РІРёРґРµРѕ-РјРѕРґРµР»СЊ РЅРµ РїРѕРґРґРµСЂР¶РёРІР°РµС‚ РІС‹Р±СЂР°РЅРЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё.",
        estimatedCost,
      },
      { status: 400 }
    );
  }

  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model: model.id,
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

  if (!model.realSchemaVerified) {
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

  if (!canSpendEstimated(estimatedCost)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_VIDEO_PRICING_UNKNOWN",
        message:
          "Real video generation заблокирован бюджетным guard. Включите ALLOW_PAID_AI_RUNS и MAX_AI_TEST_SPEND_USD после approval.",
        estimatedCost,
      },
      { status: 402 }
    );
  }

  try {
    getFalClientOrThrow();
    const result = await fal.subscribe(model.id, {
      input: model.inputMapper(data),
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
      model: model.id,
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
