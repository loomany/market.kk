import { z } from "zod";
import { MODEL_CAMERA_ANGLE_PROMPT_MAX } from "@/lib/ai/modelCustomParams";

export const productAngleAnalysisItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  cameraPrompt: z
    .string()
    .trim()
    .min(10)
    .max(MODEL_CAMERA_ANGLE_PROMPT_MAX),
});

export const productAngleAnalysisResponseSchema = z.object({
  ok: z.literal(true),
  angles: z.array(productAngleAnalysisItemSchema).min(1).max(8),
});

export type ProductAngleAnalysisItem = z.infer<
  typeof productAngleAnalysisItemSchema
>;

export type ProductAngleAnalysisSuccess = z.infer<
  typeof productAngleAnalysisResponseSchema
>;

export type ProductAngleAnalysisError = {
  ok: false;
  errorCode: string;
  message: string;
};
