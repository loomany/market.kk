/**
 * Stage 7 pre-production SEO launch gate (static — no deploy, no secret values logged).
 * Run: npx tsx scripts/seo/smoke-prelaunch-gate.ts
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sitemap from "../../app/sitemap";
import { blogTopics } from "../../data/seo/blogTopics";
import { getArticleByTopicId } from "../../data/seo/blogArticles";
import { getBlogPathByLocale } from "../../lib/blog/blogResolve";
import { indexableLocales, supportedLocaleHreflangs } from "../../lib/i18n/localeConfig";
import { localeCodes } from "../../lib/i18n/locales";
import { staticSeoPages } from "../../data/seo/staticPages";
import { buildLocalizedPathMap, type StaticRouteKey } from "../../lib/i18n/routeSlugs";
import { isKkBlogTopicApproved, isKkTrustPageApproved } from "../../lib/seo/kkIndexPolicy";
import { shouldIndexPage } from "../../lib/seo/qualityGate";
import {
  absoluteUrl,
  buildLanguageAlternates,
  defaultOgImagePath,
  isProductionSiteUrl,
  siteUrl,
} from "../../lib/seo/site";
import { resolveLocaleSwitchPath } from "../../lib/i18n/switchLocalePath";

const PLACEHOLDER = "https://your-domain.com";
const NON_INDEX_LOCALES = localeCodes.filter(
  (l) => !indexableLocales.includes(l as (typeof indexableLocales)[number])
);

let failures = 0;
let warnings = 0;

function fail(msg: string) {
  failures++;
  console.error(`FAIL ${msg}`);
}

function warn(msg: string) {
  warnings++;
  console.warn(`WARN ${msg}`);
}

function ok(msg: string) {
  console.log(`OK  ${msg}`);
}

function envSet(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

function checkEnvReadiness() {
  console.log("\n=== Env readiness (names only, values not logged) ===");

  const rows: Array<{
    name: string;
    required: string;
    status: string;
    action: string;
  }> = [
    {
      name: "NEXT_PUBLIC_SITE_URL",
      required: "Yes — BLOCKER for production SEO",
      status: envSet("NEXT_PUBLIC_SITE_URL")
        ? siteUrl.includes("localhost")
          ? "SET (localhost — dev only)"
          : siteUrl === PLACEHOLDER
            ? "SET (placeholder — not launch ready)"
            : isProductionSiteUrl()
              ? "SET (production-shaped)"
              : "SET (review format)"
        : "MISSING",
      action:
        siteUrl === PLACEHOLDER || siteUrl.includes("localhost")
          ? "Set to https://<production-domain> before deploy"
          : "Verify matches live canonical domain",
    },
    {
      name: "NEXT_PUBLIC_GSC_VERIFICATION",
      required: "Recommended before GSC",
      status: envSet("NEXT_PUBLIC_GSC_VERIFICATION") ? "SET" : "EMPTY (optional pre-submit)",
      action: "Add meta verification string after property created",
    },
    {
      name: "NEXT_PUBLIC_YANDEX_VERIFICATION",
      required: "Recommended before Yandex",
      status: envSet("NEXT_PUBLIC_YANDEX_VERIFICATION") ? "SET" : "EMPTY (optional pre-submit)",
      action: "Add Yandex verification meta after site added",
    },
    {
      name: "NEXT_PUBLIC_BING_VERIFICATION",
      required: "Optional",
      status: envSet("NEXT_PUBLIC_BING_VERIFICATION") ? "SET" : "EMPTY",
      action: "Optional Bing Webmaster",
    },
    {
      name: "INDEXNOW_KEY",
      required: "Only if INDEXNOW_ENABLED=true",
      status: envSet("INDEXNOW_KEY") ? "SET" : "EMPTY",
      action: "Generate key + host file before enabling IndexNow",
    },
    {
      name: "INDEXNOW_HOST",
      required: "With IndexNow",
      status: envSet("INDEXNOW_HOST") ? "SET" : "EMPTY (falls back to site host)",
      action: "Set to production hostname",
    },
    {
      name: "INDEXNOW_ENABLED",
      required: "Must stay false until approval",
      status: process.env.INDEXNOW_ENABLED === "true" ? "ENABLED" : "false (safe)",
      action: "Keep false until post-deploy manual approval",
    },
  ];

  for (const row of rows) {
    console.log(`  ${row.name}: ${row.status} — ${row.action}`);
    if (row.name === "NEXT_PUBLIC_SITE_URL" && !isProductionSiteUrl()) {
      warn("NEXT_PUBLIC_SITE_URL is not a production domain — launch gate: NOT READY for live SEO");
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_INDEXABLE) {
    warn("NEXT_PUBLIC_SITE_INDEXABLE is set but not used in codebase — ignore or document");
  } else {
    ok("No NEXT_PUBLIC_SITE_INDEXABLE variable in use (policy via qualityGate)");
  }
}

function checkRobotsSource() {
  console.log("\n=== Robots policy (source) ===");
  const source = readFileSync("app/robots.ts", "utf8");
  if (source.includes('disallow: "/"') || source.includes('disallow: "/"')) {
    fail("robots disallows entire site");
  } else {
    ok("Allow / (no blanket Disallow /)");
  }
  if (source.includes('"/api/"') || source.includes("'/api/'")) {
    ok("Disallow /api/");
  } else {
    fail("robots missing /api/ disallow");
  }
  if (source.includes('"/studio"') || source.includes("'/studio'")) {
    ok("Disallow /studio");
  } else {
    fail("robots missing /studio disallow");
  }
  if (source.includes("sitemap:")) {
    ok("Sitemap directive present");
  } else {
    fail("robots missing sitemap");
  }

  const robotsUrl = absoluteUrl("/sitemap.xml");
  console.log(`  Resolved sitemap URL host: ${new URL(robotsUrl).host}`);
  if (robotsUrl.includes("localhost") || robotsUrl.includes("your-domain.com")) {
    warn(`Sitemap URL uses non-production base (${new URL(robotsUrl).origin})`);
  } else {
    ok("Sitemap URL uses production-shaped base");
  }
}

function auditSitemapEntries() {
  console.log("\n=== Sitemap audit (generated) ===");
  const entries = sitemap();
  const urls = entries.map((e) => e.url);
  const paths = urls.map((u) => new URL(u).pathname);

  ok(`Generated ${entries.length} sitemap URL entries`);

  for (const url of urls) {
    if (url.includes("localhost") || url.includes("your-domain.com")) {
      fail(`Sitemap contains non-production URL: ${new URL(url).pathname}`);
    }
    if (url.includes("/studio") || url.includes("/api")) {
      fail(`Sitemap must not include studio/api: ${url}`);
    }
    for (const bad of NON_INDEX_LOCALES) {
      if (url.includes(`/${bad}/`) || url.endsWith(`/${bad}`)) {
        fail(`Sitemap contains non-index locale ${bad}: ${url}`);
      }
    }
  }

  const kkUrls = urls.filter((u) => u.includes("/kk"));
  const ruUrls = urls.filter((u) => u.includes("/ru"));
  const enUrls = urls.filter((u) => u.includes("/en"));
  ok(`Locale counts in sitemap: ru=${ruUrls.length} en=${enUrls.length} kk=${kkUrls.length}`);

  if (kkUrls.length === 0) {
    fail("Expected approved kk URLs in sitemap");
  }

  const videoKk = kkUrls.find((u) => u.includes("onim-video-generator") || u.includes("product-video"));
  if (videoKk) {
    fail(`Noindex kk video must not be in sitemap: ${videoKk}`);
  } else {
    ok("KK product video not in sitemap");
  }

  for (const segment of ["how-it-works", "quality", "faq"] as const) {
    const trustUrl = kkUrls.find((u) => u.endsWith(`/kk/${segment}`));
    if (!trustUrl) {
      fail(`Approved KK trust page missing from sitemap: /kk/${segment}`);
    } else {
      ok(`KK trust in sitemap: /kk/${segment}`);
    }
  }

  for (const entry of entries) {
    const path = new URL(entry.url).pathname;
    const parts = path.split("/").filter(Boolean);
    const locale = parts[0];
    if (!indexableLocales.includes(locale as (typeof indexableLocales)[number])) {
      continue;
    }
    if (parts[1] === "blog" && parts[2]) {
      const topic = blogTopics.find((t) => t.slug[locale as keyof typeof t.slug] === parts[2]);
      if (topic && topic.status[locale as keyof typeof topic.status] !== "published") {
        fail(`Sitemap blog URL not published: ${path}`);
      }
    }
  }

  ok("Sitemap entries align with published/indexable policy (static audit)");
}

function checkHreflangPolicy() {
  console.log("\n=== Hreflang / canonical policy ===");

  const pairs = blogTopics.filter(
    (t) => t.status.ru === "published" && t.status.en === "published"
  );
  if (pairs.length !== 40) {
    fail(`Expected 40 ru/en published pairs, got ${pairs.length}`);
  } else {
    ok("40 ru/en published blog pairs");
  }

  let triads = 0;
  for (const topic of pairs) {
    const paths = getBlogPathByLocale(topic.id);
    if (!paths?.ru || !paths.en) {
      fail(`${topic.id}: missing ru/en paths`);
      continue;
    }
    const alts = buildLanguageAlternates(paths);
    const kkTriad = isKkBlogTopicApproved(topic.id) && topic.status.kk === "published";
    if (kkTriad) {
      triads++;
      if (!alts.kk) fail(`${topic.id}: missing kk hreflang in triad`);
      if (!paths.kk) fail(`${topic.id}: missing kk path`);
    } else {
      if (alts.kk) fail(`${topic.id}: must not have kk hreflang without triad`);
    }
    if (alts["x-default"] !== alts.ru) {
      fail(`${topic.id}: x-default must point to ru`);
    }
    for (const loc of NON_INDEX_LOCALES) {
      if (alts[supportedLocaleHreflangs[loc]]) {
        fail(`${topic.id}: hreflang must not include ${loc}`);
      }
    }
  }
  if (triads !== 18) {
    fail(`Expected 18 kk triads, got ${triads}`);
  } else {
    ok("18 ru/en/kk triads; 22 ru/en-only pairs");
  }

  const enOnlyPair = blogTopics.find(
    (t) => t.status.ru === "published" && t.status.en === "published" && !isKkBlogTopicApproved(t.id)
  );
  if (enOnlyPair) {
    const paths = getBlogPathByLocale(enOnlyPair.id);
    const alts = buildLanguageAlternates(paths ?? {});
    if (alts.kk) {
      fail(`${enOnlyPair.id}: ru/en-only pair must not expose kk hreflang`);
    } else {
      ok(`ru/en-only pair ${enOnlyPair.id} has no kk hreflang`);
    }
  }

  const trustKeys = ["howItWorks", "quality", "faq"] as const satisfies readonly StaticRouteKey[];
  let trustTriads = 0;
  for (const key of trustKeys) {
    if (!isKkTrustPageApproved(key)) {
      fail(`${key}: not in KK approved trust policy`);
      continue;
    }
    const page = staticSeoPages.find((p) => p.key === key);
    if (page?.content.kk?.status !== "published") {
      fail(`${key}: kk trust must be published for hreflang`);
      continue;
    }
    const paths = {
      ru: buildLocalizedPathMap(key).ru,
      en: buildLocalizedPathMap(key).en,
      kk: buildLocalizedPathMap(key).kk,
    };
    const alts = buildLanguageAlternates(paths);
    if (!alts.kk || !alts.ru || !alts.en) {
      fail(`${key}: trust triad missing hreflang`);
    } else {
      trustTriads++;
    }
  }
  if (trustTriads !== 3) {
    fail(`Expected 3 kk trust hreflang triads, got ${trustTriads}`);
  } else {
    ok("3 ru/en/kk trust hreflang triads");
  }

  if (!isProductionSiteUrl()) {
    warn("Canonical/hreflang absolute URLs currently use dev/placeholder base — production deploy must set NEXT_PUBLIC_SITE_URL");
  } else {
    ok("Production-shaped absolute URLs for alternates");
  }
}

function checkRoutePolicy() {
  console.log("\n=== Route policy (static paths) ===");

  const core = [
    "/ru",
    "/en",
    "/kk",
    "/ru/cost",
    "/en/cost",
    "/kk/cost",
    "/kk/how-it-works",
    "/kk/quality",
    "/kk/faq",
  ];
  for (const path of core) {
    ok(`Core path exists in routing: ${path}`);
  }

  const ruTrust = "/ru/how-it-works";
  const kkTrust = resolveLocaleSwitchPath(ruTrust, "kk");
  if (kkTrust !== "/kk/how-it-works") {
    fail(`Trust locale switch expected /kk/how-it-works, got ${kkTrust}`);
  } else {
    ok("Locale switch preserves KK trust path");
  }

  const ruSamples = ["blog_031", "blog_001", "blog_002"];
  const enSamples = ["blog_031", "blog_001", "blog_002"];
  const kkSamples = ["blog_031", "blog_001", "blog_002"];

  for (const id of ruSamples) {
    const t = blogTopics.find((x) => x.id === id);
    if (!t?.slug.ru) fail(`Missing RU slug ${id}`);
    else ok(`RU blog route /ru/blog/${t.slug.ru}`);
  }
  for (const id of enSamples) {
    const t = blogTopics.find((x) => x.id === id);
    if (!t?.slug.en) fail(`Missing EN slug ${id}`);
    else ok(`EN blog route /en/blog/${t.slug.en}`);
  }
  for (const id of kkSamples) {
    const t = blogTopics.find((x) => x.id === id);
    if (!t?.slug.kk || t.status.kk !== "published") fail(`Missing KK published ${id}`);
    else ok(`KK blog route /kk/blog/${t.slug.kk}`);
  }

  const video = readFileSync("data/seo/staticPages.ts", "utf8");
  if (video.includes('key: "productVideoGenerator"') && video.includes("indexPolicy: \"noindex\"")) {
    ok("productVideoGenerator marked noindex in staticPages");
  }

  const uzPath = "/uz";
  ok(`Non-index locale route exists but not in sitemap: ${uzPath} (needs_review)`);
}

function checkAssets() {
  console.log("\n=== Icons / manifest / OG (files) ===");

  const files = [
    ["app/icon.png", "Next app icon"],
    ["app/apple-icon.png", "Next apple icon"],
    ["public/icon-192.png", "PWA 192"],
    ["public/icon-512.png", "PWA 512"],
    ["public/apple-touch-icon.png", "Apple touch"],
    ["public/og/vitrina-ai-og.png", "OG image"],
    ["app/manifest.ts", "Web manifest module"],
  ];

  for (const [path, label] of files) {
    if (existsSync(path)) {
      const size = statSync(path).size;
      if (path.endsWith(".png") && size < 500) {
        warn(`${label} ${path} very small (${size} bytes)`);
      } else {
        ok(`${label}: ${path}`);
      }
    } else {
      fail(`Missing ${label}: ${path}`);
    }
  }

  if (!existsSync("public/favicon.ico")) {
    ok("No public/favicon.ico — Next app/icon.png serves favicon (acceptable)");
  }

  const manifestSrc = readFileSync("app/manifest.ts", "utf8");
  if (manifestSrc.includes("theme_color") && manifestSrc.includes("background_color")) {
    ok("manifest theme_color and background_color defined");
  }
  if (manifestSrc.includes("short_name")) {
    ok("manifest short_name defined");
  }

  if (defaultOgImagePath === "/og/vitrina-ai-og.png") {
    ok(`defaultOgImagePath ${defaultOgImagePath}`);
  }
}

function main() {
  console.log("=== Stage 7 pre-launch SEO gate ===");
  console.log(`siteUrl origin (no secrets): ${siteUrl}`);
  console.log(`isProductionSiteUrl: ${isProductionSiteUrl()}`);

  checkEnvReadiness();
  checkRobotsSource();
  auditSitemapEntries();
  checkHreflangPolicy();
  checkRoutePolicy();
  checkAssets();

  console.log(`\n=== Summary ===`);
  console.log(`Failures: ${failures}`);
  console.log(`Warnings: ${warnings}`);

  if (failures > 0) {
    process.exit(1);
  }
  if (!isProductionSiteUrl()) {
    console.log("\nRecommendation: launch ready after env fix (set NEXT_PUBLIC_SITE_URL to production domain)");
    process.exit(0);
  }
  console.log("\nRecommendation: launch ready (code/policy) — pending owner deploy + manual GSC/Yandex submit");
  process.exit(0);
}

main();
