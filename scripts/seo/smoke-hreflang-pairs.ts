/**
 * Validates ru/en blog hreflang pairs and ru/en/kk triads where KK is published (static, no HTTP).
 */
import { blogTopics } from "../../data/seo/blogTopics";
import { getArticleByTopicId } from "../../data/seo/blogArticles";
import { getBlogPathByLocale } from "../../lib/blog/blogResolve";
import { indexableLocales } from "../../lib/i18n/localeConfig";
import { staticSeoPages } from "../../data/seo/staticPages";
import { buildLocalizedPathMap, type StaticRouteKey } from "../../lib/i18n/routeSlugs";
import { isKkBlogTopicApproved, isKkTrustPageApproved } from "../../lib/seo/kkIndexPolicy";
import { buildLanguageAlternates } from "../../lib/seo/site";
import { shouldIndexPage } from "../../lib/seo/qualityGate";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let failures = 0;

const publishedPairs = blogTopics.filter(
  (t) => t.status.ru === "published" && t.status.en === "published"
);

console.log(`Checking ${publishedPairs.length} ru/en published pairs...`);

for (const topic of publishedPairs) {
  const article = getArticleByTopicId(topic.id);
  assert(article, `${topic.id}: missing article record`);

  const pathByLocale = getBlogPathByLocale(topic.id);
  assert(pathByLocale, `${topic.id}: getBlogPathByLocale returned null`);
  const paths = pathByLocale;

  assert(paths.ru, `${topic.id}: missing RU path`);
  assert(paths.en, `${topic.id}: missing EN path`);
  assert(
    paths.ru === `/ru/blog/${topic.slug.ru}`,
    `${topic.id}: RU path mismatch ${paths.ru}`
  );
  assert(
    paths.en === `/en/blog/${topic.slug.en}`,
    `${topic.id}: EN path mismatch ${paths.en}`
  );

  const kkTriad = isKkBlogTopicApproved(topic.id) && topic.status.kk === "published";
  if (kkTriad) {
    assert(paths.kk, `${topic.id}: missing KK path in triad`);
    assert(
      paths.kk === `/kk/blog/${topic.slug.kk}`,
      `${topic.id}: KK path mismatch ${paths.kk}`
    );
  } else if (paths.kk) {
    console.error(`FAIL ${topic.id}: kk path present but topic not approved triad`);
    failures++;
  }

  const alternates = buildLanguageAlternates(paths);
  assert(alternates.ru, `${topic.id}: hreflang missing ru`);
  assert(alternates.en, `${topic.id}: hreflang missing en`);
  assert(alternates["x-default"], `${topic.id}: hreflang missing x-default`);
  assert(
    alternates["x-default"] === alternates.ru,
    `${topic.id}: x-default must point to RU`
  );

  if (kkTriad) {
    assert(alternates.kk, `${topic.id}: hreflang missing kk in triad`);
  } else {
    assert(!alternates.kk, `${topic.id}: hreflang must not include kk without triad`);
  }

  const allowedKeys = kkTriad ? ["ru", "en", "kk", "x-default"] : ["ru", "en", "x-default"];
  const extraKeys = Object.keys(alternates).filter((k) => !allowedKeys.includes(k));
  if (extraKeys.length) {
    console.error(`FAIL ${topic.id}: unexpected hreflang keys ${extraKeys.join(", ")}`);
    failures++;
  }

  for (const locale of indexableLocales) {
    if (!paths[locale]) continue;

    const content = article.content[locale];
    assert(content, `${topic.id}: missing ${locale} content`);

    const indexable = shouldIndexPage({
      locale,
      title: content.title,
      description: content.metaDescription,
      h1: content.title,
      status: topic.status[locale],
      sectionCount: content.sections.length,
      internalLinkCount: content.internalLinks.length,
      hasCanonical: true,
      hasHreflang: true,
    });

    const shouldBeIndexed =
      locale === "ru" || locale === "en" || (locale === "kk" && kkTriad);

    if (shouldBeIndexed && !indexable) {
      console.error(`FAIL ${topic.id}: ${locale} should be indexable`);
      failures++;
    }
    if (!shouldBeIndexed && indexable) {
      console.error(`FAIL ${topic.id}: ${locale} should NOT be indexable`);
      failures++;
    }
  }
}

const ruOnly = blogTopics.filter(
  (t) => t.status.ru === "published" && t.status.en !== "published"
);
const enOnly = blogTopics.filter(
  (t) => t.status.en === "published" && t.status.ru !== "published"
);

assert(ruOnly.length === 0, `expected 0 RU-only published, got ${ruOnly.length}`);
assert(enOnly.length === 0, `expected 0 EN-only published, got ${enOnly.length}`);

const kkTriads = publishedPairs.filter(
  (t) => isKkBlogTopicApproved(t.id) && t.status.kk === "published"
);
assert(kkTriads.length === 18, `expected 18 kk blog triads, got ${kkTriads.length}`);

const trustTriadKeys = ["howItWorks", "quality", "faq"] as const satisfies readonly StaticRouteKey[];
let trustTriads = 0;
for (const key of trustTriadKeys) {
  assert(isKkTrustPageApproved(key), `${key}: must be in KK approved trust policy`);
  const page = staticSeoPages.find((p) => p.key === key);
  assert(page?.content.kk?.status === "published", `${key}: kk trust must be published`);
  const paths = {
    ru: buildLocalizedPathMap(key).ru,
    en: buildLocalizedPathMap(key).en,
    kk: buildLocalizedPathMap(key).kk,
  };
  const alternates = buildLanguageAlternates(paths);
  assert(alternates.kk, `${key}: trust hreflang missing kk`);
  assert(alternates.ru && alternates.en, `${key}: trust hreflang missing ru/en`);
  assert(alternates["x-default"] === alternates.ru, `${key}: x-default must be ru`);
  trustTriads++;
}
assert(trustTriads === 3, `expected 3 kk trust triads, got ${trustTriads}`);

if (failures) {
  console.error(`\n${failures} hreflang pair check(s) failed.`);
  process.exit(1);
}

console.log(
  `OK ${publishedPairs.length} ru/en pairs with hreflang ru+en+x-default→ru`
);
console.log(`OK ${kkTriads.length} ru/en/kk blog triads with hreflang ru+en+kk+x-default→ru`);
console.log(`OK ${trustTriads} ru/en/kk trust triads (how-it-works, quality, faq)`);
console.log("OK no RU-only or EN-only published blog topics");
process.exit(0);
