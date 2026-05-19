import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";

/** Base model for virtual try-on — never pre-wear the marketplace SKU. */
export function shouldUseNeutralBaseModelGeneration(
  input: Pick<GenerateModelRequest, "categoryContext">
): boolean {
  return input.categoryContext === "lingerie";
}

export const MODEL_GENERATION_NO_GARMENT_COPY_RULE =
  "Do not recreate, copy, imitate, or pre-wear the uploaded garment. The target product will be applied later by virtual try-on. The base model must wear only plain seamless neutral underwear with no lace, no pattern, no logo, no colored floral details.";

/** Крой низа для базовой модели — FASHN копирует силуэт с model_image. */
export function lingerieBottomCutGuidance(): string {
  return (
    "Bottom must be classic bikini brief or mid-rise cheeky brief with leg openings at the hip, natural waistline — " +
    "not boyshorts, not high-waist shorts, not biker shorts, not long leg line to mid-thigh"
  );
}

/**
 * Minimal-base brief description used ONLY when the model is generated
 * as a try-on canvas (FASHN paints the marketplace brief on top).
 *
 * Compared to `lingerieBottomCutGuidance`, this version:
 *   - keeps the waistband low-profile so it does NOT compete with the
 *     marketplace brief silhouette (the previous run left the beige
 *     base edges visible alongside the marketplace high-waist brief);
 *   - forbids high-cut side panels;
 *   - keeps the same boyshort/biker-short negatives so the base
 *     cannot drift back to a thick under-shorts silhouette.
 */
export function neutralBaseMinimalBriefGuidance(): string {
  return (
    "Brief must be a minimal low-profile classic bikini brief sitting flat against the body — " +
    "natural waistline at or just below the navel, minimal visible side edges, " +
    "no high-cut side panels, no pronounced or thick waistband shape, no decorative seams, " +
    "no boyshorts, no high-waist shorts, no biker shorts, no long leg line to mid-thigh, " +
    "base brief must not compete with the target marketplace garment silhouette"
  );
}

export function lingerieModelPoseGuidance(): string {
  return (
    "Standing neutral studio pose with relaxed posture — avoid seated pose that stretches the bottom into a boy-short silhouette"
  );
}

/**
 * Plain studio base for lingerie try-on — SKU colors/pattern come from FASHN only.
 *
 * The pose clause is FASHN-safe by design: raised arms / arms behind head /
 * Vogue editorial stances AND hands-in-front-of-the-garment-area stances
 * are explicitly forbidden because FASHN cannot reliably transfer bra
 * straps, cup shape, and high-waist briefs when the base model's hand
 * sits over the abdomen, waist, or briefs.
 *
 * Brief description switched from `lingerieBottomCutGuidance` to
 * `neutralBaseMinimalBriefGuidance` so the base waistband does not compete
 * with marketplace garment silhouettes during FASHN transfer.
 */
export function lingerieNeutralBaseOutfitGuidance(): string {
  return (
    "plain seamless neutral bra and brief set, simple smooth fabric, nude beige or solid black only, " +
    "no lace, no prints, no decorative straps, no floral pattern, no turquoise or green accents, " +
    "no logos, no product design recreation, " +
    `${neutralBaseMinimalBriefGuidance()}, ${lingerieModelPoseGuidance()}, ` +
    "arms must stay relaxed at the sides or slightly away from the body, " +
    "arms drop straight down along the outer sides of the body, " +
    "hands rest near the outer thighs only, " +
    "hands must not be placed in front of the abdomen, waist, stomach, briefs, hips, bra band, straps, or any garment zone, " +
    "fingers must not overlap the product area, " +
    "no hand on hip, no arms akimbo, no hand resting on the waistband or stomach, " +
    "both shoulders must stay square to the camera, " +
    "do not raise either arm above the shoulder line, " +
    "do not place a hand behind the head, neck, hair, or above the head, " +
    "do not cross arms in front of the bra band or torso, " +
    "calm non-explicit editorial catalog pose, " +
    "generic studio base for virtual try-on only"
  );
}

/** @deprecated Use neutral base + try-on; kept for non-neutral paths. */
export function lingerieCatalogOutfitGuidance(): string {
  return lingerieNeutralBaseOutfitGuidance();
}

export function neutralBaseOutfitGuidance(): string {
  return (
    "Wearing a simple fitted neutral grey or beige seamless bodysuit base layer (plain, no lace, no patterns) — " +
    "commercial try-on base only; the marketplace garment will be applied in post."
  );
}

export function neutralBaseOutfitLockForEdit(): string {
  return (
    "Keep the exact same plain seamless neutral bra and brief base as the reference — " +
    "no lace, no prints, no floral pattern, no turquoise or green accents."
  );
}
