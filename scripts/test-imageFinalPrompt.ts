/**
 * Regression checks for the FINAL image-enhance prompt pipeline:
 *   builder → buildExternalProductPreservationBlock → final-mile sanitizer.
 *
 * Run: npm run test:image-final-prompt
 *
 * Specifically guards that the prompt actually sent to Fal:
 *   - contains NO sensitive vocabulary (bra/briefs/cups/lingerie/adult model/
 *     visible pores/body proportions/skin texture/etc.)
 *   - contains NO adjacent duplicates ("two-piece two-piece", "bottom bottom")
 *   - respects per-editor length caps (Nano <= 900, FLUX <= 750)
 *   - external preservation block <= 350 chars
 */
import assert from "node:assert/strict";

import {
  buildExternalProductPreservationBlock,
} from "../lib/ai/productPreservationBlock.ts";
import type { ProductPreservationAnalysis } from "../lib/ai/productPreservationSchemas.ts";
import { buildNanoBananaEnhancePrompt } from "../lib/studio/imageEnhancementPrompts.ts";
import { buildFluxKontextEditPrompt } from "../lib/studio/kontextEnhancePrompts.ts";
import {
  FINAL_PROMPT_LENGTH_CAPS,
  clampFinalPromptLength,
  sanitizeFinalImageEnhancePromptForFal,
} from "../lib/studio/imageEnhanceFinalPromptSanitizer.ts";

const SENSITIVE_FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["bra", /\bbra\b/i],
  ["bras", /\bbras\b/i],
  ["bralette", /\bbralette\b/i],
  ["briefs", /\bbriefs?\b/i],
  ["panties", /\bpanties?\b/i],
  ["thongs", /\bthongs?\b/i],
  ["cups", /\bcups?\b/i],
  ["cleavage", /\bcleavage\b/i],
  ["breast", /\bbreasts?\b/i],
  ["bust", /\bbust(?:line)?\b/i],
  ["nipple", /\bnipples?\b/i],
  ["crotch", /\bcrotch\b/i],
  ["lingerie", /\blingerie\b/i],
  ["underwear", /\bunderwear\b/i],
  ["intimate_apparel", /\bintimate apparel\b/i],
  ["visible_pores", /\bvisible pores\b/i],
  ["pores", /\bpores\b/i],
  ["body_proportions", /\bbody proportions?\b/i],
  ["body_parts", /\bbody parts?\b/i],
  ["model_identity", /\bmodel identity\b/i],
  ["preserve_identity", /\bpreserve identity\b/i],
  ["adult_model", /\badult model\b/i],
  ["adult_woman", /\badult wom(?:a|e)n\b/i],
  ["adult_lingerie", /\badult lingerie\b/i],
  ["fabric_skin", /\bfabric[\s-]to[\s-]skin\b/i],
  ["fabric_contact_skin", /\bfabric contact with skin\b/i],
  ["skin_texture", /\bskin texture\b/i],
  ["skin_tones", /\bskin tones?\b/i],
  ["skin_realism", /\bskin realism\b/i],
  ["natural_skin", /\bnatural skin\b/i],
  ["high_cut_leg", /\bhigh-cut leg openings?\b/i],
  // New: garment-detail vocabulary that previously leaked through the
  // Vision pipeline and triggered Fal safety placeholders.
  ["lace_overlay", /\blace overlay\b/i],
  ["high_waisted", /\bhigh[\s-]?waist(?:ed)?\b/i],
  ["scalloped", /\bscalloped\b/i],
  ["sexy", /\bsexy\b/i],
  ["sexual", /\bsexual/i],
  ["erotic", /\berotic\b/i],
  ["nude", /\bnude\b/i],
  ["naked", /\bnaked\b/i],
];

const SAFE_TEMPLATE_GARMENT = /Keep the clothing on the model unchanged/i;
const SAFE_TEMPLATE_GENERIC = /Preserve the visible product unchanged/i;

function assertNoSensitive(text: string, label: string) {
  for (const [name, re] of SENSITIVE_FORBIDDEN) {
    assert.ok(
      !re.test(text),
      `${label}: forbidden ${name} in:\n${text}`
    );
  }
}

