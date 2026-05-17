import { z } from "zod";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  normalizeTryOnFormValue,
  parseBooleanFormValue,
  parseNumberFormValue,
} from "@/lib/ai/falSchemas";

export const productShotRequestSchema = z.object({
  productImageUrl: z.string().min(1).optional(),
  scenePreset: z
    .enum([
      "marketplace-clean",
      "white-studio",
      "light-gray-studio",
      "luxury-boutique",
      "jewelry-display",
      "flat-lay",
      "custom",
    ])
    .default("marketplace-clean"),
  customSceneDescription: z.string().optional(),
  numResults: z.number().int().min(1).max(4).default(1),
  fast: z.boolean().default(true),
  placementType: z
    .enum(["original", "automatic", "manual_placement"])
    .default("manual_placement"),
  manualPlacementSelection: z
    .enum([
      "upper_left",
      "upper_right",
      "bottom_left",
      "bottom_right",
      "right_center",
      "left_center",
      "upper_center",
      "bottom_center",
      "center_vertical",
      "center_horizontal",
    ])
    .default("center_vertical"),
  shotSizePreset: z
    .enum(["square", "portrait", "vertical", "wide"])
    .default("square"),
  syncMode: z.boolean().default(false),
});

export type ProductShotRequest = z.infer<typeof productShotRequestSchema>;
export type ShotSizePreset = ProductShotRequest["shotSizePreset"];

export type ProductShotImage = {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
  file_name?: string;
  file_size?: number;
};

export type ProductShotSuccessResponse = {
  ok: true;
  provider: "mock" | "fal";
  model: string;
  images: ProductShotImage[];
  requestId?: string;
  sceneDescription?: string;
};

export type ProductShotErrorResponse = {
  ok: false;
  errorCode: string;
  message: string;
  issues?: z.ZodIssue[];
};

export type ProductShotResponse =
  | ProductShotSuccessResponse
  | ProductShotErrorResponse;

export function shotSizePresetToDimensions(
  preset: ShotSizePreset
): [number, number] {
  switch (preset) {
    case "portrait":
      return [1000, 1250];
    case "vertical":
      return [900, 1200];
    case "wide":
      return [1200, 900];
    case "square":
    default:
      return [1000, 1000];
  }
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

export type ProductShotFormPayload = ProductShotRequest & {
  productImageFile: File | null;
  productImageUrl?: string;
};

export function buildProductShotFormPayload(
  formData: FormData
): ProductShotFormPayload {
  const productImageFile = getFileFromFormData(formData, "productImageFile");
  const productImageUrl = normalizeTryOnFormValue(
    formData.get("productImageUrl")
  );

  if (!productImageFile && !productImageUrl) {
    throw new Error("Product image file or URL is required.");
  }

  if (productImageFile) {
    validateImageFile(productImageFile, "Product image");
  }

  const raw = {
    productImageUrl,
    scenePreset:
      normalizeTryOnFormValue(formData.get("scenePreset")) ??
      "marketplace-clean",
    customSceneDescription: normalizeTryOnFormValue(
      formData.get("customSceneDescription")
    ),
    numResults: parseNumberFormValue(formData.get("numResults"), 1),
    fast: parseBooleanFormValue(formData.get("fast"), true),
    placementType:
      normalizeTryOnFormValue(formData.get("placementType")) ??
      "manual_placement",
    manualPlacementSelection:
      normalizeTryOnFormValue(formData.get("manualPlacementSelection")) ??
      "center_vertical",
    shotSizePreset:
      normalizeTryOnFormValue(formData.get("shotSizePreset")) ?? "square",
    syncMode: parseBooleanFormValue(formData.get("syncMode"), false),
  };

  const parsed = productShotRequestSchema.parse(raw);

  return {
    ...parsed,
    productImageFile,
    productImageUrl,
  };
}
