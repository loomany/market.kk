import "server-only";

import { fal } from "@fal-ai/client";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import {
  applyVitrinaWatermarkToUrl,
  createVitrinaWatermarkOverlayPng,
} from "@/lib/images/applyVitrinaWatermark";

const FAL_COMPOSE_MODEL = "fal-ai/ffmpeg-api/compose";

export function shouldForceVitrinaWatermark(): boolean {
  return process.env.VITRINA_FORCE_WATERMARK === "1";
}

export function generationPayloadNeedsWatermark(
  requestPayload: Record<string, unknown> | null | undefined
): boolean {
  if (shouldForceVitrinaWatermark()) return true;
  return requestPayload?.applyWatermark === true;
}

async function watermarkAndUploadImage(url: string): Promise<string> {
  const buffer = await applyVitrinaWatermarkToUrl(url);
  const falClient = getFalClientOrThrow({
    provider: "fal",
    route: "/tokens/watermark",
  });
  const blob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
  const file = new File([blob], "vitrina-watermarked.jpg", { type: "image/jpeg" });
  return falClient.storage.upload(file);
}

async function watermarkAndUploadVideo(videoUrl: string): Promise<string> {
  getFalClientOrThrow({
    provider: "fal",
    route: "/tokens/watermark-video",
    estimatedCostUsd: 0.01,
  });

  const overlayBuffer = await createVitrinaWatermarkOverlayPng();
  const overlayBlob = new Blob([new Uint8Array(overlayBuffer)], {
    type: "image/png",
  });
  const overlayFile = new File([overlayBlob], "vitrina-watermark.png", {
    type: "image/png",
  });
  const overlayUrl = await fal.storage.upload(overlayFile);

  const composeInput = {
    tracks: [
      {
        id: "base",
        type: "video",
        keyframes: [{ url: videoUrl, timestamp: 0, duration: 0 }],
      },
      {
        id: "wm",
        type: "image",
        keyframes: [{ url: overlayUrl, timestamp: 0, duration: 0 }],
      },
    ],
  };

  const result = await fal.subscribe(FAL_COMPOSE_MODEL, {
    input: composeInput,
    logs: false,
    // Fal compose schema is loosely typed in the client SDK.
  } as { input: typeof composeInput; logs: boolean });

  const data = result.data as { video_url?: string; video?: { url?: string } };
  const out =
    typeof data.video_url === "string"
      ? data.video_url
      : typeof data.video?.url === "string"
        ? data.video.url
        : "";
  if (!out.trim()) {
    throw new Error("WATERMARK_VIDEO_COMPOSE_EMPTY");
  }
  return out;
}

/** Apply vitrina.help watermark to image/video URLs in a generation success payload. */
export async function watermarkGenerationPayload(
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const clone = structuredClone(body);

  const video = clone.video;
  if (
    video &&
    typeof video === "object" &&
    "url" in video &&
    typeof (video as { url: unknown }).url === "string" &&
    (video as { url: string }).url.trim()
  ) {
    const v = video as { url: string };
    v.url = await watermarkAndUploadVideo(v.url);
  }

  if (typeof clone.image === "object" && clone.image && "url" in (clone.image as object)) {
    const image = clone.image as { url: string };
    image.url = await watermarkAndUploadImage(image.url);
  }

  if (typeof clone.imageUrl === "string" && clone.imageUrl) {
    clone.imageUrl = await watermarkAndUploadImage(clone.imageUrl);
  }

  if (Array.isArray(clone.images)) {
    clone.images = await Promise.all(
      (clone.images as { url?: string }[]).map(async (item) => {
        if (!item?.url) return item;
        return { ...item, url: await watermarkAndUploadImage(item.url) };
      })
    );
  }

  return clone;
}
