import {
  getLocaleConfig,
  isLocale,
  localeCodes,
  localeHreflangs,
  locales,
  type Locale,
  type LocaleConfig,
  type TranslationStatus,
} from "./locales";

export type { Locale, LocaleConfig, TranslationStatus };

export const defaultLocale: Locale = "ru";
export const globalDefaultLocale: Locale = "en";
export const xDefaultLocale: Locale = defaultLocale;

export const supportedLocales = locales;
export const supportedLocaleCodes = localeCodes;
export const supportedLocaleHreflangs = localeHreflangs;

export function assertLocale(value: string): Locale | null {
  return isLocale(value) ? value : null;
}

export function getHtmlLanguage(locale: Locale): string {
  return getLocaleConfig(locale).hreflang;
}

export function getTextDirection(locale: Locale) {
  return getLocaleConfig(locale).dir;
}

export function isDefaultLocale(locale: Locale): boolean {
  return locale === defaultLocale;
}
