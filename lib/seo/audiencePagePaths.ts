import { audiencePages } from "@/data/seo/audiencePages";
import type { Locale } from "@/lib/i18n/localeConfig";
import { indexableLocales } from "@/lib/i18n/localeConfig";
import { getAudiencePagePath } from "@/lib/seo/audiencePaths";
import { isKkAudienceApproved } from "@/lib/seo/kkIndexPolicy";
import { shouldIndexPage } from "@/lib/seo/qualityGate";

export function audiencePathByLocale(
  page: (typeof audiencePages)[number]
): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    indexableLocales
      .filter((locale) => {
        const content = page.content[locale];
        if (!content?.slug) return false;
        if (locale === "kk" && !isKkAudienceApproved(page.id)) return false;
        return shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: content.status,
          sectionCount: content.sections.length,
          internalLinkCount: content.relatedLinks.length,
          hasCanonical: true,
          hasHreflang: true,
        });
      })
      .map((locale) => [locale, getAudiencePagePath(locale, page.content[locale].slug)])
  ) as Partial<Record<Locale, string>>;
}
