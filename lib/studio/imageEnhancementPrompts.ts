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
