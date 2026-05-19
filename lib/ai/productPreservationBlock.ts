/**
 * Pure helpers that turn a `ProductPreservationAnalysis` into a short English
 * "Product fidelity" block injected into image-edit prompts.
 *
 * Browser- and server-safe (no `server-only` import, no OpenAI dependency).
 */

import {
  PRODUCT_PRESERVATION_MIN_CONFIDENCE,
  type ProductPreservationAnalysis,
} from "./productPreservationSchemas.ts";

const MAX_BLOCK_LEN = 600;
/** Upper bound for the SAFE external block that is actually sent to Fal.
 *
 *  The block is now a FIXED, object-agnostic safe template (one of two
 *  variants — clothing-on-model or generic-product). It does not enumerate
 *  Vision-derived colours/materials/shape/pattern/details anymore. Those
 *  details routinely produced sensitive wording ("lace overlay",
 *  "high-waisted", "scalloped", "supportive cup shape") that survived the
 *  EXTERNAL_SENSITIVE_REPLACEMENTS pass and provoked Fal moderation /
 *  black-output placeholders on adult-leaning catalogues. The detailed
 *  block is still produced separately (`buildProductPreservationBlock`)
 *  for debug, but it is NEVER sent to Fal. */
const EXTERNAL_BLOCK_MAX_LEN = 350;

/**
 * Safe external block for clothing/lingerie/swimwear on a model.
 *
 * Used when `objectType === "garment"`. Stays generic about the actual
 * garment (no lace / bra / brief / cup / high-waist / scalloped vocabulary)
 * and explicitly forbids the failure modes we saw — recolouring, adding
 * extra clothing, swapping the product, or distorting body parts.
 */
// NOTE: the spec ask was "Do not add extra ... body parts ..." but the
// final-mile sanitizer (`SENSITIVE_RULES.body_parts`) rewrites "body parts"
// → "composition" for moderation safety. "limbs" is the sanitiser-safe
// synonym that survives unchanged AND preserves the original intent —
// preventing the model from inventing extra arms/legs on the person.
const SAFE_BLOCK_GARMENT_ON_MODEL =
  "Keep the clothing on the model unchanged. " +
  "Preserve the same visible outfit, color, shape, fit, placement, and overall look. " +
  "Do not add extra clothing, accessories, fabric, limbs, or objects to the person. " +
  "Do not replace, recolor, redesign, or distort the product.";

/**
 * Safe external block for non-garment products (jewelry, footwear,
 * accessory, cosmetic, bag, electronics, generic "product").
 *
 * Stays object-agnostic — no category-specific words enter the prompt; the
 * downstream model still has the source image to look at for visual
 * identity, so we don't risk pasting Vision wording back at it.
 */
const SAFE_BLOCK_GENERIC_PRODUCT =
  "Preserve the visible product unchanged: " +
  "same color, shape, material, placement, proportions, and overall look. " +
  "Do not replace, recolor, redesign, or distort the product.";

/** Universal fallback when Vision is missing, low-confidence, or unknown. */
export function genericPreservationBlock(): string {
  return [
    "Preserve the visible product exactly: color, shape, material, texture,",
    "pattern, edges, construction, proportions, placement, and all visible",
    "design details. Do not replace the product with a different item. Do",
    "not change the dominant product color or pattern.",
  ].join(" ");
}

/**
 * Neutral external fallback — kept short and 100% safe for Fal.
 *
 * Aligned with `SAFE_BLOCK_GENERIC_PRODUCT` so callers that have no Vision
 * analysis (low confidence, unknown object, network failure) still send a
 * complete preservation sentence to Fal, not a sentence fragment.
 */
export function genericExternalPreservationBlock(): string {
  return SAFE_BLOCK_GENERIC_PRODUCT;
}

/**
 * Sensitive-words → neutral-words substitutions for the SAFE external block.
 *
 * Goal: Vision can return very specific commercial-merchandising vocabulary
 * (bra, briefs, cups, cleavage, body proportions, fabric-to-skin contact,
 * model identity, visible pores …). These often trigger Fal/Nano/FLUX
 * moderation (422) on adult-leaning catalogues and rarely add signal to an
 * "edit only the scene/light" instruction. The mapping below rewrites them
 * into neutral product-merchandising wording without losing the meaning.
 *
 * Order matters: longer / more specific phrases first.
 */
