import { NextResponse } from "next/server";
import { getVideoVariant } from "@/lib/ai/videoCatalog";
import { resolveVideoVariantId } from "@/lib/ai/videoSchemas";
import { getCurrentSession } from "@/lib/auth/session";
import {
  completeGenerationJob,
  findGenerationJobByAssetId,
  isGenerationJobStale,
  patchGenerationJobRequestPayload,
} from "@/lib/studio/generationJobDb";
import { chargeGenerationJobTokensIfNeeded } from "@/lib/studio/chargeGenerationJobTokens";
import { syncFalVideoByMeta, syncFalVideoJobFromRow } from "@/lib/studio/falVideoQueueSync";
import {
  generationPayloadNeedsWatermark,
  watermarkGenerationPayload,
} from "@/lib/images/watermarkGenerationPayload";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

type SyncBody = {
  falRequestId?: string;
  falEndpoint?: string;
  /** Fallback when DB job row is missing (from sessionStorage pending job). */
  requestPayload?: Record<string, unknown>;
};

function endpointFromPayload(payload: Record<string, unknown>): string | null {
  const variantId = resolveVideoVariantId(payload as { variantId?: string });
  if (!variantId) return null;
  return getVideoVariant(variantId).falEndpoint;
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, errorCode: "AUTH_REQUIRED", message: "Войдите в аккаунт." },
      { status: 401 }
    );
  }

  const { id: clientAssetId } = await context.params;
  if (!clientAssetId?.trim()) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Missing job id." },
      { status: 400 }
    );
  }

  let body: SyncBody = {};
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    body = {};
  }

  let job = await findGenerationJobByAssetId(session.userId, clientAssetId);

  const rp = (job?.request_payload ?? body.requestPayload ?? {}) as Record<
    string,
    unknown
  >;
  const falRequestId =
    (typeof body.falRequestId === "string" ? body.falRequestId.trim() : "") ||
    (typeof rp.falRequestId === "string" ? rp.falRequestId.trim() : "");
  const falEndpoint =
    (typeof body.falEndpoint === "string" ? body.falEndpoint.trim() : "") ||
    (typeof rp.falEndpoint === "string" ? rp.falEndpoint.trim() : "") ||
    (typeof job?.model === "string" ? job.model.trim() : "") ||
    endpointFromPayload(rp) ||
    "";

  if (job && falRequestId && falEndpoint) {
    await patchGenerationJobRequestPayload(session.userId, clientAssetId, {
      falRequestId,
      falEndpoint,
    });
    job = await findGenerationJobByAssetId(session.userId, clientAssetId);
  }

  if (job?.status === "completed" && job.response_payload) {
    const stored = job.response_payload as Record<string, unknown>;
    if (parseGenerationJobSuccess(stored)) {
      await chargeGenerationJobTokensIfNeeded(
        session.userId,
        clientAssetId,
        job
      );
      return NextResponse.json({
        ok: true,
        status: "completed",
        result: job.response_payload,
      });
    }
    // Stale/invalid completed row — fall through to Fal sync below.
  }

  if (job?.status === "failed") {
    return NextResponse.json({
      ok: false,
      status: "failed",
      errorCode: job.error_code ?? "GENERATION_FAILED",
      message: job.error_message ?? "Генерация не удалась.",
    });
  }

  if (job && isGenerationJobStale(job.created_at)) {
    return NextResponse.json({
      ok: false,
      status: "stale",
      errorCode: "GENERATION_STALE",
      message: "Генерация прервана. Запустите снова.",
    });
  }

  if (falRequestId && falEndpoint) {
    const synced = await syncFalVideoByMeta({
      falRequestId,
      falEndpoint,
      requestPayload: rp,
      estimatedCost: job?.estimated_cost != null ? Number(job.estimated_cost) : null,
    });

    if (synced.kind === "completed") {
      let payload = synced.payload;
      if (generationPayloadNeedsWatermark(rp)) {
        try {
          payload = await watermarkGenerationPayload(payload);
        } catch (err) {
          console.error("[sync] watermark failed", err);
        }
      }
      await completeGenerationJob(session.userId, clientAssetId, payload);
      const billedJob = await findGenerationJobByAssetId(
        session.userId,
        clientAssetId
      );
      if (billedJob) {
        await chargeGenerationJobTokensIfNeeded(
          session.userId,
          clientAssetId,
          billedJob
        );
      }
      return NextResponse.json({
        ok: true,
        status: "completed",
        result: payload,
      });
    }

    if (synced.kind === "failed") {
      return NextResponse.json({
        ok: false,
        status: "failed",
        errorCode: "FAL_VIDEO_GENERATION_FAILED",
        message: synced.message,
      });
    }
  } else if (job?.status === "processing" && job.type === "video") {
    const synced = await syncFalVideoJobFromRow(job);
    if (synced.kind === "completed") {
      let payload = synced.payload;
      const jobRp = job.request_payload as Record<string, unknown>;
      if (generationPayloadNeedsWatermark(jobRp)) {
        try {
          payload = await watermarkGenerationPayload(payload);
        } catch (err) {
          console.error("[sync] watermark failed", err);
        }
      }
      await completeGenerationJob(session.userId, clientAssetId, payload);
      const billedJob = await findGenerationJobByAssetId(
        session.userId,
        clientAssetId
      );
      if (billedJob) {
        await chargeGenerationJobTokensIfNeeded(
          session.userId,
          clientAssetId,
          billedJob
        );
      }
      return NextResponse.json({
        ok: true,
        status: "completed",
        result: payload,
      });
    }
    if (synced.kind === "failed") {
      return NextResponse.json({
        ok: false,
        status: "failed",
        errorCode: "FAL_VIDEO_GENERATION_FAILED",
        message: synced.message,
      });
    }
  }

  if (!job && !falRequestId) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "NOT_FOUND",
        message: "Задача не найдена. Запустите создание заново.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: "processing",
    inProgress: true,
    clientAssetId,
    falLinked: Boolean(falRequestId && falEndpoint),
    falRequestId: falRequestId || undefined,
    falEndpoint: falEndpoint || undefined,
  });
}
