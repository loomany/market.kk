import "server-only";
import { MODEL_GENERATION_EDIT_MODEL, getFalClientOrThrow } from "@/lib/ai/falClient";
import { falErrorMessage } from "@/lib/ai/falErrorMessage";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { buildTryOnRepairPrompt } from "@/lib/ai/productAnalysisPipeline";
import type { PaidAiGuardInput } from "@/lib/ai/paidAiGuard";

const ROUTE_ID = "/api/ai/tryon/repair";

export type TryOnRepairResult =
  | { ok: true; url: string; requestId: string }
  | { ok: false; errorReason: string; requestId?: string };

async function ensureFalAccessibleImageUrl(
  imageUrl: string,
  guard: PaidAiGuardInput
): Promise<string> {
  if (/fal\.media|fal\.run/i.test(imageUrl)) {
    return imageUrl;
  }
  const fal = getFalClientOrThrow(guard);
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Cannot fetch try-on image for repair (${res.status})`);
  }
  const contentType = res.headers.get("content-type") ?? "image/png";
  const blob = new Blob([await res.arrayBuffer()], { type: contentType });
  return fal.storage.upload(blob);
}

export async function runTryOnRepair(input: {
  resultImageUrl: string;
  productAnalysis: ProductDescriptionAnalysis;
  userDescriptionRu?: string;
  resolution?: FalModelResolution;
  guard: PaidAiGuardInput;
}): Promise<TryOnRepairResult> {
  if (process.env.AI_MOCK_MODE !== "0") {
    return { ok: true, url: input.resultImageUrl, requestId: "mock-repair" };
  }

  const prompt = buildTryOnRepairPrompt(input.productAnalysis);

  try {
    const fal = getFalClientOrThrow(input.guard);
    const imageUrl = await ensureFalAccessibleImageUrl(
      input.resultImageUrl,
      input.guard
    );
    const isLingerie = input.productAnalysis.categoryContext === "lingerie";
    const result = await fal.subscribe(MODEL_GENERATION_EDIT_MODEL, {
      input: {
        prompt,
        image_urls: [imageUrl],
        num_images: 1,
        output_format: "png",
        aspect_ratio: "3:4",
        safety_tolerance: isLingerie ? "6" : "4",
        resolution: input.resolution ?? "2K",
        limit_generations: true,
      },
      logs: false,
    });

    const url = (
      result.data as { images?: { url: string }[] }
    ).images?.[0]?.url;

    if (!url) {
      const reason = "Fal edit returned no image URL in response";
      console.error(`[${ROUTE_ID}] ${reason}`, {
        requestId: result.requestId,
        dataKeys:
          result.data && typeof result.data === "object"
            ? Object.keys(result.data as object)
            : [],
      });
      return { ok: false, errorReason: reason, requestId: result.requestId };
    }

    return { ok: true, url, requestId: result.requestId };
  } catch (error) {
    const errorReason = falErrorMessage(error);
    console.error(`[${ROUTE_ID}] repair failed:`, errorReason);
    return { ok: false, errorReason };
  }
}
