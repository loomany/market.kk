import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import "../globals.css";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { JsonLdScript } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/jsonLd";
import { createLayoutMetadata } from "@/lib/seo/metadata";
import {
  assertLocale,
  getHtmlLanguage,
  getTextDirection,
  supportedLocaleCodes,
} from "@/lib/i18n/localeConfig";
import { siteDescription, siteName } from "@/lib/seo/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return supportedLocaleCodes.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) {
    return {};
  }

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    ...createLayoutMetadata(),
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: {
        "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
      },
    },
    other: {
      "content-language": getHtmlLanguage(locale),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);

  if (!locale) notFound();

  return (
    <html
      lang={getHtmlLanguage(locale)}
      dir={getTextDirection(locale)}
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900">
        <AnalyticsProvider />
        <JsonLdScript
          data={[organizationJsonLd(), websiteJsonLd(), softwareApplicationJsonLd()]}
        />
        {children}
      </body>
    </html>
  );
}
