import { getVideoVariant } from "@/lib/ai/videoCatalog";
import { resolveVideoVariantId } from "@/lib/ai/videoSchemas";
import type { PendingGenerationJob } from "@/lib/studio/pendingGenerationClient";

export type PendingJobFalMeta = {
  falRequestId?: string;
  falEndpoint?: string;
  requestPayload?: Record<string, unknown>;
};

export function getFalMetaFromPendingJob(
  job: PendingGenerationJob | null
): PendingJobFalMeta {
  if (!job) return {};

  const falRequestId =
    "falRequestId" in job && typeof job.falRequestId === "string"
      ? job.falRequestId
      : undefined;
  const falEndpointStored =
    "falEndpoint" in job && typeof job.falEndpoint === "string"
      ? job.falEndpoint
      : undefined;

  if (job.kind === "video") {
    const variantId = resolveVideoVariantId(job.body);
    const endpoint = variantId
      ? getVideoVariant(variantId).falEndpoint
      : undefined;
    return {
      falRequestId,
      falEndpoint: falEndpointStored ?? endpoint,
      requestPayload: job.body as unknown as Record<string, unknown>,
    };
  }

  if (job.kind === "text-only-video") {
    const variantId = resolveVideoVariantId(job.videoBody);
    const endpoint = variantId
      ? getVideoVariant(variantId).falEndpoint
      : undefined;
    return {
      falRequestId,
      falEndpoint: falEndpointStored ?? endpoint,
      requestPayload: job.videoBody as unknown as Record<string, unknown>,
    };
  }

  return { falRequestId, falEndpoint: falEndpointStored };
}

export function patchPendingJobFalMeta(
  job: PendingGenerationJob,
  meta: { falRequestId?: string; falEndpoint?: string }
): PendingGenerationJob {
  return { ...job, ...meta };
}
