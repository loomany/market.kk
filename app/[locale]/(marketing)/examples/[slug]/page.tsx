import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { ExampleDisclaimer } from "@/components/examples/ExampleDisclaimer";
import { ExamplesCaseSection } from "@/components/examples/ExamplesCaseSection";
import {
  getAllExampleStaticParams,
  getExamplePage,
} from "@/data/seo/examplesPages";
import {
  assertLocale,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { examplesHubLabels } from "@/lib/seo/examplesCopy";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllExampleStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const page = getExamplePage(locale, slug);
  if (!page || page.key === "index") return {};

  const path = `/${locale}/examples/${slug}`;

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

export default async function ExampleCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const page = getExamplePage(locale, slug);
  if (!page || page.key === "index") notFound();

  const labels = examplesHubLabels(locale);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", url: `/${locale}` },
      { name: "Examples", url: `/${locale}/examples` },
      { name: page.h1, url: `/${locale}/examples/${slug}` },
    ]),
    webPageJsonLd({
      name: page.h1,
      description: page.intro,
      url: `/${locale}/examples/${slug}`,
      inLanguage: locale,
    }),
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript data={structuredData} />
      <Link href={`/${locale}/examples`} className="text-sm font-semibold text-teal-700">
        {labels.backExamples}
      </Link>
      <div className="mt-4">
        <ExampleDisclaimer text={page.disclaimer} />
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">{page.h1}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">{page.intro}</p>

      <div className="mt-10 grid gap-6">
        {page.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border border-border bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      <ExamplesCaseSection locale={locale} pageKey={page.key} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{labels.related}</h2>
        <ul className="mt-4 grid gap-2 text-sm font-semibold text-teal-700">
          {page.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/studio"
          prefetch={false}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {labels.studio}
        </Link>
        <Link href={`/${locale}/examples`} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800">
          {labels.allExamples}
        </Link>
      </div>
    </main>
  );
}
