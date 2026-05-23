import { notifyTokenBalanceChanged } from "@/lib/tokens/notifyTokenBalanceChanged";

/** Ensure tokens are spent after a completed video/image lands in the UI. */
export async function settleGenerationBillingClient(
  clientAssetId: string
): Promise<void> {
  try {
    await fetch(
      `/api/studio/generation-jobs/${encodeURIComponent(clientAssetId)}/settle-billing`,
      { method: "POST", cache: "no-store" }
    );
  } catch {
    /* non-blocking */
  }
  notifyTokenBalanceChanged();
}
