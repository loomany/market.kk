/**
 * Stage 12 — examples assets system QA.
 * Run: npm run check:seo:examples
 */
import fs from "node:fs";
import path from "node:path";
import {
  canRenderBeforeAfter,
  exampleCases,
  examplesIndexPolicy,
  getCategoryMeta,
} from "@/data/seo/exampleCases";
import { examplesAssetRegistry } from "@/data/seo/examplesAssetRegistry";
import { getExamplePagesForLocale } from "@/data/seo/examplesPages";
import { featureExamplesTeaserCategories } from "@/data/seo/featureExamplesTeaser";
import { ruFeatureLandingEnhancements } from "@/data/seo/ruFeatureLandingEnhancements";
import { enFeatureLandingEnhancements } from "@/data/seo/enFeatureLandingEnhancements";
import { staticSeoPages } from "@/data/seo/staticPages";
import { shouldIndexPage } from "@/lib/seo/qualityGate";
import sitemap from "../../app/sitemap";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
}

function ok(msg: string) {
  console.log(`OK  ${msg}`);
}

console.log("=== Stage 12 examples system ===\n");

if (examplesIndexPolicy.allowIndex) {
  fail("examplesIndexPolicy.allowIndex must stay false in Stage 12");
} else {
  ok("examplesIndexPolicy.allowIndex=false");
}

if (examplesIndexPolicy.allowSitemap || examplesIndexPolicy.allowHreflang) {
  fail("examples must not be in sitemap/hreflang policy flags");
} else {
  ok("examples sitemap/hreflang flags disabled");
}

for (const locale of ["ru", "en", "kk"] as const) {
  const pages = getExamplePagesForLocale(locale);
  for (const page of pages) {
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
      fail(`examples ${locale}/${page.slug || "index"} must be noindex`);
    }
    if (page.indexPolicy !== "noindex") {
      fail(`${locale}/${page.slug} indexPolicy must be noindex`);
    }
  }
  ok(`${locale} examples: ${pages.length} pages, all noindex`);
}

const entries = sitemap();
const exampleInSitemap = entries.filter((e) => e.url.includes("/examples"));
if (exampleInSitemap.length > 0) {
  fail(`sitemap must not include examples (${exampleInSitemap.length} found)`);
} else {
  ok("examples not in sitemap");
}

for (const caseItem of exampleCases) {
  if (caseItem.isRealOwnedAsset && caseItem.assetStatus === "placeholder") {
    fail(`${caseItem.id}: placeholder cannot be isRealOwnedAsset`);
  }
  if (caseItem.indexEligible && !examplesIndexPolicy.allowIndex) {
    fail(`${caseItem.id}: indexEligible=true but policy blocks index (needs owner approval)`);
  }
  if (canRenderBeforeAfter(caseItem)) {
    for (const img of [caseItem.beforeImage, caseItem.afterImage]) {
      if (!img?.src.startsWith("/examples/")) {
        fail(`${caseItem.id}: renderable images must live under /examples/`);
        continue;
      }
      const disk = path.join(PUBLIC, img.src.replace(/^\//, ""));
      if (!fs.existsSync(disk)) {
        fail(`${caseItem.id}: missing file ${img.src}`);
      }
      if (!img.alt || img.alt.length < 8) {
        fail(`${caseItem.id}: alt text too short`);
      }
      if (img.width < 1 || img.height < 1) {
        fail(`${caseItem.id}: width/height required`);
      }
    }
  } else if (caseItem.beforeImage?.src || caseItem.afterImage?.src) {
    fail(`${caseItem.id}: partial images without owned/licensed render approval`);
  }
}

if (exampleCases.length === 0) {
  ok("exampleCases empty — no fake before/after cases");
}

const unsafeUsedAsExample = exampleCases.some((c) => {
  const paths = [c.beforeImage?.src, c.afterImage?.src].filter(Boolean) as string[];
  return paths.some((p) => p.startsWith("/demo/"));
});
if (unsafeUsedAsExample) {
  fail("exampleCases must not reference /demo/ Studio mock assets");
} else {
  ok("no /demo/ paths in exampleCases");
}

for (const record of examplesAssetRegistry) {
  if (record.path.startsWith("/demo/") && record.safeForPublic) {
    fail(`registry marks ${record.path} safeForPublic — must be false`);
  }
}
ok(`asset registry: ${examplesAssetRegistry.length} entries audited`);

for (const meta of ["product-photos", "clothing-on-model", "background-removal", "kaspi-product-cards", "lingerie-on-ai-model"] as const) {
  if (!getCategoryMeta(meta)) {
    fail(`missing category meta ${meta}`);
  }
}
ok("5 example category metadata rows");

const indexableEnhancements = [
  ...Object.entries(ruFeatureLandingEnhancements),
  ...Object.entries(enFeatureLandingEnhancements),
];
for (const [, enh] of indexableEnhancements) {
  if (!enh) continue;
  for (const link of enh.internalLinks ?? []) {
    if (link.href.includes("/examples")) {
      fail(`feature LP internalLinks must not link to noindex examples: ${link.href}`);
    }
  }
  for (const section of enh.sections ?? []) {
    if (section.body.includes("/examples")) {
      fail(`feature LP section must not link to /examples: ${section.title}`);
    }
  }
}
ok("indexable feature LPs: no /examples href in enhancements");

for (const page of staticSeoPages.filter((p) => p.kind === "feature" && p.indexPolicy === "index")) {
  for (const locale of ["ru", "en"] as const) {
    const links = page.content[locale]?.relatedLinks ?? [];
    for (const link of links) {
      if (link.href.includes("/examples")) {
        fail(`${page.key} ${locale} relatedLinks contains /examples`);
      }
    }
  }
}
ok("static feature pages: no /examples in relatedLinks");

const teaserKeys = Object.keys(featureExamplesTeaserCategories);
if (teaserKeys.length < 5) {
  fail(`expected ≥5 feature teaser mappings, got ${teaserKeys.length}`);
} else {
  ok(`${teaserKeys.length} feature LP example teaser mappings`);
}

if (process.exitCode) {
  console.error("\nExamples checks failed.");
  process.exit(1);
}

console.log("\nAll Stage 12 examples checks passed.");
