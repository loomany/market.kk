/**
 * One-off build: writes data/seo/kkBlogStage5Content.ts from authored Kazakh content.
 * Run: node scripts/seo/build-kk-blog-stage5.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { commonKkFaq, fullArticles } from "./kk-blog-full-prose.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../data/seo/kkBlogStage5Content.ts");

function wordCount(article) {
  const text = [
    article.intro,
    article.shortAnswer,
    ...article.sections.flatMap((s) => s.body),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function renderArticle(id, a) {
  const sections = a.sections
    .map(
      (s) => `      {
        title: ${JSON.stringify(s.title)},
        body: [
${s.body.map((p) => `          ${JSON.stringify(p)},`).join("\n")}
        ],
      },`,
    )
    .join("\n");

  return `  ${JSON.stringify(id)}: {
    title: ${JSON.stringify(a.title)},
    metaDescription: ${JSON.stringify(a.metaDescription)},
    intro: ${JSON.stringify(a.intro)},
    shortAnswer: ${JSON.stringify(a.shortAnswer)},
    sections: [
${sections}
    ],
    checklist: [${a.checklist.map((c) => JSON.stringify(c)).join(", ")}],
    faq: [
${a.faq.map((f) => `      { question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} },`).join("\n")}
    ],
    internalLinks: [
${a.internalLinks.map((l) => `      { label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} },`).join("\n")}
    ],
  },`;
}

const header = `import type { FaqItem } from "./platforms";

export type KkBlogArticleContent = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: FaqItem[];
  internalLinks: Array<{ label: string; href: string }>;
};

export const commonKkFaq: FaqItem[] = ${JSON.stringify(commonKkFaq, null, 2)};

export const kkBlogStage5P0: Record<string, KkBlogArticleContent> = {
`;

const body = Object.entries(fullArticles)
  .map(([id, article]) => renderArticle(id, article))
  .join("\n");

writeFileSync(OUT, header + body + "\n};\n", "utf8");
console.log("Wrote", OUT, "articles:", Object.keys(fullArticles).length);
for (const [id, a] of Object.entries(fullArticles)) {
  console.log(`  ${id}: ${wordCount(a)} words`);
}
