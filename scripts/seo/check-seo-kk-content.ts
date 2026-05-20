/**
 * KK Stage 6 content QA: approved/indexable vs noindex/needs_review.
 */
import { readFileSync } from "node:fs";
import { blogTopics } from "../../data/seo/blogTopics";
import { blogArticles } from "../../data/seo/blogArticles";
import { staticSeoPages } from "../../data/seo/staticPages";
import { indexableLocales } from "../../lib/i18n/localeConfig";
import { getLandingCopy } from "../../lib/i18n/translations";
import {
  isKkBlogTopicApproved,
  isKkStaticPageApproved,
  KK_APPROVED_BLOG_TOPIC_NUMBERS,
} from "../../lib/seo/kkIndexPolicy";
import { getBlogPathByLocale } from "../../lib/blog/blogResolve";
import { shouldIndexPage } from "../../lib/seo/qualityGate";
import { buildLanguageAlternates } from "../../lib/seo/site";

type ArticleContent = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: Array<{ question: string; answer: string }>;
  internalLinks: Array<{ label: string; href: string }>;
};

function wordCount(article: ArticleContent): number {
  const text = [
    article.intro,
    article.shortAnswer,
    ...article.sections.flatMap((section) => section.body),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function bodyText(article: ArticleContent): string {
  return [
    article.title,
    article.metaDescription,
    article.intro,
    article.shortAnswer,
    ...article.sections.flatMap((s) => [s.title, ...s.body]),
    ...article.checklist,
    ...article.faq.flatMap((f) => [f.question, f.answer]),
  ].join("\n");
}

function hasPlaceholder(text: string): boolean {
  return /\bTODO\b|\bFIXME\b|lorem ipsum|\[placeholder\]/i.test(text);
}

function looksLikeEnglishFallback(text: string): boolean {
  return /\b(how to|what is|the product|marketplace sellers|before publishing)\b/i.test(
    text
  );
}

function looksLikeRussianOnly(text: string): boolean {
  const kkMarkers = /[әғқңөүұһіӘҒҚҢӨҮҰҺІ]/;
  const kkWords = /\b(жоқ|иә|сатушы|тауар|маркетплейс|студияны|теңеру|Kaspi)\b/i;
  return !kkMarkers.test(text) && !kkWords.test(text);
}

function runContentChecks(
  label: string,
  content: ArticleContent,
  minWords: number
): string[] {
  const words = wordCount(content);
  const metaLen = content.metaDescription.length;
  const text = bodyText(content);
  const hasCta =
    content.internalLinks.some((l) => l.href === "/studio") ||
    /студияны ашу/i.test(content.internalLinks.map((l) => l.label).join(" "));

  const checks: Array<[boolean, string]> = [
    [Boolean(content.title), "title missing"],
    [Boolean(content.metaDescription), "meta missing"],
    [words >= minWords, `word count ${words} < ${minWords}`],
    [metaLen >= 90 && metaLen <= 170, `meta length ${metaLen}`],
    [content.sections.length >= 4, `sections ${content.sections.length} < 4`],
    [content.faq.length >= 4, `faq ${content.faq.length} < 4`],
    [hasCta, "CTA /studio missing"],
    [content.internalLinks.length >= 3, `internal links ${content.internalLinks.length} < 3`],
    [!hasPlaceholder(text), "placeholder/TODO found"],
    [!looksLikeEnglishFallback(text), "English fallback detected"],
    [!looksLikeRussianOnly(text), "possible RU-only copy (no KK markers)"],
    [
      !content.internalLinks.some((l) => l.href.startsWith("/ru/") || l.href.startsWith("/en/")),
      "KK links to ru/en path",
    ],
    [
      !content.internalLinks.some(
        (l) => l.href.includes("/blog/") && l.href.includes("how-to-")
      ),
      "EN-style slug in KK link",
    ],
  ];

  return checks.filter(([ok]) => !ok).map(([, msg]) => msg);
}

let failures = 0;

const kkPublished = blogTopics.filter((t) => t.status.kk === "published");
const kkNoindex = blogTopics.filter(
  (t) => t.status.kk !== "published" && t.status.kk !== "draft"
);

console.log(`\n=== KK blog published (${kkPublished.length} approved) ===`);

for (const topic of kkPublished) {
  if (!isKkBlogTopicApproved(topic.id)) {
    failures++;
    console.error(`FAIL ${topic.id}: kk published but not in approved list`);
    continue;
  }

  const article = blogArticles.find((item) => item.topicId === topic.id);
  const content = article?.content.kk;
  const label = `${topic.id} (${topic.slug.kk})`;

  if (!content) {
    console.error(`FAIL ${label}: missing KK content`);
    failures++;
    continue;
  }

  const bad = runContentChecks(label, content, 850);
  if (bad.length) {
    failures++;
    console.error(`FAIL ${label}: ${bad.join("; ")}`);
  } else {
    const words = wordCount(content);
    console.log(`OK ${label}: words=${words} meta=${content.metaDescription.length} faq=${content.faq.length}`);
  }

  const paths = getBlogPathByLocale(topic.id);
  if (!paths?.kk) {
    failures++;
    console.error(`FAIL ${label}: missing kk path in getBlogPathByLocale`);
  }
}

console.log(`\n=== KK blog not indexed (${kkNoindex.length} non-published kk topics) ===`);
for (const topic of blogTopics.filter((item) => !isKkBlogTopicApproved(item.id))) {
  if (topic.status.kk === "published") {
    failures++;
    console.error(`FAIL ${topic.id}: kk published but not approved for index`);
  }
}

console.log("\n=== KK static pages ===");
for (const page of staticSeoPages) {
  const content = page.content.kk;
  if (!content) continue;

  const approved = isKkStaticPageApproved(page.key);
  const label = page.key;
  const text = [
    content.title,
    content.metaDescription,
    content.intro,
    ...content.sections.map((s) => s.body),
  ].join("\n");

  if (approved) {
    if (content.status !== "published") {
      failures++;
      console.error(`FAIL ${label}: approved static but status=${content.status}`);
      continue;
    }
    const ok =
      content.title.length > 10 &&
      content.metaDescription.length >= 55 &&
      content.sections.length >= 2 &&
      (content.faq?.length ?? 0) >= 3 &&
      !hasPlaceholder(text) &&
      !looksLikeEnglishFallback(text);
    if (!ok) {
      failures++;
      console.error(`FAIL ${label}: approved static KK page incomplete or fallback`);
    } else {
      console.log(`OK ${label} (published/indexable): sections=${content.sections.length}`);
    }
  } else if (content.status === "published" && page.indexPolicy !== "noindex") {
    failures++;
    console.error(`FAIL ${label}: kk published but not in approved static list`);
  } else {
    console.log(`OK ${label} (${content.status}, noindex policy=${page.indexPolicy})`);
  }
}

const kkHome = getLandingCopy("kk");
if (kkHome.translationStatus !== "published") {
  failures++;
  console.error(`FAIL kk home: translationStatus=${kkHome.translationStatus}, expected published`);
} else if (looksLikeEnglishFallback(kkHome.hero.headline)) {
  failures++;
  console.error("FAIL kk home: English fallback in hero");
} else {
  console.log("OK kk home landing (published)");
}

console.log("\n=== KK index policy (Stage 6) ===");
if (!indexableLocales.includes("kk" as never)) {
  failures++;
  console.error("FAIL indexableLocales must include kk after Stage 6 approval");
} else {
  console.log(`OK indexableLocales = ${indexableLocales.join(", ")}`);
}

const sitemapSource = readFileSync("app/sitemap.ts", "utf8");
if (!sitemapSource.includes("indexableLocales")) {
  failures++;
  console.error("FAIL sitemap.ts: missing indexableLocales-driven paths");
} else {
  console.log("OK sitemap.ts uses indexableLocales (includes kk when indexable)");
}

for (const topic of kkPublished) {
  const paths = getBlogPathByLocale(topic.id);
  if (!paths) continue;
  const alternates = buildLanguageAlternates(paths);
  if (!alternates.kk) {
    failures++;
    console.error(`FAIL ${topic.id}: approved triad missing kk hreflang`);
  }
}

const draftKkInSitemap = kkPublished.length === KK_APPROVED_BLOG_TOPIC_NUMBERS.size;
if (!draftKkInSitemap) {
  failures++;
  console.error("FAIL expected 10 published kk blog topics");
}

for (const topic of blogTopics.filter((t) => t.status.kk === "ready_for_review")) {
  const paths = getBlogPathByLocale(topic.id);
  if (paths?.kk) {
    failures++;
    console.error(`FAIL ${topic.id}: ready_for_review must not appear in index paths`);
  }
}

console.log("\n=== KK robots indexability sample ===");
const sampleTopic = blogTopics.find((t) => t.id === "blog_031");
if (sampleTopic) {
  const article = blogArticles.find((a) => a.topicId === "blog_031");
  const kkContent = article?.content.kk;
  if (
    kkContent &&
    !shouldIndexPage({
      locale: "kk",
      title: kkContent.title,
      description: kkContent.metaDescription,
      h1: kkContent.title,
      status: sampleTopic.status.kk,
      sectionCount: kkContent.sections.length,
      internalLinkCount: kkContent.internalLinks.length,
      hasCanonical: true,
      hasHreflang: true,
    })
  ) {
    failures++;
    console.error("FAIL blog_031 kk should be indexable");
  } else {
    console.log("OK blog_031 kk passes shouldIndexPage");
  }
}

process.exit(failures > 0 ? 1 : 0);
