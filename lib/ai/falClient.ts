import "server-only";
import { fal } from "@fal-ai/client";

export const FASHN_TRYON_MODEL = "fal-ai/fashn/tryon/v1.6";
export const MODEL_GENERATION_MODEL = "fal-ai/nano-banana-2";
export const BACKGROUND_REMOVE_MODEL = "fal-ai/bria/background/remove";
export const PRODUCT_SHOT_MODEL = "fal-ai/bria/product-shot";

export function getFalClientOrThrow() {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not configured");
  }
  fal.config({ credentials: key });
  return fal;
}
