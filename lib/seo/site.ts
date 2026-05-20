import type { Locale } from "@/lib/i18n/localeConfig";
import {
  defaultLocale,
  indexableLocales,
  type IndexableLocale,
  supportedLocaleHreflangs,
  xDefaultLocale,
} from "@/lib/i18n/localeConfig";

export const siteName = "Vitrina AI Studio";
export const siteShortName = "Vitrina AI";

const PLACEHOLDER_SITE_URL = "https://your-domain.com";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (
    configured &&
    !configured.includes("localhost") &&
    configured !== PLACEHOLDER_SITE_URL
  ) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return PLACEHOLDER_SITE_URL;
  }

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const siteDescription =
  "AI-студия товарных фото и видео для маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов.";

export const defaultOgImagePath = "/og/vitrina-ai-og.png";

export function absoluteUrl(path = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(cleanPath, siteUrl).toString();
}

export function defaultOgImageUrl(): string {
  return absoluteUrl(defaultOgImagePath);
}

export function isProductionSiteUrl(): boolean {
  return (
    siteUrl !== "http://localhost:3000" && siteUrl !== PLACEHOLDER_SITE_URL
  );
}

export function withoutTrailingSlash(path: string): string {
  if (path === "/") return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function buildLanguageAlternates(
  pathByLocale: Partial<Record<Locale, string>> | Record<Locale, string>
): Record<string, string> {
  const activeLocales = indexableLocales.filter(
    (locale): locale is IndexableLocale =>
      typeof pathByLocale[locale] === "string" && Boolean(pathByLocale[locale])
  );

  const languages = Object.fromEntries(
    activeLocales.map((locale) => [
      supportedLocaleHreflangs[locale],
      absoluteUrl(pathByLocale[locale]!),
    ])
  ) as Record<string, string>;

  const xDefaultPath = pathByLocale[xDefaultLocale as IndexableLocale];
  if (activeLocales.includes("ru") && xDefaultPath) {
    languages["x-default"] = absoluteUrl(xDefaultPath);
  } else if (activeLocales.length > 0) {
    languages["x-default"] = absoluteUrl(pathByLocale[activeLocales[0]]!);
  }

  return languages;
}

export function defaultLocalePath(path: string): string {
  const clean = withoutTrailingSlash(path);
  return clean === "/" ? `/${defaultLocale}` : `/${defaultLocale}${clean}`;
}
