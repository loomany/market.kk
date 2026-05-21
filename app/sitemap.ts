import type { MetadataRoute } from "next";
import { blogTopics } from "@/data/seo/blogTopics";
import { getArticleByTopicId } from "@/data/seo/blogArticles";
import { getBlogPathByLocale } from "@/lib/blog/blogResolve";
import { platformPages } from "@/data/seo/platforms";
import { staticSeoPages } from "@/data/seo/staticPages";
import { audiencePages } from "@/data/seo/audiencePages";
import { audiencePathByLocale as audienceIndexPaths } from "@/lib/seo/audiencePagePaths";
import { useCasePages } from "@/data/seo/useCases";
import { indexableLocales, type Locale } from "@/lib/i18n/localeConfig";
import { shouldIndexPage } from "@/lib/seo/qualityGate";
import { absoluteUrl, buildLanguageAlternates } from "@/lib/seo/site";

const lastModified = new Date();

function alternates(pathByLocale: Partial<Record<Locale, string>>) {
  return {
    languages: buildLanguageAlternates(pathByLocale),
  };
}

function entry(
  locale: Locale,
  pathByLocale: Partial<Record<Locale, string>>,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(pathByLocale[locale]!),
    lastModified,
    changeFrequency,
    priority,
    alternates: alternates(pathByLocale),
  };
}

function homePaths(): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    indexableLocales.map((locale) => [locale, `/${locale}`])
  ) as Partial<Record<Locale, string>>;
}

function sectionPaths(segment: string): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    indexableLocales.map((locale) => [locale, `/${locale}/${segment}`])
  ) as Partial<Record<Locale, string>>;
}

function staticPathsForPage(page: (typeof staticSeoPages)[number]): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    indexableLocales
      .filter((locale) => page.content[locale]?.slug)
      .map((locale) => [locale, `/${locale}/${page.content[locale].slug}`])
  ) as Partial<Record<Locale, string>>;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  const home = homePaths();
  const features = sectionPaths("features");
  const platforms = sectionPaths("platforms");
  const useCases = sectionPaths("use-cases");
  const blog = sectionPaths("blog");
  const aiSummary = sectionPaths("ai-summary");
  const cost = sectionPaths("cost");

  for (const locale of indexableLocales) {
    items.push(entry(locale, home, 1, "weekly"));
    items.push(entry(locale, features, 0.85));
    items.push(entry(locale, platforms, 0.8));
    items.push(entry(locale, useCases, 0.8));
    items.push(entry(locale, blog, 0.75));
    items.push(entry(locale, aiSummary, 0.65));
    items.push(entry(locale, cost, 0.72));
  }

  for (const page of staticSeoPages) {
    const pathByLocale = staticPathsForPage(page);

    for (const locale of indexableLocales) {
      if (!pathByLocale[locale]) continue;

      const content = page.content[locale];
      if (
        shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: page.indexPolicy === "noindex" ? "noindex" : content.status,
          sectionCount: content.sections.length,
          internalLinkCount: 3,
          hasCanonical: true,
          hasHreflang: true,
        })
      ) {
        items.push(entry(locale, pathByLocale, page.kind === "legal" ? 0.45 : 0.7));
      }
    }
  }

  for (const page of platformPages) {
    const pathByLocale = Object.fromEntries(
      indexableLocales
        .filter((locale) => page.content[locale]?.slug)
        .map((locale) => [locale, `/${locale}/platforms/${page.content[locale].slug}`])
    ) as Partial<Record<Locale, string>>;

    for (const locale of indexableLocales) {
      if (!pathByLocale[locale]) continue;

      const content = page.content[locale];
      if (
        shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: content.status,
          sectionCount: 4,
          internalLinkCount: 4,
          hasCanonical: true,
          hasHreflang: true,
        })
      ) {
        items.push(entry(locale, pathByLocale, 0.68));
      }
    }
  }

  for (const page of audiencePages) {
    const pathByLocale = audienceIndexPaths(page);

    for (const locale of indexableLocales) {
      if (!pathByLocale[locale]) continue;

      const content = page.content[locale];
      if (
        shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: content.status,
          sectionCount: content.sections.length,
          internalLinkCount: content.relatedLinks.length,
          hasCanonical: true,
          hasHreflang: true,
        })
      ) {
        items.push(entry(locale, pathByLocale, 0.66));
      }
    }
  }

  for (const page of useCasePages) {
    const pathByLocale = Object.fromEntries(
      indexableLocales
        .filter((locale) => page.content[locale]?.slug)
        .map((locale) => [locale, `/${locale}/use-cases/${page.content[locale].slug}`])
    ) as Partial<Record<Locale, string>>;

    for (const locale of indexableLocales) {
      if (!pathByLocale[locale]) continue;

      const content = page.content[locale];
      if (
        shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: content.status,
          sectionCount: content.sections.length,
          internalLinkCount: 4,
          hasCanonical: true,
          hasHreflang: true,
        })
      ) {
        items.push(entry(locale, pathByLocale, 0.68));
      }
    }
  }

  for (const topic of blogTopics) {
    const article = getArticleByTopicId(topic.id);
    if (!article) continue;

    const pathByLocale = getBlogPathByLocale(topic.id);
    if (!pathByLocale) continue;

    for (const locale of indexableLocales) {
      if (!pathByLocale[locale]) continue;

      const localizedArticle = article.content[locale];
      if (!localizedArticle) continue;

      if (
        shouldIndexPage({
          locale,
          title: localizedArticle.title,
          description: localizedArticle.metaDescription,
          h1: localizedArticle.title,
          status: topic.status[locale],
          sectionCount: localizedArticle.sections.length,
          internalLinkCount: localizedArticle.internalLinks.length,
          hasCanonical: true,
          hasHreflang: true,
        })
      ) {
        items.push(entry(locale, pathByLocale, topic.priority === "P0" ? 0.72 : 0.58));
      }
    }
  }

  return items;
}
