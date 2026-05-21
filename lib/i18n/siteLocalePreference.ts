import { assertLocale, type Locale } from "@/lib/i18n/localeConfig";
import { toStudioLocale, type StudioLocale } from "@/lib/studio/i18n";

export const SITE_LOCALE_STORAGE_KEY = "vitrina-site-locale";
const LEGACY_STUDIO_LOCALE_KEY = "vitrina-studio-locale";

/** Canonical studio URL: /studio (ru) or /en/studio, /kk/studio */
export function studioEntryPath(locale: Locale | StudioLocale | string): string {
  const code = assertLocale(String(locale)) ?? toStudioLocale(locale);
  if (code === "ru") return "/studio";
  return `/${code}/studio`;
}

export function isStudioEntryHref(href: string): boolean {
  const path = href.split("?")[0]?.replace(/\/$/, "") ?? href;
  return path === "/studio";
}

/** Maps content links like /studio to the correct localized studio route. */
export function resolvePublicHref(href: string, locale: Locale): string {
  if (isStudioEntryHref(href)) return studioEntryPath(locale);
  return href;
}

export function persistSiteLocale(locale: Locale | StudioLocale): void {
  if (typeof window === "undefined") return;
  const code = assertLocale(String(locale)) ?? toStudioLocale(locale);
  if (!code) return;
  try {
    localStorage.setItem(SITE_LOCALE_STORAGE_KEY, code);
    localStorage.setItem(LEGACY_STUDIO_LOCALE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function readStoredSiteLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(SITE_LOCALE_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STUDIO_LOCALE_KEY);
    return raw ? assertLocale(raw) : null;
  } catch {
    return null;
  }
}
