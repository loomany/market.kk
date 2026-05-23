import type { ImageEnhanceResponse } from "@/lib/ai/imageEnhanceSchemas";
import type { TextToImageGenerateSuccessResponse } from "@/lib/ai/textToImageSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";
import {
  getPendingGenerationJob,
  patchPendingGenerationJob,
  type PendingGenerationJob,
  type PendingImageGenerationJob,
  type PendingTextOnlyVideoGenerationJob,
  type PendingTextToImageGenerationJob,
  type PendingVideoGenerationJob,
} from "@/lib/studio/pendingGenerationClient";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 45 * 60 * 1000;

export type GenerationFetchResult<T> =
  | { kind: "success"; data: T }
  | {
      kind: "in_progress";
      falRequestId?: string;
      /** Fal model endpoint, e.g. fal-ai/kling-video/v1.5/pro/image-to-video */
      falEndpoint?: string;
      /** Server confirmed the job row exists and is still processing. */
      serverProcessing?: boolean;
    }
  | {
      kind: "error";
      message: string;
      errorCode?: string;
      billing?: boolean;
      /** Full API JSON for `parseTokenBillingError` (402 / token gate). */
      billingResponse?: unknown;
    };

function parseSyncResponse(
  data: Record<string, unknown>
): GenerationFetchResult<Record<string, unknown>> {
  if (data.status === "completed" && data.result) {
    const result = data.result as Record<string, unknown>;
    if (parseGenerationJobSuccess(result)) {
      return { kind: "success", data: result };
    }
    return { kind: "in_progress" };
  }
  if (data.status === "failed" || data.status === "stale") {
    return {
      kind: "error",
      message:
        typeof data.message === "string"
          ? data.message
          : "Генерация не удалась.",
      errorCode:
        typeof data.errorCode === "string" ? data.errorCode : undefined,
    };
  }
  return {
    kind: "in_progress",
    falRequestId:
      typeof data.falRequestId === "string" ? data.falRequestId : undefined,
    falEndpoint:
      typeof data.falEndpoint === "string" ? data.falEndpoint : undefined,
    serverProcessing: data.status === "processing" || data.inProgress === true,
  };
}

/** Sync with Fal queue + DB — used by «Обновить статус» and background poll. */
export async function syncGenerationJobStatus(
  clientAssetId: string,
  falMeta?: {
    falRequestId?: string;
    falEndpoint?: string;
    requestPayload?: Record<string, unknown>;
  }
): Promise<GenerationFetchResult<Record<string, unknown>>> {
  const res = await fetch(
    `/api/studio/generation-jobs/${encodeURIComponent(clientAssetId)}/sync`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(falMeta ?? {}),
      cache: "no-store",
    }
  );

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    return { kind: "in_progress" };
  }

  if (res.status === 401) {
    return {
      kind: "error",
      errorCode: "AUTH_REQUIRED",
      message:
        typeof data.message === "string"
          ? data.message
          : "Войдите в аккаунт, чтобы подтянуть готовое видео.",
    };
  }

  if (res.status === 404) {
    return {
      kind: "error",
      errorCode: "NOT_FOUND",
      message:
        typeof data.message === "string"
          ? data.message
          : "Задача не найдена. Запустите создание заново.",
    };
  }

  if (res.status >= 500) {
    const serverMsg =
      typeof data.message === "string"
        ? data.message
        : "Сервер не смог подтянуть готовое видео.";
    return {
      kind: "error",
      errorCode: "SYNC_SERVER_ERROR",
      message: serverMsg,
    };
  }

  return parseSyncResponse(data);
}

/** Fallback when POST sync fails but job row may already be completed in DB. */
export async function fetchGenerationJobViaGet(
  clientAssetId: string
): Promise<GenerationFetchResult<Record<string, unknown>>> {
  const res = await fetch(
    `/api/studio/generation-jobs/${encodeURIComponent(clientAssetId)}`,
    { cache: "no-store" }
  );

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    return { kind: "in_progress" };
  }

  if (res.status >= 500) {
    return {
      kind: "error",
      errorCode: "SYNC_SERVER_ERROR",
      message:
        typeof data.message === "string"
          ? data.message
          : "Сервер не смог подтянуть готовое видео.",
    };
  }

  return parseSyncResponse(data);
}

/** @deprecated Use syncGenerationJobStatus */
export async function fetchGenerationJobOnce(
  clientAssetId: string
): Promise<GenerationFetchResult<Record<string, unknown>>> {
  return syncGenerationJobStatus(clientAssetId);
}

