import { z } from "zod";
import { promptLocaleSchema } from "@/lib/ai/promptLocaleSchema";
import { variantRequiresReferenceVideo } from "@/lib/ai/videoCatalog";

const videoVariantIds = [
  "kling-v3-standard",
  "kling-v3-pro",
  "kling-v2.6-pro",
  "kling-v1.5-pro",
  "kling-v2.6-motion-control",
  "kling-v2.6-motion-pro",
  "kling-v3-motion-standard",
  "minimax-hailuo-02",
  "veo-3.1",
  "veo-3.1-fast",
  "veo-3-fast",
] as const;

export const videoGenerateRequestSchema = z
  .object({
    sourceImageUrl: z.string().min(1),
    prompt: z.string().trim().min(1).max(2000),
    /** Preferred: exact Fal variant */
    variantId: z.enum(videoVariantIds).optional(),
    /** Legacy alias — mapped to variantId on the server */
    modelKey: z.enum(videoVariantIds).optional(),
    quality: z.enum(["fast", "balanced", "high", "ultra"]).default("balanced"),
    durationSeconds: z.number().int().min(3).max(15).default(5),
    aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("9:16"),
    motionPreset: z
      .enum([
        "subtle-motion",
        "model-turn",
        "camera-push",
        "continue-scene",
        "product-fidelity",
      ])
      .default("subtle-motion"),
    referenceVideoUrl: z.string().url().optional(),
    characterOrientation: z.enum(["image", "video"]).optional(),
    promptLocale: promptLocaleSchema.optional(),
    generateAudio: z.boolean().optional().default(false),
    /** Optional audio direction (merged into main prompt; no separate Fal field). */
    soundPrompt: z.string().trim().max(1000).optional(),
    useNegativePrompt: z.boolean().optional().default(false),
    negativePrompt: z.string().trim().max(1000).optional(),
    keepReferenceSound: z.boolean().optional().default(false),
    /** Pending gallery asset id — idempotency & resume after reload. */
    clientAssetId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.variantId && !data.modelKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "variantId is required",
        path: ["variantId"],
      });
    }
    const variantId = data.variantId ?? data.modelKey;
    if (
      variantId &&
      variantRequiresReferenceVideo(variantId) &&
      !data.referenceVideoUrl?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "referenceVideoUrl is required for motion control",
        path: ["referenceVideoUrl"],
      });
    } else if (
      variantId &&
      !variantRequiresReferenceVideo(variantId) &&
      data.prompt.trim().length < 8
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "prompt too short",
        path: ["prompt"],
      });
    }
  });

export function resolveVideoVariantId(body: {
  variantId?: string;
  modelKey?: string;
}): (typeof videoVariantIds)[number] | null {
  const id = body.variantId ?? body.modelKey;
  if (!id) return null;
  return videoVariantIds.includes(id as (typeof videoVariantIds)[number])
    ? (id as (typeof videoVariantIds)[number])
    : null;
}

export type VideoGenerateRequest = z.infer<typeof videoGenerateRequestSchema>;

export type VideoGenerateSuccessResponse = {
  ok: true;
  provider: "mock" | "fal";
  model: string;
  video: {
    url: string;
    posterUrl?: string;
    width?: number;
    height?: number;
    duration: number;
    format?: string;
  };
  requestId: string;
  estimatedCost?: number;
};

export type VideoGenerateErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  estimatedCost?: number;
};

export type VideoGenerateResponse =
  | VideoGenerateSuccessResponse
  | VideoGenerateErrorResponse;
