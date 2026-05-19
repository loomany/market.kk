import { z } from "zod";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  normalizeTryOnFormValue,
  parseBooleanFormValue,
  parseNumberFormValue,
} from "@/lib/ai/falSchemas";

export const SHOT_SIZE_PRESET_VALUES = [
  "square",
  "vertical_4_5",
  "vertical_3_4",
  "horizontal_4_3",
  "reels_9_16",
] as const;

export type ShotSizePreset = (typeof SHOT_SIZE_PRESET_VALUES)[number];

const LEGACY_SHOT_SIZE_PRESET_MAP: Record<string, ShotSizePreset> = {
  portrait: "vertical_4_5",
  vertical: "vertical_3_4",
  wide: "horizontal_4_3",
};

export function normalizeShotSizePreset(value: string): ShotSizePreset {
  return LEGACY_SHOT_SIZE_PRESET_MAP[value] ?? (value as ShotSizePreset);
}

export const PRODUCT_SHOT_SIZE_OPTIONS: {
  id: ShotSizePreset;
  ratio: string;
  pixels: string;
  subtitle?: string;
}[] = [
  { id: "square", ratio: "1:1", pixels: "1000×1000", subtitle: "Квадрат" },
  {
    id: "vertical_4_5",
    ratio: "4:5",
    pixels: "1000×1250",
    subtitle: "Вертикально",
  },
  { id: "vertical_3_4", ratio: "3:4", pixels: "900×1200", subtitle: "Каталог" },
  {
    id: "horizontal_4_3",
    ratio: "4:3",
    pixels: "1200×900",
    subtitle: "Горизонтально",
  },
  {
    id: "reels_9_16",
    ratio: "9:16",
    pixels: "1080×1920",
    subtitle: "Reels / Stories",
  },
];

export const PRODUCT_SHOT_ASPECT_RATIO_OPTIONS = [
  {
    id: "1:1",
    label: "1:1",
    shortHint: "Квадрат",
    hint: "Квадрат для маркетплейсов и превью",
    presetId: "square" as const,
  },
  {
    id: "4:5",
    label: "4:5",
    shortHint: "Вертикально",
    hint: "Вертикаль для ленты и витрины",
    presetId: "vertical_4_5" as const,
  },
  {
    id: "3:4",
    label: "3:4",
    shortHint: "Каталог",
    hint: "Портрет для Wildberries и Ozon",
    presetId: "vertical_3_4" as const,
  },
  {
    id: "4:3",
    label: "4:3",
    shortHint: "Горизонтально",
    hint: "Горизонтальный каталог",
    presetId: "horizontal_4_3" as const,
  },
  {
    id: "9:16",
    label: "9:16",
    shortHint: "Stories",
    hint: "Reels, Stories и TikTok",
    presetId: "reels_9_16" as const,
  },
] as const;

const PRODUCT_SHOT_QUALITY_SCALE: Record<FalModelResolution, number> = {
  "1K": 1,
  "2K": 2,
  "4K": 4,
};

export function aspectRatioForShotSizePreset(preset: ShotSizePreset): string {
  return (
    PRODUCT_SHOT_SIZE_OPTIONS.find((item) => item.id === preset)?.ratio ?? "1:1"
  );
}

export function shotSizePresetFromAspectRatio(
  ratio: string
): ShotSizePreset | undefined {
  return PRODUCT_SHOT_ASPECT_RATIO_OPTIONS.find((item) => item.id === ratio)
    ?.presetId;
}

function baseShotSizePresetDimensions(preset: ShotSizePreset): [number, number] {
  switch (preset) {
    case "vertical_4_5":
      return [1000, 1250];
    case "vertical_3_4":
      return [900, 1200];
    case "horizontal_4_3":
      return [1200, 900];
    case "reels_9_16":
      return [1080, 1920];
    case "square":
    default:
      return [1000, 1000];
  }
}

/** Export size for product card: aspect preset × quality tier (1K = базовый размер). */
export function shotSizePresetToDimensions(
  preset: ShotSizePreset,
  quality: FalModelResolution = "1K"
): [number, number] {
  const [width, height] = baseShotSizePresetDimensions(preset);
  const scale = PRODUCT_SHOT_QUALITY_SCALE[quality];
  return [Math.round(width * scale), Math.round(height * scale)];
}

export const productShotRequestSchema = z.object({
  productImageUrl: z.string().min(1).optional(),
  scenePreset: z
    .enum([
      "marketplace-clean",
      "white-studio",
      "light-gray-studio",
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
  shotSizePreset: z.preprocess(
    (value) =>
      typeof value === "string" ? normalizeShotSizePreset(value) : value,
    z.enum([
      "square",
      "vertical_4_5",
      "vertical_3_4",
      "horizontal_4_3",
      "reels_9_16",
    ])
  ).default("square"),
  syncMode: z.boolean().default(false),
  fidelityMode: z.enum(["exact-card"]).default("exact-card"),
});

export type ProductShotRequest = z.infer<typeof productShotRequestSchema>;

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
    shotSizePreset: normalizeShotSizePreset(
      normalizeTryOnFormValue(formData.get("shotSizePreset")) ?? "square"
    ),
    syncMode: parseBooleanFormValue(formData.get("syncMode"), false),
    fidelityMode:
      normalizeTryOnFormValue(formData.get("fidelityMode")) ?? "exact-card",
  };

  const parsed = productShotRequestSchema.parse(raw);

  return {
    ...parsed,
    productImageFile,
    productImageUrl,
  };
}
