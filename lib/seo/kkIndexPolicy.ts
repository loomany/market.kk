import type { StaticRouteKey } from "@/lib/i18n/routeSlugs";
import type { Locale } from "@/lib/i18n/localeConfig";

/** Blog topic numbers with Stage 5/6 approved Kazakh content (ru/en/kk triads). */
/** Stage 5 (10) + Stage 13 Wave 2 KK subset (8) = 18 approved blog triads */
export const KK_APPROVED_BLOG_TOPIC_NUMBERS = new Set([
  1, 2, 3, 4, 5, 11, 12, 16, 31, 64,
  6, 7, 9, 10, 20, 61, 63, 77,
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

/** Trust pages approved for kk index + ru/en/kk hreflang (Stage 13.1). */
export const KK_APPROVED_TRUST_PAGE_KEYS = new Set<StaticRouteKey>([
  "howItWorks",
  "quality",
  "faq",
]);

export function isKkBlogTopicApproved(topicId: string): boolean {
  const match = /^blog_(\d+)$/.exec(topicId);
  if (!match) return false;
  return KK_APPROVED_BLOG_TOPIC_NUMBERS.has(Number(match[1]));
}

export function isKkStaticPageApproved(key: StaticRouteKey): boolean {
  return KK_APPROVED_STATIC_PAGE_KEYS.has(key);
}

export function isKkTrustPageApproved(key: StaticRouteKey): boolean {
  return KK_APPROVED_TRUST_PAGE_KEYS.has(key);
}

/** KK home landing is approved for index when translation status is published. */
export function isKkHomeApproved(status: string): boolean {
  return status === "published";
}

export function isKkLocaleApprovedForIndex(locale: Locale): boolean {
  return locale === "kk";
}
