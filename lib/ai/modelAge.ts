import type {
  ModelBodyType,
  ModelCategoryContext,
  ModelGenerationSettings,
} from "@/components/studio/types";

export const MODEL_AGE_MIN = 2;
export const MODEL_AGE_MAX = 80;
export const MODEL_AGE_ADULT = 18;
export const DEFAULT_MODEL_AGE = 25;

export function clampModelAge(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MODEL_AGE;
  return Math.min(MODEL_AGE_MAX, Math.max(MODEL_AGE_MIN, Math.round(value)));
}

export function isAdultModelAge(age: number): boolean {
  return age >= MODEL_AGE_ADULT;
}

export function modelAgePromptPhrase(age: number): string {
  const years = clampModelAge(age);
  if (years < 4) {
    return `child model, approximately ${years} years old, toddler proportions`;
  }
  if (years < 13) {
    return `child model, approximately ${years} years old, age-appropriate child proportions`;
  }
  if (years < MODEL_AGE_ADULT) {
    return `teenage model, approximately ${years} years old, adolescent proportions, fully clothed catalog style`;
  }
  return `adult model, approximately ${years} years old`;
}

export function minorRestrictedChoice(settings: {
  modelAge: number;
  categoryContext: ModelCategoryContext;
  bodyType: ModelBodyType;
}): "lingerie" | "swimwear" | null {
  if (isAdultModelAge(settings.modelAge)) return null;
  if (settings.categoryContext === "lingerie") return "lingerie";
  if (settings.bodyType === "swimwear") return "swimwear";
  return null;
}

export function minorRestrictionMessage(
  restriction: NonNullable<ReturnType<typeof minorRestrictedChoice>>
): string {
  if (restriction === "lingerie") {
    return "Для модели младше 18 лет сценарий «Бельё / купальники» недоступен.";
  }
  return "Для модели младше 18 лет тип фигуры «Бикини / купальники» недоступен.";
}

export function sanitizeModelSettingsForAge<T extends ModelGenerationSettings>(
  settings: T
): T {
  if (isAdultModelAge(settings.modelAge)) return settings;
  return {
    ...settings,
    ...(settings.categoryContext === "lingerie"
      ? { categoryContext: "clothing" as const }
      : {}),
    ...(settings.bodyType === "swimwear"
      ? { bodyType: "standard" as const }
      : {}),
  };
}
