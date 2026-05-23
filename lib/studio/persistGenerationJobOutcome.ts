import "server-only";

import { getCurrentSession } from "@/lib/auth/session";
import {
  completeGenerationJob,
  failGenerationJob,
  findGenerationJobByAssetId,
} from "@/lib/studio/generationJobDb";
import { chargeGenerationJobTokensIfNeeded } from "@/lib/studio/chargeGenerationJobTokens";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";

export async function extractClientAssetIdFromRequest(
  request: Request
): Promise<string | null> {
  try {
    const body = (await request.clone().json()) as { clientAssetId?: unknown };
    const id =
      typeof body.clientAssetId === "string" ? body.clientAssetId.trim() : "";
    return id || null;
  } catch {
    return null;
  }
}

/** Persist generation_jobs after billing finalizes the API response. */
export async function persistGenerationJobOutcome(
  clientAssetId: string,
  body: Record<string, unknown>
): Promise<void> {
  const session = await getCurrentSession();
  const userId = session?.userId;
  if (!userId) return;

  if (body.ok === true) {
    const { _skipBilling: _b, ...stored } = body;
    if (!parseGenerationJobSuccess(stored)) {
      return;
    }
    await completeGenerationJob(userId, clientAssetId, stored);
    const row = await findGenerationJobByAssetId(userId, clientAssetId);
    if (row) {
      await chargeGenerationJobTokensIfNeeded(userId, clientAssetId, row);
    }
    return;
  }

  if (body.ok === false) {
    const errorCode = String(body.errorCode ?? body.code ?? "GENERATION_FAILED");
    if (errorCode === "GENERATION_IN_PROGRESS") {
      return;
    }
    await failGenerationJob(
      userId,
      clientAssetId,
      errorCode,
      String(body.message ?? body.error ?? "Generation failed")
    );
  }
}
