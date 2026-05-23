import "server-only";

import { getVideoVariant } from "@/lib/ai/videoCatalog";
import { resolveVideoVariantId } from "@/lib/ai/videoSchemas";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import type { GenerationJobRow } from "@/lib/studio/generationJobDb";

export type FalVideoQueueSyncResult =
  | { kind: "completed"; payload: Record<string, unknown> }
  | { kind: "in_progress" }
  | { kind: "failed"; message: string };

function readFalRequestMeta(job: GenerationJobRow): {
  falRequestId: string;
  falEndpoint: string;
} | null {
  const rp = job.request_payload as Record<string, unknown>;
  const falRequestId =
    typeof rp.falRequestId === "string" ? rp.falRequestId.trim() : "";
  const falEndpoint =
    (typeof rp.falEndpoint === "string" ? rp.falEndpoint.trim() : "") ||
    (typeof job.model === "string" ? job.model.trim() : "");
  if (!falRequestId || !falEndpoint) return null;
  return { falRequestId, falEndpoint };
}

function endpointFromPayload(payload: Record<string, unknown>): string | null {
  const variantId = resolveVideoVariantId(payload as { variantId?: string });
  if (!variantId) return null;
  return getVideoVariant(variantId).falEndpoint;
}

function resolveFalEndpoints(
  primary: string,
  requestPayload: Record<string, unknown>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ep of [primary, endpointFromPayload(requestPayload)]) {
    const trimmed = ep?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function extractFalVideoFile(
  resultData: unknown
): { url: string; width?: number; height?: number; duration?: number } | null {
  if (!resultData || typeof resultData !== "object") return null;
  const data = resultData as Record<string, unknown>;

  const nested = data.video;
  if (nested && typeof nested === "object" && "url" in nested) {
    const url = (nested as { url: unknown }).url;
    if (typeof url === "string" && url.trim()) {
      const file = nested as {
        url: string;
        width?: number;
        height?: number;
        duration?: number;
      };
      return {
        url: file.url.trim(),
        width: file.width,
        height: file.height,
        duration: file.duration,
      };
    }
  }

  if (typeof nested === "string" && nested.trim()) {
    return { url: nested.trim() };
  }

  if (typeof data.video_url === "string" && data.video_url.trim()) {
    return { url: data.video_url.trim() };
  }

  const output = data.output;
  if (output && typeof output === "object") {
    return extractFalVideoFile(output);
  }

  return null;
}

function buildVideoPayload(
  falEndpoint: string,
  falRequestId: string,
  resultData: unknown,
  requestPayload: Record<string, unknown>,
  estimatedCost: number | null | undefined
): Record<string, unknown> | null {
  const video = extractFalVideoFile(resultData);
  if (!video) return null;

  const durationSeconds =
    typeof requestPayload.durationSeconds === "number"
      ? requestPayload.durationSeconds
      : video.duration ?? 5;

  return {
    ok: true,
    provider: "fal",
    model: falEndpoint,
    video: {
      url: video.url,
      width: video.width,
      height: video.height,
      duration: video.duration ?? durationSeconds,
      format: "mp4",
    },
    requestId: falRequestId,
    estimatedCost: estimatedCost ?? undefined,
  };
}

async function syncFalVideoOnEndpoint(params: {
  fal: ReturnType<typeof getFalClientOrThrow>;
  falRequestId: string;
  falEndpoint: string;
  requestPayload: Record<string, unknown>;
  estimatedCost?: number | null;
}): Promise<FalVideoQueueSyncResult | { kind: "endpoint_not_found" }> {
  try {
    const status = await params.fal.queue.status(params.falEndpoint, {
      requestId: params.falRequestId,
      logs: false,
    });

    if (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") {
      return { kind: "in_progress" };
    }

    if (status.status !== "COMPLETED") {
      const failed = status as { error?: unknown; message?: unknown };
      const message =
        failed.error != null
          ? String(failed.error)
          : failed.message != null
            ? String(failed.message)
            : "Генерация видео на Fal не удалась.";
      return { kind: "failed", message };
    }

    const result = await params.fal.queue.result(params.falEndpoint, {
      requestId: params.falRequestId,
    });
    const payload = buildVideoPayload(
      params.falEndpoint,
      params.falRequestId,
      result.data,
      params.requestPayload,
      params.estimatedCost
    );

    if (!payload) {
      return {
        kind: "failed",
        message: "Fal вернул пустой ответ без видео.",
      };
    }

    return { kind: "completed", payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fal sync failed";
    if (/not found|404/i.test(message)) {
      return { kind: "endpoint_not_found" };
    }
    return { kind: "failed", message };
  }
}

/** One-shot Fal queue check (used by «Обновить статус»). */
export async function syncFalVideoByMeta(params: {
  falRequestId: string;
  falEndpoint: string;
  requestPayload: Record<string, unknown>;
  estimatedCost?: number | null;
}): Promise<FalVideoQueueSyncResult> {
  const fal = getFalClientOrThrow({
    provider: "fal",
    route: "/studio/fal-video-sync",
    estimatedCostUsd: params.estimatedCost ?? 0,
  });

  const endpoints = resolveFalEndpoints(params.falEndpoint, params.requestPayload);
  if (endpoints.length === 0) {
    return { kind: "in_progress" };
  }

  let last: FalVideoQueueSyncResult = { kind: "in_progress" };
  for (const falEndpoint of endpoints) {
    const attempt = await syncFalVideoOnEndpoint({
      fal,
      falRequestId: params.falRequestId,
      falEndpoint,
      requestPayload: params.requestPayload,
      estimatedCost: params.estimatedCost,
    });
    if (attempt.kind === "endpoint_not_found") {
      continue;
    }
    last = attempt;
    if (attempt.kind !== "in_progress") {
      return attempt;
    }
  }
  return last;
}

/** Pull completed Kling/Veo video from Fal when our HTTP handler died but Fal finished. */
export async function syncFalVideoJobFromRow(
  job: GenerationJobRow
): Promise<FalVideoQueueSyncResult> {
  const meta = readFalRequestMeta(job);
  if (!meta) return { kind: "in_progress" };

  return syncFalVideoByMeta({
    falRequestId: meta.falRequestId,
    falEndpoint: meta.falEndpoint,
    requestPayload: job.request_payload as Record<string, unknown>,
    estimatedCost: job.estimated_cost != null ? Number(job.estimated_cost) : null,
  });
}

export async function waitForFalVideoQueueResult(params: {
  falEndpoint: string;
  falRequestId: string;
  requestPayload: Record<string, unknown>;
  estimatedCost?: number;
  maxWaitMs?: number;
  pollIntervalMs?: number;
}): Promise<FalVideoQueueSyncResult> {
  const fal = getFalClientOrThrow({
    provider: "fal",
    route: "/api/ai/video/generate",
    estimatedCostUsd: params.estimatedCost ?? 0,
  });

  const maxWaitMs = params.maxWaitMs ?? 580_000;
  const pollIntervalMs = params.pollIntervalMs ?? 3_000;
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    const status = await fal.queue.status(params.falEndpoint, {
      requestId: params.falRequestId,
      logs: true,
    });

    if (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") {
      await sleep(pollIntervalMs);
      continue;
    }

    if (status.status !== "COMPLETED") {
      const failed = status as { error?: unknown; message?: unknown };
      const message =
        failed.error != null
          ? String(failed.error)
          : failed.message != null
            ? String(failed.message)
            : "Генерация видео на Fal не удалась.";
      return { kind: "failed", message };
    }

    const result = await fal.queue.result(params.falEndpoint, {
      requestId: params.falRequestId,
    });
    const payload = buildVideoPayload(
      params.falEndpoint,
      params.falRequestId,
      result.data,
      params.requestPayload,
      params.estimatedCost
    );

    if (!payload) {
      return {
        kind: "failed",
        message: "Video model returned no video URL",
      };
    }

    return { kind: "completed", payload };
  }

  return { kind: "in_progress" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
