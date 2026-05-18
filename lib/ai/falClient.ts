import "server-only";
import { fal } from "@fal-ai/client";
import {
  assertPaidAiAllowed,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";

export const FASHN_TRYON_MODEL = "fal-ai/fashn/tryon/v1.6";
export const MODEL_GENERATION_MODEL = "fal-ai/nano-banana-2";
/** Same model family — edit keeps face/outfit from reference image */
export const MODEL_GENERATION_EDIT_MODEL = "fal-ai/nano-banana-2/edit";
export const BACKGROUND_REMOVE_MODEL = "fal-ai/bria/background/remove";
export const PRODUCT_SHOT_MODEL = "fal-ai/bria/product-shot";

export function getFalClientOrThrow(input: PaidAiGuardInput) {
  assertPaidAiAllowed(input);

  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not configured");
  }
  fal.config({ credentials: key });
  return fal;
}
