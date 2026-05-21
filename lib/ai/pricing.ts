import {
  maxAiTestSpendUsd,
  paidAiRunsAllowed,
} from "@/lib/ai/paidAiGuard";
import {
  estimateVideoCostUsd,
  type VideoVariantId,
} from "@/lib/ai/videoCatalog";

export { maxAiTestSpendUsd, paidAiRunsAllowed };

export function estimateSceneCostUsd(mode: "exact-background" | "creative-scene") {
  return mode === "exact-background" ? 0.03 : 0.08;
}

export function estimateVideoOrThrow(
  variantId: VideoVariantId,
  durationSeconds: number
) {
  return estimateVideoCostUsd(variantId, durationSeconds);
}

export function canSpendEstimated(cost?: number) {
  if (!paidAiRunsAllowed()) return false;
  if (typeof cost !== "number") return false;
  const max = maxAiTestSpendUsd();
  return max !== null && cost <= max;
}
