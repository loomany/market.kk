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
  ["sexy", /\bsexy\b/i],
  ["sexual", /\bsexual/i],
  ["erotic", /\berotic\b/i],
  ["nude", /\bnude\b/i],
  ["naked", /\bnaked\b/i],
];

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
}

// ============================================================================
// C) Lingerie external block — <= 350 chars, neutral wording
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(lingerie());
  assert.ok(block.length <= 350, `C external length ${block.length} <= 350`);
  assertNoSensitive(block, "C lingerie external block");
  // Inside the block we don't even include "Preserve …" prefix — builders add it.
  assert.ok(
    !/preserve the visible product/i.test(block),
    "C: block must NOT include 'Preserve the visible product' prefix"
  );
}

// ============================================================================
// D) Dress external block — no lingerie/bra/briefs
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(dress());
  assertNoSensitive(block, "D dress block");
  assert.match(block, /midi dress/i, "D: keeps category");
  assert.match(block, /navy/i, "D: keeps colour");
}

// ============================================================================
// E) Jewelry external block — no garment/body wording
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(jewelry());
  assertNoSensitive(block, "E jewelry block");
  assert.match(block, /hoop/i, "E: keeps category");
  assert.ok(
    !/\bdress\b|\bskirt\b|\bgarment\b/i.test(block),
    "E: no garment wording for jewelry"
  );
}

// ============================================================================
// F) Sneakers external block — no lingerie/body wording
// ============================================================================

{
  const block = buildExternalProductPreservationBlock(sneakers());
  assertNoSensitive(block, "F sneakers block");
  assert.match(block, /sneakers/i, "F: keeps category");
  assert.match(block, /sole/i, "F: keeps sole");
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
