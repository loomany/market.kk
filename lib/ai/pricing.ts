import { estimateVideoCostUsd, type VideoModelKey } from "@/lib/ai/videoModels";

export function paidAiRunsAllowed() {
  return process.env.ALLOW_PAID_AI_RUNS === "true";
}

export function maxAiTestSpendUsd() {
  const value = Number(process.env.MAX_AI_TEST_SPEND_USD ?? "0");
  return Number.isFinite(value) && value > 0 ? value : 0;
}

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
  return max > 0 && cost <= max;
}
