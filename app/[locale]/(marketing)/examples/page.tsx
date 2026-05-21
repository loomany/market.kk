import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { ExampleDisclaimer } from "@/components/examples/ExampleDisclaimer";
import { ExamplesHubSection } from "@/components/examples/ExamplesHubSection";
import { getExamplePage, getExamplePagesForLocale } from "@/data/seo/examplesPages";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { examplesHubLabels } from "@/lib/seo/examplesCopy";
import { studioEntryPath } from "@/lib/i18n/siteLocalePreference";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return supportedLocaleCodes
    .filter((locale) => getExamplePagesForLocale(locale).length > 0)
    .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const page = getExamplePage(locale, "");
  if (!page) return {};

  const path = `/${locale}/examples`;

  return createSeoMetadata({
    locale,
    title: page.title,
    description: page.metaDescription,
    h1: page.h1,
    status: "noindex",
    pathByLocale: { [locale]: path },
    sectionCount: page.sections.length,
    internalLinkCount: page.relatedLinks.length,
    hasCanonical: true,
    hasHreflang: false,
  });
}

export default async function ExamplesHubPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const page = getExamplePage(locale, "");
  if (!page) notFound();

  const children = getExamplePagesForLocale(locale).filter((p) => p.key !== "index");
  const labels = examplesHubLabels(locale);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", url: `/${locale}` },
      { name: page.h1, url: `/${locale}/examples` },
    ]),
    webPageJsonLd({
      name: page.h1,
      description: page.intro,
      url: `/${locale}/examples`,
      inLanguage: locale,
    }),
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript data={structuredData} />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        {labels.back}
      </Link>
      <div className="mt-4">
        <ExampleDisclaimer text={page.disclaimer} />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">{page.h1}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{page.intro}</p>

      <ExamplesHubSection locale={locale} page={page} childPages={children} />

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={studioEntryPath(locale)}
          prefetch={false}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {labels.studio}
        </Link>
        <Link
          href={`/${locale}/quality`}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          {labels.quality}
        </Link>
      </div>
    </main>
  );
}
