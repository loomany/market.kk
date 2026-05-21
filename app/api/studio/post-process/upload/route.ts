import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import { uploadImageToFalStorage } from "@/lib/ai/falUpload";
import { uploadVideoToFalStorage } from "@/lib/ai/videoUpload";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  isMockMode,
  paidAiGuardResponse,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";
import { MOCK_BACKGROUND_REMOVED_IMAGE } from "@/lib/ai/mockResults";

export const runtime = "nodejs";

const ROUTE_ID = "/api/studio/post-process/upload";
const EXTRACT_FRAME_MODEL = "fal-ai/ffmpeg-api/extract-frame";

const MOCK_VIDEO_URL =
  "https://v3b.fal.media/files/b/0a90e01f/SWYdQyTBCPWYOLgfg5Jw2_004_video.mp4";

async function extractFirstFrameUrl(
  videoUrl: string,
  guard: PaidAiGuardInput
): Promise<string> {
  getFalClientOrThrow(guard);
  const result = await fal.subscribe(EXTRACT_FRAME_MODEL, {
    input: {
      video_url: videoUrl,
      frame_type: "first",
    },
    logs: false,
  });

  const data = result.data as {
    images?: { url: string }[];
  };
  const frameUrl = data.images?.[0]?.url;
  if (!frameUrl) {
    throw new Error("FRAME_EXTRACT_FAILED");
  }
  return frameUrl;
}

export async function POST(request: Request) {
  const guard: PaidAiGuardInput = {
    provider: "fal",
    route: ROUTE_ID,
    estimatedCostUsd: 0.01,
  };

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message: "Выберите файл (фото или видео).",
        },
        { status: 400 }
      );
    }

    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|mov)$/i.test(file.name);

    if (isMockMode()) {
      if (isVideo) {
        return NextResponse.json({
          ok: true,
          kind: "video" as const,
          imageUrl: MOCK_BACKGROUND_REMOVED_IMAGE,
          referenceVideoUrl: MOCK_VIDEO_URL,
        });
      }
      return NextResponse.json({
        ok: true,
        kind: "image" as const,
        imageUrl: MOCK_BACKGROUND_REMOVED_IMAGE,
      });
    }

    assertPaidAiAllowed(guard);

    if (isVideo) {
      const referenceVideoUrl = await uploadVideoToFalStorage(
        file,
        "Reference video",
        guard
      );
      const imageUrl = await extractFirstFrameUrl(referenceVideoUrl, guard);
      return NextResponse.json({
        ok: true,
        kind: "video" as const,
        imageUrl,
        referenceVideoUrl,
      });
    }

    const imageUrl = await uploadImageToFalStorage(file, "Photo", guard);
    return NextResponse.json({
      ok: true,
      kind: "image" as const,
      imageUrl,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    const message =
      error instanceof Error ? error.message : "Upload failed";
    console.error("[post-process upload]", error);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "UPLOAD_FAILED",
        message:
          message === "FRAME_EXTRACT_FAILED"
            ? "Не удалось подготовить кадр из видео. Попробуйте другой файл."
            : message.includes("MP4") || message.includes("MOV")
              ? "Поддерживаются фото (JPEG, PNG, WebP) и видео MP4/MOV до 200 МБ."
              : "Не удалось загрузить файл. Попробуйте ещё раз.",
      },
      { status: 500 }
    );
  }
}
