import "server-only";

import { isMockMode } from "@/lib/ai/paidAiGuard";
import type { GenerationJobRow } from "@/lib/studio/generationJobDb";
import { patchGenerationJobRequestPayload } from "@/lib/studio/generationJobDb";
import {
  resolveImageEnhanceBillingTokensFromPayload,
  resolveTextToImageBillingTokensFromPayload,
  resolveVideoBillingTokensFromPayload,
} from "@/lib/tokens/resolveRouteBillingCost";
import { spendUserTokens } from "@/lib/tokens/tokenLedger";

function tokensForJobType(
  job: GenerationJobRow
): { tokens: number; route: string } | null {
  const body = job.request_payload as Record<string, unknown>;
  switch (job.type) {
    case "video":
      return {
        tokens: resolveVideoBillingTokensFromPayload(body),
        route: "/api/ai/video/generate",
      };
    case "enhance":
      return {
        tokens: resolveImageEnhanceBillingTokensFromPayload(body),
        route: "/api/ai/image/enhance",
      };
    case "text-to-image":
      return {
        tokens: resolveTextToImageBillingTokensFromPayload(body),
        route: "/api/ai/image/text-generate",
      };
    default:
      return null;
  }
}

/** Spend tokens when Fal/sync finished but POST returned 202 (billing skipped on wire). */
export async function chargeGenerationJobTokensIfNeeded(
  userId: string,
  clientAssetId: string,
  job: GenerationJobRow
): Promise<void> {
  if (isMockMode()) return;

  const rp = job.request_payload as Record<string, unknown>;
  if (rp.billingSpent === true) return;

  const priced = tokensForJobType(job);
  if (!priced || priced.tokens <= 0) return;

  try {
    const { spent } = await spendUserTokens({
      userId,
      tokens: priced.tokens,
      metadata: {
        clientAssetId,
        route: priced.route,
        operation: job.type,
        source: "generation_job_complete",
      },
    });

    if (spent) {
      await patchGenerationJobRequestPayload(userId, clientAssetId, {
        billingSpent: true,
      });
    }
  } catch (error) {
    console.error(
      "[chargeGenerationJobTokensIfNeeded]",
      clientAssetId,
      error instanceof Error ? error.message : error
    );
  }
}
