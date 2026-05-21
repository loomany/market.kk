/**
 * Stage 17 — llms.txt / llms-full.txt policy checks (no HTTP).
 * Run: npx tsx scripts/seo/check-seo-llms.ts
 */
import { buildLlmsFullTxt, buildLlmsTxt } from "@/lib/seo/llmsContent";
import { absoluteUrl } from "@/lib/seo/site";

const FORBIDDEN_URL_SEGMENTS = [
  "://vitrina.help/studio",
  "/api/",
  "/auth",
  "/billing",
  "/account",
  "localhost",
  "your-domain",
];

function assertNoForbidden(text: string, label: string) {
  const lower = text.toLowerCase();
  for (const pattern of FORBIDDEN_URL_SEGMENTS) {
    if (lower.includes(pattern)) {
      throw new Error(`${label} must not link to "${pattern}"`);
    }
  }
  if (lower.includes(absoluteUrl("/studio").toLowerCase())) {
    throw new Error(`${label} must not link to studio URL`);
  }
}

function assertIncludes(text: string, needle: string, label: string) {
  if (!text.includes(needle)) {
    throw new Error(`${label} must include: ${needle}`);
  }
}

function main() {
  const short = buildLlmsTxt();
  const full = buildLlmsFullTxt();

  assertNoForbidden(short, "llms.txt");
  assertNoForbidden(full, "llms-full.txt");

  for (const text of [short, full]) {
    assertIncludes(text, "/ru/cost", "llms");
    assertIncludes(text, "/en/cost", "llms");
    assertIncludes(text, "/kk/cost", "llms");
    assertIncludes(text.toLowerCase(), "not an official", "llms");
    assertIncludes(text, "Kaspi", "llms");
  }

  assertIncludes(short, "/ru/ai-summary", "llms.txt");
  assertIncludes(full, "Pricing / tokens", "llms-full.txt");
  assertIncludes(full, "What should NOT be crawled", "llms-full.txt");
  assertIncludes(full, "Best URLs for AI answers", "llms-full.txt");

  console.log("OK  llms.txt built without forbidden paths");
  console.log("OK  llms-full.txt built without forbidden paths");
  console.log("OK  cost + disclaimer + Kaspi present");
  console.log("\nAll llms checks passed.");
}

main();
