import { ruBlogStage11Wave2 } from "../../data/seo/ruBlogStage11Wave2";
import { enBlogStage11Wave2 } from "../../data/seo/enBlogStage11Wave2";

function wordCount(article: {
  intro: string;
  shortAnswer: string;
  sections: Array<{ body: string[] }>;
}): number {
  const text = [
    article.intro,
    article.shortAnswer,
    ...article.sections.flatMap((s) => s.body),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

const WAVE2_TOPIC_NUMBERS = [
  6, 7, 9, 10, 19, 20, 29, 34, 35, 36, 49, 55, 60, 61, 63, 67, 75, 77, 94, 96,
];

let failures = 0;

console.log(`\n=== Stage 11 Wave 2 (${WAVE2_TOPIC_NUMBERS.length} topics) ===\n`);

for (const n of WAVE2_TOPIC_NUMBERS) {
  const id = `blog_${String(n).padStart(3, "0")}`;
  const ru = ruBlogStage11Wave2[id];
  const en = enBlogStage11Wave2[id];

  if (!ru) {
    console.error(`FAIL ${id}: missing RU content`);
    failures++;
  } else {
    const w = wordCount(ru);
    const ok =
      w >= 1000 &&
      ru.sections.length >= 6 &&
      ru.faq.length >= 5 &&
      ru.internalLinks.length >= 5;
    if (!ok) {
      console.error(
        `FAIL ${id} RU: words=${w} sections=${ru.sections.length} faq=${ru.faq.length} links=${ru.internalLinks.length}`
      );
      failures++;
    } else {
      console.log(`OK ${id} RU: words=${w}`);
    }
  }

  if (!en) {
    console.error(`FAIL ${id}: missing EN content`);
    failures++;
  } else {
    const w = wordCount(en);
    const ok =
      w >= 900 &&
      en.sections.length >= 6 &&
      en.faq.length >= 5 &&
      en.internalLinks.length >= 5 &&
      !/[а-яё]/i.test(
        [en.intro, en.shortAnswer, ...en.sections.flatMap((s) => s.body)].join(" ")
      );
    if (!ok) {
      console.error(
        `FAIL ${id} EN: words=${w} sections=${en.sections.length} faq=${en.faq.length} links=${en.internalLinks.length}`
      );
      failures++;
    } else {
      console.log(`OK ${id} EN: words=${w}`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}

console.log("\nAll Wave 2 articles passed word-count and structure checks.");
