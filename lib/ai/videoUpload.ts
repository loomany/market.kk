import "server-only";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";

/** Kling Motion Control API limits (see fal model docs). */
export const MAX_VIDEO_UPLOAD_BYTES = 200 * 1024 * 1024;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
] as const;

export type AllowedVideoType = (typeof ALLOWED_VIDEO_TYPES)[number];

export function validateVideoFile(file: File, fieldName: string): void {
  if (!file || file.size === 0) {
    throw new Error(`${fieldName} is required.`);
  }
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    throw new Error(`${fieldName} is too large. Max size is 200MB.`);
  }
  if (!ALLOWED_VIDEO_TYPES.includes(file.type as AllowedVideoType)) {
    throw new Error(`${fieldName} must be MP4 or MOV.`);
  }
}

export async function uploadVideoToFalStorage(
  file: File,
  fieldName: string,
  guard: PaidAiGuardInput
): Promise<string> {
  validateVideoFile(file, fieldName);
  const fal = getFalClientOrThrow(guard);
  return fal.storage.upload(file);
}
