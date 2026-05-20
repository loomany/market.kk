/**
 * Removes repetitive sentence padding from kkBlogStage5Content.ts seed data.
 * Run: node scripts/seo/fix-kk-blog-dedupe.mjs && node scripts/seo/build-kk-blog-stage5.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { commonKkFaq, fullArticles } from "./kk-blog-full-prose.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function dedupeSentences(text) {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out.join(" ");
}

function cleanField(text) {
  return dedupeSentences(text.replace(/\s+/g, " ").trim());
}

function cleanArticle(article) {
  return {
    ...article,
    intro: cleanField(article.intro),
    shortAnswer: cleanField(article.shortAnswer),
    sections: article.sections.map((s) => ({
      title: s.title,
      body: s.body.map((p) => cleanField(p)),
    })),
  };
}

const cleaned = Object.fromEntries(
  Object.entries(fullArticles).map(([id, a]) => [id, cleanArticle(a)]),
);

const outPath = join(__dirname, "kk-blog-full-prose-clean.mjs");
const body = `export const commonKkFaq = ${JSON.stringify(commonKkFaq, null, 2)};

export const fullArticles = ${JSON.stringify(cleaned, null, 2)};
`;
writeFileSync(outPath, body, "utf8");
console.log("Wrote", outPath);
