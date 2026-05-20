import { blogTopics } from "../../data/seo/blogTopics";
import { blogArticles } from "../../data/seo/blogArticles";
import { ruBlogExpanded, ruBlogNewP0 } from "../../data/seo/ruBlogStage2Content";

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

function hasMixedLanguage(text: string): boolean {
  const hasCyrillic = /[а-яё]/i.test(text);
  const hasLatinWords = /\b[A-Za-z]{4,}\b/.test(text);
  return hasCyrillic && hasLatinWords && /TODO|FIXME|coming soon/i.test(text);
}

function hasPlaceholder(text: string): boolean {
  return /TODO|FIXME|lorem ipsum|placeholder/i.test(text);
}

const publishedRuTopics = blogTopics.filter((topic) => topic.status.ru === "published");
const stage2Ids = new Set([
  ...Object.keys(ruBlogExpanded),
  ...Object.keys(ruBlogNewP0),
]);

let failures = 0;

for (const topic of publishedRuTopics) {
  const article = blogArticles.find((item) => item.topicId === topic.id);
  const ru = article?.content.ru;
  const label = `${topic.id} (${topic.slug.ru})`;

  if (!ru) {
    console.error(`FAIL ${label}: missing RU content`);
    failures++;
    continue;
  }

  const words = wordCount(ru);
  const metaLen = ru.metaDescription.length;
  const faqCount = ru.faq.length;
  const hasCta = ru.internalLinks.some(
    (link) => link.href === "/studio" || /студи/i.test(link.label)
  );
  const bodyText = [
    ru.title,
    ru.metaDescription,
    ru.intro,
    ru.shortAnswer,
    ...ru.sections.flatMap((s) => [s.title, ...s.body]),
    ...ru.checklist,
    ...ru.faq.flatMap((f) => [f.question, f.answer]),
  ].join("\n");

  const checks: Array<[boolean, string]> = [
    [Boolean(ru.title), "title missing"],
    [Boolean(ru.metaDescription), "meta missing"],
    [words >= 900, `word count ${words} < 900`],
    [metaLen >= 100 && metaLen <= 170, `meta length ${metaLen}`],
    [ru.sections.length >= 4, `sections ${ru.sections.length} < 4`],
    [faqCount >= 4, `faq ${faqCount} < 4`],
    [hasCta, "CTA /studio missing"],
    [ru.internalLinks.length >= 3, `internal links ${ru.internalLinks.length} < 3`],
    [!hasPlaceholder(bodyText), "placeholder/TODO found"],
    [!hasMixedLanguage(bodyText), "suspicious mixed-language markers"],
  ];

  const bad = checks.filter(([ok]) => !ok).map(([, msg]) => msg);
  if (bad.length) {
    failures++;
    console.error(`FAIL ${label}: ${bad.join("; ")}`);
  } else {
    const stageTag = stage2Ids.has(topic.id) ? "stage2" : "legacy";
    console.log(`OK ${label}: words=${words} meta=${metaLen} faq=${faqCount} [${stageTag}]`);
  }

  for (const link of ru.internalLinks) {
    if (link.href.includes("/blog/") && link.href.includes("how-to-")) {
      console.error(`FAIL ${label}: draft-style EN blog slug in link ${link.href}`);
      failures++;
    }
  }
}

const enPublishedWithRuOnly = blogTopics.filter(
  (topic) => topic.status.en === "published" && !stage2Ids.has(topic.id)
);
for (const topicId of Object.keys(ruBlogNewP0)) {
  const topic = blogTopics.find((item) => item.id === topicId);
  if (topic?.status.en === "published") {
    console.error(`FAIL ${topicId}: EN must stay draft for RU-only P0 article`);
    failures++;
  }
}

if (enPublishedWithRuOnly.length === 0) {
  console.log("OK EN publish set unchanged (8 articles)");
}

console.log(`\nPublished RU articles: ${publishedRuTopics.length}`);
process.exit(failures > 0 ? 1 : 0);
