/**
 * FASHN Try-On Max (direct api.fashn.ai) — separate from Fal try-on v1.6.
 *
 * Docs: https://docs.fashn.ai/api-reference/tryon-max
 * Model name: `tryon-max` (experimental)
 */

import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";

export const FASHN_TRYON_MAX_MODEL_NAME = "tryon-max" as const;

export type FashnTryOnMaxResolution = "1k" | "2k" | "4k";
export type FashnTryOnMaxGenerationMode = "balanced" | "quality";
export type FashnTryOnMaxOutputFormat = "png" | "jpeg";

export type FashnTryOnMaxInput = {
  productImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  resolution?: FashnTryOnMaxResolution;
  generationMode?: FashnTryOnMaxGenerationMode;
  outputFormat?: FashnTryOnMaxOutputFormat;
  seed?: number;
  numImages?: number;
};

export type FashnTryOnMaxResult =
  | {
      ok: true;
      imageUrl: string;
      requestId: string;
      rawStatus: "completed";
      promptUsed: string;
    }
  | {
      ok: false;
      requestId?: string;
      errorCode: string;
      errorMessage: string;
      rawStatus?: string;
    };

export function mapModelResolutionToFashnTryOnMax(
  resolution: FalModelResolution | undefined
): FashnTryOnMaxResolution {
  switch (resolution) {
    case "1K":
      return "1k";
    case "4K":
      return "4k";
    default:
      return "2k";
  }
}

export function buildFashnTryOnMaxRunBody(input: FashnTryOnMaxInput): {
  model_name: typeof FASHN_TRYON_MAX_MODEL_NAME;
  inputs: Record<string, unknown>;
} {
  const inputs: Record<string, unknown> = {
    product_image: input.productImageUrl,
    model_image: input.modelImageUrl,
    prompt: input.prompt?.trim() ?? "",
    resolution: input.resolution ?? "2k",
    generation_mode: input.generationMode ?? "quality",
    output_format: input.outputFormat ?? "png",
    num_images: input.numImages ?? 1,
    return_base64: false,
  };

  if (typeof input.seed === "number") {
    inputs.seed = input.seed;
  }

  return {
    model_name: FASHN_TRYON_MAX_MODEL_NAME,
    inputs,
  };
}
