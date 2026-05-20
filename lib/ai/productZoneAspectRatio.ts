import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import { PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN } from "@/lib/ai/sourceProductZoneBottomCrop";

/** Tall portrait ratios that bias Fal toward full-length body if not overridden. */
const TALL_PRODUCT_ZONE_ASPECTS = new Set<FalModelAspectRatio>(["9:16", "2:3"]);

/**
 * Extra framing when product-zone crop is active on a very tall canvas.
 * Bottom edge stays at the merchant reference; letterbox with backdrop if needed.
 */
export function productZoneVerticalAspectGuidance(
  aspectRatio: FalModelAspectRatio
): string | null {
  if (!TALL_PRODUCT_ZONE_ASPECTS.has(aspectRatio)) return null;
  return (
    `Tall vertical ${aspectRatio} output: ${PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN} Keep the model in the same middle band as a headless merchant product photo — full head above, cut at upper-mid thighs below; do not pull back to full-length head-to-toe.`
  );
}

export function isTallProductZoneAspect(aspectRatio: FalModelAspectRatio): boolean {
  return TALL_PRODUCT_ZONE_ASPECTS.has(aspectRatio);
}
