/**
 * Regression checks for dynamic product preservation block + builders.
 * Run: npm run test:product-preservation
 */
import assert from "node:assert/strict";
import {
  buildExternalProductPreservationBlock,
  buildProductPreservationBlock,
  genericExternalPreservationBlock,
  genericPreservationBlock,
  sanitizeForExternalPrompt,
} from "../lib/ai/productPreservationBlock.ts";
import type { ProductPreservationAnalysis } from "../lib/ai/productPreservationSchemas.ts";
import { buildNanoBananaEnhancePrompt } from "../lib/studio/imageEnhancementPrompts.ts";
import { buildFluxKontextEditPrompt } from "../lib/studio/kontextEnhancePrompts.ts";

/** Words that must NEVER appear in a SAFE external block or final prompt. */
const SENSITIVE_FORBIDDEN: readonly RegExp[] = [
  /\bbra\b/i,
  /\bbras\b/i,
  /\bbralette\b/i,
  /\bbriefs?\b/i,
  /\bpanties?\b/i,
  /\bthongs?\b/i,
  /\bcups?\b/i,
  /\bcleavage\b/i,
  /\bbreasts?\b/i,
  /\bbust(?:line)?\b/i,
  /\bnipples?\b/i,
  /\bcrotch\b/i,
  /\bgroin\b/i,
  /\blingerie\b/i,
  /\bunderwear\b/i,
  /\bintimate apparel\b/i,
  /\bvisible pores\b/i,
  /\bpores\b/i,
  /\bbody proportions?\b/i,
  /\bbody parts?\b/i,
  /\bmodel identity\b/i,
  /\bpreserve identity\b/i,
  /\bfabric[\s-]to[\s-]skin\b/i,
  /\bfabric contact with skin\b/i,
  /\bskin texture\b/i,
  /\bskin tones?\b/i,
  /\bskin realism\b/i,
  /\badult model\b/i,
  /\bhigh-cut leg openings?\b/i,
  /\bsexual/i,
  /\bsexy\b/i,
  /\bnaked\b/i,
];

function assertNoSensitive(text: string, label: string) {
  for (const re of SENSITIVE_FORBIDDEN) {
    assert.ok(
      !re.test(text),
      `${label}: forbidden sensitive pattern ${re} in:\n${text}`
    );
  }
}

const LINGERIE_HARDCODE = [
  /\bbra\b/i,
  /\bbriefs\b/i,
  /\blingerie\b/i,
  /\bcups\b/i,
];
const GARMENT_HARDCODE = [/\bdress\b/i, /\bskirt\b/i];
const FOOTWEAR_HARDCODE = [/\bsneakers\b/i, /\bsole\b/i];
const JEWELRY_HARDCODE = [/\bearring/i];

function assertNotMatches(
  text: string,
  patterns: readonly RegExp[],
  label: string
) {
  for (const re of patterns) {
    assert.ok(
      !re.test(text),
      `${label}: forbidden pattern ${re} in:\n${text}`
    );
  }
}

function lingerieAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "lingerie set",
    objectType: "garment",
    shortDescription:
      "Two-piece lace lingerie set on model — bra + high-waist brief.",
    visibleDetails: ["wide bra straps", "high-waist brief", "lace floral edges"],
    colors: ["black", "emerald"],
    materials: ["lace"],
    shapeSilhouette: "two-piece set, supportive bra, high-waist brief",
    patternOrTexture: "floral lace pattern",
    edgesAndConstruction: ["lace edges", "bra strap stitching"],
    mustPreserve: [
      "black base color",
      "emerald floral lace pattern",
      "lace texture",
      "wide bra straps",
      "high-waist brief fit",
    ],
    mustNotChange: ["do not change strap width", "do not flatten cup shape"],
    confidence: 0.92,
    notes: "",
  };
}

function dressAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "midi dress",
    objectType: "garment",
    shortDescription: "Pleated midi dress with thin shoulder straps.",
    visibleDetails: ["pleated skirt", "thin straps", "ankle-length hem"],
    colors: ["navy"],
    materials: ["satin"],
    shapeSilhouette: "A-line midi silhouette",
    patternOrTexture: "smooth satin",
    edgesAndConstruction: ["hem stitching", "side seam"],
    mustPreserve: [
      "navy color",
      "A-line silhouette",
      "pleated skirt structure",
      "hem length",
    ],
    mustNotChange: ["do not change neckline", "do not alter hem length"],
    confidence: 0.88,
    notes: "",
  };
}

function jewelryAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "gold hoop earrings",
    objectType: "jewelry",
    shortDescription:
      "Pair of medium-sized polished gold hoop earrings worn on the model.",
    visibleDetails: ["circular hoop shape", "polished metal", "thin profile"],
    colors: ["gold"],
    materials: ["polished metal"],
    shapeSilhouette: "perfect circular hoop, medium diameter",
    patternOrTexture: "smooth mirror-like finish",
    edgesAndConstruction: ["clasp position", "even hoop thickness"],
    mustPreserve: [
      "gold metallic finish",
      "circular hoop shape",
      "hoop size",
      "clasp placement on the earlobe",
    ],
    mustNotChange: [
      "do not change metal color",
      "do not bend the hoop shape",
    ],
    confidence: 0.91,
    notes: "",
  };
}

function sneakersAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "white low-top sneakers",
    objectType: "footwear",
    shortDescription:
      "Pair of white leather low-top lace-up sneakers with rubber sole.",
    visibleDetails: [
      "white leather upper",
      "rubber sole",
      "round toe",
      "white laces",
    ],
    colors: ["white"],
    materials: ["leather", "rubber"],
    shapeSilhouette: "classic low-top silhouette",
    patternOrTexture: "smooth leather, ribbed sole texture",
    edgesAndConstruction: ["sole stitching", "tongue shape"],
    mustPreserve: [
      "white color",
      "low-top silhouette",
      "sole shape and thickness",
      "lace pattern",
      "logo placement",
    ],
    mustNotChange: ["do not change sole shape", "do not alter toe profile"],
    confidence: 0.9,
    notes: "",
  };
}

function unknownAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "",
    objectType: "unknown",
    shortDescription: "",
    visibleDetails: [],
    colors: [],
    materials: [],
    shapeSilhouette: "",
    patternOrTexture: "",
    edgesAndConstruction: [],
    mustPreserve: [],
    mustNotChange: [],
    confidence: 0.3,
    notes: "",
  };
}

function expectGenericBlock(block: string, label: string) {
  assert.match(block, /preserve the visible product exactly/i, `${label}: generic phrase`);
  assertNotMatches(block, LINGERIE_HARDCODE, `${label} lingerie`);
  assertNotMatches(block, FOOTWEAR_HARDCODE, `${label} footwear`);
  assertNotMatches(block, JEWELRY_HARDCODE, `${label} jewelry`);
}

// === 1) Pure block helper ===

{
  const lingerie = buildProductPreservationBlock(lingerieAnalysis());
  assert.match(lingerie, /lingerie set/i, "A: head includes primaryObject");
  assert.match(lingerie, /black/i, "A: colors");
  assert.match(lingerie, /lace/i, "A: lace from Vision");
  assert.match(lingerie, /wide bra straps/i, "A: mustPreserve item");
}

{
  const dress = buildProductPreservationBlock(dressAnalysis());
  assert.match(dress, /midi dress/i, "B: dress head");
  assert.match(dress, /A-line/i, "B: silhouette");
  assertNotMatches(dress, LINGERIE_HARDCODE, "B: no lingerie");
  assertNotMatches(dress, FOOTWEAR_HARDCODE, "B: no footwear");
  assertNotMatches(dress, JEWELRY_HARDCODE, "B: no jewelry");
}

{
  const jewelry = buildProductPreservationBlock(jewelryAnalysis());
  assert.match(jewelry, /hoop/i, "C: jewelry head");
  assert.match(jewelry, /gold/i, "C: color");
  assertNotMatches(jewelry, LINGERIE_HARDCODE, "C: no lingerie");
  assertNotMatches(jewelry, GARMENT_HARDCODE, "C: no garment");
  assertNotMatches(jewelry, FOOTWEAR_HARDCODE, "C: no footwear");
}

{
  const sneakers = buildProductPreservationBlock(sneakersAnalysis());
  assert.match(sneakers, /sneakers/i, "D: sneakers head");
  assert.match(sneakers, /sole/i, "D: sole");
  assertNotMatches(sneakers, LINGERIE_HARDCODE, "D: no lingerie");
  assertNotMatches(sneakers, JEWELRY_HARDCODE, "D: no jewelry");
}

{
  const unknown = buildProductPreservationBlock(unknownAnalysis());
  expectGenericBlock(unknown, "E unknown");
}

{
  const low = buildProductPreservationBlock({
    ...lingerieAnalysis(),
    confidence: 0.4,
  });
  expectGenericBlock(low, "low-confidence");
}

