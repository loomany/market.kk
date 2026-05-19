/**
 * Prompt builder for fal-ai/flux-pro/kontext.
 *
 * Kontext is an "edit instruction" model rather than a "scene description"
 * model. It works best when the prompt reads as a *direct instruction*
 * targeted at one source image, with explicit constraints on what to keep
 * and what to change.
 *
 * Photorealism + product fidelity rules are injected here so the editor
 * never replaces the garment or distorts the model's body when the user
 * asks for a scene/lighting change.
 */

export type KontextEnhancePromptInput = {
  /** Raw text the user typed in the UI (e.g. "soft window light, luxury interior"). */
  userPrompt: string;
  /** Optional pre-enhanced prompt returned by /api/ai/prompt/enhance. */
  enhancedPrompt: string | null | undefined;
  /** When true, product and (if visible) body are locked; only scene/lighting changes. */
  preserveProduct: boolean;
  /**
   * Pre-computed Vision-derived product preservation block. When empty,
   * Kontext falls back to a generic, object-agnostic preservation sentence
   * (no hardcoded "bra", "lace", "sneakers", etc.).
   */
  productPreservationBlock?: string | null;
  /**
   * When true, the builder appends a short "brighten the scene" hint to the
   * user request section. Used by the dark-output retry path in
   * `/api/ai/image/enhance` (single retry, FLUX-only). No-op otherwise.
   */
  brightenForRetry?: boolean;
};

/** Sentence-aware length clamp. */
function clampPromptLength(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastDot = truncated.lastIndexOf(".");
  if (lastDot > maxLen * 0.6) return truncated.slice(0, lastDot + 1).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return truncated.slice(0, lastSpace).trim();
  return truncated.trim();
}

/**
 * Kontext prompts must stay SHORT — the model loses focus on long briefs and
 * is moderation-sensitive. Per-editor final cap is also enforced
 * post-sanitization in the route (see FINAL_PROMPT_LENGTH_CAPS).
 */
const KONTEXT_MAX_FINAL_LEN = 750;
const KONTEXT_MAX_INSTRUCTION_LEN = 220;
/**
 * The external product-preservation snippet is the longest variable piece of
 * the prompt; the garment-on-model safe template is exactly 263 chars (and
 * the generic-product template is 169) so 280 keeps both intact while
 * leaving headroom for the rest of the sections.
 *
 * Combined worst case (no brighten retry): 21 + 280 + 113 + 220 + 75 + 4
 * separators = ~713 chars — within the 750 cap. With the brighten retry
 * hint, the final clamp may drop the optional "Result: …" footer; that is
 * acceptable since the subject/scene/user sections are preservation-critical
 * and the result line is decorative.
 */
const KONTEXT_MAX_PRESERVATION_LEN = 280;

/** Single short hint used by the dark-output retry path. */
const KONTEXT_BRIGHTEN_HINT =
  "Bright natural daylight, well-lit subject, no dark studio lighting.";

/**
 * Builds the final English prompt sent to fal-ai/flux-pro/kontext.
 *
 * Sectioned instruct-style layout — Kontext is an edit-instruction model and
 * reads "Subject and product / Scene change / User request / Result"
 * headings unambiguously. The previous flat "Edit instruction: ... keep
 * unchanged ... modify scene" pattern was the documented trigger for the
 * "safe = dark" outputs we saw on portrait crops at high CFG (audit, sec. 6).
 *
 * `productPreservationBlock` MUST be the SAFE external block produced by
 * `buildExternalProductPreservationBlock(...)`. The preservation snippet is
 * folded into the "Subject and product" section so it is NOT duplicated as
 * a separate paragraph.
 */
export function buildFluxKontextEditPrompt({
  userPrompt,
  enhancedPrompt,
  preserveProduct,
  productPreservationBlock,
  brightenForRetry,
}: KontextEnhancePromptInput): string {
  const rawInstruction =
    enhancedPrompt?.trim() ||
    userPrompt.trim() ||
    "Improve the scene, background, and lighting of the source photo.";
  // Strip trailing punctuation BEFORE clamping so that `${instruction}.`
  // never produces "..", and so the brighten-retry sentence starts on a
  // clean boundary. The final-mile sanitizer would catch double dots but
  // the clamp can also cut the trailing Result section if we waste chars.
  const instruction = clampPromptLength(
    rawInstruction.replace(/[.,;:!?\s]+$/, "").trim(),
    KONTEXT_MAX_INSTRUCTION_LEN
  );

  const dynamicBlock = clampPromptLength(
    (productPreservationBlock ?? "").trim(),
    KONTEXT_MAX_PRESERVATION_LEN
  );

  // Fallback safe block — kept in sync with `genericExternalPreservationBlock`
  // so callers that omit `productPreservationBlock` still get a complete,
  // moderation-safe preservation sentence (not a sentence fragment).
  const safeFallback =
    "Preserve the visible product unchanged: same color, shape, material, placement, proportions, and overall look. Do not replace, recolor, redesign, or distort the product.";

  // Subject + product section.
  //  - preserveProduct=true → ONE safe sentence (either the dynamic safe
  //    block or the safe fallback). The block already ends with
  //    "Do not replace, recolor, redesign, or distort the product.", so we
  //    do NOT add a second copy here — that previously caused
  //    `dedupeAdjacent`-triggered noise in the trace and wasted prompt budget.
  //  - preserveProduct=false → soft line that still forbids replacing the
  //    dominant product or recolouring it.
  const subjectSection = preserveProduct
    ? `Subject and product: ${dynamicBlock || safeFallback}`
    : "Subject and product: Keep the source subject and the main product recognizable. Do not replace the product or change its dominant color or pattern.";

  // Scene change section — explicitly tells Kontext which axes are free to
  // move. Decoupled from subject preservation to avoid the old conflict.
  const sceneSection =
    "Scene change: Change only the background, lighting, atmosphere, and scene context according to the user request.";

  const userRequest = brightenForRetry
    ? `${instruction}. ${KONTEXT_BRIGHTEN_HINT}`
    : `${instruction}.`;

  const userSection = `User request: ${userRequest}`;

  const resultSection =
    "Result: Photoreal premium ecommerce image. No text, logos, or watermarks.";

  const assembled = [
    subjectSection,
    sceneSection,
    userSection,
    resultSection,
  ].join(" ");

  return clampPromptLength(assembled, KONTEXT_MAX_FINAL_LEN);
}
