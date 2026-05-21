import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommercialExamplesTeaser } from "@/components/examples/CommercialExamplesTeaser";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { getTeaserCategoriesForFeature } from "@/data/seo/featureExamplesTeaser";
import {
  getStaticSeoPageBySlug,
  staticSeoPages,
} from "@/data/seo/staticPages";
import {
  assertLocale,
  indexableLocales,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { shouldIndexPage } from "@/lib/seo/qualityGate";
import { resolvePublicHref, studioEntryPath } from "@/lib/i18n/siteLocalePreference";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return supportedLocaleCodes.flatMap((locale) =>
    staticSeoPages.map((page) => ({ locale, slug: page.content[locale].slug }))
  );
}

function pathMap(page: (typeof staticSeoPages)[number]) {
  return Object.fromEntries(
    indexableLocales
      .filter((locale) => {
        const content = page.content[locale];
        if (!content?.slug) return false;
        const status = page.indexPolicy === "noindex" ? "noindex" : content.status;
        return shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status,
          sectionCount: content.sections.length,
          internalLinkCount: content.relatedLinks?.length ?? 3,
          hasCanonical: true,
          hasHreflang: true,
        });
      })
      .map((locale) => [locale, `/${locale}/${page.content[locale].slug}`])
  ) as Partial<Record<Locale, string>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const page = getStaticSeoPageBySlug(locale, slug);
  if (!page) return {};
  const content = page.content[locale];

  return createSeoMetadata({
    locale,
    title: content.title,
    description: content.metaDescription,
    h1: content.h1,
    status: page.indexPolicy === "noindex" ? "noindex" : content.status,
    pathByLocale: pathMap(page),
    sectionCount: content.sections.length,
    internalLinkCount: 3,
    hasCanonical: true,
    hasHreflang: Object.keys(pathMap(page)).length >= 2,
  });
}

export default async function StaticSeoPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const page = getStaticSeoPageBySlug(locale, slug);
  if (!page) notFound();
  const content = page.content[locale];
  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", url: `/${locale}` },
      { name: content.h1, url: `/${locale}/${content.slug}` },
    ]),
    webPageJsonLd({
      name: content.h1,
      description: content.intro,
      url: `/${locale}/${content.slug}`,
      inLanguage: locale,
    }),
    ...(content.faq ? [faqJsonLd(content.faq)] : []),
    ...(page.kind === "feature"
      ? [
          serviceJsonLd({
            name: content.h1,
            description: content.intro,
            url: `/${locale}/${content.slug}`,
          }),
        ]
      : []),
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript data={structuredData} />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {content.h1}
      </h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{content.intro}</p>

      <div className="mt-10 grid gap-6">
        {content.sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
        {page.kind === "feature"
          ? getTeaserCategoriesForFeature(page.key).map((categoryId) => (
              <CommercialExamplesTeaser
                key={categoryId}
                locale={locale}
                categoryId={categoryId}
              />
            ))
          : null}
      </div>

      {content.faq ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">FAQ</h2>
          <div className="mt-5 grid gap-4">
            {content.faq.map((item) => (
              <details key={item.question} className="rounded-lg border border-border bg-white p-4">
                <summary className="font-semibold text-slate-950">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {content.relatedLinks && content.relatedLinks.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {locale === "ru" ? "Полезные материалы" : "Related resources"}
          </h2>
          <ul className="mt-4 grid gap-2 text-sm font-semibold text-teal-700">
            {content.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={resolvePublicHref(link.href, locale)}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {page.kind === "pricing" ? (
          <Link
            href={`/${locale}/tokens`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {locale === "ru"
              ? "Купить 10 токенов"
              : locale === "kk"
                ? "10 токен сатып алу"
                : "Buy 10 tokens"}
          </Link>
        ) : null}
        <Link
          href={studioEntryPath(locale)}
          prefetch={false}
          className={
            page.kind === "pricing"
              ? "rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              : "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          }
        >
          {locale === "ru" ? "Открыть студию" : locale === "kk" ? "Студияны ашу" : "Open studio"}
        </Link>
        <Link href={`/${locale}/use-cases`} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800">
          Use cases
        </Link>
        <Link href={`/${locale}/platforms`} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800">
          Platforms
        </Link>
      </div>
    </main>
  );
}
