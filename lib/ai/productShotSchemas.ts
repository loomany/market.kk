import { z } from "zod";
import {
  FAL_MODEL_ASPECT_RATIO_OPTIONS,
  type FalModelAspectRatio,
  type FalModelResolution,
} from "@/lib/ai/modelOutputSizes";
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
  "vertical_2_3",
  "horizontal_4_3",
  "horizontal_16_9",
  "reels_9_16",
] as const;

export type ShotSizePreset = (typeof SHOT_SIZE_PRESET_VALUES)[number];

/** Товарная карточка: фиксированное качество экспорта (без выбора в UI). */
export const PRODUCT_SHOT_EXPORT_QUALITY: FalModelResolution = "2K";

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
  { id: "square", ratio: "1:1", pixels: "1000×1000", subtitle: "квадрат" },
  {
    id: "vertical_4_5",
    ratio: "4:5",
    pixels: "1000×1250",
    subtitle: "лента",
  },
  { id: "vertical_3_4", ratio: "3:4", pixels: "900×1200", subtitle: "WB и Ozon" },
  { id: "vertical_2_3", ratio: "2:3", pixels: "800×1200", subtitle: "Полный рост" },
  {
    id: "horizontal_4_3",
    ratio: "4:3",
    pixels: "1200×900",
    subtitle: "Горизонталь",
  },
  {
    id: "horizontal_16_9",
    ratio: "16:9",
    pixels: "1280×720",
    subtitle: "Баннер",
  },
  {
    id: "reels_9_16",
    ratio: "9:16",
    pixels: "1080×1920",
    subtitle: "Stories",
  },
];

const FAL_ASPECT_TO_SHOT_PRESET: Record<FalModelAspectRatio, ShotSizePreset> = {
  "3:4": "vertical_3_4",
  "4:5": "vertical_4_5",
  "1:1": "square",
  "2:3": "vertical_2_3",
  "9:16": "reels_9_16",
  "4:3": "horizontal_4_3",
  "16:9": "horizontal_16_9",
};

/** Те же форматы, что у Fal nano-banana — подписи и порядок как в AI-модели. */
export const PRODUCT_SHOT_ASPECT_RATIO_OPTIONS = FAL_MODEL_ASPECT_RATIO_OPTIONS.map(
  (opt) => ({
    id: opt.id,
    label: opt.label,
    shortHint: opt.shortHint,
    hint: opt.hint,
    presetId: FAL_ASPECT_TO_SHOT_PRESET[opt.id],
  })
);

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
    case "vertical_2_3":
      return [800, 1200];
    case "horizontal_4_3":
      return [1200, 900];
    case "horizontal_16_9":
      return [1280, 720];
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
    z.enum([...SHOT_SIZE_PRESET_VALUES])
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