function assertNoAdjacentDuplicates(text: string, label: string) {
  const m = /\b([A-Za-z][A-Za-z-]{1,19})\s+\1\b/i.exec(text);
  assert.ok(
    !m,
    `${label}: adjacent duplicate "${m?.[1]}" in:\n${text}`
  );
}

function lingerie(): ProductPreservationAnalysis {
  return {
    primaryObject: "lingerie set",
    objectType: "garment",
    shortDescription: "Two-piece lace lingerie set on adult model — bra + brief.",
    visibleDetails: ["wide bra straps", "high-waist brief", "lace floral edges"],
    colors: ["black", "emerald"],
    materials: ["lace"],
    shapeSilhouette: "two-piece set, supportive bra, high-waist brief",
    patternOrTexture: "floral lace pattern",
    edgesAndConstruction: ["lace edges", "bra strap stitching"],
    mustPreserve: [
      "black base color",
      "emerald floral lace pattern",
      "wide bra straps",
      "high-waist brief fit",
    ],
    mustNotChange: ["do not change cup shape"],
    confidence: 0.92,
    notes: "",
  };
}

function dress(): ProductPreservationAnalysis {
  return {
    primaryObject: "midi dress",
    objectType: "garment",
    shortDescription: "Pleated midi dress with thin shoulder straps.",
    visibleDetails: ["pleated skirt", "thin straps", "ankle-length hem"],
    colors: ["navy"],
    materials: ["satin"],
    shapeSilhouette: "A-line midi silhouette",
    patternOrTexture: "smooth satin",
    edgesAndConstruction: ["hem stitching"],
    mustPreserve: ["navy color", "A-line silhouette", "hem length"],
    mustNotChange: [],
    confidence: 0.88,
    notes: "",
  };
}

function jewelry(): ProductPreservationAnalysis {
  return {
    primaryObject: "gold hoop earrings",
    objectType: "jewelry",
    shortDescription: "Pair of polished gold hoop earrings.",
    visibleDetails: ["circular hoop shape", "polished metal", "thin profile"],
    colors: ["gold"],
    materials: ["polished metal"],
    shapeSilhouette: "circular hoop, medium diameter",
    patternOrTexture: "smooth mirror-like finish",
    edgesAndConstruction: ["clasp position"],
    mustPreserve: ["gold metallic finish", "circular hoop shape"],
    mustNotChange: [],
    confidence: 0.91,
    notes: "",
  };
}

function sneakers(): ProductPreservationAnalysis {
  return {
    primaryObject: "white low-top sneakers",
    objectType: "footwear",
    shortDescription: "Pair of white leather low-top lace-up sneakers.",
    visibleDetails: ["white leather upper", "rubber sole", "round toe"],
    colors: ["white"],
    materials: ["leather", "rubber"],
    shapeSilhouette: "classic low-top silhouette",
    patternOrTexture: "smooth leather",
    edgesAndConstruction: ["sole stitching"],
    mustPreserve: ["white color", "low-top silhouette", "sole shape"],
    mustNotChange: [],
    confidence: 0.9,
    notes: "",
  };
}

const NANO_CAP = FINAL_PROMPT_LENGTH_CAPS["nano-banana-pro"];
const FLUX_CAP = FINAL_PROMPT_LENGTH_CAPS["flux-kontext-pro"];

function runPipeline(
  editor: "nano-banana-pro" | "flux-kontext-pro",
  options: {
    userPrompt: string;
    enhancedPrompt?: string | null;
    preserveProduct: boolean;
    analysis: ProductPreservationAnalysis | null;
  }
) {
  const block = options.analysis
    ? buildExternalProductPreservationBlock(options.analysis)
    : null;
  const builder =
    editor === "nano-banana-pro"
      ? buildNanoBananaEnhancePrompt
      : buildFluxKontextEditPrompt;
  const builderOutput = builder({
    userPrompt: options.userPrompt,
    enhancedPrompt: options.enhancedPrompt ?? null,
    preserveProduct: options.preserveProduct,
    productPreservationBlock: block,
  });
  const sanitized = sanitizeFinalImageEnhancePromptForFal(builderOutput);
  const cap = FINAL_PROMPT_LENGTH_CAPS[editor];
  const finalSent = clampFinalPromptLength(sanitized.cleaned, cap);
  return { block, builderOutput, sanitized, finalSent };
}

