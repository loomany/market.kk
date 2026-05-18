import type { Locale } from "@/lib/i18n/localeConfig";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { blogTopics, getBlogTopicBySlug } from "@/data/seo/blogTopics";
import { getArticleByTopicId } from "@/data/seo/blogArticles";

export function resolveBlogArticle(locale: Locale, slug: string) {
  const topic = getBlogTopicBySlug(locale, slug);
  if (!topic) return null;

  const article = getArticleByTopicId(topic.id);
  const localizedArticle = article?.content[locale];

  return {
    topic,
    article,
    localizedArticle,
    isPublished: topic.status[locale] === "published" && Boolean(localizedArticle),
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

export function getBlogPathByLocale(topicId: string) {
  const topic = blogTopics.find((item) => item.id === topicId);
  if (!topic) return null;

  return Object.fromEntries(
    supportedLocaleCodes.map((locale) => [
      locale,
      `/${locale}/blog/${topic.slug[locale] ?? topic.slug.en}`,
    ])
  ) as Record<Locale, string>;
}
