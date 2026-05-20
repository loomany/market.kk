import type { ResolvedModelPose } from "@/lib/ai/productViewTypes";

/** Strict hand/garment rules for lingerie and high-waist try-on bases. */
export const LINGERIE_HIGH_WAIST_HANDS_RULES_EN =
  "Hands must not cover bra cups, center front panel, waistband, back closure, or lace edges; arms must not intersect garment seams; visible waist, hips, stomach, and high-waist bottom area; avoid crossed arms, hands in front of stomach, sitting poses, and extreme torso twist unless explicitly requested.";

export const PREMIUM_CATALOG_QUALITY_EN =
  "Premium ecommerce catalog photography, sharp garment and skin detail, realistic skin texture, natural soft studio shadows, believable human proportions — no plastic skin, no doll-like body, no overbeauty filter.";

export function resolvedModelPosePromptEn(pose: ResolvedModelPose): string {
  switch (pose) {
    case "back_view":
      return [
        "Adult female model photographed from behind, back facing the camera.",
        "Upper back, shoulders, waist, hips and upper thighs clearly visible.",
        "Arms relaxed slightly away from the body.",
        "Hands must not cover the bra band, back closure, waistband, hips or garment details.",
        PREMIUM_CATALOG_QUALITY_EN,
        "Back view only. Do not turn the model to face the camera.",
        LINGERIE_HIGH_WAIST_HANDS_RULES_EN,
      ].join(" ");
    case "side_view":
      return [
        "Adult model in slight side or profile catalog pose, body visible from shoulder through upper thigh.",
        "Side silhouette and garment side seams clearly visible.",
        "Arms relaxed along the outer body line; arms must not block garment zones.",
        PREMIUM_CATALOG_QUALITY_EN,
        LINGERIE_HIGH_WAIST_HANDS_RULES_EN,
      ].join(" ");
    case "three_quarter":
      return [
        "Adult model in a slight three-quarter body turn toward the camera, natural catalog angle.",
        "Face and torso readable; hands relaxed or resting on outer hips only.",
        "Hands must not cover bra cups, center panel, waistband, or garment details.",
        PREMIUM_CATALOG_QUALITY_EN,
        LINGERIE_HIGH_WAIST_HANDS_RULES_EN,
      ].join(" ");
    case "front":
      return [
        "Adult model front-facing or slight natural front catalog pose toward the camera.",
        "Visible chest, waist, stomach, hips, and upper thighs for lingerie and high-waist try-on.",
        "Hands relaxed near outer thighs, not covering garment zones.",
        PREMIUM_CATALOG_QUALITY_EN,
        LINGERIE_HIGH_WAIST_HANDS_RULES_EN,
      ].join(" ");
    case "safe_front":
    default:
      return [
        "Adult model in safe front-facing catalog pose toward the camera.",
        "Natural relaxed posture; hands near outer thighs, not covering garment areas.",
        PREMIUM_CATALOG_QUALITY_EN,
        LINGERIE_HIGH_WAIST_HANDS_RULES_EN,
      ].join(" ");
  }
}

export function resolvedModelPoseNegativesEn(pose: ResolvedModelPose): string {
  const common =
    "no plastic skin, no doll-like body, no sitting pose, no extreme twist, no crossed arms, no hands covering waistband or bra";
  switch (pose) {
    case "back_view":
      return `no front-facing pose, no turning to camera, no crossed arms, no hands covering the back band, no hands covering waistband, ${common}`;
    case "side_view":
      return `no front-facing only portrait, no arms blocking garment side seams, ${common}`;
    case "three_quarter":
      return `no full back view, no hands on chest or stomach, ${common}`;
    case "front":
    case "safe_front":
    default:
      return `no back-only pose unless requested, no hands covering bra cups or center panel, ${common}`;
  }
}

export function shouldUseFrontFacingFallback(pose: ResolvedModelPose): boolean {
  return pose === "front" || pose === "safe_front" || pose === "three_quarter";
}

export function shouldAvoidSquareShouldersToCamera(pose: ResolvedModelPose): boolean {
  return pose === "back_view" || pose === "side_view";
}
