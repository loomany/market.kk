import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type { QualityMode } from "@/components/studio/types";

const RESOLUTION_TO_TRY_ON_MODE: Record<FalModelResolution, QualityMode> = {
  "1K": "balanced",
  "2K": "quality",
  "4K": "quality",
};

/** FASHN try-on mode matches model generation resolution (1K / 2K / 4K). */
export function tryOnQualityModeFromResolution(
  resolution: FalModelResolution
): QualityMode {
  return RESOLUTION_TO_TRY_ON_MODE[resolution];
}
