import {
  maxAiTestSpendUsd,
  paidAiRunsAllowed,
} from "@/lib/ai/paidAiGuard";
import { estimateVideoCostUsd, type VideoModelKey } from "@/lib/ai/videoModels";

export { maxAiTestSpendUsd, paidAiRunsAllowed };

export function estimateSceneCostUsd(mode: "exact-background" | "creative-scene") {
  return mode === "exact-background" ? 0.03 : 0.08;
}

export function estimateVideoOrThrow(
  modelKey: VideoModelKey,
  durationSeconds: number
) {
  return estimateVideoCostUsd(modelKey, durationSeconds);
}

export function canSpendEstimated(cost?: number) {
  if (!paidAiRunsAllowed()) return false;
  if (typeof cost !== "number") return false;
  const max = maxAiTestSpendUsd();
  return max !== null && cost <= max;
}
