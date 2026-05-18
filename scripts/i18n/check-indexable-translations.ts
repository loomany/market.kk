import { blogTopics } from "@/data/seo/blogTopics";
import { platformPages } from "@/data/seo/platforms";
import { staticSeoPages } from "@/data/seo/staticPages";
import { useCasePages } from "@/data/seo/useCases";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";
import { localeTranslationStatus } from "@/lib/i18n/translations";

const violations: string[] = [];

for (const locale of supportedLocaleCodes) {
  if (localeTranslationStatus[locale] !== "published" && (locale === "ru" || locale === "en")) {
    violations.push(`Core locale ${locale} landing is not published.`);
  }
}

for (const page of staticSeoPages) {
  for (const locale of supportedLocaleCodes) {
    if (page.indexPolicy === "index" && page.content[locale].status === "machine_translated") {
      violations.push(`${page.key}/${locale} is machine_translated but indexable.`);
    }
  }
}

for (const page of platformPages) {
  for (const locale of supportedLocaleCodes) {
    if (page.content[locale].status === "machine_translated") {
      violations.push(`${page.id}/${locale} platform page is machine_translated.`);
    }
  }
}

for (const page of useCasePages) {
  for (const locale of supportedLocaleCodes) {
    if (page.content[locale].status === "machine_translated") {
      violations.push(`${page.id}/${locale} use-case page is machine_translated.`);
    }
  }
}

for (const topic of blogTopics) {
  for (const locale of supportedLocaleCodes) {
    if (topic.status[locale] === "published" && locale !== "ru" && locale !== "en") {
      violations.push(`${topic.id}/${locale} blog topic is published without locale review policy.`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Indexable translation checks passed.");
