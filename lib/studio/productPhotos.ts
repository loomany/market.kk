/** Один товар — режим «точная карточка» и legacy API. */
export const MAX_PRODUCT_PHOTOS = 1;

/** Комплект ракурсов в SaaS try-on (фронт, спина, 3/4 …). */
export const MAX_CLOTHING_PRODUCT_SET = 5;

export type StudioProductPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

export function isProductSetMode(photoCount: number): boolean {
  return photoCount > 1;
}

export function createStudioProductPhoto(
  file: File,
  id?: string
): StudioProductPhoto {
  return {
    id:
      id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`),
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
