export type PostProcessingUploadKind = "image" | "video";

import type { StudioSessionAsset } from "@/components/studio/types";

export type PostProcessingUploadedSource = {
  id: string;
  kind: PostProcessingUploadKind;
  fileName: string;
  /** Start frame for i2v / motion `image_url`. */
  imageUrl: string;
  /** Motion reference when `kind === "video"`. */
  referenceVideoUrl?: string;
  /** Local blob URL for preview in the browser. */
  previewUrl: string;
};

/** Persist upload into «Мои файлы» (Fal URLs, not blob preview). */
export function uploadedSourceToGalleryAsset(
  source: PostProcessingUploadedSource
): StudioSessionAsset {
  const createdAt = new Date().toISOString();
  if (source.kind === "video") {
    return {
      id: source.id,
      type: "video",
      url: source.referenceVideoUrl ?? source.imageUrl,
      sourceImageUrl: source.imageUrl,
      referenceVideoUrl: source.referenceVideoUrl,
      mode: "post-processing",
      createdAt,
      format: "mp4",
      label: source.fileName,
      status: "ready",
    };
  }
  return {
    id: source.id,
    type: "scene",
    url: source.imageUrl,
    sourceImageUrl: source.imageUrl,
    mode: "post-processing",
    createdAt,
    format: "png",
    label: source.fileName,
    status: "ready",
  };
}
