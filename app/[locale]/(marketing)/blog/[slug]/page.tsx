import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { blogTopics } from "@/data/seo/blogTopics";
import {
  isBlogArticleViewable,
  resolveBlogArticle,
  getBlogPathByLocale,
} from "@/lib/blog/blogResolve";
import {
  assertLocale,
  getHtmlLanguage,
  indexableLocales,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { isStudioEntryHref, resolvePublicHref } from "@/lib/i18n/siteLocalePreference";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return supportedLocaleCodes.flatMap((locale) =>
    blogTopics
      .filter((topic) => isBlogArticleViewable(locale, topic.status[locale]))
      .map((topic) => ({ locale, slug: topic.slug[locale] ?? topic.slug.en ?? topic.id }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const resolved = resolveBlogArticle(locale, slug);
  if (!resolved?.localizedArticle || !resolved.isViewable) return {};

  const articleSlug = resolved.topic.slug[locale] ?? resolved.topic.slug.en ?? slug;
  const articlePath = `/${locale}/blog/${articleSlug}`;
  const pathByLocale =
    getBlogPathByLocale(resolved.topic.id) ??
    ({ [locale]: articlePath } as Partial<Record<Locale, string>>);
  const hasHreflang = indexableLocales.some((l) => Boolean(pathByLocale[l]));

  return createSeoMetadata({
    locale,
    title: resolved.localizedArticle.title,
    description: resolved.localizedArticle.metaDescription,
    h1: resolved.localizedArticle.title,
    status: resolved.topic.status[locale],
    pathByLocale,
    sectionCount: resolved.localizedArticle.sections.length,
    internalLinkCount: resolved.localizedArticle.internalLinks.length,
    hasCanonical: true,
    hasHreflang,
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const resolved = resolveBlogArticle(locale, slug);
  if (!resolved?.localizedArticle || !resolved.article || !resolved.isViewable) {
    notFound();
  }

  const article = resolved.localizedArticle;
  const articlePath = `/${locale}/blog/${resolved.topic.slug[locale] ?? resolved.topic.slug.en}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: `/${locale}` },
            { name: "Blog", url: `/${locale}/blog` },
            { name: article.title, url: articlePath },
          ]),
          articleJsonLd({
            title: article.title,
            description: article.metaDescription,
            url: articlePath,
            datePublished: resolved.article.publishedAt,
            dateModified: resolved.article.updatedAt,
            inLanguage: getHtmlLanguage(locale),
          }),
          faqJsonLd(article.faq),
        ]}
      />
      <Link href={`/${locale}/blog`} className="text-sm font-semibold text-teal-700">
        ← Blog
      </Link>
      <article className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          {resolved.topic.cluster}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {article.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{article.intro}</p>

        <section className="mt-8 rounded-lg border border-teal-100 bg-teal-50 p-5 text-teal-950">
          <h2 className="text-xl font-bold tracking-tight">
            {locale === "ru" ? "Короткий ответ" : "Short answer"}
          </h2>
          <p className="mt-2 text-sm leading-6">{article.shortAnswer}</p>
        </section>

        <div className="mt-8 grid gap-8">
          {article.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                {section.title}
              </h2>
              <div className="mt-3 grid gap-3 text-base leading-8 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {locale === "ru" ? "Чеклист" : "Checklist"}
          </h2>
          <ul className="mt-4 grid gap-2">
            {article.checklist.map((item) => (
              <li key={item} className="text-sm leading-6 text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">FAQ</h2>
          <div className="mt-5 grid gap-4">
            {article.faq.map((item) => (
              <details key={item.question} className="rounded-lg border border-border bg-white p-4">
                <summary className="font-semibold text-slate-950">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-slate-50 p-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {locale === "ru" ? "Связанные страницы" : "Related pages"}
          </h2>
          <div className="mt-4 grid gap-2">
            {article.internalLinks.map((link) => (
              <Link
                key={link.href}
                href={resolvePublicHref(link.href, locale)}
                prefetch={isStudioEntryHref(link.href) ? false : undefined}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
