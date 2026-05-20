import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/localeConfig";
import {
  buildLanguageAlternates,
  defaultOgImageUrl,
  siteName,
  siteUrl,
} from "./site";
import { getRobotsPolicy, type SeoQualityInput } from "./qualityGate";

export type SeoMetadataInput = SeoQualityInput & {
  title: string;
  description: string;
  pathByLocale: Partial<Record<Locale, string>> | Record<Locale, string>;
  images?: string[];
};

function resolveImages(images?: string[]): string[] {
  if (images && images.length > 0) {
    return images;
  }
  return [defaultOgImageUrl()];
}

export function createSeoMetadata(input: SeoMetadataInput): Metadata {
  const canonicalPath = input.pathByLocale[input.locale];
  const images = resolveImages(input.images);

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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images,
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

export function createLayoutMetadata(): Metadata {
  return {
    openGraph: {
      siteName,
      images: [defaultOgImageUrl()],
    },
    twitter: {
      card: "summary_large_image",
      images: [defaultOgImageUrl()],
    },
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}
