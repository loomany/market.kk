import { z } from "zod";
import type { PremiumGarmentEditDebug } from "@/lib/ai/fashnEditSchemas";
import type { TryOnPipelineDebug } from "@/lib/ai/tryOnPipelineDebug";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  FAL_MODEL_RESOLUTIONS,
  type FalModelResolution,
} from "@/lib/ai/modelOutputSizes";
import { parseProductAnalysisJson } from "@/lib/ai/productDescriptionAnalysisSchemas";

export const tryOnRequestSchema = z.object({
  productImageUrl: z.string().min(1),
  modelImageUrl: z.string().min(1),
  category: z
    .enum(["auto", "tops", "bottoms", "one-pieces"])
    .default("auto"),
  garmentPhotoType: z
    .enum(["auto", "model", "flat-lay"])
    .default("auto"),
  mode: z
    .enum(["performance", "balanced", "quality"])
    .default("balanced"),
  moderationLevel: z
    .enum(["none", "permissive", "conservative"])
    .default("permissive"),
  numSamples: z.number().int().min(1).max(4).default(1),
  segmentationFree: z.boolean().default(true),
  outputFormat: z.enum(["png", "jpeg"]).default("png"),
  seed: z.number().int().optional(),
});

export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;

export type TryOnImage = {
  url: string;
  width?: number;
  height?: number;
};

export type TryOnInputSource = {
  product: "file" | "url";
  model: "file" | "url";
};

export type TryOnSuccessResponse = {
  ok: true;
  provider: string;
  model: string;
  images: TryOnImage[];
  requestId: string;
  inputSource?: TryOnInputSource;
  premiumGarmentEdit?: PremiumGarmentEditDebug;
  tryOn?: {
    requestId: string;
    finalImageUrl?: string;
    garmentImageUrl: string;
  };
  quality?: {
    judged: boolean;
    repaired: boolean;
    judgeScore?: number;
    judgeIssues?: string[];
    repairAttempted?: boolean;
    repairSucceeded?: boolean;
    repairErrorReason?: string;
  };
  debug?: TryOnPipelineDebug;
};

export type TryOnErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  issues?: z.ZodIssue[];
};

export type TryOnResponse = TryOnSuccessResponse | TryOnErrorResponse;

export function normalizeTryOnFormValue(
  value: FormDataEntryValue | null
): string | undefined {
  if (value === null) return undefined;
  const str = typeof value === "string" ? value.trim() : "";
  return str === "" ? undefined : str;
}

export function parseBooleanFormValue(
  value: FormDataEntryValue | null,
  defaultValue: boolean
): boolean {
  const normalized = normalizeTryOnFormValue(value);
  if (normalized === undefined) return defaultValue;
  return normalized === "true";
}

export function parseNumberFormValue(
  value: FormDataEntryValue | null,
  defaultValue: number
): number {
  const normalized = normalizeTryOnFormValue(value);
  if (normalized === undefined) return defaultValue;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : defaultValue;
}

function getFileFromFormData(
  formData: FormData,
  fieldName: string
): File | null {
  const entry = formData.get(fieldName);
  if (entry instanceof File && entry.size > 0) {
    return entry;
  }
  return null;
}

export type TryOnFormPayload = {
  productImageFile: File | null;
  modelImageFile: File | null;
  productImageUrl?: string;
  modelImageUrl?: string;
  category: string;
  garmentPhotoType: string;
  mode: string;
  moderationLevel: string;
  numSamples: number;
  segmentationFree: boolean;
  outputFormat: string;
  seed?: number;
  inputSource: TryOnInputSource;
  productAnalysisJson?: string;
  userDescriptionRu?: string;
  userEditedProductDescription?: boolean;
  modelResolution?: FalModelResolution;
  /** fast = original product ref; premium = FASHN Edit before try-on (feature-flagged). */
  garmentPrepMode?: "fast" | "premium";
};

function parseModelResolutionFormValue(
  value: FormDataEntryValue | null
): FalModelResolution | undefined {
  const normalized = normalizeTryOnFormValue(value);
  if (!normalized) return undefined;
  return FAL_MODEL_RESOLUTIONS.includes(normalized as FalModelResolution)
    ? (normalized as FalModelResolution)
    : undefined;
}

