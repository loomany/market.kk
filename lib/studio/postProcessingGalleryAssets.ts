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

/** Stale or abandoned `processing` rows (e.g. after billing block or reload). */
export function isStuckProcessingAsset(asset: StudioSessionAsset): boolean {
  if (asset.status !== "processing") return false;
  const job = getPendingGenerationJob(asset.id);
  if (!job) return true;
  return isPendingGenerationStale(job.startedAt);
}
