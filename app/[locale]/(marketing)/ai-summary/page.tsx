import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { aiSummaryByLocale } from "@/data/seo/aiSummaryContent";
import {
  assertLocale,
  indexableLocales,
  type IndexableLocale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  indexableLocales.map((locale) => [locale, `/${locale}/ai-summary`])
) as Record<IndexableLocale, string>;

function asIndexableLocale(raw: string): IndexableLocale | null {
  const locale = assertLocale(raw);
  if (locale === "ru" || locale === "en" || locale === "kk") return locale;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = asIndexableLocale(rawLocale);
  if (!locale) return {};

  const content = aiSummaryByLocale[locale];
  return createSeoMetadata({
    locale,
    title: content.metaTitle,
    description: content.metaDescription,
    h1: content.h1,
    status: content.status,
    pathByLocale,
    sectionCount: content.sections.length,
    internalLinkCount: content.links.length + (content.comparisonBlog ? 1 : 0),
    hasCanonical: true,
    hasHreflang: true,
  });
}

function sectionClassName(variant?: "default" | "warning" | "cta") {
  if (variant === "warning") {
    return "rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950";
  }
  if (variant === "cta") {
    return "rounded-lg border border-teal-100 bg-teal-50 p-6 text-teal-950";
  }
  return "rounded-lg border border-border bg-white p-6 shadow-sm";
}

export default async function AiSummaryPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = asIndexableLocale(rawLocale);
  if (!locale) notFound();

  const content = aiSummaryByLocale[locale];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: `/${locale}` },
          { name: "AI summary", url: `/${locale}/ai-summary` },
        ])}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        {content.homeLabel}
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">{content.h1}</h1>
      <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-600">
        {content.sections.map((section) => (
          <section key={section.title} className={sectionClassName(section.variant)}>
            <h2
              className={
                section.variant === "warning"
                  ? "text-2xl font-bold tracking-tight"
                  : "text-2xl font-bold tracking-tight text-slate-950"
              }
            >
              {section.title}
            </h2>
            <p className="mt-3">{section.body}</p>
          </section>
        ))}
        <section className={sectionClassName("cta")}>
          <h2 className="text-2xl font-bold tracking-tight">
            {locale === "ru"
              ? "Полезные ссылки"
              : locale === "kk"
                ? "Пайдалы сілтемелер"
                : "Helpful links"}
          </h2>
          <ul className="mt-4 grid gap-2 font-semibold text-teal-800">
            {content.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-teal-950">
                  {link.label}
                </Link>
              </li>
            ))}
            {content.comparisonBlog ? (
              <li>
                <Link href={content.comparisonBlog.href} className="hover:text-teal-950">
                  {content.comparisonBlog.label}
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/llms.txt" className="hover:text-teal-950">
                {locale === "ru"
                  ? "llms.txt для AI"
                  : locale === "kk"
                    ? "AI үшін llms.txt"
                    : "llms.txt for AI"}
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