{
  const nullBlock = buildProductPreservationBlock(null);
  expectGenericBlock(nullBlock, "null analysis");
}

{
  assert.equal(
    buildProductPreservationBlock(lingerieAnalysis(), { forceGeneric: true }),
    genericPreservationBlock(),
    "forceGeneric returns generic"
  );
}

// === 1b) External SAFE block — strips sensitive vocabulary ===

{
  const safe = buildExternalProductPreservationBlock(lingerieAnalysis());
  assertNoSensitive(safe, "ext.A lingerie");
  // semantic identity preserved through neutral wording
  assert.match(
    safe,
    /two-piece fashion garment|fashion garment|garment top|garment bottom|visible fashion product/i,
    "ext.A: neutralised category present"
  );
  assert.match(safe, /black/i, "ext.A: color preserved");
  assert.match(safe, /lace/i, "ext.A: material preserved (lace is allowed)");
  assert.ok(safe.length <= 450, `ext.A: length ${safe.length} <= 450`);
}

{
  const safe = buildExternalProductPreservationBlock(dressAnalysis());
  assertNoSensitive(safe, "ext.B dress");
  assert.match(safe, /midi dress/i, "ext.B: dress category preserved");
  assert.match(safe, /navy/i, "ext.B: color preserved");
}

{
  const safe = buildExternalProductPreservationBlock(jewelryAnalysis());
  assertNoSensitive(safe, "ext.C jewelry");
  assert.match(safe, /hoop/i, "ext.C: category preserved");
  assertNotMatches(safe, GARMENT_HARDCODE, "ext.C: no garment");
  assertNotMatches(safe, FOOTWEAR_HARDCODE, "ext.C: no footwear");
}

{
  const safe = buildExternalProductPreservationBlock(sneakersAnalysis());
  assertNoSensitive(safe, "ext.D sneakers");
  assert.match(safe, /sneakers/i, "ext.D: sneakers preserved");
  assert.match(safe, /sole/i, "ext.D: sole preserved");
}

{
  const safe = buildExternalProductPreservationBlock(unknownAnalysis());
  assertNoSensitive(safe, "ext.E unknown");
  assert.equal(
    safe,
    genericExternalPreservationBlock(),
    "ext.E: unknown → generic external"
  );
}

{
  const safe = buildExternalProductPreservationBlock({
    ...lingerieAnalysis(),
    confidence: 0.4,
  });
  assert.equal(
    safe,
    genericExternalPreservationBlock(),
    "ext low-confidence → generic"
  );
}

// sanitizer regression — adversarial Vision text
{
  const raw =
    "Preserve the visible product exactly: bra cups, briefs, lingerie set; visible pores; body proportions; fabric contact with skin; preserve model identity. Adult lingerie catalog photo.";
  const cleaned = sanitizeForExternalPrompt(raw);
  assertNoSensitive(cleaned, "sanitizer adversarial");
}

// === 2) Builders integration — no hardcoded category words remain ===

const baseBuilderInput = {
  userPrompt: "Place same woman near window in luxury interior",
  enhancedPrompt: null,
  preserveProduct: true,
};

// Nano + dress block: no lingerie words leak from the template
{
  const block = buildProductPreservationBlock(dressAnalysis());
  const prompt = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: block,
  });
  assertNotMatches(prompt, LINGERIE_HARDCODE, "Nano + dress: no lingerie");
  assertNotMatches(prompt, FOOTWEAR_HARDCODE, "Nano + dress: no footwear");
  assertNotMatches(prompt, JEWELRY_HARDCODE, "Nano + dress: no jewelry");
  assert.match(prompt, /midi dress/i, "Nano + dress: includes dress head");
}

// FLUX + sneakers block: no lingerie/lace words from template
{
  const block = buildProductPreservationBlock(sneakersAnalysis());
  const prompt = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: block,
  });
  assertNotMatches(prompt, LINGERIE_HARDCODE, "FLUX + sneakers: no lingerie");
  assertNotMatches(prompt, JEWELRY_HARDCODE, "FLUX + sneakers: no jewelry");
  assert.ok(
    !/\blace\b/i.test(prompt) || /shoelace|laces?/i.test(prompt),
    "FLUX + sneakers: only Vision laces, not template lace"
  );
  assert.match(prompt, /sneakers/i, "FLUX + sneakers: sneakers in block");
  assert.match(prompt, /Edit instruction:/i, "FLUX uses 'Edit instruction:' prefix");
}

