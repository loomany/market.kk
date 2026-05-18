import type { Locale } from "@/lib/i18n/locales";

const SPEECH_LOCALE: Partial<Record<Locale, string>> = {
  ru: "ru-RU",
  en: "en-US",
  kk: "kk-KZ",
  ky: "ky-KG",
  uz: "uz-UZ",
  tg: "tg-TG",
  tr: "tr-TR",
  az: "az-AZ",
  ar: "ar-SA",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pl: "pl-PL",
  uk: "uk-UA",
  hi: "hi-IN",
  id: "id-ID",
  vi: "vi-VN",
  zh: "zh-CN",
};

export function speechRecognitionLang(locale?: Locale): string {
  if (locale && SPEECH_LOCALE[locale]) {
    return SPEECH_LOCALE[locale]!;
  }
  return "ru-RU";
}
