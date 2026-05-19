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

export function lingerieModelPoseGuidance(): string {
  return (
    "Standing neutral studio pose with relaxed posture — avoid seated pose that stretches the bottom into a boy-short silhouette"
  );
}

/** Plain studio base for lingerie try-on — SKU colors/pattern come from FASHN only. */
export function lingerieNeutralBaseOutfitGuidance(): string {
  return (
    "plain seamless neutral bra and brief set, simple smooth fabric, nude beige or solid black only, " +
    "no lace, no prints, no decorative straps, no floral pattern, no turquoise or green accents, " +
    "no logos, no product design recreation, " +
    `${lingerieBottomCutGuidance()}, ${lingerieModelPoseGuidance()}, ` +
    "hands relaxed away from chest and hips, confident sensual but non-explicit editorial catalog pose, " +
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