// Unknown / no block — generic fallback, no category words
{
  const nanoNoBlock = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: null,
  });
  assertNotMatches(nanoNoBlock, LINGERIE_HARDCODE, "Nano fallback no lingerie");
  assertNotMatches(nanoNoBlock, FOOTWEAR_HARDCODE, "Nano fallback no footwear");
  assertNotMatches(nanoNoBlock, JEWELRY_HARDCODE, "Nano fallback no jewelry");
  assert.match(
    nanoNoBlock,
    /visible fashion product|main product recognisable|preserve the visible product exactly/i,
    "Nano fallback uses generic block"
  );

  const fluxNoBlock = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: null,
  });
  assertNotMatches(fluxNoBlock, LINGERIE_HARDCODE, "FLUX fallback no lingerie");
  assertNotMatches(fluxNoBlock, FOOTWEAR_HARDCODE, "FLUX fallback no footwear");
  assertNotMatches(fluxNoBlock, JEWELRY_HARDCODE, "FLUX fallback no jewelry");
  assert.match(
    fluxNoBlock,
    /visible fashion product|main product recognisable|product fidelity/i,
    "FLUX fallback uses generic block"
  );
}

// preserveProduct=false → soft creative block
{
  const nanoCreative = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    preserveProduct: false,
    productPreservationBlock: null,
  });
  assert.match(
    nanoCreative,
    /main product recognisable/i,
    "preserveProduct=false uses creative block"
  );
}

// === 3) Final prompt + SAFE external block — sensitive words must not leak ===

// Lingerie: full pipeline — Vision analysis → safe external block → builders
{
  const safe = buildExternalProductPreservationBlock(lingerieAnalysis());
  const nano = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(nano, "Nano + lingerie (safe block)");
  assert.ok(nano.length <= 1200, `Nano length ${nano.length} <= 1200`);
  assert.match(nano, /Edit the source image/i, "Nano: new short header");
  assert.match(nano, /Improve only lighting/i, "Nano: improve-only line");

  const flux = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(flux, "FLUX + lingerie (safe block)");
  assert.ok(flux.length <= 900, `FLUX length ${flux.length} <= 900`);
  assert.match(flux, /Edit instruction:/i, "FLUX: edit instruction prefix");
  assert.match(flux, /Photoreal ecommerce result/i, "FLUX: short footer");
}

// Dress + safe external block
{
  const safe = buildExternalProductPreservationBlock(dressAnalysis());
  const nano = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(nano, "Nano + dress (safe block)");
  assert.match(nano, /midi dress/i, "Nano + dress: still mentions dress");
  assert.ok(nano.length <= 1200, `Nano dress length ${nano.length} <= 1200`);
}

// Jewelry + safe external block
{
  const safe = buildExternalProductPreservationBlock(jewelryAnalysis());
  const nano = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(nano, "Nano + jewelry (safe block)");
  assertNotMatches(nano, GARMENT_HARDCODE, "Nano + jewelry: no garment");
  assertNotMatches(nano, FOOTWEAR_HARDCODE, "Nano + jewelry: no footwear");
  assert.match(nano, /hoop/i, "Nano + jewelry: hoop mention");
}

// Sneakers + safe external block
{
  const safe = buildExternalProductPreservationBlock(sneakersAnalysis());
  const flux = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(flux, "FLUX + sneakers (safe block)");
  assert.match(flux, /sneakers/i, "FLUX + sneakers: category");
  assert.match(flux, /sole/i, "FLUX + sneakers: sole");
  assert.ok(flux.length <= 900, `FLUX sneakers length ${flux.length} <= 900`);
}

// Adversarial: someone passes a NON-safe block by mistake → ideally we'd want
// builders to still produce something but we accept that contamination is the
// caller's responsibility. We assert SAFE flow path: when caller correctly
// uses buildExternalProductPreservationBlock first, no sensitive vocab leaks.
{
  const detailed = buildProductPreservationBlock(lingerieAnalysis());
  assert.match(
    detailed,
    /\b(?:bra|briefs|lace)\b/i,
    "sanity: detailed block intentionally contains category words"
  );
  const safe = buildExternalProductPreservationBlock(lingerieAnalysis());
  assert.ok(
    !/\bbra\b|\bbriefs\b/i.test(safe),
    "sanity: external block strips bra/briefs while keeping lace"
  );
}

console.log("test:product-preservation — ok");
