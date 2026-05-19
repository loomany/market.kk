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
  // New: garment-detail vocabulary that previously leaked through the
  // Vision pipeline (audit of the lingerie source image).
  /\blace overlay\b/i,
  /\bhigh[\s-]?waist(?:ed)?\b/i,
  /\bscalloped\b/i,
  /\bsexual/i,
  /\bsexy\b/i,
  /\bnaked\b/i,
];

/** The two fixed safe templates emitted by `buildExternalProductPreservationBlock`. */
const SAFE_TEMPLATE_GARMENT = /Keep the clothing on the model unchanged/i;
const SAFE_TEMPLATE_GENERIC = /Preserve the visible product unchanged/i;

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

// === 1b) External SAFE block — fixed safe templates ===
//
// New design (after lace/scalloped leak audit): the external block is no
// longer a Vision-derived enumeration of colours/materials/details. It is
// one of two fixed safe templates, chosen by `objectType`:
//   - `objectType === "garment"`  → SAFE_TEMPLATE_GARMENT
//   - any other recognised type   → SAFE_TEMPLATE_GENERIC
// Low-confidence / unknown      → genericExternalPreservationBlock()
//
// We intentionally NO LONGER assert that the safe block mentions Vision
// specifics (colour, category, "hoop", "sole", "navy", "midi dress").
// Those are valuable for debug only — the source image carries the visual
// identity, the prompt only needs to say "do not change it".

{
  const safe = buildExternalProductPreservationBlock(lingerieAnalysis());
  assertNoSensitive(safe, "ext.A lingerie");
  assert.match(safe, SAFE_TEMPLATE_GARMENT, "ext.A: garment safe template");
  assert.ok(safe.length <= 350, `ext.A: length ${safe.length} <= 350`);
  // Belt-and-suspenders: the safe template MUST NOT contain the previously
  // leaking garment-detail vocabulary.
  assert.ok(!/\blace\b/i.test(safe), "ext.A: no 'lace' in template");
  assert.ok(!/\bhigh[\s-]?waist/i.test(safe), "ext.A: no 'high-waist' in template");
  assert.ok(!/\bscalloped\b/i.test(safe), "ext.A: no 'scalloped' in template");
  assert.ok(!/\btwo-piece\b/i.test(safe), "ext.A: no 'two-piece' in template");
}

{
  const safe = buildExternalProductPreservationBlock(dressAnalysis());
  assertNoSensitive(safe, "ext.B dress");
  assert.match(safe, SAFE_TEMPLATE_GARMENT, "ext.B: garment safe template");
  // Vision details (colour, hem, silhouette) are intentionally NOT in the
  // safe external block anymore.
  assert.ok(!/\bmidi\b/i.test(safe), "ext.B: no 'midi' detail leak");
  assert.ok(!/\bnavy\b/i.test(safe), "ext.B: no 'navy' detail leak");
}

{
  const safe = buildExternalProductPreservationBlock(jewelryAnalysis());
  assertNoSensitive(safe, "ext.C jewelry");
  assert.match(safe, SAFE_TEMPLATE_GENERIC, "ext.C: generic safe template");
  assertNotMatches(safe, GARMENT_HARDCODE, "ext.C: no garment");
  assertNotMatches(safe, FOOTWEAR_HARDCODE, "ext.C: no footwear");
  assert.ok(!/\bhoop\b/i.test(safe), "ext.C: no Vision 'hoop' leak");
}

{
  const safe = buildExternalProductPreservationBlock(sneakersAnalysis());
  assertNoSensitive(safe, "ext.D sneakers");
  assert.match(safe, SAFE_TEMPLATE_GENERIC, "ext.D: generic safe template");
  assert.ok(!/\bsneakers\b/i.test(safe), "ext.D: no Vision 'sneakers' leak");
  assert.ok(!/\bsole\b/i.test(safe), "ext.D: no Vision 'sole' leak");
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
  assert.match(
    prompt,
    /Subject and product:/i,
    "FLUX uses 'Subject and product:' section"
  );
  assert.match(
    prompt,
    /User request:/i,
    "FLUX uses 'User request:' section"
  );
}

