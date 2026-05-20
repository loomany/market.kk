import type { Locale } from "@/lib/i18n/localeConfig";
import { indexableLocales } from "@/lib/i18n/localeConfig";
import {
  blogTopics,
  getBlogTopicBySlug,
  type BlogTopicStatus,
} from "@/data/seo/blogTopics";
import { getArticleByTopicId } from "@/data/seo/blogArticles";

export function isBlogArticleViewable(
  locale: Locale,
  status: BlogTopicStatus
): boolean {
  if (status === "published") return true;
  if (locale === "kk" && status === "ready_for_review") return true;
  return false;
}

export function resolveBlogArticle(locale: Locale, slug: string) {
  const topic = getBlogTopicBySlug(locale, slug);
  if (!topic) return null;

  const article = getArticleByTopicId(topic.id);
  const localizedArticle = article?.content[locale];

  const viewable =
    Boolean(localizedArticle) && isBlogArticleViewable(locale, topic.status[locale]);

  return {
    topic,
    article,
    localizedArticle,
    isPublished: topic.status[locale] === "published" && Boolean(localizedArticle),
    isViewable: viewable,
  };
}

export function getPublishedBlogArticles(locale: Locale) {
  return blogTopics
    .map((topic) => {
      const article = getArticleByTopicId(topic.id);
      const localizedArticle = article?.content[locale];
      if (topic.status[locale] !== "published" || !localizedArticle) return null;
      return { topic, article, localizedArticle };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getBlogPathByLocale(topicId: string): Partial<Record<Locale, string>> | null {
  const topic = blogTopics.find((item) => item.id === topicId);
  if (!topic) return null;

  const article = getArticleByTopicId(topicId);
  const entries = indexableLocales
    .filter((locale) => {
      if (topic.status[locale] !== "published") return false;
      if (!article?.content[locale]) return false;
      return true;
    })
    .map((locale) => [
      locale,
      `/${locale}/blog/${topic.slug[locale] ?? topic.slug.en}`,
    ]);

  if (entries.length === 0) return null;
  return Object.fromEntries(entries) as Partial<Record<Locale, string>>;
}
