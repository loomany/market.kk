import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/localeConfig";
import { buildLanguageAlternates, siteName, siteUrl } from "./site";
import { getRobotsPolicy, type SeoQualityInput } from "./qualityGate";

export type SeoMetadataInput = SeoQualityInput & {
  title: string;
  description: string;
  pathByLocale: Partial<Record<Locale, string>> | Record<Locale, string>;
  images?: string[];
};

export function createSeoMetadata(input: SeoMetadataInput): Metadata {
  const canonicalPath = input.pathByLocale[input.locale];

  return {
    metadataBase: new URL(siteUrl),
    title: input.title,
    description: input.description,
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(input.pathByLocale),
    },
    openGraph: {
      type: "website",
      siteName,
      title: input.title,
      description: input.description,
      url: canonicalPath,
      images: input.images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.images,
    },
    robots: getRobotsPolicy(input),
  };
}

export function createNoindexMetadata(
  title: string,
  description: string,
  locale: Locale,
  pathByLocale: Record<Locale, string>
): Metadata {
  return createSeoMetadata({
    locale,
    title,
    description,
    h1: title,
    status: "noindex",
    pathByLocale,
    sectionCount: 1,
    internalLinkCount: 1,
    hasCanonical: true,
    hasHreflang: true,
  });
}
