import type { MetadataRoute } from "next";
import { blogTopics } from "@/data/seo/blogTopics";
import { getArticleByTopicId } from "@/data/seo/blogArticles";
import { platformPages } from "@/data/seo/platforms";
import { staticSeoPages } from "@/data/seo/staticPages";
import { useCasePages } from "@/data/seo/useCases";
import type { Locale } from "@/lib/i18n/localeConfig";
import { shouldIndexPage } from "@/lib/seo/qualityGate";
import { absoluteUrl } from "@/lib/seo/site";

const indexableLocales: Locale[] = ["ru", "en"];
const lastModified = new Date("2026-05-18T00:00:00.000Z");

function alternates(pathByLocale: Record<Locale, string>) {
  return {
    languages: {
      ru: absoluteUrl(pathByLocale.ru),
      en: absoluteUrl(pathByLocale.en),
      "x-default": absoluteUrl(pathByLocale.ru),
    },
  };
}

function entry(
  locale: Locale,
  pathByLocale: Record<Locale, string>,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(pathByLocale[locale]),
    lastModified,
    changeFrequency,
    priority,
    alternates: alternates(pathByLocale),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];

  for (const locale of indexableLocales) {
    items.push(
      entry(locale, { ru: "/ru", en: "/en" } as Record<Locale, string>, 1, "weekly")
    );
    items.push(
      entry(locale, { ru: "/ru/features", en: "/en/features" } as Record<Locale, string>, 0.85)
    );
    items.push(
      entry(locale, { ru: "/ru/platforms", en: "/en/platforms" } as Record<Locale, string>, 0.8)
    );
    items.push(
      entry(locale, { ru: "/ru/use-cases", en: "/en/use-cases" } as Record<Locale, string>, 0.8)
    );
    items.push(
      entry(locale, { ru: "/ru/blog", en: "/en/blog" } as Record<Locale, string>, 0.75)
    );
    items.push(
      entry(locale, { ru: "/ru/ai-summary", en: "/en/ai-summary" } as Record<Locale, string>, 0.65)
    );
  }

  for (const page of staticSeoPages) {
    const pathByLocale = {
      ru: `/ru/${page.content.ru.slug}`,
      en: `/en/${page.content.en.slug}`,
    } as Record<Locale, string>;

    for (const locale of indexableLocales) {
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
    const pathByLocale = {
      ru: `/ru/platforms/${page.content.ru.slug}`,
      en: `/en/platforms/${page.content.en.slug}`,
    } as Record<Locale, string>;

    for (const locale of indexableLocales) {
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

  for (const page of useCasePages) {
    const pathByLocale = {
      ru: `/ru/use-cases/${page.content.ru.slug}`,
      en: `/en/use-cases/${page.content.en.slug}`,
    } as Record<Locale, string>;

    for (const locale of indexableLocales) {
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

    const pathByLocale = {
      ru: `/ru/blog/${topic.slug.ru}`,
      en: `/en/blog/${topic.slug.en}`,
    } as Record<Locale, string>;

    for (const locale of indexableLocales) {
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
