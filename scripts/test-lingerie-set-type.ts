/**
 * Unit tests: lingerieSetType resolver + Try-On Max / Edit / Repair prompts.
 * Run: npm run test:lingerie-set-type
 */
import assert from "node:assert/strict";

import { mockLingerieSetOnModelAnalysis } from "../lib/ai/mockLingerieProductAnalysis.ts";
import { buildFashnGarmentPrepPrompt } from "../lib/ai/fashnGarmentPrepPrompt.ts";
import { buildFashnTryOnMaxPrompt } from "../lib/ai/fashnTryOnMaxPrompt.ts";
import { buildTryOnRepairPrompt } from "../lib/ai/tryOnRepairPrompt.ts";
import {
  inferLingerieSetTypeFromText,
  resolveLingerieSetType,
} from "../lib/ai/lingerieSetType.ts";
import type { ProductDescriptionAnalysis } from "../lib/ai/productDescriptionAnalysisSchemas.ts";

function testTextInference() {
  const twoPiece = inferLingerieSetTypeFromText(
    "black bra and high-waisted brief with visible skin gap between top and bottom"
  );
  assert.equal(twoPiece.lingerieSetType, "bra_brief_set");

  const bodysuit = inferLingerieSetTypeFromText("one-piece bodysuit lingerie");
  assert.equal(bodysuit.lingerieSetType, "bodysuit");

  const braOnly = inferLingerieSetTypeFromText("bra only product photo");
  assert.equal(braOnly.lingerieSetType, "bra_only");

  const briefOnly = inferLingerieSetTypeFromText("high-waisted brief only");
  assert.equal(briefOnly.lingerieSetType, "brief_only");

  const unknown = inferLingerieSetTypeFromText("generic apparel item");
  assert.equal(unknown.lingerieSetType, "unknown");

  console.log("[ok] lingerieSetType text inference");
}

function testResolverFromAnalysis() {
  const analysis = mockLingerieSetOnModelAnalysis();
  const resolved = resolveLingerieSetType(analysis);
  assert.equal(resolved.lingerieSetType, "bra_brief_set");
  assert.ok(resolved.lingerieSetTypeConfidence >= 0.55);
  console.log("[ok] resolveLingerieSetType from mock analysis");
}

function testTryOnMaxPromptBraBriefSet() {
  const analysis = mockLingerieSetOnModelAnalysis();
  const result = buildFashnTryOnMaxPrompt({ productAnalysis: analysis });

  assert.match(result.prompt, /TWO-PIECE lingerie set/i);
  assert.match(result.prompt, /separate bra/i);
  assert.match(result.prompt, /separate high-waisted brief/i);
  assert.match(result.prompt, /Do NOT turn it into a bodysuit/i);
  assert.match(result.prompt, /visible natural skin gap/i);
  assert.equal(result.garmentTypeLockApplied, true);
  assert.equal(result.antiOnePieceApplied, true);
  assert.doesNotMatch(result.prompt, /one-piece garment\. Do not split/i);

  const sentences = result.prompt.split(".").filter(Boolean);
  assert.ok(sentences.length <= 3, "prompt should stay compact (<=3 sentences)");

  console.log("[ok] Try-On Max prompt for bra_brief_set");
}

function testTryOnMaxPromptBodysuit() {
  const analysis: ProductDescriptionAnalysis = {
    ...mockLingerieSetOnModelAnalysis(),
    lingerieSetType: "bodysuit",
    lingerieSetTypeConfidence: 0.9,
    lingerieSetTypeReason: "Connected top and bottom without skin gap.",
    bra: { present: true, style: "bodysuit top", cupShape: null, straps: null },
    bottoms: { present: true, style: "bodysuit bottom", rise: null },
  };
  const result = buildFashnTryOnMaxPrompt({ productAnalysis: analysis });
  assert.match(result.prompt, /ONE-PIECE bodysuit/i);
  assert.doesNotMatch(result.prompt, /visible natural skin gap between the bra/i);
  console.log("[ok] Try-On Max prompt for bodysuit");
}

function testTryOnMaxPromptUnknownRegression() {
  const analysis: ProductDescriptionAnalysis = {
    ...mockLingerieSetOnModelAnalysis(),
    categoryContext: "clothing",
    lingerieSetType: "unknown",
    lingerieSetTypeConfidence: 0.2,
    lingerieSetTypeReason: "Not lingerie.",
  };
  const result = buildFashnTryOnMaxPrompt({ productAnalysis: analysis });
  assert.match(result.prompt, /Do not change a two-piece set into a one-piece/i);
  console.log("[ok] unknown/generic Try-On Max prompt regression");
}

function testEditPromptAntiMerge() {
  const analysis = mockLingerieSetOnModelAnalysis();
  const edit = buildFashnGarmentPrepPrompt({ productAnalysis: analysis });
  assert.match(edit.prompt, /TWO-PIECE lingerie set/i);
  assert.match(edit.prompt, /Do not connect, merge, or convert/i);
  assert.equal(edit.antiOnePieceApplied, true);
  console.log("[ok] Edit prompt anti-merge for bra_brief_set");
}

function testRepairPromptAntiBodysuit() {
  const analysis = mockLingerieSetOnModelAnalysis();
  const repair = buildTryOnRepairPrompt(analysis);
  assert.match(repair, /TWO-PIECE set/i);
  assert.match(repair, /Do not turn it into a bodysuit/i);
  assert.match(repair, /visible natural skin gap/i);
  console.log("[ok] Repair prompt two-piece lock");
}

function main() {
  testTextInference();
  testResolverFromAnalysis();
  testTryOnMaxPromptBraBriefSet();
  testTryOnMaxPromptBodysuit();
  testTryOnMaxPromptUnknownRegression();
  testEditPromptAntiMerge();
  testRepairPromptAntiBodysuit();
  console.log("\nAll lingerie set type unit checks passed.");
}

main();
