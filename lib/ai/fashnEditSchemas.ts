/**
 * FASHN Edit API (direct api.fashn.ai) — separate from Fal try-on v1.6.
 *
 * Docs: https://docs.fashn.ai/api-reference/edit
 * Model name: `edit` (experimental)
 * Mask: white (255) = prioritize edit; black (0) = preserve.
 */

export const FASHN_EDIT_MODEL_NAME = "edit" as const;

export type FashnEditGenerationMode = "fast" | "balanced" | "quality";
export type FashnEditResolution = "1k" | "2k" | "4k";
export type FashnEditOutputFormat = "png" | "jpeg";

export type FashnEditInput = {
  imageUrl: string;
  prompt: string;
  maskUrl?: string;
  imageContextUrl?: string;
  resolution?: FashnEditResolution;
  generationMode?: FashnEditGenerationMode;
  outputFormat?: FashnEditOutputFormat;
  seed?: number;
  numImages?: number;
};

export type FashnEditResult =
  | {
      ok: true;
      imageUrl: string;
      requestId: string;
      rawStatus: "completed";
    }
  | {
      ok: false;
      requestId?: string;
      errorCode: string;
      errorMessage: string;
      rawStatus?: string;
    };

export type PremiumGarmentEditDebug = {
  enabled: true;
  editRequestId: string;
  editModelId: typeof FASHN_EDIT_MODEL_NAME;
  originalProductImageUrl: string;
  preparedGarmentImageUrl: string;
  maskUrl?: string;
  /** Dev/report: center_product_zone 5–95% mask may alter garment edges */
  maskStrategy?: string;
  maskWarning?: string;
  editPromptSummary: string;
  lingerieSetType?: string;
  editAntiOnePieceApplied?: boolean;
  garmentPrepMode: "premium";
  fashnEditResolution: FashnEditResolution;
  fashnEditGenerationMode: FashnEditGenerationMode;
  garmentPhotoTypeUsed: string;
  premiumGarmentPrepRan: true;
};

export type TryOnGarmentPrepMode = "fast" | "premium";

export function isPremiumGarmentEditFeatureEnabled(): boolean {
  return process.env.AI_PREMIUM_GARMENT_EDIT_ENABLED === "true";
}

export function shouldRunPremiumGarmentPrep(
  garmentPrepMode: TryOnGarmentPrepMode | undefined
): boolean {
  return (
    garmentPrepMode === "premium" && isPremiumGarmentEditFeatureEnabled()
  );
}

export function buildFashnEditRunBody(input: FashnEditInput): {
  model_name: typeof FASHN_EDIT_MODEL_NAME;
  inputs: Record<string, unknown>;
} {
  const inputs: Record<string, unknown> = {
    image: input.imageUrl,
    prompt: input.prompt,
    resolution: input.resolution ?? "2k",
    generation_mode: input.generationMode ?? "balanced",
    output_format: input.outputFormat ?? "png",
    num_images: input.numImages ?? 1,
  };
  if (input.maskUrl) inputs.mask = input.maskUrl;
  if (input.imageContextUrl) inputs.image_context = input.imageContextUrl;
  if (typeof input.seed === "number") inputs.seed = input.seed;

  return { model_name: FASHN_EDIT_MODEL_NAME, inputs };
}

export function resolveTryOnGarmentImageUrl(input: {
  productImageUrl: string;
  preparedGarmentImageUrl?: string;
  garmentPrepMode?: TryOnGarmentPrepMode;
}): string {
  if (shouldRunPremiumGarmentPrep(input.garmentPrepMode) && input.preparedGarmentImageUrl) {
    return input.preparedGarmentImageUrl;
  }
  return input.productImageUrl;
}
