import { z } from "zod";

export const promptEnhanceRequestSchema = z.object({
  context: z.enum([
    "model-description",
    "product-shot",
    "video",
    "background",
    "scene",
  ]),
  userPrompt: z.string().trim().min(2).max(2000),
  sourceImageDescription: z.string().trim().max(1000).optional(),
  targetPlatform: z
    .enum(["marketplace", "instagram", "reels", "catalog"])
    .default("marketplace"),
  language: z.enum(["ru"]).default("ru"),
});

export type PromptEnhanceRequest = z.infer<
  typeof promptEnhanceRequestSchema
>;

export type PromptEnhanceSuccessResponse = {
  ok: true;
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt?: string;
  safetyNotes?: string;
  suggestions: string[];
  provider: "mock" | "openai";
  model: string;
};

export type PromptEnhanceErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
};

export type PromptEnhanceResponse =
  | PromptEnhanceSuccessResponse
  | PromptEnhanceErrorResponse;
