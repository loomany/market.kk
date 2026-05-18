import type { ProductShotChecklistState as ProductShotChecklistStateType } from "@/lib/ai/productShotChecklist";

export type ProductCategory =
  | "auto"
  | "tops"
  | "bottoms"
  | "one-pieces"
  | "accessory";

export type GarmentPhotoType = "auto" | "model" | "flat-lay";

export type QualityMode = "performance" | "balanced" | "quality";

export type ModelPreset =
  | "female-studio"
  | "male-studio"
  | "plus-size-female"
  | "neutral-mannequin";

export const MODEL_PRESETS: {
  id: ModelPreset;
  label: string;
  description: string;
}[] = [
  {
    id: "female-studio",
    label: "Женская студийная модель",
    description: "Нейтральная поза, подходит для платьев, топов и комплектов.",
  },
  {
    id: "male-studio",
    label: "Мужская студийная модель",
    description: "Спокойная поза для футболок, рубашек, костюмов и верхней одежды.",
  },
  {
    id: "plus-size-female",
    label: "Женская plus-size модель",
    description: "Взрослая модель plus-size для каталожной съёмки.",
  },
  {
    id: "neutral-mannequin",
    label: "Нейтральный манекен",
    description: "Когда нужна карточка без узнаваемого лица модели.",
  },
];

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "auto", label: "Авто" },
  { id: "tops", label: "Верх" },
  { id: "bottoms", label: "Низ" },
  { id: "one-pieces", label: "Платье / комплект" },
  { id: "accessory", label: "Аксессуар" },
];

export const GARMENT_PHOTO_TYPES: { id: GarmentPhotoType; label: string }[] = [
  { id: "auto", label: "Авто" },
  { id: "model", label: "Одежда на человеке" },
  { id: "flat-lay", label: "Одежда отдельно" },
];

export const QUALITY_MODES: { id: QualityMode; label: string }[] = [
  { id: "performance", label: "Быстро" },
  { id: "balanced", label: "Баланс" },
  { id: "quality", label: "Максимальное качество" },
];

export type ModelGender = "female" | "male";
export type ModelBodyType = "standard" | "plus-size" | "slim";
export type ModelPose = "front" | "slight-angle";
export type ModelCrop = "full-body" | "upper-body";
export type ModelBackground = "white" | "light-gray" | "studio";
export type ModelCategoryContext =
  | "general"
  | "clothing"
  | "lingerie"
  | "jewelry";

export type ModelGenerationSettings = {
  gender: ModelGender;
  bodyType: ModelBodyType;
  pose: ModelPose;
  crop: ModelCrop;
  background: ModelBackground;
  categoryContext: ModelCategoryContext;
};

export const DEFAULT_MODEL_GENERATION_SETTINGS: ModelGenerationSettings = {
  gender: "female",
  bodyType: "standard",
  pose: "front",
  crop: "full-body",
  background: "white",
  categoryContext: "clothing",
};

export type StudioMode =
  | "clothing-tryon"
  | "product-shot"
  | "post-processing";

export const STUDIO_MODES: {
  id: StudioMode;
  label: string;
  description: string;
  recommendedFor: string;
}[] = [
  {
    id: "clothing-tryon",
    label: "Одежда на модели",
    description:
      "Перенесите одежду, бельё или комплект на AI-модель.",
    recommendedFor: "Рекомендуем для одежды",
  },
  {
    id: "product-shot",
    label: "Товарная карточка",
    description:
      "Создайте чистую карточку товара для маркетплейса или креативную сцену для витрины.",
    recommendedFor: "Рекомендуем для карточек",
  },
  {
    id: "post-processing",
    label: "Проработка",
    description:
      "Доработайте уже созданные изображения: видео, фон, сцена, Reels.",
    recommendedFor: "Рекомендуем после генерации",
  },
];

export type StudioAssetType =
  | "tryon"
  | "exact-card"
  | "creative-card"
  | "background-removed"
  | "video"
  | "scene";

export type StudioSessionAsset = {
  id: string;
  type: StudioAssetType;
  url: string;
  sourceImageUrl?: string;
  mode: StudioMode | "video" | "scene";
  provider?: string;
  model?: string;
  requestId?: string;
  createdAt: string;
  prompt?: string;
  enhancedPrompt?: string;
  estimatedCost?: number;
  reviewStatus?: ResultReviewStatus;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  label?: string;
};

export type ProductShotScenePreset =
  | "marketplace-clean"
  | "white-studio"
  | "light-gray-studio";

import type { ShotSizePreset } from "@/lib/ai/productShotSchemas";

export type { ShotSizePreset };

export type ProductShotFidelityMode = "exact-card";

export type ProductShotSettings = {
  scenePreset: ProductShotScenePreset;
  shotSizePreset: ShotSizePreset;
};

export const DEFAULT_PRODUCT_SHOT_SETTINGS: ProductShotSettings = {
  scenePreset: "marketplace-clean",
  shotSizePreset: "square",
};

export type ResultReviewStatus =
  | "pending_review"
  | "accepted"
  | "rejected";

export type QualityChecklistKey =
  | "productColorAccurate"
  | "productShapeAccurate"
  | "textureAndPatternAccurate"
  | "modelAnatomyOk"
  | "handsAndEdgesOk"
  | "backgroundClean"
  | "noTextOrWatermark"
  | "marketplaceReady";

export type QualityChecklistState = Record<QualityChecklistKey, boolean>;

export type ProductShotChecklistState = ProductShotChecklistStateType;

export type StudioResultImage = {
  id: string;
  url: string;
  width?: number;
  height?: number;
  label?: string;
  provider?: string;
  reviewStatus: ResultReviewStatus;
  checklist: QualityChecklistState;
  productShotFidelity?: ProductShotFidelityMode;
  productShotChecklist?: ProductShotChecklistState;
  cutoutPreviewUrl?: string;
  backgroundRemovedUrl?: string;
  selectedProductPreviewUrl?: string;
  manualMaskUsed?: boolean;
  exactCardWithoutMask?: boolean;
  backgroundRemoveError?: string;
  backgroundRemoveLoading?: boolean;
};

export type LastGenerationMode = StudioMode;

export function presetToModelSettings(
  preset: ModelPreset
): Partial<ModelGenerationSettings> {
  switch (preset) {
    case "male-studio":
      return { gender: "male", bodyType: "standard" };
    case "plus-size-female":
      return { gender: "female", bodyType: "plus-size" };
    case "neutral-mannequin":
      return { gender: "female", bodyType: "standard", pose: "front" };
    default:
      return { gender: "female", bodyType: "standard" };
  }
}
