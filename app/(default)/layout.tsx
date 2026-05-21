import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { JsonLdScript } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/jsonLd";
import { defaultOgImageUrl, siteUrl } from "@/lib/seo/site";
import { createSiteIconsMetadata } from "@/lib/seo/siteIcons";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const configuredAppName = process.env.NEXT_PUBLIC_APP_NAME;
const appName =
  configuredAppName && !configuredAppName.toLowerCase().includes("kaspi")
    ? configuredAppName
    : "Vitrina AI Studio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description:
    "AI-студия товарных фото для маркетплейсов: одежда на AI-модели, product shot, чистый фон и проверка качества.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    images: [defaultOgImageUrl()],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOgImageUrl()],
  },
  ...createSiteIconsMetadata(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
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
