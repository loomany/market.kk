export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function validateImageFile(file: File, fieldName: string): void {
  if (!file || file.size === 0) {
    throw new Error(`${fieldName} is required.`);
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(`${fieldName} is too large. Max size is 10MB.`);
  }
  if (
    !ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)
  ) {
    throw new Error(`${fieldName} must be JPEG, PNG, or WEBP.`);
  }
}
