import type { ImageEnhanceResponse } from "@/lib/ai/imageEnhanceSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";
import type {
  PendingGenerationJob,
  PendingImageGenerationJob,
  PendingVideoGenerationJob,
} from "@/lib/studio/pendingGenerationClient";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 45 * 60 * 1000;

export type GenerationFetchResult<T> =
  | { kind: "success"; data: T }
  | { kind: "in_progress" }
  | {
      kind: "error";
      message: string;
      billing?: boolean;
      /** Full API JSON for `parseTokenBillingError` (402 / token gate). */
      billingResponse?: unknown;
    };

export async function pollGenerationJobResult(
  clientAssetId: string
): Promise<GenerationFetchResult<Record<string, unknown>>> {
  const started = Date.now();
  while (Date.now() - started < POLL_MAX_MS) {
    const res = await fetch(
      `/api/studio/generation-jobs/${encodeURIComponent(clientAssetId)}`,
      { cache: "no-store" }
    );
    if (res.status === 401 || res.status === 404) {
      return { kind: "in_progress" };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      status?: string;
      result?: Record<string, unknown>;
      message?: string;
      errorCode?: string;
    };
    if (data.status === "completed" && data.result) {
      return { kind: "success", data: data.result };
    }
    if (data.status === "failed" || data.status === "stale") {
      return {
        kind: "error",
        message: data.message ?? "Генерация не удалась.",
      };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return { kind: "error", message: "Генерация заняла слишком много времени." };
}

export async function runVideoGenerationRequest(
  body: PendingVideoGenerationJob["body"]
): Promise<GenerationFetchResult<VideoGenerateResponse>> {
  const res = await fetch("/api/ai/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 202) {
    return { kind: "in_progress" };
  }
  const data = (await res.json()) as VideoGenerateResponse & {
    inProgress?: boolean;
  };
  if (data.ok) {
    return { kind: "success", data };
  }
  if (
    data &&
    typeof data === "object" &&
    "errorCode" in data &&
    data.errorCode === "GENERATION_IN_PROGRESS"
  ) {
    return { kind: "in_progress" };
  }
  const billing = tryBillingFlag(data);
  return {
    kind: "error",
    message: data.message ?? "Не удалось создать видео.",
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

export async function resumePendingGeneration(
  job: PendingGenerationJob
): Promise<GenerationFetchResult<VideoGenerateResponse | ImageEnhanceResponse>> {
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
    const first = await runVideoGenerationRequest(job.body);
    if (first.kind !== "in_progress") return first;
    const polledAfter = await pollGenerationJobResult(job.clientAssetId);
    if (polledAfter.kind === "success") {
      return polledAfter as GenerationFetchResult<VideoGenerateResponse>;
    }
    return polledAfter;
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
