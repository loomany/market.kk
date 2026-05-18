import { z } from "zod";

export const videoGenerateRequestSchema = z.object({
  sourceImageUrl: z.string().min(1),
  prompt: z.string().trim().min(8).max(2000),
  modelKey: z.enum(["kling", "minimax", "veo"]),
  quality: z.enum(["fast", "balanced", "high"]).default("balanced"),
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
});

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
