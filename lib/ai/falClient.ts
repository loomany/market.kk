import "server-only";
import { fal } from "@fal-ai/client";
import {
  assertPaidAiAllowed,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";

export const FASHN_TRYON_MODEL = "fal-ai/fashn/tryon/v1.6";
export const MODEL_GENERATION_MODEL = "fal-ai/nano-banana-pro";
/** Same model family — edit keeps face/outfit from reference image */
export const MODEL_GENERATION_EDIT_MODEL = "fal-ai/nano-banana-pro/edit";
/** FLUX.1 Kontext Pro — directed image edits, scene/context changes */
export const FLUX_KONTEXT_PRO_MODEL = "fal-ai/flux-pro/kontext";
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
