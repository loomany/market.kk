/**
 * Last-mile sanitizer for the EXACT prompt that the post-processing image
 * editors (Nano Banana Pro, FLUX Kontext, future image editors) send to Fal.
 *
 * Why a single, separate file?
 *  - The Vision pipeline can return body/identity wording in its internal
 *    JSON (that's fine for debug).
 *  - The Nano/FLUX builders try to be conservative but still concatenate
 *    user-typed text + GPT-enhanced text + product preservation block.
 *  - GPT enhancer can add unsafe wording back (e.g. "adult model", "natural
 *    skin", "visible pores") and adjacent duplicates ("two-piece two-piece").
 *
 * This module is the FINAL defence. Apply it to the assembled prompt right
 * before `runNanoBananaEnhance(...)` / `runFluxKontextEdit(...)` so we never
 * send Fal:
 *   - body / identity / adult vocabulary that triggers moderation 422
 *   - "Reels / video / motion" wording on a static image edit
 *   - "two-piece two-piece", "garment garment", "bottom bottom" duplicates
 *   - dangling punctuation, doubled periods, stray commas
 *
 * Pure function — no side effects. Returns the cleaned prompt PLUS the
 * lists of what was removed, so the diagnostic trace can show the diff.
 */

export type FinalPromptSanitizeResult = {
  cleaned: string;
  removedSensitiveWords: string[];
  removedDuplicatePatterns: string[];
  lengthBefore: number;
  lengthAfter: number;
};

/**
 * Sensitive-word replacements applied to the assembled prompt.
 *
 * Order is intentional: more specific phrases first so that, e.g.,
 * `"same adult model"` is rewritten before the generic `adult model` rule
 * would fire on the remainder.
 *
 * Each entry has a stable `label` used for the `removedSensitiveWords`
 * report. When `replacement` is an empty string the phrase is excised and
 * adjacent punctuation is cleaned up later.
 */
type SensitiveRule = {
  readonly label: string;
  readonly pattern: RegExp;
  readonly replacement: string;
};

