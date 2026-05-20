/**
 * Stage 11 Wave 2: writes ruBlogStage11Wave2.ts and enBlogStage11Wave2.ts
 * Run: node scripts/seo/build-wave2-blog-stage11.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { getWave2EnArticles, getWave2RuArticles } from "./wave2-blog-stage11-articles.mjs";
import { wordCount, WAVE2_TOPIC_NUMBERS } from "./wave2-blog-stage11-lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RU_OUT = join(__dirname, "../../data/seo/ruBlogStage11Wave2.ts");
const EN_OUT = join(__dirname, "../../data/seo/enBlogStage11Wave2.ts");

function renderArticle(id, a) {
  const sections = a.sections
    .map(
      (s) => `      {
        title: ${JSON.stringify(s.title)},
        body: [
${s.body.map((p) => `          ${JSON.stringify(p)},`).join("\n")}
        ],
      },`
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

function writeLocale(outPath, exportName, typeName, articles) {
  const header = `import type { FaqItem } from "./platforms";

export type ${typeName} = {
  title: string;
  metaDescription: string;
  intro: string;
  shortAnswer: string;
  sections: Array<{ title: string; body: string[] }>;
  checklist: string[];
  faq: FaqItem[];
  internalLinks: Array<{ label: string; href: string }>;
};

export const ${exportName}: Record<string, ${typeName}> = {
`;
  const body = Object.entries(articles)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, article]) => renderArticle(id, article))
    .join("\n");
  writeFileSync(outPath, header + body + "\n};\n", "utf8");
}

const ru = getWave2RuArticles();
const en = getWave2EnArticles();

writeLocale(RU_OUT, "ruBlogStage11Wave2", "RuBlogArticleContent", ru);
writeLocale(EN_OUT, "enBlogStage11Wave2", "EnBlogArticleContent", en);

console.log("Wrote", RU_OUT, "articles:", Object.keys(ru).length);
console.log("Wrote", EN_OUT, "articles:", Object.keys(en).length);

let ruMin = Infinity;
let ruMax = 0;
let enMin = Infinity;
let enMax = 0;

for (const n of WAVE2_TOPIC_NUMBERS) {
  const id = `blog_${String(n).padStart(3, "0")}`;
  const rw = wordCount(ru[id]);
  const ew = wordCount(en[id]);
  ruMin = Math.min(ruMin, rw);
  ruMax = Math.max(ruMax, rw);
  enMin = Math.min(enMin, ew);
  enMax = Math.max(enMax, ew);
  console.log(`  ${id}: RU=${rw} EN=${ew}`);
}

console.log(`RU word range: ${ruMin}–${ruMax}`);
console.log(`EN word range: ${enMin}–${enMax}`);
