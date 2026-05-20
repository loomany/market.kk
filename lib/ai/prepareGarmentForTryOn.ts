import "server-only";
import { runFashnEdit } from "@/lib/ai/fashnEditClient";
import {
  FASHN_GARMENT_PREP_PROMPT,
  FASHN_GARMENT_PREP_PROMPT_SUMMARY,
} from "@/lib/ai/fashnGarmentPrepPrompt";
import {
  FASHN_EDIT_MODEL_NAME,
  type PremiumGarmentEditDebug,
  type TryOnGarmentPrepMode,
  resolveTryOnGarmentImageUrl,
  shouldRunPremiumGarmentPrep,
} from "@/lib/ai/fashnEditSchemas";
import { defaultPremiumEditOptions } from "@/lib/ai/fashnEditClient";
import {
  createGarmentPreparationMaskPng,
  garmentMaskDebugFilename,
  readImageDimensions,
  type GarmentMaskStrategy,
} from "@/lib/ai/garmentPreparationMask";
import { getFalClientOrThrow } from "@/lib/ai/falClient";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";

export type PrepareGarmentForTryOnInput = {
  productImageUrl: string;
  garmentPrepMode?: TryOnGarmentPrepMode;
  garmentPhotoType: string;
  guard: PaidAiGuardInput;
  mockMode?: boolean;
  maskStrategy?: GarmentMaskStrategy;
};

export type PrepareGarmentForTryOnResult =
  | {
      ok: true;
      garmentImageUrl: string;
      premiumGarmentEdit?: PremiumGarmentEditDebug;
    }
  | {
      ok: false;
      errorCode: string;
      message: string;
    };

async function fetchImageBuffer(imageUrl: string): Promise<{
  buffer: Buffer;
  contentType: string | null;
}> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Cannot fetch product image for mask (${res.status})`);
  }
  const contentType = res.headers.get("content-type");
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType,
  };
}

async function uploadMaskToFal(
  png: Buffer,
  filename: string,
  guard: PaidAiGuardInput
): Promise<string> {
  const fal = getFalClientOrThrow(guard);
  const blob = new Blob([Uint8Array.from(png)], { type: "image/png" });
  const file = new File([blob], filename, { type: "image/png" });
  return fal.storage.upload(file);
}

export { resolveTryOnGarmentImageUrl };

export async function prepareGarmentForTryOn(
  input: PrepareGarmentForTryOnInput
): Promise<PrepareGarmentForTryOnResult> {
  if (!shouldRunPremiumGarmentPrep(input.garmentPrepMode)) {
    return { ok: true, garmentImageUrl: input.productImageUrl };
  }

  const mockMode =
    input.mockMode ?? process.env.AI_MOCK_MODE !== "0";
  const editOpts = defaultPremiumEditOptions();
  const maskStrategy = input.maskStrategy ?? "center_product_zone";

  let maskUrl: string | undefined;

  if (!mockMode) {
    try {
      const { buffer, contentType } = await fetchImageBuffer(input.productImageUrl);
      const { width, height } = readImageDimensions(buffer, contentType);
      const maskPng = createGarmentPreparationMaskPng(width, height, {
        strategy: maskStrategy,
        marginRatio: 0.05,
      });
      maskUrl = await uploadMaskToFal(
        maskPng,
        garmentMaskDebugFilename(width, height, maskStrategy),
        input.guard
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Garment mask preparation failed";
      return {
        ok: false,
        errorCode: "GARMENT_MASK_FAILED",
        message,
      };
    }
  }

  const edit = await runFashnEdit({
    imageUrl: input.productImageUrl,
    prompt: FASHN_GARMENT_PREP_PROMPT,
    maskUrl,
    resolution: editOpts.resolution,
    generationMode: editOpts.generationMode,
    outputFormat: "png",
    numImages: 1,
  });

  if (!edit.ok) {
    return {
      ok: false,
      errorCode: edit.errorCode,
      message: edit.errorMessage,
    };
  }

  return {
    ok: true,
    garmentImageUrl: edit.imageUrl,
    premiumGarmentEdit: {
      enabled: true,
      editRequestId: edit.requestId,
      editModelId: FASHN_EDIT_MODEL_NAME,
      originalProductImageUrl: input.productImageUrl,
      preparedGarmentImageUrl: edit.imageUrl,
      maskUrl,
      maskStrategy,
      maskWarning:
        "center_product_zone mask (5–95% of frame) may alter lace edges or SKU details — review preparedGarmentImageUrl before production",
      editPromptSummary: FASHN_GARMENT_PREP_PROMPT_SUMMARY,
      garmentPrepMode: "premium",
      fashnEditResolution: editOpts.resolution,
      fashnEditGenerationMode: editOpts.generationMode,
      garmentPhotoTypeUsed: input.garmentPhotoType,
      premiumGarmentPrepRan: true,
    },
  };
}
