import { z } from "zod";
import { promptLocaleSchema } from "@/lib/ai/promptLocaleSchema";
import {
  IMAGE_ENHANCE_ASPECT_RATIOS,
  IMAGE_ENHANCE_OUTPUT_FORMATS,
  IMAGE_ENHANCE_QUALITY_TIERS,
} from "@/lib/ai/imageEnhanceSchemas";

export const textToImageGenerateRequestSchema = z.object({
  userPrompt: z.string().trim().min(1).max(2000),
  aspectRatio: z.enum(IMAGE_ENHANCE_ASPECT_RATIOS).default("9:16"),
  outputFormat: z.enum(IMAGE_ENHANCE_OUTPUT_FORMATS).default("png"),
  quality: z.enum(IMAGE_ENHANCE_QUALITY_TIERS).default("balanced"),
  locale: promptLocaleSchema.optional(),
  skipPromptPackage: z.boolean().optional().default(false),
  useNegativePrompt: z.boolean().optional().default(false),
  negativePrompt: z.string().trim().max(1000).optional(),
  clientAssetId: z.string().uuid().optional(),
});

export type TextToImageGenerateRequest = z.infer<
  typeof textToImageGenerateRequestSchema
>;

export type TextToImageGenerateSuccessResponse = {
  ok: true;
  imageUrl: string;
  provider: "fal" | "mock";
  model: string;
  promptUsed: string;
  requestId: string | null;
  estimatedCostUsd: number | null;
};

export type TextToImageGenerateErrorResponse = {
  ok: false;
  errorCode: string;
  message?: string;
};
