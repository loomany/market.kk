/** Bootstrap: dedupe current kkBlogStage5Content.ts into a clean seed module. */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { kkBlogStage5P0 } from "../../data/seo/kkBlogStage5Content.ts";

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

function cleanArticle(a) {
  return {
    ...a,
    title: dedupeSentences(a.title),
    intro: dedupeSentences(a.intro),
    shortAnswer: dedupeSentences(a.shortAnswer),
    sections: a.sections.map((s) => ({
      title: dedupeSentences(s.title),
      body: s.body.map((p) => dedupeSentences(p)),
    })),
    checklist: a.checklist.map((c) => dedupeSentences(c)),
  };
}

const seed = Object.fromEntries(
  Object.entries(kkBlogStage5P0).map(([id, a]) => [id, cleanArticle(a)]),
);

const out = join(__dirname, "kk-blog-stage5-seed.mjs");
writeFileSync(
  out,
  `export const seedArticles = ${JSON.stringify(seed, null, 2)};\n`,
  "utf8",
);
console.log("Wrote", out);