const SENSITIVE_RULES: readonly SensitiveRule[] = [
  // multi-word body / identity
  { label: "preserve_model_identity", pattern: /\bpreserve (?:the )?model identity\b/gi, replacement: "keep the same general appearance" },
  { label: "same_adult_model", pattern: /\bsame adult model\b/gi, replacement: "same subject" },
  { label: "adult_model", pattern: /\badult models?\b/gi, replacement: "subject" },
  { label: "adult_woman", pattern: /\badult wom(?:a|e)n\b/gi, replacement: "person" },
  { label: "adult_human_model", pattern: /\badult human models?\b/gi, replacement: "subject" },
  { label: "model_identity", pattern: /\bmodel identity\b/gi, replacement: "general appearance" },
  { label: "body_proportions", pattern: /\b(?:realistic )?body proportions?\b/gi, replacement: "overall composition" },
  { label: "body_parts", pattern: /\bbody parts?\b/gi, replacement: "composition" },
  { label: "fabric_skin_contact", pattern: /\bfabric[\s-]to[\s-]skin(?:\s+contact)?\b/gi, replacement: "natural product placement" },
  { label: "fabric_contact_with_skin", pattern: /\bfabric contact with skin\b/gi, replacement: "natural product placement" },
  { label: "natural_fabric_contact_with_skin", pattern: /\bnatural fabric contact with skin\b/gi, replacement: "natural product placement" },
  { label: "visible_pores", pattern: /\bvisible pores\b/gi, replacement: "natural texture" },
  { label: "skin_pores", pattern: /\bskin pores\b/gi, replacement: "natural texture" },
  { label: "natural_skin_texture", pattern: /\bnatural skin texture\b/gi, replacement: "natural texture" },
  { label: "natural_skin", pattern: /\bnatural skin\b/gi, replacement: "natural texture" },
  { label: "realistic_skin", pattern: /\brealistic skin\b/gi, replacement: "realistic texture" },
  { label: "skin_texture", pattern: /\bskin texture\b/gi, replacement: "natural texture" },
  { label: "skin_realism", pattern: /\bskin realism\b/gi, replacement: "realism" },
  { label: "skin_tones", pattern: /\bskin tones?\b/gi, replacement: "tone" },
  { label: "high_cut_leg", pattern: /\bhigh[\s-]cut leg openings?\b/gi, replacement: "garment cut" },
  { label: "lingerie_sets", pattern: /\blingerie sets?\b/gi, replacement: "two-piece fashion garment" },
  { label: "intimate_apparel", pattern: /\bintimate apparel\b/gi, replacement: "fashion product" },
  { label: "lingerie", pattern: /\blingerie\b/gi, replacement: "fashion garment" },
  { label: "underwear", pattern: /\bunderwear\b/gi, replacement: "garment" },
  { label: "bralette", pattern: /\bbralette\b/gi, replacement: "garment top" },
  { label: "bra_straps", pattern: /\bbra straps?\b/gi, replacement: "garment straps" },
  { label: "bra_cups", pattern: /\bbra cups?\b/gi, replacement: "product shape" },
  { label: "bras", pattern: /\bbras\b/gi, replacement: "garment tops" },
  { label: "bra", pattern: /\bbra\b/gi, replacement: "garment top" },
  { label: "briefs", pattern: /\bbriefs\b/gi, replacement: "garment bottom" },
  { label: "brief", pattern: /\bbrief\b/gi, replacement: "garment bottom" },
  { label: "panties", pattern: /\bpanties\b/gi, replacement: "garment bottom" },
  { label: "panty", pattern: /\bpanty\b/gi, replacement: "garment bottom" },
  { label: "thongs", pattern: /\bthongs?\b/gi, replacement: "garment bottom" },
  { label: "cups", pattern: /\bcups\b/gi, replacement: "product shape" },
  { label: "cup", pattern: /\bcup\b/gi, replacement: "product shape" },
  // Words removed entirely (no replacement). Adjacent punctuation will be cleaned up later.
  { label: "cleavage", pattern: /\bcleavage\b/gi, replacement: "" },
  { label: "breasts", pattern: /\bbreasts?\b/gi, replacement: "" },
  { label: "bust", pattern: /\bbust(?:line)?\b/gi, replacement: "" },
  { label: "nipples", pattern: /\bnipples?\b/gi, replacement: "" },
  { label: "crotch", pattern: /\bcrotch\b/gi, replacement: "" },
  { label: "groin", pattern: /\bgroin\b/gi, replacement: "" },
  { label: "sexy", pattern: /\bsexy\b/gi, replacement: "" },
  { label: "erotic", pattern: /\berotic\b/gi, replacement: "" },
  { label: "sexual", pattern: /\bsexual(?:ised|ized|ly)?\b/gi, replacement: "" },
  { label: "nude", pattern: /\bnude\b/gi, replacement: "" },
  { label: "naked", pattern: /\bnaked\b/gi, replacement: "" },
  { label: "bare", pattern: /\bbare\b/gi, replacement: "" },
];

/**
 * Adjacent-duplicate patterns. These run AFTER sensitive replacements so
 * artifacts like `bra → garment top` next to an existing `top` collapse.
 *
 * The greedy `dedupeAdjacent` below also catches generic doubles
 * (`black black`, `same same` etc.). The named patterns let us report
 * exactly which doubles were removed in the debug trace.
 */
type DuplicateRule = {
  readonly label: string;
  readonly pattern: RegExp;
  readonly replacement: string;
};

const NAMED_DUPLICATE_RULES: readonly DuplicateRule[] = [
  { label: "two-piece two-piece", pattern: /\btwo-piece\s+two-piece\b/gi, replacement: "two-piece" },
  { label: "garment garment", pattern: /\bgarment\s+garment\b/gi, replacement: "garment" },
  { label: "fashion fashion", pattern: /\bfashion\s+fashion\b/gi, replacement: "fashion" },
  { label: "product product", pattern: /\bproduct\s+product\b/gi, replacement: "product" },
  { label: "bottom bottom", pattern: /\bbottom\s+bottom\b/gi, replacement: "bottom" },
  { label: "top top", pattern: /\btop\s+top\b/gi, replacement: "top" },
  { label: "same same", pattern: /\bsame\s+same\b/gi, replacement: "same" },
  { label: "black black", pattern: /\bblack\s+black\b/gi, replacement: "black" },
  { label: "the the", pattern: /\bthe\s+the\b/gi, replacement: "the" },
  { label: "a a", pattern: /\ba\s+a\b/gi, replacement: "a" },
  { label: "double-dot", pattern: /\.{2,}/g, replacement: "." },
  { label: "dot-space-dot", pattern: /\.\s+\./g, replacement: "." },
  { label: "comma-period", pattern: /,\s*\./g, replacement: "." },
  { label: "double-comma", pattern: /,\s*,/g, replacement: "," },
];

/**
 * Phrases that, once a sensitive word has been stripped, become non-sensical
 * fragments. Removing them keeps the prompt grammatical.
 */
