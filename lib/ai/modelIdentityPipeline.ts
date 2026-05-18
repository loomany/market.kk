import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";

/**
 * Для сценария «бельё» модель генерируем в нейтральном bodysuit (не кружево с карточки).
 * Ракурсы 2+ — через nano-banana edit (то же лицо). Финальный товар — только FASHN try-on.
 */
export function shouldUseNeutralBaseModelGeneration(
  input: Pick<GenerateModelRequest, "categoryContext">
): boolean {
  return input.categoryContext === "lingerie";
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
