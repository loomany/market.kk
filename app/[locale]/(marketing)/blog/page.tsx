import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { blogTopics } from "@/data/seo/blogTopics";
import { getPublishedBlogArticles } from "@/lib/blog/blogResolve";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { studioEntryPath } from "@/lib/i18n/siteLocalePreference";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { blogJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/blog`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const isRu = locale === "ru";
  return createSeoMetadata({
    locale,
    title: isRu ? "Блог Vitrina AI Studio" : "Vitrina AI Studio Blog",
    description: isRu
      ? "Keyword-first блог Vitrina AI Studio: опубликованы только полезные статьи, остальные темы остаются draft/noindex до проверки ключей и контента."
      : "Keyword-first Vitrina AI Studio blog: only useful articles are published; the rest stay draft/noindex until keyword and content review.",
    h1: isRu ? "Блог Vitrina AI Studio" : "Vitrina AI Studio Blog",
    status: locale === "ru" || locale === "en" ? "published" : "needs_review",
    pathByLocale,
    sectionCount: 3,
    internalLinkCount: 8,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function BlogPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();
  const isRu = locale === "ru";
  const articles = getPublishedBlogArticles(locale);
  const draftCount = blogTopics.filter((topic) => topic.status[locale] !== "published").length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: `/${locale}` },
            { name: isRu ? "Блог" : "Blog", url: `/${locale}/blog` },
          ]),
          blogJsonLd({
            name: isRu ? "Блог Vitrina AI Studio" : "Vitrina AI Studio Blog",
            description: isRu
              ? "Keyword-first блог о товарных фото, маркетплейсах и AI workflow."
              : "Keyword-first blog about product photos, marketplaces, and AI workflows.",
            url: `/${locale}/blog`,
            inLanguage: locale,
          }),
        ]}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {isRu ? "Блог" : "Blog"}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {isRu
          ? `Опубликованы только статьи с полезным контентом. ${draftCount} тем остаются в keyword map как draft/noindex до ручной проверки.`
          : `Only useful articles are published. ${draftCount} topics stay in the keyword map as draft/noindex until manual review.`}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={studioEntryPath(locale)}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
        >
          {isRu ? "Открыть студию" : "Open studio"}
        </Link>
        <Link
          href={`/${locale}/features`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:border-teal-200 hover:bg-teal-50"
        >
          {isRu ? "Посмотреть возможности" : "See features"}
        </Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {articles.map(({ topic, localizedArticle }) => (
          <Link
            key={topic.id}
            href={`/${locale}/blog/${topic.slug[locale] ?? topic.slug.en}`}
            className="rounded-lg border border-border bg-white p-5 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/50"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {topic.cluster}
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
              {localizedArticle.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {localizedArticle.shortAnswer}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