const EXTERNAL_SENSITIVE_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bfabric[\s-]to[\s-]skin(?:\s+contact)?\b/gi, "fabric and surface contact"],
  [/\bfabric contact with skin\b/gi, "fabric and surface contact"],
  [/\bhigh[\s-]cut leg openings?\b/gi, "garment cut"],
  [/\blingerie sets?\b/gi, "two-piece fashion garment"],
  [/\bintimate apparel\b/gi, "fashion garment"],
  [/\bvisible pores\b/gi, "natural texture"],
  [/\bskin pores\b/gi, "natural texture"],
  [/\bbody proportions?\b/gi, "composition"],
  [/\bbody parts?\b/gi, "composition"],
  [/\bmodel identity\b/gi, "subject appearance"],
  [/\bpreserve identity\b/gi, "keep the same subject appearance"],
  [/\bbra straps?\b/gi, "garment straps"],
  [/\bbra cups?\b/gi, "garment top shape"],
  [/\bbralette\b/gi, "garment top"],
  [/\blingerie\b/gi, "fashion garment"],
  [/\bunderwear\b/gi, "fashion garment"],
  [/\bbras\b/gi, "garment tops"],
  [/\bbra\b/gi, "garment top"],
  [/\bbriefs\b/gi, "garment bottom"],
  [/\bbrief\b/gi, "garment bottom"],
  [/\bpanties\b/gi, "garment bottom"],
  [/\bpanty\b/gi, "garment bottom"],
  [/\bthongs?\b/gi, "garment bottom"],
  [/\bcups\b/gi, "garment top shape"],
  [/\bcup\b/gi, "garment top shape"],
  [/\bcleavage\b/gi, ""],
  [/\bbreasts?\b/gi, ""],
  [/\bbust(?:line)?\b/gi, ""],
  [/\bnipples?\b/gi, ""],
  [/\bcrotch\b/gi, ""],
  [/\bgroin\b/gi, ""],
  [/\bnaked\b/gi, ""],
  [/\bbare\b/gi, ""],
  [/\bsexualised\b/gi, ""],
  [/\bsexualized\b/gi, ""],
  [/\bsexually\b/gi, ""],
  [/\bsexy\b/gi, ""],
  [/\badult model\b/gi, "subject"],
  [/\badult\s+lingerie\b/gi, "fashion garment"],
  [/\bskin tones?\b/gi, "tone"],
  [/\bskin texture\b/gi, "natural texture"],
  [/\bskin realism\b/gi, "realism"],
  [/\bidentity\b/gi, "appearance"],
];

/** Strips sensitive wording and collapses whitespace/punctuation. */
export function sanitizeForExternalPrompt(input: string): string {
  let out = (input ?? "").toString();
  if (!out) return "";

  for (const [pattern, replacement] of EXTERNAL_SENSITIVE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  return out
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;])\s*([,;])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(/^[\s,.;:]+/, "")
    .replace(/[\s,;:]+$/, "")
    .trim();
}

function uniq(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const v = (raw ?? "").trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(v);
  }
  return result;
}

function take(values: readonly string[], max: number): string[] {
  return uniq(values).slice(0, max);
}

function joinShort(values: readonly string[]): string {
  return take(values, 8).join(", ");
}

/** Sentence-aware length clamp (does not split words mid-token). */
function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastDot = truncated.lastIndexOf(".");
  if (lastDot > maxLen * 0.6) return truncated.slice(0, lastDot + 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return truncated.slice(0, lastSpace).trim();
  return truncated.trim();
}

/**
 * Builds a short English preservation block from Vision analysis.
 *
 * Behaviour:
 *  - If analysis is missing or confidence < threshold → generic block.
 *  - If objectType is "unknown" → generic block.
 *  - Otherwise → composed block based on visible details from Vision only
 *    (no hardcoded category words like "bra", "lace", "sneakers").
 */
