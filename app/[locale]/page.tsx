import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SaasLanding } from "@/components/landing/SaasLanding";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { getLandingCopy } from "@/lib/i18n/translations";
import {
  assertLocale,
  supportedLocaleCodes,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const homePathByLocale = Object.fromEntries(
  supportedLocaleCodes.map((locale) => [locale, `/${locale}`])
) as Record<Locale, string>;

export function generateStaticParams() {
  return supportedLocaleCodes.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) return {};

  const copy = getLandingCopy(locale);

  return createSeoMetadata({
    locale,
    title: copy.hero.headline,
    description: copy.hero.subtitle,
    h1: copy.hero.headline,
    status: copy.translationStatus,
    pathByLocale: homePathByLocale,
    sectionCount: 8,
    internalLinkCount: 12,
    hasCanonical: true,
    hasHreflang: true,
  });
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  if (!locale) notFound();

  const copy = getLandingCopy(locale);

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([{ name: "Home", url: `/${locale}` }]),
          webPageJsonLd({
            name: copy.hero.headline,
            description: copy.hero.subtitle,
            url: `/${locale}`,
            inLanguage: locale,
          }),
          faqJsonLd(
            copy.trust.items.slice(0, 3).map((item, index) => ({
              question:
                locale === "ru"
                  ? `Что важно знать о Vitrina AI Studio? ${index + 1}`
                  : `What should I know about Vitrina AI Studio? ${index + 1}`,
              answer: item,
            }))
          ),
        ]}
      />
      <SaasLanding locale={locale} />
    </>
  );
}
