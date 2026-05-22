import { z } from "zod";
import { promptLocaleSchema } from "@/lib/ai/promptLocaleSchema";
import type { ImageEnhanceDebugTrace } from "@/lib/ai/imageEnhanceDebugTypes";

export const IMAGE_ENHANCE_ASPECT_RATIOS = [
  "9:16",
  "4:5",
  "1:1",
  "3:4",
  "4:3",
  "16:9",
] as const;

export const IMAGE_ENHANCE_OUTPUT_FORMATS = ["png", "jpg"] as const;

export const IMAGE_ENHANCE_QUALITY_TIERS = ["fast", "balanced", "high"] as const;

export const IMAGE_ENHANCE_EDITORS = [
  "nano-banana-pro",
  "flux-kontext-pro",
] as const;

/** Per-editor capability map — authoritative for both UI and server validation.
 *
 * Source of truth: official Fal schemas
 *   - fal-ai/nano-banana-pro/edit
 *   - fal-ai/flux-pro/kontext
 *
 * Values not listed for an editor are NOT supported by that model's API.
 */
export const IMAGE_EDITOR_CAPABILITIES = {
  "nano-banana-pro": {
    aspectRatios: ["9:16", "4:5", "1:1", "3:4", "4:3", "16:9"],
    outputFormats: ["png", "jpg"],
    supportsQuality: true,
    supportsNegativePrompt: true,
  },
  "flux-kontext-pro": {
    aspectRatios: ["9:16", "1:1", "3:4", "4:3", "16:9"],
    outputFormats: ["png", "jpg"],
    supportsQuality: false,
    supportsNegativePrompt: true,
  },
} as const satisfies Record<
  (typeof IMAGE_ENHANCE_EDITORS)[number],
  {
    aspectRatios: readonly (typeof IMAGE_ENHANCE_ASPECT_RATIOS)[number][];
    outputFormats: readonly (typeof IMAGE_ENHANCE_OUTPUT_FORMATS)[number][];
    supportsQuality: boolean;
    /** Exclusions merged into main prompt (Fal has no negative_prompt on image editors). */
    supportsNegativePrompt: boolean;
  }
>;

export type ImageEditorId = (typeof IMAGE_ENHANCE_EDITORS)[number];

export function editorSupportsAspectRatio(
  editor: ImageEditorId,
  ratio: (typeof IMAGE_ENHANCE_ASPECT_RATIOS)[number]
): boolean {
  return (
    IMAGE_EDITOR_CAPABILITIES[editor].aspectRatios as readonly string[]
  ).includes(ratio);
}

export function editorSupportsOutputFormat(
  editor: ImageEditorId,
  format: (typeof IMAGE_ENHANCE_OUTPUT_FORMATS)[number]
): boolean {
  return (
    IMAGE_EDITOR_CAPABILITIES[editor].outputFormats as readonly string[]
  ).includes(format);
}

export const imageEnhanceRequestSchema = z.object({
  sourceImageUrl: z.string().trim().min(1).max(2048),
  userPrompt: z.string().trim().max(2000).default(""),
  enhancedPrompt: z.string().trim().max(4000).nullable().optional(),
  preserveProduct: z.boolean().default(true),
  aspectRatio: z.enum(IMAGE_ENHANCE_ASPECT_RATIOS).default("4:5"),
  outputFormat: z.enum(IMAGE_ENHANCE_OUTPUT_FORMATS).default("png"),
  quality: z.enum(IMAGE_ENHANCE_QUALITY_TIERS).default("balanced"),
  locale: promptLocaleSchema.optional(),
  selectedEditor: z.enum(IMAGE_ENHANCE_EDITORS).default("nano-banana-pro"),
  sourceAssetId: z.string().trim().max(120).nullable().optional(),
  /**
   * Pre-computed dynamic product preservation block (Vision-derived) for
   * post-processing. When absent, builders fall back to the generic block.
   */
  productPreservationBlock: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional(),
  useNegativePrompt: z.boolean().optional().default(false),
  negativePrompt: z.string().trim().max(1000).optional(),
  /** When true, skip OpenAI packaging (user pasted a full AI prompt). */
  skipPromptPackage: z.boolean().optional().default(false),
  /** Billing: preservation Vision already ran for this asset. */
  hasPreservationCached: z.boolean().optional().default(false),
  /** Pending gallery asset id — idempotency & resume after reload. */
  clientAssetId: z.string().uuid().optional(),
});

export type ImageEnhanceRequest = z.infer<typeof imageEnhanceRequestSchema>;

export type ImageEnhanceAspectRatio =
  (typeof IMAGE_ENHANCE_ASPECT_RATIOS)[number];
export type ImageEnhanceOutputFormat =
  (typeof IMAGE_ENHANCE_OUTPUT_FORMATS)[number];
export type ImageEnhanceQualityTier =
  (typeof IMAGE_ENHANCE_QUALITY_TIERS)[number];

export type ImageEnhanceSuccessResponse = {
  ok: true;
  imageUrl: string;
  provider: "fal" | "mock";
  model: string;
  editor: ImageEditorId;
  promptUsed: string;
  requestId: string | null;
  estimatedCostUsd: number | null;
  meta: {
    aspectRatio: ImageEnhanceAspectRatio;
    outputFormat: ImageEnhanceOutputFormat;
    quality: ImageEnhanceQualityTier;
    preserveProduct: boolean;
  };
  /** Diagnostic trace — populated only when AI_IMAGE_ENHANCE_DEBUG is on. */
  debug?: ImageEnhanceDebugTrace;
};

export type ImageEnhanceErrorResponse = {
  ok: false;
  error: string;
  providerError?: string;
  code:
    | "VALIDATION_ERROR"
    | "EDITOR_UNSUPPORTED_OPTION"
    | "PAID_AI_RUNS_DISABLED"
    | "BUDGET_EXCEEDED"
    | "FAL_KEY_MISSING"
    | "FAL_NO_IMAGE"
    | "FAL_CONTENT_REJECTED"
    /**
     * Fal model returned a uniform safety placeholder (audit-confirmed
     * pattern: solid RGB(0,0,0) 1024×768 PNG, ~10 KB). Treated as a content
     * rejection, but reported separately so the UI can suggest a different
     * editor or a less explicit source instead of "try a different prompt".
     */
    | "FAL_SAFETY_PLACEHOLDER"
    | "FAL_TIMEOUT"
    | "FAL_GENERIC_ERROR"
    | "UNKNOWN_ERROR";
  /** Diagnostic trace — populated only when AI_IMAGE_ENHANCE_DEBUG is on. */
  debug?: ImageEnhanceDebugTrace;
};

export type ImageEnhanceResponse =
  | ImageEnhanceSuccessResponse
  | ImageEnhanceErrorResponse;
