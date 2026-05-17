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
    label: "Female studio model",
    description: "Женская студийная модель, фронтальная поза",
  },
  {
    id: "male-studio",
    label: "Male studio model",
    description: "Мужская студийная модель",
  },
  {
    id: "plus-size-female",
    label: "Plus-size female model",
    description: "Plus-size женская модель",
  },
  {
    id: "neutral-mannequin",
    label: "Neutral mannequin",
    description: "Нейтральный манекен без лица",
  },
];

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "one-pieces", label: "One-pieces" },
  { id: "accessory", label: "Accessory" },
];

export const GARMENT_PHOTO_TYPES: { id: GarmentPhotoType; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "model", label: "Model" },
  { id: "flat-lay", label: "Flat-lay" },
];

export const QUALITY_MODES: { id: QualityMode; label: string }[] = [
  { id: "performance", label: "Performance" },
  { id: "balanced", label: "Balanced" },
  { id: "quality", label: "Quality" },
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
  | "background-remove-only";

export const STUDIO_MODES: {
  id: StudioMode;
  label: string;
  description: string;
}[] = [
  {
    id: "clothing-tryon",
    label: "Одежда на модели",
    description: "Virtual try-on на AI-модель",
  },
  {
    id: "product-shot",
    label: "Product Shot",
    description: "Студийное фото товара без модели",
  },
  {
    id: "background-remove-only",
    label: "Удалить фон",
    description: "Только удаление фона по URL",
  },
];

export type ProductShotScenePreset =
  | "marketplace-clean"
  | "white-studio"
  | "light-gray-studio"
  | "luxury-boutique"
  | "jewelry-display"
  | "flat-lay"
  | "custom";

export type ShotSizePreset = "square" | "portrait" | "vertical" | "wide";

export type ProductShotSettings = {
  scenePreset: ProductShotScenePreset;
  customSceneDescription: string;
  numResults: number;
  shotSizePreset: ShotSizePreset;
};

export const DEFAULT_PRODUCT_SHOT_SETTINGS: ProductShotSettings = {
  scenePreset: "marketplace-clean",
  customSceneDescription: "",
  numResults: 1,
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

export type StudioResultImage = {
  id: string;
  url: string;
  width?: number;
  height?: number;
  label?: string;
  reviewStatus: ResultReviewStatus;
  checklist: QualityChecklistState;
  backgroundRemovedUrl?: string;
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
