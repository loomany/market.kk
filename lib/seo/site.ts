import type { Locale } from "@/lib/i18n/localeConfig";
import {
  defaultLocale,
  supportedLocaleCodes,
  supportedLocaleHreflangs,
  xDefaultLocale,
} from "@/lib/i18n/localeConfig";

export const siteName = "Vitrina AI Studio";
export const siteShortName = "Vitrina AI";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://your-domain.com"
    : "http://localhost:3000");
export const siteDescription =
  "AI-студия товарных фото и видео для маркетплейсов, интернет-магазинов, Instagram-витрин и каталогов.";

export function absoluteUrl(path = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(cleanPath, siteUrl).toString();
}

export function withoutTrailingSlash(path: string): string {
  if (path === "/") return path;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function buildLanguageAlternates(
  pathByLocale: Record<Locale, string>
): Record<string, string> {
  const languages = Object.fromEntries(
    supportedLocaleCodes.map((locale) => [
      supportedLocaleHreflangs[locale],
      absoluteUrl(pathByLocale[locale]),
    ])
  ) as Record<string, string>;

  languages["x-default"] = absoluteUrl(pathByLocale[xDefaultLocale]);
  return languages;
}

export function defaultLocalePath(path: string): string {
  const clean = withoutTrailingSlash(path);
  return clean === "/" ? `/${defaultLocale}` : `/${defaultLocale}${clean}`;
}
