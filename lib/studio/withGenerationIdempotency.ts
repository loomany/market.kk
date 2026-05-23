import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import {
  findGenerationJobByAssetId,
  isGenerationJobStale,
  upsertGenerationJobProcessing,
} from "@/lib/studio/generationJobDb";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";

export type GenerationIdempotencyContext = {
  clientAssetId?: string;
  jobType: string;
  route: string;
  requestPayload: Record<string, unknown>;
  provider?: string;
  model?: string;
  estimatedCost?: number;
};

export async function withGenerationIdempotency(
  ctx: GenerationIdempotencyContext,
  run: () => Promise<NextResponse>
): Promise<NextResponse> {
  const clientAssetId = ctx.clientAssetId?.trim();
  if (!clientAssetId) {
    return run();
  }

  const session = await getCurrentSession();
  const userId = session?.userId;
  if (!userId) {
    return run();
  }

  const existing = await findGenerationJobByAssetId(userId, clientAssetId);

  if (existing?.status === "completed" && existing.response_payload) {
    const payload = existing.response_payload as Record<string, unknown>;
    if (parseGenerationJobSuccess(payload)) {
      return NextResponse.json({
        ...existing.response_payload,
        _skipBilling: true,
      });
    }
  }

  if (existing?.status === "processing" && !isGenerationJobStale(existing.created_at)) {
    const rp = (existing.request_payload ?? {}) as Record<string, unknown>;
    const falRequestId =
      typeof rp.falRequestId === "string" ? rp.falRequestId.trim() : undefined;
    const falEndpoint =
      (typeof rp.falEndpoint === "string" ? rp.falEndpoint.trim() : "") ||
      (typeof existing.model === "string" ? existing.model.trim() : "") ||
      undefined;
    return NextResponse.json(
      {
        ok: false,
        errorCode: "GENERATION_IN_PROGRESS",
        inProgress: true,
        clientAssetId,
        falRequestId,
        falEndpoint,
        model: falEndpoint,
      },
      { status: 202 }
    );
  }

  await upsertGenerationJobProcessing({
    userId,
    clientAssetId,
    type: ctx.jobType,
    provider: ctx.provider,
    model: ctx.model,
    requestPayload: ctx.requestPayload,
    estimatedCost: ctx.estimatedCost,
  });

  const response = await run();
  return response;
}
