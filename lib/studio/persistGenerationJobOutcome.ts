import "server-only";

import { getCurrentSession } from "@/lib/auth/session";
import {
  completeGenerationJob,
  failGenerationJob,
} from "@/lib/studio/generationJobDb";

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
    await completeGenerationJob(userId, clientAssetId, stored);
    return;
  }

  if (body.ok === false) {
    await failGenerationJob(
      userId,
      clientAssetId,
      String(body.errorCode ?? body.code ?? "GENERATION_FAILED"),
      String(body.message ?? body.error ?? "Generation failed")
    );
  }
}
