import { blogTopics } from "@/data/seo/blogTopics";
import { platformPages } from "@/data/seo/platforms";
import { staticSeoPages } from "@/data/seo/staticPages";
import { useCasePages } from "@/data/seo/useCases";
import {
  supportedLocaleCodes,
  type Locale,
  type TranslationStatus,
} from "@/lib/i18n/localeConfig";
import { localeTranslationStatus } from "@/lib/i18n/translations";

type MissingRow = {
  area: string;
  id: string;
  locale: Locale;
  status: TranslationStatus | string;
};

const rows: MissingRow[] = [];

for (const locale of supportedLocaleCodes) {
  if (localeTranslationStatus[locale] !== "published") {
    rows.push({ area: "landing", id: "home", locale, status: localeTranslationStatus[locale] });
  }
}

for (const page of staticSeoPages) {
  for (const locale of supportedLocaleCodes) {
    if (page.content[locale].status !== "published") {
      rows.push({ area: page.kind, id: page.key, locale, status: page.content[locale].status });
    }
  }
}

for (const page of platformPages) {
  for (const locale of supportedLocaleCodes) {
    if (page.content[locale].status !== "published") {
      rows.push({ area: "platform", id: page.id, locale, status: page.content[locale].status });
    }
  }
}

for (const page of useCasePages) {
  for (const locale of supportedLocaleCodes) {
    if (page.content[locale].status !== "published") {
      rows.push({ area: "use-case", id: page.id, locale, status: page.content[locale].status });
    }
  }
}

for (const topic of blogTopics) {
  for (const locale of supportedLocaleCodes) {
    if (topic.status[locale] !== "published") {
      rows.push({ area: "blog", id: topic.id, locale, status: topic.status[locale] });
    }
  }
}

console.table(rows);
console.log(`Missing or non-published translation units: ${rows.length}`);
