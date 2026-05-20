import type { SourceModelCrop } from "@/lib/ai/productDescriptionAnalysisSchemas";

/**
 * English bottom-edge rule derived from Vision `sourceModel.crop`.
 * The AI model must be cut at the same vertical level as the merchant photo.
 */
export function sourceProductZoneBottomCropEn(crop: SourceModelCrop): string {
  switch (crop) {
    case "upper-thigh":
      return (
        "bottom frame edge must match the merchant product photo exactly — cut through upper-mid thighs at the same level as the reference, never show knees, calves, feet, or floor"
      );
    case "waist-up":
      return (
        "bottom frame edge must match the merchant product photo exactly — cut around hips or top of thighs as in the reference, never show mid-thigh, knees, or below"
      );
    case "upper-body":
      return (
        "bottom frame edge must match the merchant product photo exactly — cut at waist or hip line as in the reference, never extend the body below the reference crop"
      );
    case "close-up":
      return (
        "bottom frame edge must match the merchant product photo exactly — same tight torso or garment-zone cut as the reference, never widen or extend below the reference"
      );
    case "full-body":
      return (
        "full-length bottom edge from top of head through both feet and floor, matching a full-length merchant reference"
      );
    default:
      return (
        "bottom frame edge must match the merchant product photo exactly — never show legs or feet below the reference crop line"
      );
  }
}

/** Applies to any output aspect ratio (9:16, 3:4, etc.). */
export const PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN =
  "Any aspect ratio (9:16, 3:4, etc.) must not extend the body below the merchant cut — add backdrop above the head and below the thighs instead of legs, knees, feet, or floor.";

/** Reference may be headless; generation must add head and hands. */
export const PRODUCT_ZONE_HEAD_HANDS_ADD_EN =
  "Merchant reference may lack head or hands — add full head, face, generous headroom above hair, and both hands along outer sides, never headless.";