const BROKEN_FRAGMENT_PATTERNS: readonly RegExp[] = [
  // "preserve ." / "preserve, " left over after stripping a body part word
  /\b(?:preserve|keep)\s*[,.;:]/gi,
  // "Do not . " — stripped phrase right before "Do not"
  /\.\s+Do not\s*\./gi,
  // Orphan connectors at sentence start
  /(?:^|\.\s+)(?:and|or)\b\s+/gi,
];

const COLLAPSE_SPACES = /\s{2,}/g;
const TRAILING_PUNCT = /[\s,;:]+$/;
const LEADING_PUNCT = /^[\s,.;:]+/;

/**
 * Generic adjacent-word collapser. Triggers on any [3-20 char] alpha token
 * repeated immediately. Case-insensitive. Reports each unique double once.
 */
function dedupeAdjacent(text: string): { cleaned: string; removed: string[] } {
  const removed = new Set<string>();
  // Loop until stable to handle triple repeats like "garment garment garment".
  let prev = "";
  let cur = text;
  while (prev !== cur) {
    prev = cur;
    cur = cur.replace(
      /\b([A-Za-z][A-Za-z-]{1,19})\b(\s+)\1\b/gi,
      (_match, w: string) => {
        removed.add(`${w.toLowerCase()} ${w.toLowerCase()}`);
        return w;
      }
    );
  }
  return { cleaned: cur, removed: [...removed] };
}

/**
 * Public entry point — sanitize the EXACT string going to Fal.
 *
 * NOTE: This is intentionally a pure helper. It does NOT enforce length
 * limits — callers (Nano / FLUX route paths) apply their own `clampPromptLength`
 * after the sanitizer, because length thresholds differ per editor.
 */
export function sanitizeFinalImageEnhancePromptForFal(
  input: string
): FinalPromptSanitizeResult {
  const original = (input ?? "").toString();
  const lengthBefore = original.length;

  if (!original.trim()) {
    return {
      cleaned: "",
      removedSensitiveWords: [],
      removedDuplicatePatterns: [],
      lengthBefore,
      lengthAfter: 0,
    };
  }

  // 1) sensitive replacements
  const removedSensitive = new Set<string>();
  let working = original;
  for (const rule of SENSITIVE_RULES) {
    if (rule.pattern.test(working)) {
      removedSensitive.add(rule.label);
      // Reset lastIndex (some flags maintain it across calls)
      rule.pattern.lastIndex = 0;
      working = working.replace(rule.pattern, rule.replacement);
    }
  }

  // 2) broken fragments after stripping
  for (const re of BROKEN_FRAGMENT_PATTERNS) {
    working = working.replace(re, (match) =>
      match.startsWith(".") ? "." : " "
    );
  }

  // 3) named duplicates (reported by label)
  const removedDuplicates = new Set<string>();
  for (const rule of NAMED_DUPLICATE_RULES) {
    if (rule.pattern.test(working)) {
      removedDuplicates.add(rule.label);
      rule.pattern.lastIndex = 0;
      working = working.replace(rule.pattern, rule.replacement);
    }
  }

  // 4) generic adjacent-word collapser (catches whatever the named rules missed)
  const dedupe = dedupeAdjacent(working);
  working = dedupe.cleaned;
  for (const item of dedupe.removed) removedDuplicates.add(item);

  // 5) whitespace + punctuation cleanup
  working = working
    .replace(COLLAPSE_SPACES, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;])\s*([,;])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(LEADING_PUNCT, "")
    .replace(TRAILING_PUNCT, "")
    .trim();

  return {
    cleaned: working,
    removedSensitiveWords: [...removedSensitive].sort(),
    removedDuplicatePatterns: [...removedDuplicates].sort(),
    lengthBefore,
    lengthAfter: working.length,
  };
}

/**
 * Sentence-aware length clamp, exposed so callers can apply per-editor caps
 * (Nano <= 900, FLUX <= 750) after sanitization. Kept inline so this file
 * is the single source of truth for the final prompt shape.
 */
export function clampFinalPromptLength(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastDot = truncated.lastIndexOf(".");
  if (lastDot > maxLen * 0.6) return truncated.slice(0, lastDot + 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return truncated.slice(0, lastSpace).trim();
  return truncated.trim();
}

/** Hard caps used by route.ts when picking per-editor lengths. */
export const FINAL_PROMPT_LENGTH_CAPS = {
  "nano-banana-pro": 900,
  "flux-kontext-pro": 750,
} as const;
