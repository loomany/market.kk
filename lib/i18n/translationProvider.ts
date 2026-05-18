import type { Locale, TranslationStatus } from "./localeConfig";

export type TranslationUnit = {
  key: string;
  sourceLocale: Locale;
  targetLocale: Locale;
  sourceText: string;
  translatedText?: string;
  status: TranslationStatus;
  notes?: string;
};

export type TranslationProviderResult = {
  translatedText: string;
  status: Extract<TranslationStatus, "machine_translated" | "needs_review">;
  provider: string;
};

export interface TranslationProvider {
  readonly name: string;
  translate(unit: TranslationUnit): Promise<TranslationProviderResult>;
}

export class ManualTranslationProvider implements TranslationProvider {
  readonly name = "manual";

  async translate(unit: TranslationUnit): Promise<TranslationProviderResult> {
    return {
      translatedText: unit.translatedText ?? unit.sourceText,
      status: "needs_review",
      provider: this.name,
    };
  }
}

export function createTranslationQueueItem(
  key: string,
  sourceLocale: Locale,
  targetLocale: Locale,
  sourceText: string
): TranslationUnit {
  return {
    key,
    sourceLocale,
    targetLocale,
    sourceText,
    status: "draft",
  };
}
