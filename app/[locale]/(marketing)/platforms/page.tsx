import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { platformPages } from "@/data/seo/platforms";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonLd";

type PageProps = { params: Promise<{ locale: string }> };

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/platforms`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const isRu = locale === "ru";
  return createSeoMetadata({
    locale,
    title: isRu ? "Платформы для товарных фото" : "Product photo platform pages",
    description: isRu
      ? "SEO-страницы по платформам: Kaspi, Wildberries, Ozon, eBay, Amazon, Etsy, Shopify, Instagram Shop, TikTok Shop и другие."
      : "Platform SEO pages for Kaspi, Wildberries, Ozon, eBay, Amazon, Etsy, Shopify, Instagram Shop, TikTok Shop, and more.",
    h1: isRu ? "Платформы" : "Platforms",
    status: locale === "ru" || locale === "en" ? "published" : "needs_review",
    pathByLocale,
    sectionCount: 3,
    internalLinkCount: platformPages.length,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function PlatformsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();
  const isRu = locale === "ru";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: `/${locale}` },
          { name: isRu ? "Платформы" : "Platforms", url: `/${locale}/platforms` },
        ])}
      />
      <Link href={`/${locale}`} className="text-sm font-semibold text-teal-700">
        ← Vitrina AI
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {isRu ? "Платформы" : "Platforms"}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {isRu
          ? "Страницы помогают понять, какие изображения готовить для разных площадок. Vitrina AI Studio не является официальным партнёром этих платформ."
          : "These pages explain how to prepare product images for different channels. Vitrina AI Studio is not an official partner of these platforms."}
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platformPages.map((page) => {
          const content = page.content[locale];
          return (
            <Link
              key={page.id}
              href={`/${locale}/platforms/${content.slug}`}
              className="rounded-lg border border-border bg-white p-5 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50/50"
            >
              <p className="text-lg font-semibold text-slate-950">{page.name}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{content.shortAnswer}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
