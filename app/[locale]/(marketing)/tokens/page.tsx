import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TokensPageClient } from "@/components/tokens/TokensPageClient";
import { assertLocale, type IndexableLocale } from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const titles: Record<IndexableLocale, string> = {
  ru: "Токены — Vitrina AI Studio",
  en: "Tokens — Vitrina AI Studio",
  kk: "Токендер — Vitrina AI Studio",
};

const descriptions: Record<IndexableLocale, string> = {
  ru: "Пополнение баланса токенов Vitrina AI: 10 токенов за $10, 1 токен = $1, одна AI-задача = 1 токен.",
  en: "Top up Vitrina AI tokens: 10 tokens for $10, 1 token = $1, one AI task = 1 token.",
  kk: "Vitrina AI токен балансын толтыру: 10 токен $10, 1 токен = $1.",
};

function asIndexableLocale(raw: string): IndexableLocale | null {
  const locale = assertLocale(raw);
  if (locale === "ru" || locale === "en" || locale === "kk") return locale;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = asIndexableLocale(raw);
  if (!locale) return {};

  const pathByLocale = {
    ru: "/ru/tokens",
    en: "/en/tokens",
    kk: "/kk/tokens",
  };

  return createSeoMetadata({
    locale,
    title: titles[locale],
    description: descriptions[locale],
    h1: titles[locale],
    status: "published",
    pathByLocale,
    sectionCount: 2,
    internalLinkCount: 2,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function TokensPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = asIndexableLocale(raw);
  if (!locale) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-slate-600">…</p>}>
        <TokensPageClient locale={locale} />
      </Suspense>
    </main>
  );
}
