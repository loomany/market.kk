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
 *  Lowered from 450 → 350 after black-screen debugging showed that long,
 *  repetitive Vision-derived blocks were the main contributor to Fal 422s
 *  on adult-leaning catalogues. Keep it tight, generic, and de-duplicated. */
const EXTERNAL_BLOCK_MAX_LEN = 350;

/** Universal fallback when Vision is missing, low-confidence, or unknown. */
export function genericPreservationBlock(): string {
  return [
    "Preserve the visible product exactly: color, shape, material, texture,",
    "pattern, edges, construction, proportions, placement, and all visible",
    "design details. Do not replace the product with a different item. Do",
    "not change the dominant product color or pattern.",
  ].join(" ");
}

/** Neutral external fallback — kept short and 100% safe for Fal. */
export function genericExternalPreservationBlock(): string {
  return (
    "visible fashion product — keep color, pattern, material, shape, edges, " +
    "proportions, and placement."
  );
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

function sanitizeListItems(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const cleaned = sanitizeForExternalPrompt(raw);
    if (!cleaned) continue;
    if (cleaned.length < 3) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function sanitizeOrFallback(text: string | undefined, fallback: string): string {
  const cleaned = sanitizeForExternalPrompt(text ?? "");
  if (cleaned.length >= 3) return cleaned;
  return fallback;
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
 * Builds the SAFE EXTERNAL preservation block — this is what actually gets
 * sent to Fal (Nano Banana / FLUX Kontext).
 *
 * Difference from `buildProductPreservationBlock`:
 *  - Strips body-parts / identity / skin / sensitive merchandising vocabulary
 *    (`sanitizeForExternalPrompt`) so adult-leaning lingerie photos do not
 *    trigger Fal/Nano moderation (422).
 *  - Caps total length at ~450 chars.
 *  - Drops `mustNotChange` (often verbose "do not change cup shape" style).
 *  - Keeps category & visual identity (color, pattern, silhouette, material).
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
  if (analysis.objectType === "unknown") return genericExternalPreservationBlock();

  const head = sanitizeOrFallback(
    analysis.primaryObject || analysis.shortDescription,
    "visible fashion product"
  );

  // De-dup pool: every textual fragment we ever emit must be unique inside
  // the block (case-insensitive). Without this, Vision often produces
  // "garment bottom" inside shape, details AND mustPreserve simultaneously
  // → resulting in adjacent doubles after concatenation.
  const used = new Set<string>([head.toLowerCase()]);
  const takeUnique = (items: readonly string[], limit: number): string[] => {
    const out: string[] = [];
    for (const raw of items) {
      const item = raw.trim();
      if (!item) continue;
      const key = item.toLowerCase();
      if (used.has(key)) continue;
      // Skip items already contained in the head, e.g. head="midi dress" + item="dress".
      if (
        key.length < 5 &&
        head.toLowerCase().split(/\s+/).includes(key)
      ) {
        continue;
      }
      used.add(key);
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  };

  const colors = takeUnique(sanitizeListItems(analysis.colors), 2);
  const materials = takeUnique(sanitizeListItems(analysis.materials), 1);
  const shape = sanitizeOrFallback(analysis.shapeSilhouette, "");
  const shapeUnique = used.has(shape.toLowerCase()) ? "" : shape;
  if (shapeUnique) used.add(shapeUnique.toLowerCase());
  const pattern = sanitizeOrFallback(analysis.patternOrTexture, "");
  const patternUnique = used.has(pattern.toLowerCase()) ? "" : pattern;
  if (patternUnique) used.add(patternUnique.toLowerCase());
  const details = takeUnique(sanitizeListItems(analysis.visibleDetails), 2);
  const preserve = takeUnique(sanitizeListItems(analysis.mustPreserve), 2);

  const fragments: string[] = [];
  const colorMat = [...colors, ...materials];
  if (colorMat.length > 0) fragments.push(colorMat.join(", "));
  if (shapeUnique) fragments.push(shapeUnique);
  if (patternUnique) fragments.push(patternUnique);
  if (details.length > 0) fragments.push(details.join(", "));

  // The block is a CONTENT fragment — builders prefix it with their own
  // "Preserve the visible product exactly:" / "Preserve the visible product:".
  // Keep this block FREE of those phrases to avoid duplication and of any
  // "Do not replace…" clause (builders include their own).
  const headLine =
    fragments.length > 0 ? `${head} — ${fragments.join("; ")}.` : `${head}.`;

  const sentences: string[] = [headLine];

  if (preserve.length > 0) {
    sentences.push(`Keep unchanged: ${preserve.join("; ")}.`);
  }

  const joined = sentences.join(" ");
  const safe = sanitizeForExternalPrompt(joined);
  return clamp(safe, EXTERNAL_BLOCK_MAX_LEN);
}
