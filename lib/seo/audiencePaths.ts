import type { Locale } from "@/lib/i18n/localeConfig";

const audienceHubByLocale: Partial<Record<Locale, string>> = {
  ru: "dlya-kogo",
  en: "who-it-is-for",
  kk: "kimge",
};

export function getAudienceHubSegment(locale: Locale): string {
  return audienceHubByLocale[locale] ?? audienceHubByLocale.en ?? "who-it-is-for";
}

export function getAudiencePagePath(locale: Locale, slug: string): string {
  const hub = getAudienceHubSegment(locale);
  return `/${locale}/${hub}/${slug}`;
}

export function isAudienceHubForLocale(locale: Locale, hub: string): boolean {
  return hub === getAudienceHubSegment(locale);
}
