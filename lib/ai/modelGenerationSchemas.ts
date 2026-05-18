import { z } from "zod";
import { MODEL_BODY_TYPE_IDS } from "@/components/studio/types";
import { promptLocaleSchema } from "@/lib/ai/promptLocaleSchema";
import {
  isAdultModelAge,
  MODEL_AGE_MAX,
  MODEL_AGE_MIN,
  DEFAULT_MODEL_AGE,
} from "@/lib/ai/modelAge";
import {
  FAL_MODEL_ASPECT_RATIOS,
  FAL_MODEL_RESOLUTIONS,
} from "@/lib/ai/modelOutputSizes";
import {
  MODEL_CUSTOM_TEXT_MAX,
  MODEL_PARAM_CUSTOM,
} from "@/lib/ai/modelCustomParams";

export const generateModelRequestSchema = z
  .object({
  gender: z.enum(["female", "male"]).default("female"),
  bodyType: z.enum(MODEL_BODY_TYPE_IDS).default("standard"),
  modelAge: z
    .number()
    .int()
    .min(MODEL_AGE_MIN)
    .max(MODEL_AGE_MAX)
    .default(DEFAULT_MODEL_AGE),
  pose: z
    .enum(["front", "slight-angle", MODEL_PARAM_CUSTOM])
    .default("front"),
  poseCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  crop: z
    .enum(["full-body", "upper-body", MODEL_PARAM_CUSTOM])
    .default("full-body"),
  cropCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  bodyTypeCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  background: z.enum(["white", "light-gray", "studio"]).default("white"),
  categoryContext: z
    .enum(["general", "clothing", "lingerie", "jewelry"])
    .default("clothing"),
  aspectRatio: z.enum(FAL_MODEL_ASPECT_RATIOS),
  outputFormat: z.enum(["png", "jpeg", "webp"]).default("png"),
  resolution: z.enum(FAL_MODEL_RESOLUTIONS),
  numImages: z.number().int().min(1).max(4).default(1),
  seed: z.number().int().optional(),
  customDescription: z.string().trim().max(1000).optional(),
  /** Locale of customDescription in the UI; server translates to English for Fal */
  promptLocale: promptLocaleSchema.optional(),
})
  .superRefine((data, ctx) => {
    if (data.bodyType === MODEL_PARAM_CUSTOM && !data.bodyTypeCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bodyTypeCustom is required when bodyType is custom",
        path: ["bodyTypeCustom"],
      });
    }
    if (data.pose === MODEL_PARAM_CUSTOM && !data.poseCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "poseCustom is required when pose is custom",
        path: ["poseCustom"],
      });
    }
    if (data.crop === MODEL_PARAM_CUSTOM && !data.cropCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "cropCustom is required when crop is custom",
        path: ["cropCustom"],
      });
    }
    if (isAdultModelAge(data.modelAge)) return;
    if (data.categoryContext === "lingerie") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Lingerie and swimwear scenarios require a model age of 18 or older.",
        path: ["categoryContext"],
      });
    }
    if (data.bodyType === "swimwear") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Swimwear body type requires a model age of 18 or older.",
        path: ["bodyType"],
      });
    }
  });

export type GenerateModelRequest = z.infer<typeof generateModelRequestSchema>;

export type GenerateModelImage = {
  url: string;
  width?: number;
  height?: number;
};

export type GenerateModelSuccessResponse = {
  ok: true;
  provider: string;
  model: string;
  images: GenerateModelImage[];
  requestId: string;
  promptPreview: string;
  description?: string;
};

export type GenerateModelErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  issues?: z.ZodIssue[];
};

export type GenerateModelResponse =
  | GenerateModelSuccessResponse
  | GenerateModelErrorResponse;
