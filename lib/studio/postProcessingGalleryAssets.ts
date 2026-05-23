import type { StudioSessionAsset } from "@/components/studio/types";
import { isVideoAsset } from "@/lib/studio/assetDisplayLabels";
import { isTextOnlyPostProcessAsset } from "@/lib/studio/postProcessingTextOnly";
import {
  getPendingGenerationJob,
  isPendingGenerationStale,
} from "@/lib/studio/pendingGenerationClient";

/** Completed post-processing output linked to a source upload (hidden by legacy filter). */
export function isPostProcessingDerivedOutput(
  asset: StudioSessionAsset
): boolean {
  if (!asset.parentAssetId) return false;
  if (asset.status === "processing") return false;
  return (
    isVideoAsset(asset) ||
    asset.type === "scene" ||
    isTextOnlyPostProcessAsset(asset)
  );
}

/** Gallery tiles: uploads, text-only results, and finished outputs (image→video, enhance, T2I/T2V). */
export function listPostProcessingGalleryAssets(
  assets: StudioSessionAsset[]
): StudioSessionAsset[] {
  const visible = assets.filter((a) => {
    if (a.status === "processing") return false;
    if (!a.parentAssetId) return true;
    return isPostProcessingDerivedOutput(a);
  });

  return [...visible].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Stale `processing` rows with a local resume job past the TTL. */
export function isStuckProcessingAsset(asset: StudioSessionAsset): boolean {
  if (asset.status !== "processing") return false;
  const job = getPendingGenerationJob(asset.id);
  if (!job) return false;
  return isPendingGenerationStale(job.startedAt);
}
