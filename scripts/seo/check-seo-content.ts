import { blogTopics } from "../../data/seo/blogTopics";
import { blogArticles } from "../../data/seo/blogArticles";

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

const arg = process.argv[2] ?? "ru";
if (arg !== "ru" && arg !== "en" && arg !== "all" && arg !== "kk") {
  console.error("Usage: npx tsx scripts/seo/check-seo-content.ts [ru|en|kk|all]");
  process.exit(1);
}

const locales =
  arg === "all" ? (["ru", "en"] as const) : arg === "kk" ? ([] as const) : ([arg] as const);

if (arg === "kk") {
  console.error("Use npm run check:seo:kk-content for KK QA");
  process.exit(0);
}

const publishedBlogSlugs = new Set(
  blogTopics
    .filter((t) => t.status.ru === "published" || t.status.en === "published")
    .flatMap((t) => [t.slug.ru, t.slug.en].filter(Boolean))
);

let failures = 0;

for (const loc of locales) {
  const published = blogTopics.filter((topic) => topic.status[loc] === "published");
  console.log(`\n=== ${loc.toUpperCase()} (${published.length} published) ===`);

  for (const topic of published) {
    const article = blogArticles.find((item) => item.topicId === topic.id);
    const content = article?.content[loc];
    const label = `${topic.id} (${topic.slug[loc]})`;

    if (!content) {
      console.error(`FAIL ${label}: missing ${loc.toUpperCase()} content`);
      failures++;
      continue;
    }

    const words = wordCount(content);
    const metaLen = content.metaDescription.length;
    const text = bodyText(content);
    const hasCta = content.internalLinks.some(
      (link) =>
        link.href === "/studio" ||
        (loc === "ru" ? /студи/i.test(link.label) : /open studio/i.test(link.label))
    );

    const checks: Array<[boolean, string]> = [
      [Boolean(content.title), "title missing"],
      [Boolean(content.metaDescription), "meta missing"],
      [words >= 900, `word count ${words} < 900`],
      [metaLen >= 100 && metaLen <= 170, `meta length ${metaLen}`],
      [content.sections.length >= 4, `sections ${content.sections.length} < 4`],
      [content.faq.length >= 4, `faq ${content.faq.length} < 4`],
      [hasCta, "CTA /studio missing"],
      [content.internalLinks.length >= 3, `internal links ${content.internalLinks.length} < 3`],
      [!hasPlaceholder(text), "placeholder/TODO found"],
    ];

    if (loc === "en") {
      checks.push([!/[а-яё]/i.test(text), "Cyrillic leftover in EN"]);
      checks.push(
        [
          !content.internalLinks.some((l) => l.href.startsWith("/ru/")),
          "EN article links to /ru/ path",
        ]
      );
    }

    if (loc === "ru") {
      checks.push(
        [
          !content.internalLinks.some(
            (l) => l.href.includes("/blog/") && l.href.includes("how-to-")
          ),
          "EN-style blog slug in RU link",
        ]
      );
    }

    const bad = checks.filter(([ok]) => !ok).map(([, msg]) => msg);
    if (bad.length) {
      failures++;
      console.error(`FAIL ${label}: ${bad.join("; ")}`);
    } else {
      console.log(`OK ${label}: words=${words} meta=${metaLen} faq=${content.faq.length}`);
    }

    for (const link of content.internalLinks) {
      if (link.href.includes("/blog/")) {
        const slug = link.href.split("/blog/")[1]?.replace(/\/$/, "");
        const topicForSlug = blogTopics.find(
          (t) => t.slug.ru === slug || t.slug.en === slug
        );
        if (topicForSlug) {
          const targetLoc = link.href.startsWith("/ru/") ? "ru" : "en";
          if (topicForSlug.status[targetLoc] !== "published") {
            console.error(
              `FAIL ${label}: link to unpublished ${targetLoc} article ${link.href}`
            );
            failures++;
          }
        }
      }
    }
  }
}

const ruCount = blogTopics.filter((t) => t.status.ru === "published").length;
const enCount = blogTopics.filter((t) => t.status.en === "published").length;
console.log(`\nPublished totals: RU=${ruCount} EN=${enCount}`);
process.exit(failures > 0 ? 1 : 0);
