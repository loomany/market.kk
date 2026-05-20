import type { StaticRouteKey } from "@/lib/i18n/routeSlugs";
import type { Locale } from "@/lib/i18n/localeConfig";

/** Blog topic numbers with Stage 5/6 approved Kazakh content (ru/en/kk triads). */
export const KK_APPROVED_BLOG_TOPIC_NUMBERS = new Set([
  1, 2, 3, 4, 5, 11, 12, 16, 31, 64,
]);

/** Feature/pricing static pages approved for kk index + hreflang (excludes in-dev video). */
export const KK_APPROVED_STATIC_PAGE_KEYS = new Set<StaticRouteKey>([
  "aiProductPhotoStudio",
  "productPhotoForMarketplaces",
  "backgroundGenerator",
  "fashionModelPhotos",
  "jewelryProductPhotos",
  "cost",
]);

export function isKkBlogTopicApproved(topicId: string): boolean {
  const match = /^blog_(\d+)$/.exec(topicId);
  if (!match) return false;
  return KK_APPROVED_BLOG_TOPIC_NUMBERS.has(Number(match[1]));
}

export function isKkStaticPageApproved(key: StaticRouteKey): boolean {
  return KK_APPROVED_STATIC_PAGE_KEYS.has(key);
}

/** KK home landing is approved for index when translation status is published. */
export function isKkHomeApproved(status: string): boolean {
  return status === "published";
}

export function isKkLocaleApprovedForIndex(locale: Locale): boolean {
  return locale === "kk";
}
