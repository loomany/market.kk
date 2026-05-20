import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";

/** Tailwind aspect-* class for studio preview viewports (must be static strings). */
const PREVIEW_ASPECT_CLASS: Record<FalModelAspectRatio, string> = {
  "9:16": "aspect-[9/16]",
  "2:3": "aspect-[2/3]",
  "3:4": "aspect-[3/4]",
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
};

export function previewViewportAspectClass(
  ratio: FalModelAspectRatio
): string {
  return PREVIEW_ASPECT_CLASS[ratio] ?? PREVIEW_ASPECT_CLASS["3:4"];
}
