import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { useCasePages } from "@/data/seo/useCases";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/use-cases`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const isRu = locale === "ru";
  return createSeoMetadata({
    locale,
    title: isRu ? "Use cases товарных фото" : "Product photo use cases",
    description: isRu
      ? "Use cases Vitrina AI Studio: одежда на модели, бижутерия, обувь, сумки, белый фон, видео из фото, Reels и workflow контент-менеджера."
      : "Vitrina AI Studio use cases: clothing on model, jewelry, shoes, bags, white background, product video, Reels, and content manager workflows.",
    h1: isRu ? "Use cases" : "Use cases",
    status: locale === "ru" || locale === "en" ? "published" : "needs_review",
    pathByLocale,
    sectionCount: 3,
    internalLinkCount: useCasePages.length,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function UseCasesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();
  const isRu = locale === "ru";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: `/${locale}` },
          { name: "Use cases", url: `/${locale}/use-cases` },
        ])}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {isRu ? "Use cases товарных фото" : "Product photo use cases"}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {isRu
          ? "Сценарии построены вокруг реальных задач продавцов и контент-команд, а не doorway-страниц."
          : "Use cases are organized around real seller and content-team tasks, not doorway pages."}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCasePages.map((page) => {
          const content = page.content[locale];
          return (
            <Link
              key={page.id}
              href={`/${locale}/use-cases/${content.slug}`}
              className="rounded-lg border border-border bg-white p-5 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/50"
            >
              <p className="text-lg font-semibold text-slate-950">{content.h1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{content.shortAnswer}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
