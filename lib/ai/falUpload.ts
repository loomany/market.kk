import "server-only";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageFile,
} from "@/lib/ai/imageConstraints";

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_UPLOAD_BYTES, validateImageFile };

export async function uploadImageToFalStorage(
  file: File,
  fieldName: string,
  guard: PaidAiGuardInput
): Promise<string> {
  validateImageFile(file, fieldName);
  const fal = getFalClientOrThrow(guard);
  const url = await fal.storage.upload(file);
  return url;
}
