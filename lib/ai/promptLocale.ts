import { localeCodes, type Locale } from "@/lib/i18n/locales";

/** Human-readable language name for OpenAI instructions */
const PROMPT_LANGUAGE_NAMES: Record<Locale, string> = {
  ru: "Russian",
  en: "English",
  kk: "Kazakh",
  ky: "Kyrgyz",
  uz: "Uzbek",
  tg: "Tajik",
  tr: "Turkish",
  az: "Azerbaijani",
  ar: "Arabic",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  it: "Italian",
  pl: "Polish",
  uk: "Ukrainian",
  hi: "Hindi",
  id: "Indonesian",
  vi: "Vietnamese",
  zh: "Chinese",
};

export function getPromptLanguageName(locale: Locale): string {
  return PROMPT_LANGUAGE_NAMES[locale] ?? "Russian";
}

export function isEnglishPromptLocale(locale: Locale): boolean {
  return locale === "en";
}

/** Skip translation when the text is already mostly Latin/English */
export function looksLikeEnglishPrompt(text: string): boolean {
  const letters = text.match(/\p{L}/gu);
  if (!letters?.length) return true;

  let latin = 0;
  for (const char of letters) {
    if (/[A-Za-z]/.test(char)) latin += 1;
  }

  return latin / letters.length >= 0.85;
}

export const supportedPromptLocales = localeCodes;
