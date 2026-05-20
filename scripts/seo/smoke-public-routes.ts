/**
 * Static smoke checks for public SEO routes (no HTTP server required).
 * Run: npx tsx scripts/seo/smoke-public-routes.ts
 */
import { readFileSync } from "node:fs";
import { blogTopics } from "@/data/seo/blogTopics";
import { getArticleByTopicId } from "@/data/seo/blogArticles";
import { getExamplePagesForLocale } from "@/data/seo/examplesPages";
import { staticSeoPages } from "@/data/seo/staticPages";
import { indexableLocales } from "@/lib/i18n/localeConfig";
import { resolveLocaleSwitchPath } from "@/lib/i18n/switchLocalePath";
import { shouldIndexPage } from "@/lib/seo/qualityGate";
import { absoluteUrl, isProductionSiteUrl, siteUrl } from "@/lib/seo/site";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function readRobots() {
  const source = readFileSync("app/robots.ts", "utf8");
  assert(!source.includes('disallow: "/"'), "robots.ts must not disallow entire site");
  assert(source.includes("sitemap:"), "robots.ts must expose sitemap");
}

function readSitemapModule() {
  const source = readFileSync("app/sitemap.ts", "utf8");
  assert(source.includes("indexableLocales"), "sitemap must use indexableLocales");
  assert(source.includes('sectionPaths("cost")'), "sitemap must include pricing routes");
}

function checkPricingPage() {
  const pricing = staticSeoPages.find((page) => page.key === "cost");
  if (!pricing) {
    throw new Error("pricing static page must exist");
  }
  for (const locale of indexableLocales) {
    const content = pricing.content[locale];
    assert(content.slug === "cost", `pricing slug for ${locale}`);
    assert(
      shouldIndexPage({
        locale,
        title: content.title,
        description: content.metaDescription,
        h1: content.h1,
        status: content.status,
        sectionCount: content.sections.length,
        internalLinkCount: 3,
        hasCanonical: true,
        hasHreflang: true,
      }),
      `pricing page must be indexable for ${locale}`
    );
  }
}

function checkPublishedBlogSlugs() {
  for (const topic of blogTopics) {
    const article = getArticleByTopicId(topic.id);
    for (const locale of indexableLocales) {
      const slug = topic.slug[locale];
      if (topic.status[locale] === "published" && article?.content[locale]) {
        assert(Boolean(slug), `published blog ${topic.id} missing slug for ${locale}`);
      }
    }
  }
}

function checkLocaleSwitcherPaths() {
  const ruBlog = blogTopics.find((t) => t.id === "blog_031");
  if (!ruBlog?.slug.ru) {
    throw new Error("kaspi blog topic missing RU slug");
  }
  const ruPath = `/ru/blog/${ruBlog.slug.ru}`;
  const enPath = resolveLocaleSwitchPath(ruPath, "en");
  assert(enPath.startsWith("/en/blog/"), `expected EN blog path, got ${enPath}`);
  assert(!enPath.includes("undefined"), "locale switch must not produce undefined slug");

  const enBack = resolveLocaleSwitchPath(enPath, "ru");
  assert(enBack === ruPath, `round-trip blog path failed: ${enBack}`);

  const kkPath = resolveLocaleSwitchPath(ruPath, "kk");
  assert(kkPath.startsWith("/kk/blog/"), `expected KK blog triad path, got ${kkPath}`);
  assert(kkPath === `/kk/blog/${ruBlog.slug.kk}`, `kaspi kk path mismatch: ${kkPath}`);

  const videoPage = staticSeoPages.find((p) => p.key === "productVideoGenerator");
  if (videoPage?.content.ru?.slug) {
    const ruVideo = `/ru/${videoPage.content.ru.slug}`;
    const kkVideo = resolveLocaleSwitchPath(ruVideo, "kk");
    assert(
      kkVideo === "/kk",
      `noindex kk video must fallback to /kk, got ${kkVideo}`
    );
  }
}

function checkTrustPages() {
  for (const key of ["howItWorks", "quality", "faq"] as const) {
    const page = staticSeoPages.find((p) => p.key === key);
    assert(page, `trust page ${key} exists`);
    for (const locale of indexableLocales) {
      const content = page!.content[locale];
      assert(
        shouldIndexPage({
          locale,
          title: content.title,
          description: content.metaDescription,
          h1: content.h1,
          status: content.status,
          sectionCount: content.sections.length,
          internalLinkCount: content.relatedLinks?.length ?? 3,
          hasCanonical: true,
          hasHreflang: true,
        }),
        `trust ${key} indexable for ${locale}`
      );
    }
  }
}

function checkExamplesNoindex() {
  for (const locale of indexableLocales) {
    for (const page of getExamplePagesForLocale(locale)) {
      assert(
        !shouldIndexPage({
          locale,
          title: page.title,
          description: page.metaDescription,
          h1: page.h1,
          status: "noindex",
          sectionCount: page.sections.length,
          internalLinkCount: page.relatedLinks.length,
          hasCanonical: true,
          hasHreflang: false,
        }),
        `examples ${locale}/${page.slug} must stay noindex`
      );
    }
  }
}

function checkSiteUrlPolicy() {
  const sitemapUrl = absoluteUrl("/sitemap.xml");
  assert(!sitemapUrl.includes("undefined"), "sitemap URL must be valid");
  if (process.env.NODE_ENV === "production" && isProductionSiteUrl()) {
    assert(!siteUrl.includes("localhost"), "production siteUrl must not be localhost");
  }
}

function main() {
  const checks = [
    ["robots.ts policy", readRobots],
    ["sitemap.ts structure", readSitemapModule],
    ["trust pages", checkTrustPages],
    ["examples noindex", checkExamplesNoindex],
    ["pricing page", checkPricingPage],
    ["published blog slugs", checkPublishedBlogSlugs],
    ["locale switch paths", checkLocaleSwitcherPaths],
    ["site URL policy", checkSiteUrlPolicy],
  ] as const;

  for (const [name, fn] of checks) {
    fn();
    console.log(`OK  ${name}`);
  }

  console.log(`\nSmoke passed. siteUrl=${siteUrl}`);
}

main();
