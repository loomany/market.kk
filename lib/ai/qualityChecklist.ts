import type {
  QualityChecklistKey,
  QualityChecklistState,
} from "@/components/studio/types";

export const DEFAULT_QUALITY_CHECKLIST: QualityChecklistState = {
  productColorAccurate: false,
  productShapeAccurate: false,
  textureAndPatternAccurate: false,
  modelAnatomyOk: false,
  handsAndEdgesOk: false,
  backgroundClean: false,
  noTextOrWatermark: false,
  marketplaceReady: false,
};

export const QUALITY_CHECKLIST_LABELS_RU: Record<
  QualityChecklistKey,
  string
> = {
  productColorAccurate: "Цвет товара сохранён",
  productShapeAccurate: "Форма товара не искажена",
  textureAndPatternAccurate:
    "Текстура, узор и детали похожи на оригинал",
  modelAnatomyOk: "Анатомия модели выглядит нормально",
  handsAndEdgesOk:
    "Руки, края одежды и контуры без явных артефактов",
  backgroundClean: "Фон чистый",
  noTextOrWatermark: "Нет лишнего текста, водяных знаков или логотипов",
  marketplaceReady: "Фото можно использовать для карточки товара",
};

export const QUALITY_CHECKLIST_KEYS = Object.keys(
  DEFAULT_QUALITY_CHECKLIST
) as QualityChecklistKey[];

export function createDefaultChecklist(): QualityChecklistState {
  return { ...DEFAULT_QUALITY_CHECKLIST };
}

export function isChecklistComplete(checklist: QualityChecklistState): boolean {
  return QUALITY_CHECKLIST_KEYS.every((key) => checklist[key]);
}
