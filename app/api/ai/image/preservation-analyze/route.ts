import { NextResponse } from "next/server";
import {
  productPreservationRequestSchema,
  type ProductPreservationErrorResponse,
  type ProductPreservationSuccessResponse,
} from "@/lib/ai/productPreservationSchemas";
import {
  buildExternalProductPreservationBlock,
  buildProductPreservationBlock,
} from "@/lib/ai/productPreservationBlock";
import {
  analyzeProductPreservationFromImageUrl,
  mockProductPreservationAnalysis,
} from "@/lib/ai/productPreservationVision";
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
} from "@/lib/ai/paidAiGuard";
import { wrapAiPost } from "@/lib/tokens/wrapAiPost";
import { resolvePreservationAnalyzeBillingCost } from "@/lib/tokens/resolveRouteBillingCost";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/image/preservation-analyze";
const ESTIMATED_VISION_COST_USD = 0.01;

function isDev() {
  return process.env.NODE_ENV === "development";
}

function jsonError(
  status: number,
  body: ProductPreservationErrorResponse
): NextResponse {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  return wrapAiPost(
    request,
    "preservation-analyze",
    ROUTE_ID,
    handlePreservationAnalyzePost,
    { resolveCost: resolvePreservationAnalyzeBillingCost }
  );
}

async function handlePreservationAnalyzePost(request: Request) {
  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonError(400, {
      ok: false,
      error: "Некорректный JSON.",
      errorCode: "VALIDATION_ERROR",
    });
  }

  const parsed = productPreservationRequestSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return jsonError(400, {
      ok: false,
      error: "Не удалось проверить параметры анализа товара.",
      errorCode: "VALIDATION_ERROR",
      providerError: isDev() ? parsed.error.message : undefined,
    });
  }

  const data = parsed.data;

  if (isMockMode()) {
    const analysis = mockProductPreservationAnalysis();
    const response: ProductPreservationSuccessResponse = {
      ok: true,
      analysis,
      preservationBlock: buildProductPreservationBlock(analysis),
      externalPreservationBlock:
        buildExternalProductPreservationBlock(analysis),
      provider: "mock",
      model: "mock-product-preservation",
      usedVision: false,
    };
    return NextResponse.json(response);
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_VISION_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return jsonError(error.status, {
        ok: false,
        error:
          "Анализ товара отключён. Включите ALLOW_PAID_AI_RUNS=true только после approval бюджета.",
        errorCode: "PAID_AI_RUNS_DISABLED",
        providerError: isDev() ? error.message : undefined,
      });
    }
    throw error;
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonError(500, {
      ok: false,
      error: "OPENAI_API_KEY is not configured.",
      errorCode: "OPENAI_API_KEY_MISSING",
    });
  }

  try {
    const result = await analyzeProductPreservationFromImageUrl({
      imageUrl: data.imageUrl,
      userPromptHint: data.userPromptHint,
    });

    const response: ProductPreservationSuccessResponse = {
      ok: true,
      analysis: result.analysis,
      preservationBlock: buildProductPreservationBlock(result.analysis),
      externalPreservationBlock: buildExternalProductPreservationBlock(
        result.analysis
      ),
      provider: result.usedVision ? "openai" : "mock",
      model: result.model,
      usedVision: result.usedVision,
    };
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[${ROUTE_ID}] vision failed:`, message);
    return jsonError(502, {
      ok: false,
      error: "Не удалось проанализировать товар. Используется generic preservation.",
      errorCode: "OPENAI_VISION_FAILED",
      providerError: isDev() ? message : undefined,
    });
  }
}
