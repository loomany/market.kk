import { z } from "zod";
import { PRODUCT_POSE_DESCRIPTION_RU_MAX } from "@/lib/ai/modelCustomParams";

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
  const parsed = productDescriptionAnalysisSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
