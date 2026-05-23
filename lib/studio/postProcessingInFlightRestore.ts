import type { StudioSessionAsset } from "@/components/studio/types";
import {
  getPendingGenerationJob,
  listPendingGenerationJobs,
  type PendingGenerationJob,
} from "@/lib/studio/pendingGenerationClient";

function isVideoJob(job: PendingGenerationJob): boolean {
  return job.kind === "video" || job.kind === "text-only-video";
}

/** Rebuild processing tile for editor preview when only sessionStorage jobs survived reload. */
export function buildProcessingAssetFromJob(
  job: PendingGenerationJob,
  assets: StudioSessionAsset[]
): StudioSessionAsset {
  const parent = assets.find((a) => a.id === job.parentAssetId);
  const isVideo = isVideoJob(job);
  const sourceUrl =
    parent?.sourceImageUrl ??
    parent?.url ??
    (job.kind === "text-only-video"
      ? job.frameImageUrl
      : job.kind === "video"
        ? job.body.sourceImageUrl
        : job.kind === "image"
          ? job.body.sourceImageUrl
          : undefined);

  return {
    id: job.clientAssetId,
    type: isVideo ? "video" : "scene",
    url: "",
    sourceImageUrl: typeof sourceUrl === "string" ? sourceUrl : undefined,
    parentAssetId:
      job.kind === "text-to-image" || job.kind === "text-only-video"
        ? undefined
        : job.parentAssetId,
    mode: isVideo ? "video" : "scene",
    createdAt: job.startedAt,
    startedAt: job.startedAt,
    status: "processing",
    postProcessOrigin:
      job.kind === "text-to-image"
        ? "text-only-image"
        : job.kind === "text-only-video"
          ? "text-only-video"
          : undefined,
  };
}

export function resolveEditorInFlightPreview(
  previewId: string,
  assets: StudioSessionAsset[],
  fallbackStartedAt?: string | null
): StudioSessionAsset | null {
  const fromList = assets.find((a) => a.id === previewId);
  const job =
    getPendingGenerationJob(previewId) ??
    listPendingGenerationJobs().find((j) => j.clientAssetId === previewId) ??
    null;

  const startedAt =
    fromList?.startedAt ??
    job?.startedAt ??
    fallbackStartedAt ??
    fromList?.createdAt;

  if (fromList) {
    return {
      ...fromList,
      status: "processing",
      startedAt: startedAt ?? fromList.createdAt,
    };
  }

  if (job) {
    const built = buildProcessingAssetFromJob(job, assets);
    return fallbackStartedAt && !built.startedAt
      ? { ...built, startedAt: fallbackStartedAt }
      : built;
  }

  return null;
}
