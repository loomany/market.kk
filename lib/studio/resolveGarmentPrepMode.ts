import type { QualityMode } from "@/components/studio/types";
import type { TryOnGarmentPrepMode } from "@/lib/ai/fashnEditSchemas";
import { isPremiumGarmentEditFeatureEnabled } from "@/lib/ai/fashnEditSchemas";

/** Fast by default; premium only when feature flag on and user chose max quality. */
export function resolveGarmentPrepMode(
  qualityMode: QualityMode,
  explicit?: TryOnGarmentPrepMode
): TryOnGarmentPrepMode {
  if (explicit) return explicit;
  if (qualityMode === "quality" && isPremiumGarmentEditFeatureEnabled()) {
    return "premium";
  }
  return "fast";
}
