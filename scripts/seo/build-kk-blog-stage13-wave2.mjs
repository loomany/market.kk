/**
 * Writes data/seo/kkBlogStage13Wave2.ts — Stage 13 KK Wave 2 (8 topics).
 * Run: node scripts/seo/build-kk-blog-stage13-wave2.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { kkBlogStage13Articles } from "./kk-blog-stage13-wave2-articles.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../data/seo/kkBlogStage13Wave2.ts");

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
import type { KkBlogArticleContent } from "./kkBlogStage5Content";

export const kkBlogStage13Wave2: Record<string, KkBlogArticleContent> = {
`;

const body = Object.entries(kkBlogStage13Articles)
  .map(([id, article]) => renderArticle(id, article))
  .join("\n");

writeFileSync(OUT, header + body + "\n};\n", "utf8");

let fail = false;
for (const [id, a] of Object.entries(kkBlogStage13Articles)) {
  const w = wordCount(a);
  console.log(`  ${id}: ${w} words`);
  if (w < 850) {
    console.error(`FAIL ${id} below 850 words`);
    fail = true;
  }
}
if (fail) process.exit(1);
console.log("Wrote", OUT);
