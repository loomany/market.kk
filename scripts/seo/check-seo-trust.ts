/**
 * Trust + examples scaffold QA (Stage 10).
 * Run: npx tsx scripts/seo/check-seo-trust.ts
 */
import { getExamplePagesForLocale } from "@/data/seo/examplesPages";
import { staticSeoPages } from "@/data/seo/staticPages";
import { indexableLocales } from "@/lib/i18n/localeConfig";
import { shouldIndexPage } from "@/lib/seo/qualityGate";

const trustKeys = ["howItWorks", "quality", "faq"] as const;

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
}

function ok(msg: string) {
  console.log(`OK  ${msg}`);
}

console.log("=== Trust pages ===\n");

for (const key of trustKeys) {
  const page = staticSeoPages.find((p) => p.key === key);
  if (!page) {
    fail(`missing trust page ${key}`);
    continue;
  }
  if (page.kind !== "trust") {
    fail(`${key} kind must be trust`);
  }

  for (const locale of ["ru", "en"] as const) {
    const c = page.content[locale];
    if (!c) {
      fail(`${key} missing ${locale} content`);
      continue;
    }
    if (c.title.length < 18) fail(`${key} ${locale} title short`);
    if (c.metaDescription.length < 55) fail(`${key} ${locale} meta short`);
    if (c.h1.length < 8) fail(`${key} ${locale} h1 short`);
    if (c.sections.length < 2) fail(`${key} ${locale} sections`);
    if (!c.faq || c.faq.length < 3) fail(`${key} ${locale} FAQ`);
    if (!c.relatedLinks || c.relatedLinks.length < 2) fail(`${key} ${locale} links`);

    const indexable = shouldIndexPage({
      locale,
      title: c.title,
      description: c.metaDescription,
      h1: c.h1,
      status: c.status,
      sectionCount: c.sections.length,
      internalLinkCount: c.relatedLinks!.length,
      hasCanonical: true,
      hasHreflang: true,
    });
    if (!indexable) {
      fail(`${key} ${locale} should be indexable`);
    } else {
      ok(`${key} ${locale} indexable (${c.faq!.length} FAQ)`);
    }
  }

  const kk = page.content.kk;
  if (kk) {
    const kkIndex = shouldIndexPage({
      locale: "kk",
      title: kk.title,
      description: kk.metaDescription,
      h1: kk.h1,
      status: kk.status,
      sectionCount: kk.sections.length,
      internalLinkCount: kk.relatedLinks?.length ?? 0,
      hasCanonical: true,
      hasHreflang: true,
    });
    if (kkIndex) {
      fail(`${key} kk should be noindex (ready_for_review)`);
    } else {
      ok(`${key} kk noindex until QA (${kk.status})`);
    }
  }
}

console.log("\n=== Examples scaffold (noindex) ===\n");

for (const locale of indexableLocales) {
  const pages = getExamplePagesForLocale(locale);
  if (pages.length === 0) continue;

  for (const page of pages) {
    if (page.indexPolicy !== "noindex") {
      fail(`examples ${locale}/${page.slug} must be noindex policy`);
    }
    const indexable = shouldIndexPage({
      locale,
      title: page.title,
      description: page.metaDescription,
      h1: page.h1,
      status: "noindex",
      sectionCount: page.sections.length,
      internalLinkCount: page.relatedLinks.length,
      hasCanonical: true,
      hasHreflang: false,
    });
    if (indexable) {
      fail(`examples ${locale}/${page.slug} must not pass shouldIndexPage`);
    }
  }
  ok(`${locale} examples: ${pages.length} pages, all noindex`);
}

if (process.exitCode !== 1) {
  console.log("\nTrust/examples checks passed.");
}
