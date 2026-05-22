import { NextResponse } from "next/server";
import { MOCK_PRODUCT_SHOT_IMAGES } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { prepareImagePromptPackage } from "@/lib/ai/imagePromptPackage";
import { runPostProcessTextToImage } from "@/lib/ai/runPostProcessTextToImage";
import {
  textToImageGenerateRequestSchema,
  type TextToImageGenerateErrorResponse,
  type TextToImageGenerateSuccessResponse,
} from "@/lib/ai/textToImageSchemas";
import { defaultLocale } from "@/lib/i18n/localeConfig";
import { OPENAI_COST, FAL_IMAGE_COST } from "@/lib/ai/generationCostPricing";
import { wrapAiPost } from "@/lib/tokens/wrapAiPost";
import { estimatePostProcessTextToImageCost } from "@/lib/ai/studioGenerationCostEstimate";
import { resolveTextToImageBillingCost } from "@/lib/tokens/resolveRouteBillingCost";
import { preflightTokensFromEstimate } from "@/lib/ai/studioCostEstimateUtils";
import { normalizeTokenAmount } from "@/lib/tokens/tokenAmount";
import { withGenerationIdempotency } from "@/lib/studio/withGenerationIdempotency";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/image/text-generate";

export async function POST(request: Request) {
  return wrapAiPost(request, "text-to-image", ROUTE_ID, handleTextGeneratePost, {
    resolveCost: resolveTextToImageBillingCost,
  });
}

async function handleTextGeneratePost(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "Invalid JSON body",
    });
  }

  const parsed = textToImageGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "Invalid text-to-image request",
    });
  }

  const data = parsed.data;
  const locale = data.locale ?? defaultLocale;
  const estimatedCostUsd =
    OPENAI_COST.imagePromptPackage + FAL_IMAGE_COST.nanoBananaProT2i;
  const estimatedCost = normalizeTokenAmount(
    preflightTokensFromEstimate(
      estimatePostProcessTextToImageCost({
        runOpenAiPromptPackage: data.skipPromptPackage !== true,
        mockMode: isMockMode(),
      })
    )
  );

  return withGenerationIdempotency(
    {
      clientAssetId: data.clientAssetId,
      jobType: "text-to-image",
      route: ROUTE_ID,
      requestPayload: data as unknown as Record<string, unknown>,
      provider: "fal",
      model: "fal-ai/nano-banana-pro",
      estimatedCost,
    },
    async () => {
      if (isMockMode()) {
        const mock = MOCK_PRODUCT_SHOT_IMAGES[0];
        return NextResponse.json({
          ok: true,
          imageUrl: mock.url,
          provider: "mock",
          model: "mock-text-to-image",
          promptUsed: data.userPrompt,
          requestId: "mock-text-to-image",
          estimatedCostUsd: null,
        } satisfies TextToImageGenerateSuccessResponse);
      }

      try {
        assertPaidAiAllowed({
          provider: "fal",
          route: ROUTE_ID,
          estimatedCostUsd,
        });
      } catch (error) {
        if (isPaidAiGuardError(error)) {
          return NextResponse.json(paidAiGuardResponse(error), {
            status: error.status,
          });
        }
        throw error;
      }

      let generationPrompt = data.userPrompt;
      try {
        const packaged = await prepareImagePromptPackage({
          userPrompt: data.userPrompt,
          negativePrompt: data.negativePrompt,
          useNegativePrompt: Boolean(data.useNegativePrompt),
          preserveProduct: false,
          selectedEditor: "nano-banana-pro",
          locale,
          mockMode: false,
          skipOpenAiPackage: data.skipPromptPackage,
        });
        generationPrompt = packaged.generationPrompt;
      } catch (error) {
        if (isPaidAiGuardError(error)) {
          return NextResponse.json(paidAiGuardResponse(error), {
            status: error.status,
          });
        }
        console.error("[text-generate prompt package]", error);
        return jsonError(502, {
          ok: false,
          errorCode: "PROMPT_PACKAGE_FAILED",
          message: "Не удалось подготовить промпт. Упростите текст и повторите.",
        });
      }

      const falResult = await runPostProcessTextToImage({
        prompt: generationPrompt,
        aspectRatio: data.aspectRatio,
        outputFormat: data.outputFormat,
        quality: data.quality,
        guard: { provider: "fal", route: ROUTE_ID, estimatedCostUsd },
      });

      if (!falResult.ok) {
        return jsonError(502, {
          ok: false,
          errorCode: falResult.code,
          message: falResult.providerError ?? "Text-to-image generation failed",
        });
      }

      return NextResponse.json({
        ok: true,
        imageUrl: falResult.url,
        provider: "fal",
        model: falResult.model,
        promptUsed: generationPrompt,
        requestId: falResult.requestId,
        estimatedCostUsd,
      } satisfies TextToImageGenerateSuccessResponse);
    }
  );
}

function jsonError(status: number, body: TextToImageGenerateErrorResponse) {
  return NextResponse.json(body, { status });
}
