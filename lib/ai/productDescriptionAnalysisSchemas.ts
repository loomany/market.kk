import { z } from "zod";
import { PRODUCT_POSE_DESCRIPTION_RU_MAX } from "@/lib/ai/modelCustomParams";
import { LINGERIE_SET_TYPES } from "@/lib/ai/lingerieSetType";

export const PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD = 0.75;

export function isConfidentProductAnalysis(
  confidence: number,
  threshold = PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD
): boolean {
  return confidence >= threshold;
}

const braPartSchema = z.object({
  present: z.boolean(),
  style: z.string().trim().max(120).nullable(),
  cupShape: z.string().trim().max(120).nullable(),
  straps: z.string().trim().max(120).nullable(),
});

const bottomsPartSchema = z.object({
  present: z.boolean(),
  style: z.string().trim().max(120).nullable(),
  rise: z.string().trim().max(120).nullable(),
});

export const SOURCE_MODEL_SIZE_CLASSES = [
  "petite",
  "slim",
  "standard",
  "curvy",
  "plus-size",
  "xl",
  "2xl",
  "unknown",
] as const;

export const SOURCE_MODEL_CROPS = [
  "full-body",
  "upper-body",
  "waist-up",
  "upper-thigh",
  "close-up",
  "unknown",
] as const;

export const productSourceModelSchema = z.object({
  bodyType: z.string().trim().max(200).nullable(),
  sizeClass: z.enum(SOURCE_MODEL_SIZE_CLASSES).nullable(),
  pose: z.string().trim().max(400).nullable(),
  /** Short Russian pose line for merchant UI */
  poseRu: z.string().trim().max(200).nullable(),
  crop: z.enum(SOURCE_MODEL_CROPS).nullable(),
  cameraAngle: z.string().trim().max(300).nullable(),
  handsPosition: z.string().trim().max(200).nullable(),
  framing: z.string().trim().max(300).nullable(),
  bodyVisibility: z.string().trim().max(200).nullable(),
  descriptionRu: z.string().trim().max(400).nullable(),
  promptEn: z.string().trim().max(900).nullable(),
});

export type ProductSourceModel = z.infer<typeof productSourceModelSchema>;
export type SourceModelSizeClass = (typeof SOURCE_MODEL_SIZE_CLASSES)[number];
export type SourceModelCrop = (typeof SOURCE_MODEL_CROPS)[number];

export const productDescriptionAnalysisSchema = z.object({
  descriptionRu: z.string().trim().min(20).max(PRODUCT_POSE_DESCRIPTION_RU_MAX),
  shortAiSummaryEn: z.string().trim().min(10).max(600),

  categoryContext: z.enum(["clothing", "lingerie", "jewelry", "general"]),
  productCategory: z.enum(["auto", "tops", "bottoms", "one-pieces"]),
  sourcePresentation: z.enum(["on-model", "flat-lay", "unknown"]),
  garmentPhotoType: z.enum(["auto", "model", "flat-lay"]),

  setType: z.enum([
    "bra_brief_set",
    "bra_only",
    "bottoms_only",
    "dress",
    "top",
    "bottom",
    "unknown",
  ]),

  lingerieSetType: z.enum(LINGERIE_SET_TYPES),
  lingerieSetTypeConfidence: z.number().min(0).max(1),
  lingerieSetTypeReason: z.string().trim().min(3).max(400),

  baseColor: z.string().trim().max(80).nullable(),
  accentColors: z.array(z.string().trim().max(40)).max(8),
  pattern: z.string().trim().max(120).nullable(),
  materials: z.array(z.string().trim().max(60)).max(8),

  bra: braPartSchema,
  bottoms: bottomsPartSchema,

  mustPreserve: z.array(z.string().trim().max(160)).max(16),
  fitNotes: z.array(z.string().trim().max(200)).max(12),
  warnings: z.array(z.string().trim().max(200)).max(12),

  confidence: z.number().min(0).max(1),

  sourceModel: z.union([productSourceModelSchema, z.null()]),
});

export type ProductDescriptionAnalysis = z.infer<
  typeof productDescriptionAnalysisSchema
>;

export type ProductDescriptionAnalysisDebug = {
  sourcePresentation: ProductDescriptionAnalysis["sourcePresentation"];
  garmentPhotoType: ProductDescriptionAnalysis["garmentPhotoType"];
  reason: string | null;
  confidence: number;
  rawVisionAnswer: string | null;
  correctedBySafetyRule: boolean;
  postProcessingOverrides: string[];
  finalUserDescription: string | null;
  userEditedProductDescription: boolean;
};

export type ProductDescriptionAnalysisResponse =
  | {
      ok: true;
      analysis: ProductDescriptionAnalysis;
      productAnalysisJson: ProductDescriptionAnalysis;
      usedVision: boolean;
      appliedSettingsRecommended: boolean;
      debug: ProductDescriptionAnalysisDebug;
      message?: string;
    }
  | {
      ok: false;
      errorCode: string;
      message: string;
    };

/** Parse JSON from client/API; returns null if invalid */
export function parseProductAnalysisJson(
  raw: unknown
): ProductDescriptionAnalysis | null {
  if (!raw) return null;
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof value === "object" && value !== null && !("sourceModel" in value)) {
    value = { ...value, sourceModel: null };
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (!record.lingerieSetType) record.lingerieSetType = "unknown";
    if (typeof record.lingerieSetTypeConfidence !== "number") {
      record.lingerieSetTypeConfidence = 0.3;
    }
    if (typeof record.lingerieSetTypeReason !== "string") {
      record.lingerieSetTypeReason =
        "Legacy product analysis without lingerieSetType; will be re-derived.";
    }
  }

  const parsed = productDescriptionAnalysisSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
