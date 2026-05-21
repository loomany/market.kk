/**
 * One-time merge: splices EN remaining + KK_COPY into audience-pages-copy.mjs
 * Run: node scripts/seo/_merge-audience-copy.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.join(__dirname, "audience-pages-copy.mjs");
const supPath = path.join(__dirname, "_audience-copy-supplement.mjs");

const main = fs.readFileSync(mainPath, "utf8");
const { EN_REMAINING_ENTRIES, KK_COPY } = await import("./_audience-copy-supplement.mjs");

const marker =
  '      { question: "Do we need a pro studio?", answer: "Often a phone and even light are enough to start. Premium categories and complex macro may still need studio or photographer." },\n    ],\n  },\n};';

if (!main.includes(marker)) {
  throw new Error("EN_COPY end marker not found");
}

const kkBlock =
  "export const KK_COPY = " +
  JSON.stringify(KK_COPY, null, 2)
    .replace(/"title":/g, "title:")
    .replace(/"body":/g, "body:")
    .replace(/"question":/g, "question:")
    .replace(/"answer":/g, "answer:")
    .replace(/"meta":/g, "meta:")
    .replace(/"intro":/g, "intro:")
    .replace(/"sections":/g, "sections:")
    .replace(/"forWho":/g, "forWho:")
    .replace(/"tasks":/g, "tasks:")
    .replace(/"howHelps":/g, "howHelps:")
    .replace(/"scenarios":/g, "scenarios:")
    .replace(/"limitations":/g, "limitations:")
    .replace(/"faq":/g, "faq:");

// JSON approach loses sec() - supplement must export KK as raw JS string instead
console.error("Use supplement with raw KK string export");
