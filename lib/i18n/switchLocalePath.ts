import { getArticleByTopicId } from "@/data/seo/blogArticles";
import { blogTopics } from "@/data/seo/blogTopics";
import { platformPages } from "@/data/seo/platforms";
import { staticSeoPages } from "@/data/seo/staticPages";
import { resolveExampleSwitchPath } from "@/data/seo/examplesPages";
import { useCasePages } from "@/data/seo/useCases";
import {
  indexableLocales,
  isLocale,
  type Locale,
} from "@/lib/i18n/localeConfig";

const SECTION_ROUTES = new Set([
  "features",
  "platforms",
  "use-cases",
  "blog",
  "ai-summary",
  "cost",
]);

function findStaticPageByAnySlug(slug: string) {
  return staticSeoPages.find((page) =>
    indexableLocales.some((locale) => page.content[locale].slug === slug)
  );
}

function findPlatformByAnySlug(slug: string) {
  return platformPages.find((page) =>
    indexableLocales.some((locale) => page.content[locale].slug === slug)
  );
}

function findUseCaseByAnySlug(slug: string) {
  return useCasePages.find((page) =>
    indexableLocales.some((locale) => page.content[locale].slug === slug)
  );
}

function findBlogTopicByAnySlug(slug: string) {
  return blogTopics.find((topic) =>
    indexableLocales.some((locale) => topic.slug[locale] === slug)
  );
}

/**
 * Maps the current public path to an equivalent path in `targetLocale`.
 * Falls back to locale home or section index when translation is missing or draft.
 */
export function resolveLocaleSwitchPath(
  pathname: string,
  targetLocale: Locale
): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  const sourceLocale = isLocale(segments[0]) ? segments[0] : null;
  const rest = sourceLocale ? segments.slice(1) : segments;

  if (rest.length === 0) {
    return `/${targetLocale}`;
  }

  if (rest[0] === "studio") {
    if (targetLocale === "ru") {
      return "/studio";
    }
    return `/${targetLocale}/studio`;
  }

  if (rest.length === 1 && SECTION_ROUTES.has(rest[0])) {
    return `/${targetLocale}/${rest[0]}`;
  }

  if (rest.length === 1) {
    const staticPage = findStaticPageByAnySlug(rest[0]);
    if (staticPage) {
      const targetContent = staticPage.content[targetLocale];
      const indexable =
        staticPage.indexPolicy !== "noindex" &&
        targetContent?.status === "published" &&
        Boolean(targetContent.slug);
      if (indexable) {
        return `/${targetLocale}/${targetContent.slug}`;
      }
    }
    return `/${targetLocale}`;
  }

  if (rest[0] === "platforms" && rest[1]) {
    const page = findPlatformByAnySlug(rest[1]);
    if (page) {
      return `/${targetLocale}/platforms/${page.content[targetLocale].slug}`;
    }
    return `/${targetLocale}/platforms`;
  }

  if (rest[0] === "use-cases" && rest[1]) {
    const page = findUseCaseByAnySlug(rest[1]);
    if (page) {
      return `/${targetLocale}/use-cases/${page.content[targetLocale].slug}`;
    }
    return `/${targetLocale}/use-cases`;
  }

  if (rest[0] === "examples") {
    const examplePath = resolveExampleSwitchPath(pathname, targetLocale);
    if (examplePath) {
      return examplePath;
    }
    return `/${targetLocale}/examples`;
  }

  if (rest[0] === "blog") {
    if (!rest[1]) {
      return `/${targetLocale}/blog`;
    }

    const topic = findBlogTopicByAnySlug(rest[1]);
    if (!topic) {
      return `/${targetLocale}/blog`;
    }

    const targetSlug = topic.slug[targetLocale];
    const article = getArticleByTopicId(topic.id);
    const published =
      topic.status[targetLocale] === "published" &&
      Boolean(article?.content[targetLocale]) &&
      Boolean(targetSlug);

    if (published) {
      return `/${targetLocale}/blog/${targetSlug}`;
    }

    return `/${targetLocale}/blog`;
  }

  return `/${targetLocale}`;
}
