import { writeFileSync } from "node:fs";
import { blogTopics } from "@/data/seo/blogTopics";
import { supportedLocaleCodes } from "@/lib/i18n/localeConfig";

const rows = [
  ["area", "id", "locale", "field", "source_text", "target_text", "status", "notes"],
];

for (const topic of blogTopics) {
  for (const locale of supportedLocaleCodes) {
    rows.push([
      "blog_topic",
      topic.id,
      locale,
      "title",
      topic.title.ru ?? "",
      topic.title[locale] ?? "",
      topic.status[locale],
      "Validate keyword intent before publishing.",
    ]);
  }
}

const csv = rows
  .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
  .join("\n");

writeFileSync("reports/i18n-translation-export.csv", csv, "utf8");
console.log("Wrote reports/i18n-translation-export.csv");
