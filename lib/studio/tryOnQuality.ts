import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type { QualityMode } from "@/components/studio/types";

const RESOLUTION_TO_TRY_ON_MODE: Record<FalModelResolution, QualityMode> = {
  "0.5K": "performance",
  "1K": "balanced",
  "2K": "quality",
};

/** FASHN try-on mode matches model generation resolution (0.5K / 1K / 2K). */
export function tryOnQualityModeFromResolution(
  resolution: FalModelResolution
): QualityMode {
  return RESOLUTION_TO_TRY_ON_MODE[resolution];
}
