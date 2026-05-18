import type {
  GarmentPhotoType,
  ProductCategory,
} from "@/components/studio/types";

/**
 * FASHN-примерка для белья: flat lay на карточке + комплект на одном фото.
 * Явный «Низ» / «Верх» пользователь может выбрать сам (например, кроп только трусов).
 */
export function resolveLingerieTryOnSettings(input: {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
}): {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
} {
  let { productCategory, garmentPhotoType } = input;

  if (garmentPhotoType === "auto") {
    garmentPhotoType = "flat-lay";
  }

  if (productCategory === "auto") {
    productCategory = "one-pieces";
  }

  return { productCategory, garmentPhotoType };
}