export function buildProductPreservationBlock(
  analysis: ProductPreservationAnalysis | null | undefined,
  options?: { forceGeneric?: boolean }
): string {
  if (options?.forceGeneric) return genericPreservationBlock();
  if (!analysis) return genericPreservationBlock();

  const lowConfidence =
    typeof analysis.confidence !== "number" ||
    analysis.confidence < PRODUCT_PRESERVATION_MIN_CONFIDENCE;
  if (lowConfidence) return genericPreservationBlock();
  if (analysis.objectType === "unknown") return genericPreservationBlock();

  const head =
    analysis.primaryObject?.trim() ||
    analysis.shortDescription?.trim() ||
    "the visible product";

  const detailFragments: string[] = [];

  const colorMat = uniq([
    ...take(analysis.colors, 3),
    ...take(analysis.materials, 3),
  ]);
  if (colorMat.length > 0) detailFragments.push(joinShort(colorMat));

  if (analysis.shapeSilhouette?.trim()) {
    detailFragments.push(analysis.shapeSilhouette.trim());
  }
  if (analysis.patternOrTexture?.trim()) {
    detailFragments.push(analysis.patternOrTexture.trim());
  }
  if (analysis.visibleDetails.length > 0) {
    detailFragments.push(joinShort(analysis.visibleDetails));
  }
  if (analysis.edgesAndConstruction.length > 0) {
    detailFragments.push(joinShort(analysis.edgesAndConstruction));
  }

  const mustPreserve = take(analysis.mustPreserve, 8);
  const mustNotChange = take(analysis.mustNotChange, 6);

  const sentences: string[] = [];

  const detailLine =
    detailFragments.length > 0
      ? `Preserve the visible product exactly: ${head} — ${detailFragments.join(
          "; "
        )}.`
      : `Preserve the visible product exactly: ${head}.`;
  sentences.push(detailLine);

  if (mustPreserve.length > 0) {
    sentences.push(`Must remain unchanged: ${mustPreserve.join("; ")}.`);
  }

  if (mustNotChange.length > 0) {
    sentences.push(`Do not change: ${mustNotChange.join("; ")}.`);
  }

  sentences.push(
    "Do not replace the product with a different item; do not alter its color, pattern, proportions, or placement."
  );

  return clamp(sentences.join(" "), MAX_BLOCK_LEN);
}

/**
 * Builds the SAFE EXTERNAL preservation block — the one and only piece of
 * "preserve the product" text that gets sent to Fal (Nano Banana / FLUX
 * Kontext).
 *
 * Behaviour (re-designed after the lace/scalloped/high-waisted leak audit):
 *  - For `objectType === "garment"` (and confident enough) → fixed
 *    `SAFE_BLOCK_GARMENT_ON_MODEL` template. Covers clothing/lingerie/
 *    swimwear/dress on a model without any category-specific vocabulary.
 *  - For other product categories (jewelry, footwear, accessory, cosmetic,
 *    bag, electronics, generic "product") → fixed
 *    `SAFE_BLOCK_GENERIC_PRODUCT` template.
 *  - Low confidence, missing analysis, `unknown` objectType, or explicit
 *    `forceGeneric` → `genericExternalPreservationBlock()` (= generic).
 *
 * Why no Vision details anymore:
 *  Vision regularly returned strings like "lace overlay", "high-waisted
 *  brief", "supportive cup shape", "scalloped textured edges". Even after
 *  the EXTERNAL_SENSITIVE_REPLACEMENTS pass, enough of these survived to
 *  contaminate the final Fal prompt and provoke moderation (manifesting as
 *  the silent black 1024×768 safety placeholder we audited). The source
 *  image already carries the visual identity; the prompt only needs to say
 *  "do not change it".
 *
 * The result is always a complete, self-contained sentence — builders MUST
 * NOT prefix it with "Preserve the visible product exactly:" or similar
 * (that would cause duplication with the template's own first sentence).
 */
export function buildExternalProductPreservationBlock(
  analysis: ProductPreservationAnalysis | null | undefined,
  options?: { forceGeneric?: boolean }
): string {
  if (options?.forceGeneric) return genericExternalPreservationBlock();
  if (!analysis) return genericExternalPreservationBlock();

  const lowConfidence =
    typeof analysis.confidence !== "number" ||
    analysis.confidence < PRODUCT_PRESERVATION_MIN_CONFIDENCE;
  if (lowConfidence) return genericExternalPreservationBlock();
  if (analysis.objectType === "unknown")
    return genericExternalPreservationBlock();

  const block =
    analysis.objectType === "garment"
      ? SAFE_BLOCK_GARMENT_ON_MODEL
      : SAFE_BLOCK_GENERIC_PRODUCT;

  // Defence in depth: the templates above are hand-crafted to never contain
  // sensitive words, but if a future edit drifts into "preserve identity"
  // / "body parts" territory the sanitizer will still catch it. Clamp to
  // EXTERNAL_BLOCK_MAX_LEN for the same reason — protects callers that
  // pre-size a buffer assuming the cap.
  const safe = sanitizeForExternalPrompt(block);
  return clamp(safe, EXTERNAL_BLOCK_MAX_LEN);
}
