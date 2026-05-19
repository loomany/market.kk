import type { ProductShotChecklistState as ProductShotChecklistStateType } from "@/lib/ai/productShotChecklist";
import { DEFAULT_MODEL_AGE } from "@/lib/ai/modelAge";
import {
  DEFAULT_MODEL_ANGLE_PRESETS,
  type ModelAnglePresetId,
  type ModelCustomAngle,
} from "@/lib/ai/modelAngles";
import {
  MODEL_PARAM_CUSTOM,
  type ModelParamCustom,
} from "@/lib/ai/modelCustomParams";

export type ProductCategory =
  | "auto"
  | "tops"
  | "bottoms"
  | "one-pieces"
  | "accessory";

export type GarmentPhotoType = "auto" | "model" | "flat-lay";

export type QualityMode = "performance" | "balanced" | "quality";

export const DEFAULT_QUALITY_MODE: QualityMode = "balanced";

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "auto", label: "Авто" },
  { id: "tops", label: "Верх" },
  { id: "bottoms", label: "Низ" },
  { id: "one-pieces", label: "Платье / комплект" },
  { id: "accessory", label: "Аксессуар" },
];

export const GARMENT_PHOTO_TYPES: { id: GarmentPhotoType; label: string }[] = [
  { id: "auto", label: "Авто" },
  { id: "model", label: "На модели / на человеке" },
  { id: "flat-lay", label: "Товар отдельно" },
];

export const QUALITY_MODES: { id: QualityMode; label: string }[] = [
  { id: "performance", label: "Быстро" },
  { id: "balanced", label: "Баланс" },
  { id: "quality", label: "Максимальное качество" },
];

/** Try-on quality in UI (0.5K / 1K / 2K) → FASHN mode performance | balanced | quality */
export const TRY_ON_QUALITY_OPTIONS: {
  id: QualityMode;
  label: string;
  shortHint: string;
  hint: string;
}[] = [
  {
    id: "performance",
    label: "0.5K",
    shortHint: "черновик",
    hint: "Быстрый черновик, ниже стоимость",
  },
  {
    id: "balanced",
    label: "1K",
    shortHint: "баланс",
    hint: "Баланс качества и скорости",
  },
  {
    id: "quality",
    label: "2K",
    shortHint: "для зума",
    hint: "Детализация для зума в карточке",
  },
];

export type ModelGender = "female" | "male";

export const MODEL_BODY_TYPES = [
  {
    id: MODEL_PARAM_CUSTOM,
    label: "Свой вариант",
    hint: "Опишите силуэт своими словами",
  },
  {
    id: "size-s",
    label: "S",
    hint: "Маленький размер, узкий силуэт для маркетплейса",
  },
  {
    id: "size-m",
    label: "M",
    hint: "Средний размер — базовый каталожный силуэт",
  },
  {
    id: "size-l",
    label: "L",
    hint: "Крупнее среднего, комфортная посадка L",
  },
  {
    id: "size-xl",
    label: "XL",
    hint: "Полный силуэт XL, натуральные пропорции",
  },
  {
    id: "size-2xl",
    label: "2XL",
    hint: "Размер 2XL, выраженные формы для plus-каталога",
  },
  {
    id: "standard",
    label: "Стандартная",
    hint: "Средние пропорции для маркетплейса",
  },
  {
    id: "plus-size",
    label: "Plus-size",
    hint: "Полные формы, каталожная посадка",
  },
  {
    id: "slim",
    label: "Стройная",
    hint: "Узкий силуэт, лёгкая фигура",
  },
  {
    id: "athletic",
    label: "Спортивная (фитнес)",
    hint: "Подтянутое тело, рельеф без перебора",
  },
  {
    id: "swimwear",
    label: "Бикини / купальники",
    hint: "Тонус и пляжный каталог, без откровенности",
  },
  {
    id: "curvy",
    label: "Пышная фигура",
    hint: "Выраженная талия и бёдра, «песочные часы»",
  },
  {
    id: "petite",
    label: "Миниатюрная",
    hint: "Невысокая, изящный маленький силуэт",
  },
  {
    id: "tall",
    label: "Высокая модель",
    hint: "Длинные ноги, подиумная подача",
  },
] as const;

export type ModelBodyType = (typeof MODEL_BODY_TYPES)[number]["id"];

export const MODEL_BODY_TYPE_IDS = MODEL_BODY_TYPES.map(
  (item) => item.id
) as [ModelBodyType, ...ModelBodyType[]];
export type ModelPose = "front" | "slight-angle" | typeof MODEL_PARAM_CUSTOM;
export type ModelCrop =
  | "full-body"
  | "upper-body"
  | "upper-thigh"
  | typeof MODEL_PARAM_CUSTOM;
export type ModelBackground = "white" | "light-gray" | "studio";
export type ModelLighting =
  | "studio"
  | "sunny-outdoor"
  | ModelParamCustom;
export type ModelCategoryContext =
  | "general"
  | "clothing"
  | "lingerie"
  | "jewelry";

export type { ModelAnglePresetId, ModelCustomAngle };

export type ModelGenerationSettings = {
  gender: ModelGender;
  /** Free-text; optional, included in generation prompt when set */
  modelNationality: string;
  anglePresets: ModelAnglePresetId[];
  customAngles: ModelCustomAngle[];
  bodyType: ModelBodyType;
  bodyTypeCustom: string;
  modelAge: number;
  pose: ModelPose;
  poseCustom: string;
  crop: ModelCrop;
  cropCustom: string;
  background: ModelBackground;
  lighting: ModelLighting;
  lightingCustom: string;
  categoryContext: ModelCategoryContext;
};

export const DEFAULT_MODEL_GENERATION_SETTINGS: ModelGenerationSettings = {
  gender: "female",
  modelNationality: "",
  anglePresets: [...DEFAULT_MODEL_ANGLE_PRESETS],
  customAngles: [],
  bodyType: "standard",
  bodyTypeCustom: "",
  modelAge: DEFAULT_MODEL_AGE,
  pose: "front",
  poseCustom: "",
  crop: "full-body",
  cropCustom: "",
  background: "white",
  lighting: "studio",
  lightingCustom: "",
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
      "Создайте видео или прокачайте готовые фото для витрины и соцсетей.",
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

export type StudioSessionAssetStatus = "ready" | "processing" | "error";

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
  /** Post-processing UI: in-flight or failed generation */
  status?: StudioSessionAssetStatus;
  parentAssetId?: string;
  errorMessage?: string;
  startedAt?: string;
};

export type ProductShotScenePreset =
  | "marketplace-clean"
  | "white-studio"
  | "light-gray-studio"
  | ModelParamCustom;

import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type { ShotSizePreset } from "@/lib/ai/productShotSchemas";

export type { ShotSizePreset };

export type ProductShotFidelityMode = "exact-card";

export type ProductShotSettings = {
  scenePreset: ProductShotScenePreset;
  sceneCustomDescription: string;
  shotSizePreset: ShotSizePreset;
  imageQuality: FalModelResolution;
};

export const DEFAULT_PRODUCT_SHOT_SETTINGS: ProductShotSettings = {
  scenePreset: "marketplace-clean",
  sceneCustomDescription: "",
  shotSizePreset: "square",
  imageQuality: "1K",
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
  model?: string;
  requestId?: string;
  seed?: number;
  estimatedCost?: number;
  promptPreview?: string;
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
