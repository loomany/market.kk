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

/** Parse an explicit model age from free-form scene/description text (RU/EN). */
export function parseModelAgeFromDescription(text: string): number | null {
  const normalized = text.trim();
  if (!normalized) return null;

  const patterns = [
    /(?:^|[\s,.(])(?:возраст|age)\s*[:=]?\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\s*[-–]?\s*(?:лет(?:няя|ний|ние|него|ней)?|года|год|years?\s*old|y\.?\s*o\.?)\b/i,
    /\b(?:модел[ьяи]|model)\s+(\d{1,2})\s*(?:лет|years?\s*old)?\b/i,
  ] as const;

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match?.[1]) continue;
    const age = Number.parseInt(match[1], 10);
    if (!Number.isFinite(age)) continue;
    if (age < MODEL_AGE_MIN || age > MODEL_AGE_MAX) continue;
    return clampModelAge(age);
  }

  return null;
}

export function resolveModelAgeFromDescription(
  description: string,
  fallbackAge: number = DEFAULT_MODEL_AGE
): number {
  return parseModelAgeFromDescription(description) ?? clampModelAge(fallbackAge);
}

export function isAdultModelAge(age: number): boolean {
  return age >= MODEL_AGE_ADULT;
}

export function modelAgePromptPhrase(age: number): string {
  const years = clampModelAge(age);
  if (years < 4) {
    return `child model, exactly ${years} years old, toddler proportions`;
  }
  if (years < 13) {
    return `child model, exactly ${years} years old, age-appropriate child proportions`;
  }
  if (years < MODEL_AGE_ADULT) {
    return `teenage model, exactly ${years} years old, adolescent proportions, fully clothed catalog style`;
  }
  if (years <= 23) {
    return `young adult model, exactly ${years} years old`;
  }
  return `adult model, exactly ${years} years old`;
}

export function modelAgeYears(age: number): number {
  return clampModelAge(age);
}

/**
 * Strong age lock for image models (UI age often ignored if only "adult" is sent).
 */
export function modelAgeAppearanceGuidance(age: number): string {
  const years = clampModelAge(age);

  if (years < 4) {
    return `Mandatory age: clearly a ${years}-year-old toddler — child face, child body proportions, not older child.`;
  }
  if (years < 13) {
    return `Mandatory age: clearly ${years} years old — child face and age-appropriate body, not teen, not adult.`;
  }
  if (years < MODEL_AGE_ADULT) {
    return `Mandatory age: clearly ${years} years old — teenage face and adolescent proportions, fully clothed, not adult woman.`;
  }
  if (years <= 23) {
    return (
      `Mandatory age: the model must look exactly ${years} years old — youthful young-adult face, fresh early-twenties appearance, ` +
      `smooth skin without mature lines, not 28+, not 30+, not 35+, not 40+, not a mature older woman.`
    );
  }
  if (years <= 27) {
    return (
      `Mandatory age: the model must look approximately ${years} years old — young adult in mid-twenties, ` +
      `not 32+, not 35+, not 40+, not mature middle-aged appearance.`
    );
  }
  if (years <= 34) {
    return (
      `Mandatory age: the model must look approximately ${years} years old — adult in late twenties to early thirties, ` +
      `not 40+, not 50+.`
    );
  }
  if (years <= 45) {
    return `Mandatory age: the model must look approximately ${years} years old — mature adult, age-appropriate face, not early twenties.`;
  }
  return `Mandatory age: the model must look approximately ${years} years old — mature adult with natural age-appropriate features, not young 20s.`;
}

export function modelAgeNegativePhrase(age: number): string {
  const years = clampModelAge(age);

  if (years < MODEL_AGE_ADULT) {
    return "adult woman, mature 25+ face, sexualized styling";
  }
  if (years <= 23) {
    return `face or body that looks 28, 30, 35, 40 or older, mature middle-aged woman, deep wrinkles, crow's feet`;
  }
  if (years <= 27) {
    return "face that looks 32, 35, 40 or older, mature middle-aged woman";
  }
  if (years <= 34) {
    return "face that looks 45 or older, elderly appearance";
  }
  if (years <= 45) {
    return "face that looks early twenties or teenage";
  }
  return "face that looks 25-year-old when model should be mature";
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
