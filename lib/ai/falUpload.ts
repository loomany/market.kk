import "server-only";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageFile,
} from "@/lib/ai/imageConstraints";

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_UPLOAD_BYTES, validateImageFile };

export async function uploadImageToFalStorage(
  file: File,
  fieldName: string
): Promise<string> {
  validateImageFile(file, fieldName);
  const fal = getFalClientOrThrow();
  const url = await fal.storage.upload(file);
  return url;
}
