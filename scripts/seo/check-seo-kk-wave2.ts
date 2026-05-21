/**
 * Stage 13 — KK Wave 2 subset QA.
 * Run: npm run check:seo:kk-wave2
 */
import { blogArticles } from "../../data/seo/blogArticles";
import { blogTopics } from "../../data/seo/blogTopics";
import { isKkBlogTopicApproved } from "../../lib/seo/kkIndexPolicy";

const WAVE2_KK_IDS = [
  "blog_006",
  "blog_007",
  "blog_009",
  "blog_010",
  "blog_020",
  "blog_061",
  "blog_063",
  "blog_077",
];

function wordCount(content: {
  intro: string;
  shortAnswer: string;
  sections: Array<{ body: string[] }>;
}): number {
  const text = [
    content.intro,
    content.shortAnswer,
    ...content.sections.flatMap((s) => s.body),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

let failures = 0;

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  failures++;
}

function ok(msg: string) {
  console.log(`OK  ${msg}`);
}

console.log("=== Stage 13 KK Wave 2 (8 topics) ===\n");

for (const topicId of WAVE2_KK_IDS) {
  const n = Number(topicId.replace("blog_", ""));
  if (!isKkBlogTopicApproved(topicId)) {
    fail(`${topicId} not in KK_APPROVED_BLOG_TOPIC_NUMBERS`);
    continue;
  }

  const topic = blogTopics.find((t) => t.id === topicId);
  if (!topic || topic.status.kk !== "published") {
    fail(`${topicId} kk status must be published`);
    continue;
  }

  const article = blogArticles.find((a) => a.topicId === topicId);
  const kk = article?.content.kk;
  if (!kk) {
    fail(`${topicId} missing kk content`);
    continue;
  }

  const words = wordCount(kk);
  if (words < 850) fail(`${topicId} words ${words} < 850`);
  else ok(`${topicId} (${topic.slug.kk}): words=${words}`);

  if (!kk.title || !kk.metaDescription || kk.faq.length < 4) {
    fail(`${topicId} structure incomplete`);
  }

  const body = [kk.intro, kk.shortAnswer, ...kk.sections.flatMap((s) => s.body)].join(" ");
  if (/\bTODO\b|lorem ipsum/i.test(body)) fail(`${topicId} placeholder`);
  if (/\b(how to|what is|the product)\b/i.test(body)) fail(`${topicId} EN fallback`);
  if (kk.internalLinks.some((l) => l.href.startsWith("/ru/") || l.href.startsWith("/en/"))) {
    fail(`${topicId} ru/en internal link`);
  }
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}

console.log("\nAll KK Wave 2 checks passed.");
