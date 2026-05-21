import { platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { getPublishedBlogArticles } from "@/lib/blog/blogResolve";
import type { Locale } from "@/lib/i18n/localeConfig";
import { getLandingCopy } from "@/lib/i18n/translations";

export function getMarketingFooterProps(locale: Locale) {
  const copy = getLandingCopy(locale);
  const featuredUseCases = useCasePages.slice(0, 4);
  const featuredPlatforms = platformPages.slice(0, 4);

  return {
    copy,
    productLinks: [
      { label: copy.nav.openStudio, href: "/studio" },
      { label: copy.nav.features, href: `/${locale}/features` },
    ],
    useCaseLinks: featuredUseCases.map((page) => ({
      label: page.content[locale].h1,
      href: `/${locale}/use-cases/${page.content[locale].slug}`,
    })),
    platformLinks: featuredPlatforms.map((page) => ({
      label: page.name,
      href: `/${locale}/platforms/${page.content[locale].slug}`,
    })),
    resourceLinks: [
      {
        label: locale === "ru" ? "Как работает" : locale === "kk" ? "Қалай жұмыс істейді" : "How it works",
        href: `/${locale}/how-it-works`,
      },
      {
        label: locale === "ru" ? "Качество AI" : locale === "kk" ? "AI сапасы" : "AI quality",
        href: `/${locale}/quality`,
      },
      { label: "FAQ", href: `/${locale}/faq` },
      { label: copy.nav.blog, href: `/${locale}/blog` },
      {
        label: locale === "ru" ? "Тарифы" : locale === "kk" ? "Тарифтер" : "Pricing",
        href: `/${locale}/cost`,
      },
      {
        label:
          locale === "ru"
            ? "AI summary"
            : locale === "kk"
              ? "AI summary"
              : "AI summary",
        href: `/${locale}/ai-summary`,
      },
      {
        label:
          locale === "ru" ? "Файл для AI" : locale === "kk" ? "AI файлы" : "File for AI",
        href: "/llms.txt",
      },
    ],
  };
}