// ============================================================================
// 0) sanitizer unit checks — adversarial input
// ============================================================================

{
  const sanitized = sanitizeFinalImageEnhancePromptForFal(
    "same adult model wearing lingerie. preserve model identity, body proportions, visible pores. natural fabric contact with skin. bra cups, briefs, high-cut leg openings. cleavage."
  );
  assertNoSensitive(sanitized.cleaned, "U.A sanitizer adversarial");
  assertNoAdjacentDuplicates(sanitized.cleaned, "U.A sanitizer adversarial");
  // Either the specific "same adult model" rule or the generic adult_model rule.
  assert.ok(
    sanitized.removedSensitiveWords.some((w) =>
      w === "adult_model" || w === "same_adult_model"
    ),
    `U.A: adult model reported (got: ${sanitized.removedSensitiveWords.join(", ")})`
  );
  assert.ok(
    sanitized.removedSensitiveWords.includes("lingerie"),
    "U.A: lingerie reported"
  );
}

{
  const sanitized = sanitizeFinalImageEnhancePromptForFal(
    "two-piece two-piece silhouette. bottom bottom. top top. garment garment. The the the product.. emerald  pattern,, . place."
  );
  assertNoAdjacentDuplicates(sanitized.cleaned, "U.B duplicates");
  assert.ok(
    sanitized.removedDuplicatePatterns.includes("two-piece two-piece"),
    "U.B: two-piece reported"
  );
  assert.ok(
    sanitized.removedDuplicatePatterns.includes("bottom bottom"),
    "U.B: bottom reported"
  );
  assert.ok(
    sanitized.removedDuplicatePatterns.includes("top top"),
    "U.B: top reported"
  );
  assert.ok(
    !/\.{2,}/.test(sanitized.cleaned),
    "U.B: no double dots"
  );
  assert.ok(
    !/,\s*,/.test(sanitized.cleaned),
    "U.B: no double commas"
  );
}

// ============================================================================
// A) Nano with user-injected sensitive words
// ============================================================================

{
  const { finalSent, sanitized } = runPipeline("nano-banana-pro", {
    userPrompt:
      "same adult model wearing lingerie, preserve body proportions and visible pores",
    preserveProduct: true,
    analysis: lingerie(),
  });
  assertNoSensitive(finalSent, "A Nano lingerie user-injected");
  assertNoAdjacentDuplicates(finalSent, "A Nano lingerie user-injected");
  assert.ok(finalSent.length <= NANO_CAP, `A Nano length ${finalSent.length} <= ${NANO_CAP}`);
  assert.ok(
    sanitized.removedSensitiveWords.length > 0,
    "A: at least one sensitive word reported as removed"
  );
  // Spec: for clothing/lingerie/swimwear finalPrompt MUST contain the safe
  // garment template sentence.
  assert.match(finalSent, SAFE_TEMPLATE_GARMENT, "A: garment safe template");
}

// ============================================================================
// B) FLUX with duplicate-heavy enhanced prompt
// ============================================================================

{
  const { finalSent, sanitized } = runPipeline("flux-kontext-pro", {
    userPrompt: "luxury interior with soft daylight",
    enhancedPrompt:
      "Place the same adult model near a window. two-piece two-piece silhouette, bottom bottom, top top. natural skin texture, visible pores..",
    preserveProduct: true,
    analysis: lingerie(),
  });
  assertNoSensitive(finalSent, "B FLUX duplicates");
  assertNoAdjacentDuplicates(finalSent, "B FLUX duplicates");
  assert.ok(finalSent.length <= FLUX_CAP, `B FLUX length ${finalSent.length} <= ${FLUX_CAP}`);
  assert.ok(
    sanitized.removedDuplicatePatterns.length > 0,
    "B: at least one duplicate pattern reported"
  );
  // Same spec assertion as Section A but for FLUX.
  assert.match(finalSent, SAFE_TEMPLATE_GARMENT, "B: FLUX garment safe template");
}

