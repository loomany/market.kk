import { z } from "zod";

export const sceneGenerateRequestSchema = z.object({
  sourceImageUrl: z.string().min(1),
  prompt: z.string().trim().min(4).max(2000),
  mode: z.enum(["exact-background", "creative-scene"]),
  aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  outputFormat: z.enum(["png", "jpeg", "webp"]).default("png"),
});

export type SceneGenerateRequest = z.infer<typeof sceneGenerateRequestSchema>;

export type SceneGenerateSuccessResponse = {
  ok: true;
  provider: "mock" | "fal";
  model: string;
  image: { url: string; width?: number; height?: number };
  requestId: string;
  estimatedCost?: number;
};

export type SceneGenerateErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  estimatedCost?: number;
};

export type SceneGenerateResponse =
  | SceneGenerateSuccessResponse
  | SceneGenerateErrorResponse;
