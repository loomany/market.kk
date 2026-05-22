import type { ImageEnhanceRequest } from "@/lib/ai/imageEnhanceSchemas";
import type { TextToImageGenerateRequest } from "@/lib/ai/textToImageSchemas";
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

/** Post-processing text-to-image (no reference file). */
export type PendingTextToImageGenerationJob = {
  kind: "text-to-image";
  clientAssetId: string;
  parentAssetId: string;
  startedAt: string;
  body: TextToImageGenerateRequest & { clientAssetId: string };
  /** UI output format for `applyImageSuccess`. */
  outputFormatUi: "png" | "jpeg";
};

/** Text-to-video: frame (T2I) then video; single gallery asset id = video. */
export type PendingTextOnlyVideoGenerationJob = {
  kind: "text-only-video";
  clientAssetId: string;
  parentAssetId: string;
  startedAt: string;
  frameClientAssetId: string;
  frameBody: TextToImageGenerateRequest & { clientAssetId: string };
  videoBody: VideoGenerateRequest & { clientAssetId: string };
  userPrompt: string;
  frameImageUrl?: string;
};

export type PendingGenerationJob =
  | PendingVideoGenerationJob
  | PendingImageGenerationJob
  | PendingTextToImageGenerationJob
  | PendingTextOnlyVideoGenerationJob;

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

export function patchPendingGenerationJob(
  clientAssetId: string,
  patch: (job: PendingGenerationJob) => PendingGenerationJob
): void {
  const jobs = loadAll();
  const idx = jobs.findIndex((j) => j.clientAssetId === clientAssetId);
  if (idx < 0) return;
  jobs[idx] = patch(jobs[idx]);
  saveAll(jobs);
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
