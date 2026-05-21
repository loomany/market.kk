import { audiencePages, getAudienceChips } from "../../data/seo/audiencePages";
import { getAudienceHubSegment } from "../../lib/seo/audiencePaths";
import { audiencePathByLocale } from "../../lib/seo/audiencePagePaths";
import { isKkAudienceApproved } from "../../lib/seo/kkIndexPolicy";
import { shouldIndexPage } from "../../lib/seo/qualityGate";

const LOCALES = ["ru", "en", "kk"] as const;
const MIN_WORDS = { ru: 900, en: 900, kk: 850 } as const;

function wordCount(content: {
  intro: string;
  sections: Array<{ body: string }>;
  scenarios: Array<{ body: string }>;
  limitations: string;
}): number {
  const text = [
    content.intro,
    ...content.sections.map((s) => s.body),
    ...content.scenarios.map((s) => s.body),
    content.limitations,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function hasPlaceholder(text: string): boolean {
  return /\bTODO\b|\bFIXME\b|lorem ipsum|\[placeholder\]/i.test(text);
}

let failures = 0;

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  failures++;
}

function ok(msg: string) {
  console.log(`OK ${msg}`);
}

if (audiencePages.length !== 10) {
  fail(`expected 10 audience pages, got ${audiencePages.length}`);
}

const slugSets = { ru: new Set<string>(), en: new Set<string>(), kk: new Set<string>() };

for (const page of audiencePages) {
  for (const locale of LOCALES) {
    const content = page.content[locale];
    const label = `${page.id} ${locale}`;

    if (!content.title || !content.metaDescription || !content.h1 || !content.intro) {
      fail(`${label}: missing meta fields`);
    }
    if (content.faq.length < 5) fail(`${label}: FAQ < 5`);
    if (content.relatedLinks.length < 5) fail(`${label}: relatedLinks < 5`);
    if (content.sections.length < 6) fail(`${label}: sections < 6`);
    if (hasPlaceholder(content.intro)) fail(`${label}: placeholder in intro`);

    const words = wordCount(content);
    if (words < MIN_WORDS[locale]) {
      fail(`${label}: word count ${words} < ${MIN_WORDS[locale]}`);
    } else {
      ok(`${label}: ${words} words`);
    }

    if (slugSets[locale].has(content.slug)) {
      fail(`${label}: duplicate slug ${content.slug}`);
    }
    slugSets[locale].add(content.slug);

    const hub = getAudienceHubSegment(locale);
    const path = `/${locale}/${hub}/${content.slug}`;
    const indexable = audiencePathByLocale(page)[locale];
    const expectIndex =
      content.status === "published" &&
      (locale !== "kk" || isKkAudienceApproved(page.id)) &&
      shouldIndexPage({
        locale,
        title: content.title,
        description: content.metaDescription,
        h1: content.h1,
        status: content.status,
        sectionCount: content.sections.length,
        internalLinkCount: content.relatedLinks.length,
        hasCanonical: true,
        hasHreflang: true,
      });

    if (expectIndex && indexable !== path) {
      fail(`${label}: sitemap path mismatch ${indexable} vs ${path}`);
    }
    if (!expectIndex && indexable) {
      fail(`${label}: unexpected indexable path ${indexable}`);
    }
  }
}

for (const locale of LOCALES) {
  const chips = getAudienceChips(locale);
  if (chips.length !== 10) fail(`${locale} chips: expected 10, got ${chips.length}`);
  for (const chip of chips) {
    const page = audiencePages.find((p) => p.id === chip.id);
    if (!page) fail(`${locale} chip ${chip.id}: unknown page`);
    else if (chip.href !== `/${locale}/${getAudienceHubSegment(locale)}/${page.content[locale].slug}`) {
      fail(`${locale} chip ${chip.id}: bad href ${chip.href}`);
    }
  }
  ok(`${locale}: ${chips.length} landing chips`);
}

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}

console.log("\nAll audience page checks passed.");