// Unknown / no block — generic safe fallback, no category words
{
  const nanoNoBlock = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: null,
  });
  assertNotMatches(nanoNoBlock, LINGERIE_HARDCODE, "Nano fallback no lingerie");
  assertNotMatches(nanoNoBlock, FOOTWEAR_HARDCODE, "Nano fallback no footwear");
  assertNotMatches(nanoNoBlock, JEWELRY_HARDCODE, "Nano fallback no jewelry");
  // Nano fallback safe sentence (kept in sync with `genericExternalPreservationBlock`).
  assert.match(
    nanoNoBlock,
    SAFE_TEMPLATE_GENERIC,
    "Nano fallback uses generic safe template"
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
    SAFE_TEMPLATE_GENERIC,
    "FLUX fallback uses generic safe template"
  );
  assert.match(
    fluxNoBlock,
    /Subject and product:/i,
    "FLUX fallback keeps sectioned template"
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

// Lingerie: full pipeline — Vision analysis → safe external block → builders.
// The safe block uses the garment-on-model template; no lace / bra / briefs
// vocabulary even though Vision's primary description contained them.
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
  assert.match(nano, SAFE_TEMPLATE_GARMENT, "Nano + lingerie: garment template");

  const flux = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(flux, "FLUX + lingerie (safe block)");
  assert.ok(flux.length <= 900, `FLUX length ${flux.length} <= 900`);
  assert.match(
    flux,
    /Subject and product:/i,
    "FLUX: subject and product section"
  );
  assert.match(flux, /Scene change:/i, "FLUX: scene change section");
  assert.match(
    flux,
    /Photoreal premium ecommerce/i,
    "FLUX: short result footer"
  );
  assert.match(flux, SAFE_TEMPLATE_GARMENT, "FLUX + lingerie: garment template");
}

// Dress + safe external block — uses the same garment template (no
// "midi dress" / "navy" leaks into the final prompt).
{
  const safe = buildExternalProductPreservationBlock(dressAnalysis());
  const nano = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(nano, "Nano + dress (safe block)");
  assert.match(nano, SAFE_TEMPLATE_GARMENT, "Nano + dress: garment template");
  assert.ok(!/\bmidi dress\b/i.test(nano), "Nano + dress: no Vision 'midi dress' leak");
  assert.ok(!/\bnavy\b/i.test(nano), "Nano + dress: no Vision 'navy' leak");
  assert.ok(nano.length <= 1200, `Nano dress length ${nano.length} <= 1200`);
}

// Jewelry + safe external block — uses the GENERIC product template.
{
  const safe = buildExternalProductPreservationBlock(jewelryAnalysis());
  const nano = buildNanoBananaEnhancePrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(nano, "Nano + jewelry (safe block)");
  assertNotMatches(nano, GARMENT_HARDCODE, "Nano + jewelry: no garment");
  assertNotMatches(nano, FOOTWEAR_HARDCODE, "Nano + jewelry: no footwear");
  assert.match(nano, SAFE_TEMPLATE_GENERIC, "Nano + jewelry: generic template");
  assert.ok(!/\bhoop\b/i.test(nano), "Nano + jewelry: no Vision 'hoop' leak");
}

// Sneakers + safe external block — uses the GENERIC product template.
{
  const safe = buildExternalProductPreservationBlock(sneakersAnalysis());
  const flux = buildFluxKontextEditPrompt({
    ...baseBuilderInput,
    productPreservationBlock: safe,
  });
  assertNoSensitive(flux, "FLUX + sneakers (safe block)");
  assert.match(flux, SAFE_TEMPLATE_GENERIC, "FLUX + sneakers: generic template");
  assert.ok(!/\bsneakers\b/i.test(flux), "FLUX + sneakers: no Vision 'sneakers' leak");
  assert.ok(!/\bsole\b/i.test(flux), "FLUX + sneakers: no Vision 'sole' leak");
  assert.ok(flux.length <= 900, `FLUX sneakers length ${flux.length} <= 900`);
}

// Sanity check on the contract: the DETAILED Vision block (debug-only,
// never sent to Fal) still contains category words; the SAFE external
// block strips them entirely.
{
  const detailed = buildProductPreservationBlock(lingerieAnalysis());
  assert.match(
    detailed,
    /\b(?:bra|briefs|lace)\b/i,
    "sanity: detailed block intentionally contains category words"
  );
  const safe = buildExternalProductPreservationBlock(lingerieAnalysis());
  assert.ok(
    !/\bbra\b|\bbriefs\b|\blace\b/i.test(safe),
    "sanity: external block strips bra/briefs/lace entirely"
  );
}

console.log("test:product-preservation — ok");
