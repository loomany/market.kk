import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AudienceSeoPage } from "@/components/seo-pages/AudienceSeoPage";
import { JsonLdScript } from "@/components/seo/JsonLd";
import { audiencePages, getAudienceBySlug } from "@/data/seo/audiencePages";
import { assertLocale, type IndexableLocale } from "@/lib/i18n/localeConfig";
import { getLandingCopy } from "@/lib/i18n/translations";
import { audiencePathByLocale as audienceHreflangPaths } from "@/lib/seo/audiencePagePaths";
import { getAudienceHubSegment } from "@/lib/seo/audiencePaths";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd, webPageJsonLd } from "@/lib/seo/jsonLd";
import { createSeoMetadata } from "@/lib/seo/metadata";

export type AudienceHubSegment = "dlya-kogo" | "who-it-is-for" | "kimge";

const hubLocale: Record<AudienceHubSegment, IndexableLocale> = {
  "dlya-kogo": "ru",
  "who-it-is-for": "en",
  kimge: "kk",
};

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function createAudienceDetailRoute(hub: AudienceHubSegment) {
  const expectedLocale = hubLocale[hub];

  function generateStaticParams() {
    return audiencePages.map((page) => ({
      locale: expectedLocale,
      slug: page.content[expectedLocale as "ru" | "en" | "kk"].slug,
    }));
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = assertLocale(rawLocale);
    if (!locale || locale !== expectedLocale) return {};

    const page = getAudienceBySlug(locale, slug);
    if (!page) return {};
    const content = page.content[expectedLocale];

    return createSeoMetadata({
      locale: expectedLocale,
      title: content.title,
      description: content.metaDescription,
      h1: content.h1,
      status: content.status,
      pathByLocale: audienceHreflangPaths(page),
      sectionCount: content.sections.length,
      internalLinkCount: content.relatedLinks.length,
      hasCanonical: true,
      hasHreflang: true,
    });
  }

  async function AudienceDetailPage({ params }: PageProps) {
    const { locale: rawLocale, slug } = await params;
    const locale = assertLocale(rawLocale);
    if (!locale || locale !== expectedLocale || getAudienceHubSegment(locale) !== hub) {
      notFound();
    }

    const page = getAudienceBySlug(locale, slug);
    if (!page) notFound();

    const content = page.content[expectedLocale];
    const copy = getLandingCopy(locale);
    const pagePath = `/${locale}/${hub}/${slug}`;

    return (
      <>
        <JsonLdScript
          data={[
            breadcrumbJsonLd([
              {
                name: locale === "ru" ? "Главная" : locale === "kk" ? "Басты" : "Home",
                url: `/${locale}`,
              },
              { name: copy.audiences.title, url: `/${locale}#audiences` },
              { name: content.h1, url: pagePath },
            ]),
            faqJsonLd(content.faq),
            webPageJsonLd({
              name: content.h1,
              description: content.intro,
              url: pagePath,
              inLanguage: locale,
            }),
            serviceJsonLd({
              name: content.h1,
              description: content.intro,
              url: pagePath,
            }),
          ]}
        />
        <AudienceSeoPage locale={locale} content={content} hubLabel={copy.audiences.title} />
      </>
    );
  }

  return { generateStaticParams, generateMetadata, default: AudienceDetailPage };
}
