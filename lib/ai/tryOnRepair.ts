import "server-only";
import { MODEL_GENERATION_EDIT_MODEL, getFalClientOrThrow } from "@/lib/ai/falClient";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { buildTryOnRepairPrompt } from "@/lib/ai/productAnalysisPipeline";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";

const ROUTE_ID = "/api/ai/tryon/repair";

export async function runTryOnRepair(input: {
  resultImageUrl: string;
  productAnalysis: ProductDescriptionAnalysis;
  userDescriptionRu?: string;
  resolution?: FalModelResolution;
  guard: PaidAiGuardInput;
}): Promise<{ url: string; requestId: string } | null> {
  if (process.env.AI_MOCK_MODE !== "0") {
    return { url: input.resultImageUrl, requestId: "mock-repair" };
  }

  const prompt = buildTryOnRepairPrompt(
    input.productAnalysis,
    input.userDescriptionRu
  );

  try {
    const fal = getFalClientOrThrow(input.guard);
    const result = await fal.subscribe(MODEL_GENERATION_EDIT_MODEL, {
      input: {
        prompt,
        image_urls: [input.resultImageUrl],
        num_images: 1,
        output_format: "png",
        resolution: input.resolution ?? "2K",
        limit_generations: true,
      },
      logs: false,
    });

    const url = (
      result.data as { images?: { url: string }[] }
    ).images?.[0]?.url;

    if (!url) return null;

    return { url, requestId: result.requestId };
  } catch (error) {
    console.warn(
      `[${ROUTE_ID}] repair failed:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}
