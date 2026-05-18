import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/StudioShell";
import { assertLocale, type Locale } from "@/lib/i18n/localeConfig";
import { createNoindexMetadata } from "@/lib/seo/metadata";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { getAiSafetyState } from "@/lib/ai/paidAiGuard";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const pathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}/studio`])
) as Record<Locale, string>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  return createNoindexMetadata(
    locale === "ru" ? "Студия" : "Studio",
    locale === "ru"
      ? "Локализованный вход в Vitrina AI Studio. Основной canonical product entry остаётся /studio."
      : "Localized Vitrina AI Studio entry. The primary canonical product entry remains /studio.",
    locale,
    pathByLocale
  );
}

export default async function LocaleStudioPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const aiSafety = getAiSafetyState();

  return (
    <StudioShell
      mockMode={aiSafety.mockMode}
      paidAiRunsAllowed={aiSafety.paidAiRunsAllowed}
      locale={locale}
    />
  );
}
