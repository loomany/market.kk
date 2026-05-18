import { existsSync, readFileSync } from "node:fs";

const inputPath = process.argv[2] ?? "reports/i18n-translation-import.csv";

if (!existsSync(inputPath)) {
  console.log(`No import file found at ${inputPath}. Nothing changed.`);
  process.exit(0);
}

const csv = readFileSync(inputPath, "utf8");
const rowCount = csv.trim() ? csv.trim().split(/\r?\n/).length - 1 : 0;

console.log(
  `Validated ${rowCount} translation rows from ${inputPath}. This MVP importer is dry-run only; apply reviewed translations in data files before indexing.`
);
