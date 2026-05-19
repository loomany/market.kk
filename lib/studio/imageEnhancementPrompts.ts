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

/** Upper bound on the assembled Nano Banana prompt (safe margin for queue). */
const NANO_BANANA_MAX_FINAL_LEN = 1800;
/** Upper bound on the raw intent that flows into the Nano builder. */
const NANO_BANANA_MAX_INTENT_LEN = 600;

/**
 * Server-side guardrails for fal-ai/nano-banana-pro/edit.
 *
 * The UI either already enriched the prompt via /api/ai/prompt/enhance
 * (`enhancedPrompt`) or only sends the raw `userPrompt`. Either way the
 * route MUST wrap the text with strict photorealism + product-preservation
 * rules so the editor never replaces the garment or produces CGI-looking
 * output. Returns a single English prompt string ready for Fal.
 */
export function buildNanoBananaEnhancePrompt(input: {
  userPrompt: string;
  enhancedPrompt: string | null | undefined;
  preserveProduct: boolean;
}): string {
  const rawIntent =
    input.enhancedPrompt?.trim() ||
    input.userPrompt.trim() ||
    "Improve realism, lighting, and background without changing the product.";
  const intent = clampPromptLength(rawIntent, NANO_BANANA_MAX_INTENT_LEN);

  const photorealism = [
    "photorealistic adult human model",
    "real person, not plastic, not doll-like, not toy-like",
    "natural skin texture with realistic pores",
    "natural body shading and realistic skin tones",
    "realistic fabric-to-skin contact and natural shadows",
    "premium commercial studio lighting",
    "remove CGI, wax, toy-like or doll-like appearance",
  ];

  const preserveStrict = [
    "Preserve the exact product design",
    "Preserve color, shape, silhouette, lace, pattern, fabric edges, straps, seams, and garment category",
    "Do not replace the bra, briefs, or any garment with another product",
    "Do not change the garment into a different product",
    "Do not alter product color or decorative pattern",
    "Improve only realism, light, shadows, background, skin realism, and artifact cleanup",
  ];

  const preserveCreative = [
    "Keep the main product recognisable",
    "Background, atmosphere and lighting may change",
    "Do not replace the product with another item",
    "Do not change the dominant product color or pattern",
  ];

  const negative = [
    "avoid plastic skin",
    "avoid doll face",
    "avoid toy-like body",
    "avoid waxy texture",
    "avoid over-smoothed skin",
    "avoid pasted-on garment",
    "avoid warped lace",
    "avoid distorted anatomy",
    "avoid changing garment shape",
    "avoid changing product color",
    "avoid replacing the outfit",
  ];

  const preservation = input.preserveProduct
    ? preserveStrict
    : preserveCreative;

  const assembled = [
    "Edit the source product photo for premium ecommerce use.",
    `User intent: ${intent}`,
    `Photorealism: ${photorealism.join("; ")}.`,
    `Product fidelity: ${preservation.join("; ")}.`,
    `Negative: ${negative.join("; ")}.`,
    "Return one photoreal image; do not add text, logos, or watermarks.",
  ].join(" ");

  return clampPromptLength(assembled, NANO_BANANA_MAX_FINAL_LEN);
}
