import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { chargeGenerationJobTokensIfNeeded } from "@/lib/studio/chargeGenerationJobTokens";
import {
  findGenerationJobByAssetId,
  type GenerationJobRow,
} from "@/lib/studio/generationJobDb";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";
import { getUserTokenBalance } from "@/lib/tokens/tokenLedger";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** Idempotent token spend after client received a completed generation result. */
export async function POST(_request: Request, context: RouteContext) {
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
  if (!job?.response_payload || job.status !== "completed") {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "NOT_READY",
        message: "Генерация ещё не завершена.",
      },
      { status: 409 }
    );
  }

  if (
    !parseGenerationJobSuccess(job.response_payload as Record<string, unknown>)
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "NO_MEDIA",
        message: "Нет готового файла для списания.",
      },
      { status: 409 }
    );
  }

  const rp = job.request_payload as Record<string, unknown>;
  const alreadySpent = rp.billingSpent === true;

  if (!alreadySpent) {
    await chargeGenerationJobTokensIfNeeded(
      session.userId,
      clientAssetId,
      job as GenerationJobRow
    );
  }

  const refreshed = await findGenerationJobByAssetId(
    session.userId,
    clientAssetId
  );
  const billed =
    (refreshed?.request_payload as Record<string, unknown> | undefined)
      ?.billingSpent === true;
  const balanceTokens = await getUserTokenBalance(session.userId);

  return NextResponse.json({
    ok: true,
    charged: billed && !alreadySpent,
    alreadySpent,
    balanceTokens,
  });
}
