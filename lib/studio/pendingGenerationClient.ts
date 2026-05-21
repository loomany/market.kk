import type { ImageEnhanceRequest } from "@/lib/ai/imageEnhanceSchemas";
import type { VideoGenerateRequest } from "@/lib/ai/videoSchemas";

const PENDING_KEY = "vitrina-pending-generations-v1";
/** After this, resume is abandoned and asset marked error. */
export const PENDING_GENERATION_STALE_MS = 45 * 60 * 1000;

export type PendingVideoGenerationJob = {
  kind: "video";
  clientAssetId: string;
  parentAssetId: string;
  startedAt: string;
  body: VideoGenerateRequest & { clientAssetId: string };
};

export type PendingImageGenerationJob = {
  kind: "image";
  clientAssetId: string;
  parentAssetId: string;
  startedAt: string;
  body: ImageEnhanceRequest & { clientAssetId: string };
};

export type PendingGenerationJob =
  | PendingVideoGenerationJob
  | PendingImageGenerationJob;

function loadAll(): PendingGenerationJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingGenerationJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(jobs: PendingGenerationJob[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(jobs));
  } catch {
    /* quota */
  }
}

export function savePendingGenerationJob(job: PendingGenerationJob): void {
  const rest = loadAll().filter((j) => j.clientAssetId !== job.clientAssetId);
  saveAll([job, ...rest]);
}

export function removePendingGenerationJob(clientAssetId: string): void {
  saveAll(loadAll().filter((j) => j.clientAssetId !== clientAssetId));
}

export function getPendingGenerationJob(
  clientAssetId: string
): PendingGenerationJob | null {
  return loadAll().find((j) => j.clientAssetId === clientAssetId) ?? null;
}

export function listPendingGenerationJobs(): PendingGenerationJob[] {
  return loadAll();
}

export function isPendingGenerationStale(startedAt: string): boolean {
  return Date.now() - new Date(startedAt).getTime() > PENDING_GENERATION_STALE_MS;
}
