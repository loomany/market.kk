/** Один товар за запуск — следующий SKU: замените фото и снова «Создать фото на модели». */
export const MAX_PRODUCT_PHOTOS = 1;

/** Максимум фото в комплекте одежды (мульти-ракурс). */
export const MAX_CLOTHING_PRODUCT_SET = 5;

export function isProductSetMode(photoCount: number): boolean {
  return photoCount > 1;
}

export type StudioProductPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export function createStudioProductPhoto(file: File): StudioProductPhoto {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokeStudioProductPhoto(photo: StudioProductPhoto) {
  URL.revokeObjectURL(photo.previewUrl);
}

export function revokeStudioProductPhotos(photos: StudioProductPhoto[]) {
  for (const photo of photos) {
    revokeStudioProductPhoto(photo);
  }
}
