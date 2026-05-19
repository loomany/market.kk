import { z } from "zod";

/**
 * Object-agnostic product preservation analysis used by "Проработка → Изображение".
 *
 * Goal: identify the main visible product on the selected asset and describe
 * what must remain unchanged when an image editor (Nano / FLUX) modifies the
 * scene. Works for any product (garment, footwear, jewelry, accessory,
 * cosmetic, bag, electronics, etc.) — Vision sets the category, not the code.
 *
 * Isolated from the try-on / FASHN / generate-model pipelines. Do NOT import
 * this from those modules.
 */

export const PRODUCT_PRESERVATION_OBJECT_TYPES = [
  "garment",
  "footwear",
  "jewelry",
  "accessory",
  "cosmetic",
  "bag",
  "electronics",
  "product",
  "unknown",
] as const;

export type ProductPreservationObjectType =
  (typeof PRODUCT_PRESERVATION_OBJECT_TYPES)[number];

export const productPreservationAnalysisSchema = z.object({
  primaryObject: z.string().trim().max(160),
  objectType: z.enum(PRODUCT_PRESERVATION_OBJECT_TYPES),
  shortDescription: z.string().trim().max(400),
  visibleDetails: z.array(z.string().trim().max(120)).max(20).default([]),
  colors: z.array(z.string().trim().max(60)).max(12).default([]),
  materials: z.array(z.string().trim().max(60)).max(12).default([]),
  shapeSilhouette: z.string().trim().max(200).default(""),
  patternOrTexture: z.string().trim().max(200).default(""),
  edgesAndConstruction: z
    .array(z.string().trim().max(120))
    .max(20)
    .default([]),
  mustPreserve: z.array(z.string().trim().max(160)).max(20).default([]),
  mustNotChange: z.array(z.string().trim().max(160)).max(20).default([]),
  confidence: z.number().min(0).max(1),
  notes: z.string().trim().max(400).default(""),
});

export type ProductPreservationAnalysis = z.infer<
  typeof productPreservationAnalysisSchema
>;

/** Confidence floor above which the Vision detail is trusted enough to put
 *  category-specific wording into the prompt. Below this — generic fallback. */
export const PRODUCT_PRESERVATION_MIN_CONFIDENCE = 0.55;

/** Strict JSON schema for OpenAI Responses API (`text.format.json_schema`).
 *  All keys are required + `additionalProperties: false` — required by strict mode. */
export const PRODUCT_PRESERVATION_VISION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    primaryObject: { type: "string" },
    objectType: {
      type: "string",
      enum: [...PRODUCT_PRESERVATION_OBJECT_TYPES],
    },
    shortDescription: { type: "string" },
    visibleDetails: { type: "array", items: { type: "string" } },
    colors: { type: "array", items: { type: "string" } },
    materials: { type: "array", items: { type: "string" } },
    shapeSilhouette: { type: "string" },
    patternOrTexture: { type: "string" },
    edgesAndConstruction: { type: "array", items: { type: "string" } },
    mustPreserve: { type: "array", items: { type: "string" } },
    mustNotChange: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    notes: { type: "string" },
  },
  required: [
    "primaryObject",
    "objectType",
    "shortDescription",
    "visibleDetails",
    "colors",
    "materials",
    "shapeSilhouette",
    "patternOrTexture",
    "edgesAndConstruction",
    "mustPreserve",
    "mustNotChange",
    "confidence",
    "notes",
  ],
} as const;

/** Vision-prompt rules — universal across product categories. */
export const PRODUCT_PRESERVATION_VISION_RULES: readonly string[] = [
  "Identify the MAIN product/object that should be preserved during image editing.",
  "Do NOT assume the product is clothing. It can be jewelry, shoes, handbag, cosmetics, accessory, garment, electronics, or any visible commercial product.",
  "Describe ONLY visible product details. Do NOT invent details that are not in the image.",
  "Do NOT describe the person's face, identity, ethnicity, age, or body as the product.",
  "Do NOT describe the background or lighting as the product.",
  "If the photo shows a person wearing or holding the product, describe ONLY the product (not the person).",
  "Avoid sexualised wording even if the product is intimate apparel — keep neutral, commercial, catalog-grade language.",
  "If there are multiple visible products, pick the most prominent / centered one as primaryObject; mention others briefly in notes.",
  "If you cannot reliably identify a single product, set objectType to 'unknown' and confidence below 0.55.",
  "mustPreserve: 4–10 short English phrases — the exact visible details (color, shape, material, pattern, construction) that must NOT change during editing.",
  "mustNotChange: short English phrases describing forbidden transformations (e.g. 'do not change strap width', 'do not alter clasp shape').",
  "Return STRICT JSON only — no prose, no markdown.",
];

/** Request schema for `/api/ai/image/preservation-analyze`. */
export const productPreservationRequestSchema = z.object({
  imageUrl: z.string().trim().min(1).max(4096),
  /** Optional hint from the user textarea — used as a soft cue, never as ground truth. */
  userPromptHint: z.string().trim().max(2000).optional(),
  /** Optional asset id to help with caching/logging on the client side. */
  sourceAssetId: z.string().trim().max(120).nullable().optional(),
});

export type ProductPreservationRequest = z.infer<
  typeof productPreservationRequestSchema
>;

export type ProductPreservationSuccessResponse = {
  ok: true;
  analysis: ProductPreservationAnalysis;
  /** Detailed block — used in dev debug only. Not sent to Fal. */
  preservationBlock: string;
  /** Short, sensitive-words-stripped block actually sent to Fal. */
  externalPreservationBlock: string;
  provider: "openai" | "mock";
  model: string;
  usedVision: boolean;
};

export type ProductPreservationErrorResponse = {
  ok: false;
  error: string;
  errorCode:
    | "VALIDATION_ERROR"
    | "PAID_AI_RUNS_DISABLED"
    | "BUDGET_EXCEEDED"
    | "OPENAI_API_KEY_MISSING"
    | "OPENAI_VISION_FAILED"
    | "UNKNOWN_ERROR";
  providerError?: string;
};

export type ProductPreservationResponse =
  | ProductPreservationSuccessResponse
  | ProductPreservationErrorResponse;
