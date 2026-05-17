export type ProductShotChecklistKey =
  | "productColorAccurate"
  | "productShapeAccurate"
  | "itemCountMatches"
  | "materialTextureSimilar"
  | "noExtraDetails"
  | "noNewColorsGemsChains"
  | "noExtraObjectsInCard"
  | "backgroundClean"
  | "marketplaceReady";

export type ProductShotChecklistState = Record<
  ProductShotChecklistKey,
  boolean
>;

export const DEFAULT_PRODUCT_SHOT_CHECKLIST: ProductShotChecklistState = {
  productColorAccurate: false,
  productShapeAccurate: false,
  itemCountMatches: false,
  materialTextureSimilar: false,
  noExtraDetails: false,
  noNewColorsGemsChains: false,
  noExtraObjectsInCard: false,
  backgroundClean: false,
  marketplaceReady: false,
};

export const PRODUCT_SHOT_CHECKLIST_LABELS_RU: Record<
  ProductShotChecklistKey,
  string
> = {
  productColorAccurate: "Цвет товара сохранён",
  productShapeAccurate: "Форма товара не изменилась",
  itemCountMatches: "Количество элементов совпадает",
  materialTextureSimilar: "Материал и текстура похожи",
  noExtraDetails: "Нет лишних деталей",
  noNewColorsGemsChains: "Нет новых цветов, камней или цепочек",
  noExtraObjectsInCard: "Лишние предметы не попали в карточку",
  backgroundClean: "Фон чистый",
  marketplaceReady: "Фото подходит для карточки товара",
};

export const PRODUCT_SHOT_CHECKLIST_KEYS = Object.keys(
  DEFAULT_PRODUCT_SHOT_CHECKLIST
) as ProductShotChecklistKey[];

export function createDefaultProductShotChecklist(): ProductShotChecklistState {
  return { ...DEFAULT_PRODUCT_SHOT_CHECKLIST };
}