export function buildTryOnFormPayload(formData: FormData): TryOnFormPayload {
  const productImageFile = getFileFromFormData(formData, "productImageFile");
  const modelImageFile = getFileFromFormData(formData, "modelImageFile");
  const productImageUrl = normalizeTryOnFormValue(
    formData.get("productImageUrl")
  );
  const modelImageUrl = normalizeTryOnFormValue(formData.get("modelImageUrl"));

  if (!productImageFile && !productImageUrl) {
    throw new Error("Product image file or URL is required.");
  }
  if (!modelImageFile && !modelImageUrl) {
    throw new Error("Model image file or URL is required.");
  }

  if (productImageFile) {
    validateImageFile(productImageFile, "Product image");
  }
  if (modelImageFile) {
    validateImageFile(modelImageFile, "Model image");
  }

  const categoryRaw =
    normalizeTryOnFormValue(formData.get("category")) ?? "auto";
  const seedNormalized = normalizeTryOnFormValue(formData.get("seed"));
  const seed =
    seedNormalized !== undefined ? Number(seedNormalized) : undefined;

  return {
    productImageFile,
    modelImageFile,
    productImageUrl,
    modelImageUrl,
    category: mapCategoryForTryOn(categoryRaw),
    garmentPhotoType:
      normalizeTryOnFormValue(formData.get("garmentPhotoType")) ?? "auto",
    mode: normalizeTryOnFormValue(formData.get("mode")) ?? "balanced",
    moderationLevel:
      normalizeTryOnFormValue(formData.get("moderationLevel")) ?? "permissive",
    numSamples: parseNumberFormValue(formData.get("numSamples"), 1),
    segmentationFree: parseBooleanFormValue(
      formData.get("segmentationFree"),
      true
    ),
    outputFormat:
      normalizeTryOnFormValue(formData.get("outputFormat")) ?? "png",
    seed: seed !== undefined && Number.isFinite(seed) ? seed : undefined,
    inputSource: {
      product: productImageFile ? "file" : "url",
      model: modelImageFile ? "file" : "url",
    },
    productAnalysisJson:
      normalizeTryOnFormValue(formData.get("productAnalysisJson")) ?? undefined,
    userDescriptionRu:
      normalizeTryOnFormValue(formData.get("userDescriptionRu")) ?? undefined,
    userEditedProductDescription: parseBooleanFormValue(
      formData.get("userEditedProductDescription"),
      false
    ),
    modelResolution: parseModelResolutionFormValue(
      formData.get("modelResolution")
    ),
    garmentPrepMode: parseGarmentPrepModeFormValue(formData.get("garmentPrepMode")),
  };
}

function parseGarmentPrepModeFormValue(
  value: FormDataEntryValue | null
): "fast" | "premium" {
  const normalized = normalizeTryOnFormValue(value);
  return normalized === "premium" ? "premium" : "fast";
}

export function getProductAnalysisFromPayload(
  payload: TryOnFormPayload
) {
  if (!payload.productAnalysisJson) return null;
  return parseProductAnalysisJson(payload.productAnalysisJson);
}

/** FASHN try-on supports auto | tops | bottoms | one-pieces only. */
export function mapCategoryForTryOn(
  category: string
): TryOnRequest["category"] {
  if (category === "accessory") return "auto";
  if (
    category === "tops" ||
    category === "bottoms" ||
    category === "one-pieces" ||
    category === "auto"
  ) {
    return category;
  }
  return "auto";
}

export function tryOnParamsToRequest(
  productImageUrl: string,
  modelImageUrl: string,
  payload: Omit<
    TryOnFormPayload,
    | "productImageFile"
    | "modelImageFile"
    | "productImageUrl"
    | "modelImageUrl"
    | "inputSource"
  >
): TryOnRequest {
  return tryOnRequestSchema.parse({
    productImageUrl,
    modelImageUrl,
    category: payload.category,
    garmentPhotoType: payload.garmentPhotoType,
    mode: payload.mode,
    moderationLevel: payload.moderationLevel,
    numSamples: payload.numSamples,
    segmentationFree: payload.segmentationFree,
    outputFormat: payload.outputFormat,
    seed: payload.seed,
  });
}
