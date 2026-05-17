import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
} from "@/lib/ai/imageConstraints";

const MESSAGES = {
  tooLarge: "Файл слишком большой. Максимум 10MB.",
  invalidType: "Поддерживаются только JPEG, PNG или WEBP.",
} as const;

export function validateImageFileClient(file: File): string | null {
  if (!file || file.size === 0) {
    return null;
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return MESSAGES.tooLarge;
  }
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return MESSAGES.invalidType;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
