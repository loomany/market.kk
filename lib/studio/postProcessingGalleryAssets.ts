import type { StudioSessionAsset } from "@/components/studio/types";
import {
  getPendingGenerationJob,
  isPendingGenerationStale,
} from "@/lib/studio/pendingGenerationClient";

/** Top-level gallery tiles only — not in-flight child placeholders. */
export function listPostProcessingGalleryAssets(
  assets: StudioSessionAsset[]
): StudioSessionAsset[] {
  return assets.filter((a) => !a.parentAssetId && a.status !== "processing");
}

/** Stale `processing` rows with a local resume job past the TTL. */
export function isStuckProcessingAsset(asset: StudioSessionAsset): boolean {
  if (asset.status !== "processing") return false;
  const job = getPendingGenerationJob(asset.id);
  if (!job) return false;
  return isPendingGenerationStale(job.startedAt);
}
