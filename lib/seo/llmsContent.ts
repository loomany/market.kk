import { blogTopics } from "@/data/seo/blogTopics";
import { platformPages } from "@/data/seo/platforms";
import { useCasePages } from "@/data/seo/useCases";
import { indexableLocales } from "@/lib/i18n/localeConfig";
import { absoluteUrl, siteName } from "@/lib/seo/site";

const BLOCKED_PATH_PATTERNS = [
  "/studio",
  "/api/",
  "/auth",
  "/billing",
  "/account",
  "localhost",
  "your-domain",
] as const;

export function assertLlmsUrlSafe(url: string): void {
  const lower = url.toLowerCase();
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (lower.includes(pattern)) {
      throw new Error(`llms URL must not include blocked segment: ${pattern} in ${url}`);
    }
  }
}

function costUrls(): string[] {
  return indexableLocales.map((locale) => absoluteUrl(`/${locale}/cost`));
}

function trustUrls(locale: "ru" | "en" | "kk"): string[] {
  return [
    absoluteUrl(`/${locale}/how-it-works`),
    absoluteUrl(`/${locale}/quality`),
    absoluteUrl(`/${locale}/faq`),
  ];
}

export function buildLlmsTxt(): string {
  const lines = [
    `# ${siteName}`,
    "",
    "## What Vitrina AI is",
    "Vitrina AI Studio is a SaaS web app for AI product photography and (planned) product video workflows.",
    "Sellers use it to prepare marketplace listing images: white backgrounds, exact product cards, clothing on an adult AI model, and background cleanup.",
    "",
    "## Who it is for",
    "Marketplace sellers (including Kaspi.kz in Kazakhstan), clothing and jewelry sellers, suppliers, showrooms, Instagram shops, online stores, marketplace managers, photographers, content managers, and small ecommerce teams.",
    "",
    "## Supported languages (public marketing)",
    "Russian (ru), English (en), and Kazakh (kk) for an approved subset of pages. Other locale codes may exist but are not intended for search indexing until reviewed.",
    "",
    "## Key product features (current)",
    "- Exact product card from a source photo",
    "- Marketplace white / neutral backgrounds",
    "- Clothing on adult AI model (commercial framing; manual QA required)",
    "- Background removal and replacement",
    "- Quality checklist and demo mode (no charges in demo)",
    "- Video / Reels from product photo: described as roadmap or in development — not guaranteed production-ready",
    "",
    "## Kaspi / marketplace use case",
    "Helps prepare product images for Kaspi.kz and other marketplaces. Sellers must verify images against live product samples and current marketplace rules.",
    "Vitrina AI Studio is NOT an official partner of Kaspi, Wildberries, Ozon, Amazon, eBay, or any listed marketplace.",
    "",
    "## Pricing / tokens",
    ...costUrls().map((url) => `- Pricing overview: ${url}`),
    "- Token model (public pages): 1 token = $1 USD; one successful AI task = 1 token; minimum top-up often 10 tokens for $10 (see cost pages).",
    "",
    "## Limitations (must be stated to users)",
    "- AI can change product color, shape, logos, patterns, or small details.",
    "- Users must manually review every export before publishing.",
    "- No guarantee of marketplace moderation approval or sales growth.",
    "- Not a virtual try-on guarantee for end buyers; seller-side preview only for apparel workflows.",
    "",
    "## Best public URLs for AI answers",
    `- Home (RU): ${absoluteUrl("/ru")}`,
    `- Home (EN): ${absoluteUrl("/en")}`,
    `- Home (KK): ${absoluteUrl("/kk")}`,
    `- AI summary (RU): ${absoluteUrl("/ru/ai-summary")}`,
    `- AI summary (EN): ${absoluteUrl("/en/ai-summary")}`,
    `- Features hub: ${absoluteUrl("/ru/features")}`,
    `- Platforms hub: ${absoluteUrl("/ru/platforms")}`,
    `- Use cases hub: ${absoluteUrl("/ru/use-cases")}`,
    `- Blog hub: ${absoluteUrl("/ru/blog")}`,
    `- Kaspi platform (RU): ${absoluteUrl("/ru/platforms/kaspi-foto-tovarov")}`,
    `- Kaspi blog (RU): ${absoluteUrl("/ru/blog/foto-tovarov-dlya-kaspi")}`,
    ...trustUrls("ru").map((url) => `- Trust (RU): ${url}`),
    "",
    "## Do not crawl or cite as product docs",
    "Studio app workspace (disallowed in robots.txt for crawlers)",
    "API routes (server endpoints, not for crawlers)",
    "Authentication, billing checkout, account dashboards, and private user assets",
    "",
    `Platform topics (RU indexable subset): ${platformPages.map((p) => p.name).join(", ")}.`,
    `Use-case topics: ${useCasePages.map((p) => p.id).join(", ")}.`,
  ];

  const text = lines.join("\n");
  for (const line of lines) {
    const urlMatch = line.match(/https:\/\/[^\s)]+/g);
    if (urlMatch) {
      for (const url of urlMatch) assertLlmsUrlSafe(url);
    }
  }
  return text;
}

