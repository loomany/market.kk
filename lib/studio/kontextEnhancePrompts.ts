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
  /** When true, garment and body are locked; only scene/lighting changes. */
  preserveProduct: boolean;
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

/** Kontext prompts must stay short — the model loses focus on long briefs. */
const KONTEXT_MAX_FINAL_LEN = 1200;
const KONTEXT_MAX_INSTRUCTION_LEN = 400;

/** Builds the final English prompt sent to fal-ai/flux-pro/kontext. */
export function buildFluxKontextEditPrompt({
  userPrompt,
  enhancedPrompt,
  preserveProduct,
}: KontextEnhancePromptInput): string {
  const rawInstruction =
    enhancedPrompt?.trim() ||
    userPrompt.trim() ||
    "Improve the scene, background, and lighting of the source photo.";
  const instruction = clampPromptLength(
    rawInstruction,
    KONTEXT_MAX_INSTRUCTION_LEN
  );

  const preserveStrict = [
    "Keep the same person, pose, body, face, skin tone, and clothing exactly the same",
    "Only modify: scene, background, lighting, atmosphere, and light direction",
    "Do not change: garment shape, garment color, garment pattern, lace details, straps, seams, fit, or the model's body proportions",
  ];

  const preserveCreative = [
    "Keep the same person and recognisable garment design",
    "Background, lighting, and atmosphere may change",
    "Do not change the dominant product color or pattern",
  ];

  const photorealism = [
    "Photoreal result, premium ecommerce quality",
    "Natural skin texture, natural shadows, realistic light direction",
  ];

  const negative = [
    "Avoid: plastic skin, waxy texture, doll-like appearance",
    "Avoid: distorted lace, warped garment edges",
    "Avoid: changing the outfit, pasted-on clothing",
    "Avoid: text, logos, watermarks",
  ];

  const constraints = preserveProduct ? preserveStrict : preserveCreative;

  const assembled = [
    `Edit instruction: ${instruction}.`,
    `${constraints.join(". ")}.`,
    `${photorealism.join(". ")}.`,
    `${negative.join(". ")}.`,
  ].join(" ");

  return clampPromptLength(assembled, KONTEXT_MAX_FINAL_LEN);
}
