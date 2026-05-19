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
  MODEL_CAMERA_ANGLE_PROMPT_MAX,
  MODEL_CUSTOM_TEXT_MAX,
  MODEL_PARAM_CUSTOM,
  PRODUCT_POSE_DESCRIPTION_RU_MAX,
} from "@/lib/ai/modelCustomParams";
import { MODEL_LIGHTING_PRESET_IDS } from "@/lib/ai/modelLighting";

export const generateModelRequestSchema = z
  .object({
  gender: z.enum(["female", "male"]).default("female"),
  modelNationality: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
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
    .enum(["full-body", "upper-body", "upper-thigh", MODEL_PARAM_CUSTOM])
    .default("full-body"),
  cropCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  bodyTypeCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  background: z.enum(["white", "light-gray", "studio"]).default("white"),
  lighting: z
    .enum([...MODEL_LIGHTING_PRESET_IDS, MODEL_PARAM_CUSTOM])
    .default("studio"),
  lightingCustom: z.string().trim().max(MODEL_CUSTOM_TEXT_MAX).optional(),
  categoryContext: z
    .enum(["general", "clothing", "lingerie", "jewelry"])
    .default("clothing"),
  aspectRatio: z.enum(FAL_MODEL_ASPECT_RATIOS),
  outputFormat: z.enum(["png", "jpeg", "webp"]).default("png"),
  resolution: z.enum(FAL_MODEL_RESOLUTIONS),
  numImages: z.number().int().min(1).max(4).default(1),
  seed: z.number().int().optional(),
  customDescription: z.string().trim().max(1000).optional(),
  /** Per-angle camera framing (English or translated on server) */
  cameraAnglePrompt: z
    .string()
    .trim()
    .max(MODEL_CAMERA_ANGLE_PROMPT_MAX)
    .optional(),
  /** Russian pose label from product photo analysis (for GPT prompt composer) */
  productPoseDescriptionRu: z
    .string()
    .trim()
    .max(PRODUCT_POSE_DESCRIPTION_RU_MAX)
    .optional(),
  /** Merchant-checked product description (Russian); priority over AI pose text */
  productDescriptionRu: z
    .string()
    .trim()
    .max(PRODUCT_POSE_DESCRIPTION_RU_MAX)
    .optional(),
  shortAiSummaryEn: z.string().trim().max(600).optional(),
  productSetType: z
    .enum([
      "bra_brief_set",
      "bra_only",
      "bottoms_only",
      "dress",
      "top",
      "bottom",
      "unknown",
    ])
    .optional(),
  productSourcePresentation: z
    .enum(["on-model", "flat-lay", "unknown"])
    .optional(),
  productMustPreserve: z.array(z.string().trim().max(160)).max(16).optional(),
  productFitNotes: z.array(z.string().trim().max(200)).max(12).optional(),
  /** On-model reference: body/pose/framing only (from product analysis) */
  sourceModelPromptEn: z.string().trim().max(900).optional(),
  sourceModelSizeClass: z.string().trim().max(40).optional(),
  sourceModelPose: z.string().trim().max(400).optional(),
  sourceModelCrop: z.string().trim().max(40).optional(),
  sourceModelCameraAngle: z.string().trim().max(300).optional(),
  sourceModelHandsPosition: z.string().trim().max(200).optional(),
  sourceModelFraming: z.string().trim().max(300).optional(),
  /** Hero image URL — when set, uses image edit to preserve face and outfit */
  referenceImageUrl: z.string().url().max(2048).optional(),
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
    if (data.lighting === MODEL_PARAM_CUSTOM && !data.lightingCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "lightingCustom is required when lighting is custom",
        path: ["lightingCustom"],
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
  /** How the Fal prompt was built */
  promptComposer?: "openai" | "template";
  openAiPromptModel?: string;
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
