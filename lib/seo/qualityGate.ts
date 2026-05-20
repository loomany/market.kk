import type { Metadata } from "next";
import type { Locale, TranslationStatus } from "@/lib/i18n/localeConfig";
import { localeTranslationStatus } from "@/lib/i18n/translations";

export type IndexPolicy =
  | "index"
  | "noindex"
  | "index_when_content_ready"
  | "draft";

export type SeoQualityInput = {
  locale: Locale;
  title?: string;
  description?: string;
  h1?: string;
  status?: TranslationStatus | IndexPolicy;
  contentStatus?: TranslationStatus | IndexPolicy;
  sectionCount?: number;
  internalLinkCount?: number;
  hasPlaceholder?: boolean;
  hasCanonical?: boolean;
  hasHreflang?: boolean;
  hasUnsupportedClaims?: boolean;
};

const noindexStatuses = new Set<string>([
  "draft",
  "machine_translated",
  "needs_review",
  "ready_for_review",
  "noindex",
  "index_when_content_ready",
]);

export function explainNoindexReason(page: SeoQualityInput): string | null {
  const status = page.status ?? page.contentStatus;

  if (status && noindexStatuses.has(status)) {
    return `content status is ${status}`;
  }

  if (localeTranslationStatus[page.locale] !== "published") {
    return `locale ${page.locale} translation is ${localeTranslationStatus[page.locale]}`;
  }

  if (!page.title || page.title.trim().length < 18) {
    return "title is missing or too short";
  }

  if (!page.description || page.description.trim().length < 55) {
    return "description is missing or too short";
  }

  if (!page.h1 || page.h1.trim().length < 8) {
    return "H1 is missing or too short";
  }

  if (page.sectionCount !== undefined && page.sectionCount < 2) {
    return "not enough useful sections";
  }

  if (page.internalLinkCount !== undefined && page.internalLinkCount < 2) {
    return "not enough internal links";
  }

  if (page.hasPlaceholder) {
    return "placeholder content present";
  }

  if (page.hasUnsupportedClaims) {
    return "unsupported guarantee or fake trust claim present";
  }

  if (page.hasCanonical === false) {
    return "canonical is missing";
  }

  if (page.hasHreflang === false) {
    return "hreflang alternates are missing";
  }

  return null;
}

export function shouldIndexPage(page: SeoQualityInput): boolean {
  return explainNoindexReason(page) === null;
}

export function getRobotsPolicy(page: SeoQualityInput): Metadata["robots"] {
  const index = shouldIndexPage(page);
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}
