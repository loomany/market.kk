import { z } from "zod";
import { promptLocaleSchema } from "@/lib/ai/promptLocaleSchema";

export const promptEnhanceRequestSchema = z.object({
  context: z.enum([
    "model-description",
    "product-shot",
    "video",
    "background",
    "scene",
  ]),
  userPrompt: z.string().trim().min(2).max(2000),
  /** Locked parameter summary — enhance must not override (model-description) */
  lockedBasePrompt: z.string().trim().max(2000).optional(),
  sourceImageDescription: z.string().trim().max(1000).optional(),
  targetPlatform: z
    .enum(["marketplace", "instagram", "reels", "catalog"])
    .default("marketplace"),
  /** Site UI locale — enhancedPrompt is written in this language */
  language: promptLocaleSchema.default("ru"),
});

export type PromptEnhanceRequest = z.infer<
  typeof promptEnhanceRequestSchema
>;

export type PromptEnhanceSuccessResponse = {
  ok: true;
  originalPrompt: string;
  /** Text shown in the UI (site language); user may edit before generate */
  enhancedPrompt: string;
  /** English version for image/video models (reference; generate re-translates final text) */
  generationPrompt: string;
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
