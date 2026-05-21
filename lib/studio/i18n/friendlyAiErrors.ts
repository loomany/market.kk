import type { StudioCopy } from "./studioCopyTypes";

export function friendlyAiError(
  copy: StudioCopy,
  errorCode?: string,
  message?: string
): string {
  if (errorCode === "FAL_KEY_MISSING") return copy.errors.falNotConfigured;
  if (errorCode === "FAL_UPLOAD_FAILED") return copy.errors.falUploadFailed;
  if (errorCode === "FAL_TRYON_FAILED") return copy.errors.falTryOnFailed;
  if (errorCode === "FAL_MODEL_GENERATION_FAILED") return copy.errors.falModelFailed;
  if (message?.includes("did not generate the expected output")) {
    return copy.errors.falDistorted;
  }
  if (errorCode === "FAL_MODEL_GENERATION_TIMEOUT") return copy.errors.falTimeout;
  if (errorCode === "FAL_MODEL_CONTENT_BLOCKED") return copy.errors.falBlocked;
  if (message?.includes("Product image file or URL is required")) {
    return copy.errors.uploadProduct;
  }
  if (message?.includes("Product and model image sources are required")) {
    return copy.errors.uploadProductAndModel;
  }
  if (errorCode === "VALIDATION_ERROR") return copy.errors.validationModel;
  if (message?.includes("Invalid")) return copy.errors.validationGeneric;
  return message ?? copy.errors.imageFailed;
}

export function readJsonResponseError(
  copy: StudioCopy,
  res: Response,
  emptyOk: boolean
): string {
  if (emptyOk) return copy.errors.serverEmpty;
  return copy.errors.serverUnavailable.replace("{status}", String(res.status));
}
