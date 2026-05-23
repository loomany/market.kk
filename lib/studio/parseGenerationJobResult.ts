import type { ImageEnhanceResponse } from "@/lib/ai/imageEnhanceSchemas";
import type { TextToImageGenerateSuccessResponse } from "@/lib/ai/textToImageSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";

export type ParsedGenerationJobSuccess =
  | { kind: "video"; data: VideoGenerateResponse }
  | { kind: "image"; data: ImageEnhanceResponse | TextToImageGenerateSuccessResponse };

/** Normalize stored generation_jobs payloads for client resume/recovery. */
export function parseGenerationJobSuccess(
  payload: Record<string, unknown>
): ParsedGenerationJobSuccess | null {
  if (payload.ok !== true) return null;

  const video = payload.video;
  if (
    video &&
    typeof video === "object" &&
    "url" in video &&
    typeof (video as { url: unknown }).url === "string" &&
    (video as { url: string }).url.trim()
  ) {
    return {
      kind: "video",
      data: payload as VideoGenerateResponse,
    };
  }

  if (typeof payload.imageUrl === "string" && payload.imageUrl.trim()) {
    return {
      kind: "image",
      data: payload as ImageEnhanceResponse | TextToImageGenerateSuccessResponse,
    };
  }

  return null;
}
