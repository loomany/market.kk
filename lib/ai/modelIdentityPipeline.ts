import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";

/**
 * Нейтральный bodysuit отключён: для белья модель снова в каталожном комплекте (как раньше).
 * Конкретный товар с карточки — только на шаге FASHN-примерки.
 */
export function shouldUseNeutralBaseModelGeneration(
  _input: Pick<GenerateModelRequest, "categoryContext">
): boolean {
  return false;
}

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

/** Студийный комплект для генерации (не SKU с фото товара). */
export function lingerieCatalogOutfitGuidance(): string {
  return (
    "Wearing a plain seamless matching bra and brief set in one neutral catalog color (soft nude or black), " +
    "no lace, prints, logos or decorative patterns on the base model garment, " +
    `${lingerieBottomCutGuidance()}, ${lingerieModelPoseGuidance()}, ` +
    "hands relaxed away from chest and hips, confident sensual but non-explicit editorial lingerie catalog pose, " +
    "beautiful premium commercial lingerie look — generic studio base for virtual try-on, " +
    "not the customer's marketplace lace pattern or product colors"
  );
}

export function neutralBaseOutfitGuidance(): string {
  return (
    "Wearing a simple fitted neutral grey or beige seamless bodysuit base layer (plain, no lace, no patterns) — " +
    "commercial try-on base only; the marketplace garment will be applied in post."
  );
}

export function neutralBaseOutfitLockForEdit(): string {
  return "Keep the exact same neutral grey/beige bodysuit base layer as the reference.";
}