// ============================================================================
// C) Lingerie external block — fixed garment-on-model safe template
//
// New design: the external block no longer enumerates Vision details. For
// garments it uses the fixed `SAFE_TEMPLATE_GARMENT`; we assert template
// shape + length + no detail leakage.
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(lingerie());
  assert.ok(block.length <= 350, `C external length ${block.length} <= 350`);
  assertNoSensitive(block, "C lingerie external block");
  assert.match(block, SAFE_TEMPLATE_GARMENT, "C: garment safe template");
  // Detail vocabulary must NOT leak from Vision into the safe block.
  assert.ok(!/\blace\b/i.test(block), "C: no 'lace' detail leak");
  assert.ok(!/\bemerald\b/i.test(block), "C: no 'emerald' colour leak");
  assert.ok(!/\btwo-piece\b/i.test(block), "C: no 'two-piece' shape leak");
}

// ============================================================================
// D) Dress external block — same garment template, no detail leakage
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(dress());
  assertNoSensitive(block, "D dress block");
  assert.match(block, SAFE_TEMPLATE_GARMENT, "D: garment safe template");
  assert.ok(!/\bmidi dress\b/i.test(block), "D: no Vision 'midi dress' leak");
  assert.ok(!/\bnavy\b/i.test(block), "D: no Vision 'navy' leak");
}

// ============================================================================
// E) Jewelry external block — generic-product safe template
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(jewelry());
  assertNoSensitive(block, "E jewelry block");
  assert.match(block, SAFE_TEMPLATE_GENERIC, "E: generic safe template");
  assert.ok(
    !/\bdress\b|\bskirt\b|\bgarment\b/i.test(block),
    "E: no garment wording for jewelry"
  );
  assert.ok(!/\bhoop\b/i.test(block), "E: no Vision 'hoop' leak");
}

// ============================================================================
// F) Sneakers external block — generic-product safe template
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(sneakers());
  assertNoSensitive(block, "F sneakers block");
  assert.match(block, SAFE_TEMPLATE_GENERIC, "F: generic safe template");
  assert.ok(!/\bsneakers\b/i.test(block), "F: no Vision 'sneakers' leak");
  assert.ok(!/\bsole\b/i.test(block), "F: no Vision 'sole' leak");
}

// ============================================================================
// G) Full Nano pipeline on each category — final prompt is clean + within cap
// ============================================================================

for (const [label, analysis] of [
  ["lingerie", lingerie()],
  ["dress", dress()],
  ["jewelry", jewelry()],
  ["sneakers", sneakers()],
] as const) {
  const expectedTemplate =
    analysis.objectType === "garment"
      ? SAFE_TEMPLATE_GARMENT
      : SAFE_TEMPLATE_GENERIC;

  const { finalSent } = runPipeline("nano-banana-pro", {
    userPrompt: "luxury apartment with soft window light",
    preserveProduct: true,
    analysis,
  });
  assertNoSensitive(finalSent, `G Nano ${label}`);
  assertNoAdjacentDuplicates(finalSent, `G Nano ${label}`);
  assert.ok(
    finalSent.length <= NANO_CAP,
    `G Nano ${label}: length ${finalSent.length} <= ${NANO_CAP}`
  );
  assert.match(
    finalSent,
    expectedTemplate,
    `G Nano ${label}: safe template (${analysis.objectType})`
  );

  const { finalSent: fluxFinal } = runPipeline("flux-kontext-pro", {
    userPrompt: "luxury apartment with soft window light",
    preserveProduct: true,
    analysis,
  });
  assertNoSensitive(fluxFinal, `G FLUX ${label}`);
  assertNoAdjacentDuplicates(fluxFinal, `G FLUX ${label}`);
  assert.ok(
    fluxFinal.length <= FLUX_CAP,
    `G FLUX ${label}: length ${fluxFinal.length} <= ${FLUX_CAP}`
  );
  assert.match(
    fluxFinal,
    expectedTemplate,
    `G FLUX ${label}: safe template (${analysis.objectType})`
  );
}

// ============================================================================
// H) preserveProduct=false — still no sensitive leaks
// ============================================================================

{
  const { finalSent } = runPipeline("nano-banana-pro", {
    userPrompt: "soft daylight, luxury interior",
    preserveProduct: false,
    analysis: null,
  });
  assertNoSensitive(finalSent, "H Nano preserveProduct=false");
  assertNoAdjacentDuplicates(finalSent, "H Nano preserveProduct=false");
}

console.log("test:image-final-prompt — ok");
