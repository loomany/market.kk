import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
} from "@/lib/ai/imageConstraints";
import { getStudioCopy, type StudioLocale } from "./index";

export function validateStudioImageFile(
  file: File,
  locale: StudioLocale
): string | null {
  const copy = getStudioCopy(locale);
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) return copy.upload.fileTooLarge;
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return copy.upload.invalidType;
  }
  return null;
}
