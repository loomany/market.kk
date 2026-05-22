import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import type { StudioSessionAsset } from "@/components/studio/types";

export type PostProcessOrigin =
  | "upload"
  | "text-only-image"
  | "text-only-video";

export function isTextOnlyPostProcessAsset(
  asset: StudioSessionAsset | null | undefined
): boolean {
  if (!asset?.postProcessOrigin) return false;
  return (
    asset.postProcessOrigin === "text-only-image" ||
    asset.postProcessOrigin === "text-only-video"
  );
}

export function createTextOnlyDraftAsset(input: {
  mode: PostProcessingMode;
  label: string;
}): StudioSessionAsset {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const origin: PostProcessOrigin =
    input.mode === "video" ? "text-only-video" : "text-only-image";

  return {
    id,
    type: input.mode === "video" ? "video" : "scene",
    url: "",
    mode: "post-processing",
    createdAt,
    status: "ready",
    label: input.label,
    postProcessOrigin: origin,
  };
}
