import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  findGenerationJobByAssetId,
  isGenerationJobStale,
} from "@/lib/studio/generationJobDb";

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
    return NextResponse.json({
      ok: true,
      status: "completed",
      result: job.response_payload,
    });
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

  return NextResponse.json({
    ok: true,
    status: "processing",
    inProgress: true,
    clientAssetId,
  });
}
