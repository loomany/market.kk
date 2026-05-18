import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { staticSeoPages } from "@/data/seo/staticPages";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/features`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const isRu = locale === "ru";
  return createSeoMetadata({
    locale,
    title: isRu ? "Возможности Vitrina AI Studio" : "Vitrina AI Studio Features",
    description: isRu
      ? "Возможности Vitrina AI Studio: одежда на AI-модели, точная карточка товара, фон, видео roadmap, quality checklist и ограничения AI."
      : "Vitrina AI Studio features: clothing on AI models, exact product cards, backgrounds, video roadmap, quality checklist, and AI limitations.",
    h1: isRu ? "Возможности" : "Features",
    status: locale === "ru" || locale === "en" ? "published" : "needs_review",
    pathByLocale,
    sectionCount: 3,
    internalLinkCount: 8,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function FeaturesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const isRu = locale === "ru";
  const pages = staticSeoPages.filter((page) => page.kind === "feature");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: `/${locale}` },
          { name: isRu ? "Возможности" : "Features", url: `/${locale}/features` },
        ])}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {isRu ? "Возможности" : "Features"}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {isRu
          ? "Карта функций и SEO-страниц без обещаний production-ready там, где workflow ещё находится в разработке."
          : "A feature and SEO page map that does not present in-development workflows as production-ready."}
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const content = page.content[locale];
          return (
            <Link
              key={page.key}
              href={`/${locale}/${content.slug}`}
              className="rounded-lg border border-border bg-white p-5 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/50"
            >
              <p className="text-lg font-semibold text-slate-950">{content.h1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{content.intro}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-teal-700">
                {isRu ? "Открыть" : "Open"} →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