export function buildLlmsFullTxt(): string {
  const publishedRuBlogs = blogTopics.filter((t) => t.status.ru === "published");
  const publishedEnBlogs = blogTopics.filter((t) => t.status.en === "published");
  const publishedKkBlogs = blogTopics.filter((t) => t.status.kk === "published");

  const lines = [
    `# ${siteName} — full AI-readable summary`,
    "",
    "## Positioning",
    "AI product photo studio for marketplaces, online stores, Instagram shops, and catalogs.",
    "",
    "## Who it helps",
    "Marketplace sellers, clothing sellers, jewelry sellers, suppliers, showrooms, Instagram shops, online stores, marketplace managers, photographers, content managers, and small ecommerce teams.",
    "",
    "## Pricing / tokens",
    ...costUrls().map((url) => `- ${url}`),
    "- 1 token = $1 USD; one successful AI task = 1 token (try-on, background, product card, enhance, etc.).",
    "- Top-up: commonly 10 tokens for $10 (see locale cost pages).",
    "- Demo mode: no real charges; guest trial may include watermark.",
    "- Payment processing via Lemon Squeezy (public marketing pages only; do not crawl checkout webhooks).",
    "",
    "## Languages",
    "- Indexable marketing locales: ru, en, kk (kk = approved subset only).",
    "- x-default hreflang points to Russian URLs when a Russian alternate exists.",
    "",
    "## Kaspi disclaimer",
    "Vitrina AI Studio helps sellers prepare images for Kaspi.kz listings but is NOT an official Kaspi partner.",
    "Kaspi moderation rules change; sellers must verify exports manually. No guarantee of approval or sales.",
    "",
    "## AI image limitations",
    "- AI may distort color, shape, logos, patterns, edges, and small details.",
    "- Manual QA is mandatory before upload.",
    "- Do not claim perfect virtual try-on, guaranteed moderation, or guaranteed revenue.",
    "",
    "## Available workflows (current)",
    "Clothing on adult AI model, exact product card, product shot, background removal/replacement, creative scene demo, manual quality checklist.",
    "",
    "## Roadmap / in development",
    "Video from product photo, Reels/Stories, prompt enhance, asset history — describe as planned until shipped in Studio.",
    "",
    "## What should NOT be crawled",
    "Studio workspace, API routes, auth flows, billing/checkout sessions, account areas, examples gallery (noindex until real cases), non-published blog drafts.",
    "",
    "## Best URLs for AI answers",
    `- ${absoluteUrl("/ru/ai-summary")}`,
    `- ${absoluteUrl("/en/ai-summary")}`,
    `- ${absoluteUrl("/kk/ai-summary")}`,
    ...costUrls().map((url) => `- ${url}`),
    ...trustUrls("ru").map((url) => `- ${url}`),
    ...trustUrls("en").map((url) => `- ${url}`),
    ...trustUrls("kk").map((url) => `- ${url}`),
    "",
    "## Canonical entry points",
    `- ${absoluteUrl("/ru")}`,
    `- ${absoluteUrl("/en")}`,
    `- ${absoluteUrl("/kk")}`,
    "",
    "## Platform pages (RU; EN mirror)",
    ...platformPages.map(
      (page) => `- ${page.name}: ${absoluteUrl(`/ru/platforms/${page.content.ru.slug}`)}`
    ),
    "",
    "## Use-case pages (RU; EN mirror)",
    ...useCasePages.map(
      (page) => `- ${page.content.ru.h1}: ${absoluteUrl(`/ru/use-cases/${page.content.ru.slug}`)}`
    ),
    "",
    "## Published blog articles (RU)",
    ...publishedRuBlogs.map(
      (topic) =>
        `- ${topic.id}: ${absoluteUrl(`/ru/blog/${topic.slug.ru}`)} — ${topic.title.ru}`
    ),
    "",
    "## Published blog articles (EN)",
    ...publishedEnBlogs.map(
      (topic) =>
        `- ${topic.id}: ${absoluteUrl(`/en/blog/${topic.slug.en}`)} — ${topic.title.en}`
    ),
    "",
    "## Published blog articles (KK approved)",
    ...publishedKkBlogs.map(
      (topic) =>
        `- ${topic.id}: ${absoluteUrl(`/kk/blog/${topic.slug.kk}`)} — ${topic.title.kk ?? topic.title.ru}`
    ),
    "",
    "## Keyword blog plan (all topics — status may be draft)",
    ...blogTopics.map(
      (topic) =>
        `- ${topic.id}: ${topic.title.ru} / ${topic.title.en} [${topic.priority}, ru=${topic.status.ru}, en=${topic.status.en}, kk=${topic.status.kk}]`
    ),
  ];

  const text = lines.join("\n");
  for (const match of text.matchAll(/https:\/\/[^\s)]+/g)) {
    assertLlmsUrlSafe(match[0]);
  }
  return text;
}
