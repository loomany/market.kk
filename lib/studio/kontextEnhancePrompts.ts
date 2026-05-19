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
 * is moderation-sensitive. Lowered from 900 → 750. Per-editor final cap is
 * also enforced post-sanitization in the route (see FINAL_PROMPT_LENGTH_CAPS).
 */
const KONTEXT_MAX_FINAL_LEN = 750;
const KONTEXT_MAX_INSTRUCTION_LEN = 240;

/**
 * Builds the final English prompt sent to fal-ai/flux-pro/kontext.
 *
 * Kept intentionally SHORT and SAFE: FLUX moderation can 422 on long,
 * sensitive-leaning prompts. The caller passes `productPreservationBlock` —
 * this MUST be the *external/safe* block produced by
 * `buildExternalProductPreservationBlock(...)`, not the detailed analysis.
 */
export function buildFluxKontextEditPrompt({
  userPrompt,
  enhancedPrompt,
  preserveProduct,
  productPreservationBlock,
}: KontextEnhancePromptInput): string {
  const rawInstruction =
    enhancedPrompt?.trim() ||
    userPrompt.trim() ||
    "Improve the scene, background, and lighting of the source photo.";
  const instruction = clampPromptLength(
    rawInstruction,
    KONTEXT_MAX_INSTRUCTION_LEN
  );

  const genericPreserveStrict =
    "Visible fashion product — keep color, pattern, material, shape, edges, proportions, and placement exactly the same.";

  const preserveCreative =
    "Keep the main product recognisable; do not change the dominant product color or pattern.";

  const dynamicBlock = (productPreservationBlock ?? "").trim();

  const preservation = preserveProduct
    ? dynamicBlock || genericPreserveStrict
    : preserveCreative;

  const compositionLine = preserveProduct
    ? "Keep the same subject and visible product unchanged. Only modify background, lighting, atmosphere, and scene context."
    : "Keep the source subject and the main product recognisable. Background, lighting, and atmosphere may change.";

  // ONE instruction, ONE composition line, ONE product fidelity line, ONE
  // short negative + footer — by design.
  const assembled = [
    `Edit instruction: ${instruction}.`,
    compositionLine,
    `Preserve the visible product: ${preservation}`,
    "Do not replace, recolor, redesign, or distort the product.",
    "Photoreal ecommerce result. No text, logos, watermarks.",
  ].join(" ");

  return clampPromptLength(assembled, KONTEXT_MAX_FINAL_LEN);
}
