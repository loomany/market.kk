import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { getUseCaseBySlug, useCasePages } from "@/data/seo/useCases";
import { platformPages } from "@/data/seo/platforms";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return supportedLocaleCodes.flatMap((locale) =>
    useCasePages.map((page) => ({ locale, slug: page.content[locale].slug }))
  );
}

function pathMap(page: (typeof useCasePages)[number]) {
  return Object.fromEntries(
    supportedLocaleCodes.map((locale) => [
      locale,
      `/${locale}/use-cases/${page.content[locale].slug}`,
    ])
  ) as Record<Locale, string>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const page = getUseCaseBySlug(locale, slug);
  if (!page) return {};
  const content = page.content[locale];

  return createSeoMetadata({
    locale,
    title: content.title,
    description: content.metaDescription,
    h1: content.h1,
    status: content.status,
    pathByLocale: pathMap(page),
    sectionCount: content.sections.length,
    internalLinkCount: content.internalLinks.length + page.relatedPlatforms.length,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function UseCaseDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const page = getUseCaseBySlug(locale, slug);
  if (!page) notFound();

  const content = page.content[locale];
  const relatedPlatforms = platformPages.filter((platform) =>
    page.relatedPlatforms.includes(platform.name)
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: `/${locale}` },
            { name: "Use cases", url: `/${locale}/use-cases` },
            { name: content.h1, url: `/${locale}/use-cases/${content.slug}` },
          ]),
          faqJsonLd(content.faq),
          webPageJsonLd({
            name: content.h1,
            description: content.shortAnswer,
            url: `/${locale}/use-cases/${content.slug}`,
            inLanguage: locale,
          }),
          serviceJsonLd({
            name: content.h1,
            description: content.shortAnswer,
            url: `/${locale}/use-cases/${content.slug}`,
          }),
        ]}
      />
      <Link href={`/${locale}/use-cases`} className="text-sm font-semibold text-teal-700">
        ← Use cases
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {content.h1}
      </h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{content.shortAnswer}</p>

      <div className="mt-10 grid gap-5">
        {content.sections.map((section) => (
          <section key={section.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          {locale === "ru" ? "Связанные платформы" : "Related platforms"}
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {relatedPlatforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/${locale}/platforms/${platform.content[locale].slug}`}
              className="rounded-lg border border-border bg-white p-4 text-sm font-semibold text-slate-800 hover:border-teal-200 hover:text-teal-800"
            >
              {platform.name}
            </Link>
          ))}
          <Link
            href="/studio"
            prefetch={false}
            className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-800 hover:bg-teal-100"
          >
            {locale === "ru" ? "Открыть студию" : "Open studio"}
          </Link>
        </div>
      </section>

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
    </main>
  );
}
