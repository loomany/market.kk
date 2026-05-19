/**
 * Prompt-construction helpers for post-processing (Nano Banana / scene / video).
 *
 * The user writes a short, simple prompt. Before generation we wrap it with
 * professional photorealistic and product-preservation rules so the downstream
 * GPT-5.5 prompt enhancer always produces a safe, high-fidelity final prompt
 * for the image / video editor.
 */

export type PostProcessingTaskKind = "image" | "video";

const PHOTOREALISTIC_RULES_RU = [
  "фотореалистичный взрослый человек, не пластик, не кукла, не игрушка",
  "натуральная текстура кожи, видимые поры, реалистичные тени",
  "реалистичные пропорции тела",
  "натуральный контакт ткани с кожей",
  "натуральные тени, премиальный студийный свет",
];

const PRODUCT_PRESERVATION_RULES_RU = [
  "сохранить дизайн товара: цвет, форму, кружево, узор, края",
  "не превращать товар в другое изделие",
  "не менять посадку и материал товара",
];

const NEGATIVE_RULES_RU = [
  "избегать: пластиковая кожа",
  "избегать: восковое или CGI-лицо",
  "избегать: пересглаженная кожа",
  "избегать: нереалистичный свет и искажённые края товара",
];

const VIDEO_RULES_RU = [
  "стабильное натуральное движение",
  "товар не деформируется во время движения",
];

type BuildEnhancerInput = {
  userPrompt: string;
  task: PostProcessingTaskKind;
  preserveProduct: boolean;
};

/** Plain-text guard prepended to the user's prompt before /api/ai/prompt/enhance.
 *  The enhancer is responsible for translating + expanding into a final English
 *  prompt for the image/video model; here we only inject *hard* constraints.
 */
export function buildEnhancerUserPrompt({
  userPrompt,
  task,
  preserveProduct,
}: BuildEnhancerInput): string {
  const user = userPrompt.trim();
  const guard: string[] = [...PHOTOREALISTIC_RULES_RU];

  if (preserveProduct) {
    guard.push(...PRODUCT_PRESERVATION_RULES_RU);
  }

  if (task === "video") {
    guard.push(...VIDEO_RULES_RU);
  }

  guard.push(...NEGATIVE_RULES_RU);

  const guardLine = guard.join("; ");

  if (!user) return guardLine;
  return `${user}. Обязательные требования: ${guardLine}.`;
}

/** Local fallback used when the enhancer API returns an error — we still send
 *  a prompt that contains the preservation and photorealism rules. */
export function buildFallbackGenerationPrompt({
  userPrompt,
  task,
  preserveProduct,
}: BuildEnhancerInput): string {
  const photo = [
    "photorealistic adult human model, not plastic, not doll-like, not toy-like",
    "natural skin texture with realistic pores and shading",
    "realistic body proportions and natural fabric-to-skin contact",
    "natural shadows, premium commercial studio lighting",
  ];

  const preserve = preserveProduct
    ? [
        "preserve the product design exactly",
        "preserve color, shape, lace, pattern and garment edges",
        "do not change the garment into a different product",
      ]
    : [
        "preserve product silhouette and recognisable details",
      ];

  const negative = [
    "avoid plastic skin",
    "avoid doll face and waxy texture",
    "avoid over-smoothed skin and CGI look",
    "avoid distorted garment edges and pasted-on clothing",
  ];

  const taskLine =
    task === "video"
      ? "Generate a stable photoreal short video clip with subtle motion"
      : "Generate a photoreal premium ecommerce photo";

  return [
    `${taskLine}.`,
    `User intent: ${userPrompt.trim() || "improve the photo without changing the product."}`,
    `Photorealism: ${photo.join("; ")}.`,
    `Product fidelity: ${preserve.join("; ")}.`,
    `Negative: ${negative.join("; ")}.`,
  ].join(" ");
}

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
 * Upper bound on the assembled Nano Banana prompt (safe margin for queue).
 * Lowered from 1200 → 900 after black-screen / 422 debugging — shorter and
 * cleaner prompts pass Fal moderation reliably. The final per-editor cap is
 * also enforced post-sanitization in the route (see FINAL_PROMPT_LENGTH_CAPS).
 */
const NANO_BANANA_MAX_FINAL_LEN = 900;
/** Upper bound on the raw intent that flows into the Nano builder. */
const NANO_BANANA_MAX_INTENT_LEN = 280;

/**
 * Server-side guardrails for fal-ai/nano-banana-pro/edit.
 *
 * Kept intentionally SHORT and SAFE: Nano/Fal moderation can 422 on long,
 * sensitive-leaning prompts (lingerie photos especially). The caller passes
 * `productPreservationBlock` — this MUST be the *external/safe* block
 * produced by `buildExternalProductPreservationBlock(...)`, not the
 * detailed analysis. When the block is absent we fall back to a generic,
 * object-agnostic preservation sentence.
 */
export function buildNanoBananaEnhancePrompt(input: {
  userPrompt: string;
  enhancedPrompt: string | null | undefined;
  preserveProduct: boolean;
  /**
   * Pre-computed SAFE external preservation block. Empty/undefined →
   * generic safe fallback. Treated as a self-contained, already-safe
   * sentence: do NOT prefix it with "Preserve the visible product
   * exactly:" — the block itself starts with "Keep the clothing ..." or
   * "Preserve the visible product unchanged:" by construction.
   */
  productPreservationBlock?: string | null;
}): string {
  const rawIntent =
    input.enhancedPrompt?.trim() ||
    input.userPrompt.trim() ||
    "Improve realism, lighting, and background without changing the product.";
  const intent = clampPromptLength(rawIntent, NANO_BANANA_MAX_INTENT_LEN);

  // Fallback when no Vision analysis was passed (low-confidence /
  // generic-product / unknown). Matches `genericExternalPreservationBlock`
  // so the two paths produce identical output and we stay single-source.
  const safeFallback =
    "Preserve the visible product unchanged: same color, shape, material, placement, proportions, and overall look. Do not replace, recolor, redesign, or distort the product.";

  // preserveProduct=false → softer "background may change" wording.
  const preserveCreative =
    "Keep the main product recognisable. Background, lighting, and atmosphere may change. Do not replace the product or change its dominant color or pattern.";

  const dynamicBlock = (input.productPreservationBlock ?? "").trim();

  const preservationSentence = input.preserveProduct
    ? dynamicBlock || safeFallback
    : preserveCreative;

  // ONE user intent, ONE product fidelity sentence (the safe block itself
  // ends with "Do not replace, recolor, redesign, or distort the product."
  // — adding another copy of that line would just trigger the duplicate-
  // sentence collapser in the sanitizer).
  const assembled = [
    "Edit the source image for premium ecommerce quality.",
    `User intent: ${intent}.`,
    preservationSentence,
    "Improve only lighting, background, realism, shadows, and cleanup.",
    "No text, logos, or watermarks.",
  ].join(" ");

  return clampPromptLength(assembled, NANO_BANANA_MAX_FINAL_LEN);
}
