import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  completeGenerationJob,
  findGenerationJobByAssetId,
  isGenerationJobStale,
} from "@/lib/studio/generationJobDb";
import { chargeGenerationJobTokensIfNeeded } from "@/lib/studio/chargeGenerationJobTokens";
import type { GenerationJobRow } from "@/lib/studio/generationJobDb";
import { syncFalVideoJobFromRow } from "@/lib/studio/falVideoQueueSync";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
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

  const job = await findGenerationJobByAssetId(session.userId, clientAssetId);
  if (!job) {
    return NextResponse.json(
      { ok: false, errorCode: "NOT_FOUND", message: "Задача не найдена." },
      { status: 404 }
    );
  }

  if (job.status === "completed" && job.response_payload) {
    const stored = job.response_payload as Record<string, unknown>;
    if (parseGenerationJobSuccess(stored)) {
      await chargeGenerationJobTokensIfNeeded(
        session.userId,
        clientAssetId,
        job as GenerationJobRow
      );
      return NextResponse.json({
        ok: true,
        status: "completed",
        result: job.response_payload,
      });
    }
  }

  if (job.status === "failed") {
    return NextResponse.json({
      ok: false,
      status: "failed",
      errorCode: job.error_code ?? "GENERATION_FAILED",
      message: job.error_message ?? "Генерация не удалась.",
    });
  }

  if (isGenerationJobStale(job.created_at)) {
    return NextResponse.json({
      ok: false,
      status: "stale",
      errorCode: "GENERATION_STALE",
      message: "Генерация прервана. Запустите снова.",
    });
  }

  if (job.status === "processing" && job.type === "video") {
    const synced = await syncFalVideoJobFromRow(job);
    if (synced.kind === "completed") {
      await completeGenerationJob(session.userId, clientAssetId, synced.payload);
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
        result: synced.payload,
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

  return NextResponse.json({
    ok: true,
    status: "processing",
    inProgress: true,
    clientAssetId,
  });
}
