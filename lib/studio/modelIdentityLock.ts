import { MAX_CLOTHING_PRODUCT_SET, isProductSetMode } from "@/lib/studio/productPhotos";

export function clothingProductUploadHint(photoCount: number): string {
  if (isProductSetMode(photoCount)) {
    return `Комплект до ${MAX_CLOTHING_PRODUCT_SET} ракурсов: одна модель (лицо и образ), у каждого фото своя поза под примерку.`;
  }
  return "Одно фото — быстрый черновик. Несколько ракурсов — загрузите до 5 фото сразу (фронт, спина, 3/4).";
}