export async function pollGenerationJobResult(
  clientAssetId: string
): Promise<GenerationFetchResult<Record<string, unknown>>> {
  const started = Date.now();
  while (Date.now() - started < POLL_MAX_MS) {
    const outcome = await syncGenerationJobStatus(clientAssetId);
    if (outcome.kind !== "in_progress") {
      return outcome;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return { kind: "error", message: "Генерация заняла слишком много времени." };
}

export async function runVideoGenerationRequest(
  body: PendingVideoGenerationJob["body"]
): Promise<GenerationFetchResult<VideoGenerateResponse>> {
  let res: Response;
  try {
    res = await fetch("/api/ai/video/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { kind: "in_progress" };
  }
  let data: VideoGenerateResponse & {
    inProgress?: boolean;
    falRequestId?: string;
    clientAssetId?: string;
  };
  try {
    data = (await res.json()) as VideoGenerateResponse & {
      inProgress?: boolean;
      falRequestId?: string;
      clientAssetId?: string;
    };
  } catch {
    return { kind: "in_progress" };
  }

  if (res.status === 202) {
    const body = data as {
      falRequestId?: string;
      falEndpoint?: string;
      model?: string;
    };
    const falEndpoint =
      typeof body.falEndpoint === "string"
        ? body.falEndpoint
        : typeof body.model === "string"
          ? body.model
          : undefined;
    return {
      kind: "in_progress",
      falRequestId:
        typeof body.falRequestId === "string" ? body.falRequestId : undefined,
      falEndpoint,
    };
  }

  if (data.ok) {
    if (data.video?.url?.trim()) {
      return { kind: "success", data };
    }
    return { kind: "in_progress" };
  }
  if (
    data &&
    typeof data === "object" &&
    "errorCode" in data &&
    data.errorCode === "GENERATION_IN_PROGRESS"
  ) {
    const body = data as {
      falRequestId?: string;
      falEndpoint?: string;
      model?: string;
    };
    const falEndpoint =
      typeof body.falEndpoint === "string"
        ? body.falEndpoint
        : typeof body.model === "string"
          ? body.model
          : undefined;
    return {
      kind: "in_progress",
      falRequestId:
        typeof body.falRequestId === "string" ? body.falRequestId : undefined,
      falEndpoint,
    };
  }
  const billing = tryBillingFlag(data);
  return {
    kind: "error",
    message: data.message ?? "Не удалось создать видео.",
    billing,
    billingResponse: billing ? data : undefined,
  };
}

export async function runTextToImageGenerationRequest(
  body: PendingTextToImageGenerationJob["body"]
): Promise<GenerationFetchResult<TextToImageGenerateSuccessResponse>> {
  const res = await fetch("/api/ai/image/text-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 202) {
    return { kind: "in_progress" };
  }
  const data = (await res.json()) as TextToImageGenerateSuccessResponse & {
    inProgress?: boolean;
    message?: string;
    errorCode?: string;
  };
  if (data.ok) {
    return { kind: "success", data };
  }
  if (data.errorCode === "GENERATION_IN_PROGRESS") {
    return { kind: "in_progress" };
  }
  const billing = tryBillingFlag(data);
  return {
    kind: "error",
    message: data.message ?? "Не удалось создать изображение.",
    billing,
    billingResponse: billing ? data : undefined,
  };
}

export async function runImageGenerationRequest(
  body: PendingImageGenerationJob["body"]
): Promise<GenerationFetchResult<ImageEnhanceResponse>> {
  const res = await fetch("/api/ai/image/enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 202) {
    return { kind: "in_progress" };
  }
  const data = (await res.json()) as ImageEnhanceResponse & {
    inProgress?: boolean;
  };
  if (data.ok) {
    return { kind: "success", data };
  }
  const billing = tryBillingFlag(data);
  return {
    kind: "error",
    message: data.error ?? "Не удалось улучшить фото.",
    billing,
    billingResponse: billing ? data : undefined,
  };
}

async function resumeTextToImagePending(
  job: PendingTextToImageGenerationJob
): Promise<GenerationFetchResult<TextToImageGenerateSuccessResponse>> {
  const polled = await pollGenerationJobResult(job.clientAssetId);
  if (polled.kind === "success") {
    return {
      kind: "success",
      data: polled.data as TextToImageGenerateSuccessResponse,
    };
  }
  if (polled.kind === "error") {
    return polled;
  }

  const first = await runTextToImageGenerationRequest(job.body);
  if (first.kind !== "in_progress") {
    return first;
  }
  const polledAfter = await pollGenerationJobResult(job.clientAssetId);
  if (polledAfter.kind === "success") {
    return {
      kind: "success",
      data: polledAfter.data as TextToImageGenerateSuccessResponse,
    };
  }
  return polledAfter;
}

async function resolveTextOnlyVideoFrameUrl(
  job: PendingTextOnlyVideoGenerationJob
): Promise<
  | { ok: true; imageUrl: string }
  | { ok: false; outcome: GenerationFetchResult<VideoGenerateResponse> }
> {
  if (job.frameImageUrl?.trim()) {
    return { ok: true, imageUrl: job.frameImageUrl.trim() };
  }

  const framePolled = await pollGenerationJobResult(job.frameClientAssetId);
  if (framePolled.kind === "success" && framePolled.data.ok && framePolled.data.imageUrl) {
    const imageUrl = String(framePolled.data.imageUrl);
    patchPendingGenerationJob(job.clientAssetId, (j) => {
      if (j.kind !== "text-only-video") return j;
      return {
        ...j,
        frameImageUrl: imageUrl,
        videoBody: { ...j.videoBody, sourceImageUrl: imageUrl },
      };
    });
    return { ok: true, imageUrl };
  }
  if (framePolled.kind === "error") {
    return { ok: false, outcome: framePolled };
  }

  const frameRun = await runTextToImageGenerationRequest(job.frameBody);
  if (frameRun.kind === "success") {
    const imageUrl = frameRun.data.imageUrl;
    patchPendingGenerationJob(job.clientAssetId, (j) => {
      if (j.kind !== "text-only-video") return j;
      return {
        ...j,
        frameImageUrl: imageUrl,
        videoBody: { ...j.videoBody, sourceImageUrl: imageUrl },
      };
    });
    return { ok: true, imageUrl };
  }
  if (frameRun.kind === "error") {
    return { ok: false, outcome: frameRun };
  }

  const framePolledAfter = await pollGenerationJobResult(job.frameClientAssetId);
  if (
    framePolledAfter.kind === "success" &&
    framePolledAfter.data.ok &&
    framePolledAfter.data.imageUrl
  ) {
    const imageUrl = String(framePolledAfter.data.imageUrl);
    patchPendingGenerationJob(job.clientAssetId, (j) => {
      if (j.kind !== "text-only-video") return j;
      return {
        ...j,
        frameImageUrl: imageUrl,
        videoBody: { ...j.videoBody, sourceImageUrl: imageUrl },
      };
    });
    return { ok: true, imageUrl };
  }
  if (framePolledAfter.kind === "error") {
    return { ok: false, outcome: framePolledAfter };
  }

  return { ok: false, outcome: { kind: "in_progress" } };
}

async function resumeTextOnlyVideoPending(
  job: PendingTextOnlyVideoGenerationJob
): Promise<GenerationFetchResult<VideoGenerateResponse>> {
  const videoPolled = await pollGenerationJobResult(job.clientAssetId);
  if (videoPolled.kind === "success") {
    return {
      kind: "success",
      data: videoPolled.data as VideoGenerateResponse,
    };
  }
  if (videoPolled.kind === "error") {
    return videoPolled;
  }

  const frameResolved = await resolveTextOnlyVideoFrameUrl(job);
  if (!frameResolved.ok) {
    if (frameResolved.outcome.kind === "in_progress") {
      return { kind: "in_progress" };
    }
    return frameResolved.outcome as GenerationFetchResult<VideoGenerateResponse>;
  }

  const latest = getPendingGenerationJob(job.clientAssetId);
  const videoBody =
    latest?.kind === "text-only-video"
      ? latest.videoBody
      : {
          ...job.videoBody,
          sourceImageUrl: frameResolved.imageUrl,
        };

  const first = await runVideoGenerationRequest(videoBody);
  if (first.kind !== "in_progress") {
    return first;
  }
  const polledAfter = await pollGenerationJobResult(job.clientAssetId);
  if (polledAfter.kind === "success") {
    return {
      kind: "success",
      data: polledAfter.data as VideoGenerateResponse,
    };
  }
  return polledAfter;
}

export async function resumePendingGeneration(
  job: PendingGenerationJob
): Promise<
  GenerationFetchResult<
    | VideoGenerateResponse
    | ImageEnhanceResponse
    | TextToImageGenerateSuccessResponse
  >
> {
  if (job.kind === "text-to-image") {
    return resumeTextToImagePending(job);
  }
  if (job.kind === "text-only-video") {
    return resumeTextOnlyVideoPending(job);
  }

  const polled = await pollGenerationJobResult(job.clientAssetId);
  if (polled.kind === "success") {
    return polled as GenerationFetchResult<
      VideoGenerateResponse | ImageEnhanceResponse
    >;
  }
  if (polled.kind === "error") {
    return polled;
  }

  if (job.kind === "video") {
    // Do not POST again while DB job is processing — idempotency 202 omits Fal ids.
    return polled as GenerationFetchResult<VideoGenerateResponse>;
  }

  const first = await runImageGenerationRequest(job.body);
  if (first.kind !== "in_progress") return first;
  const polledAfter = await pollGenerationJobResult(job.clientAssetId);
  if (polledAfter.kind === "success") {
    return polledAfter as GenerationFetchResult<ImageEnhanceResponse>;
  }
  return polledAfter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tryBillingFlag(data: unknown): boolean | undefined {
  if (!data || typeof data !== "object") return undefined;
  const code = (data as { errorCode?: string }).errorCode;
  return code === "INSUFFICIENT_TOKENS" ? true : undefined;
}
