import { NextResponse } from "next/server";
import { estimateSceneCostUsd } from "@/lib/ai/pricing";
import { MOCK_BACKGROUND_REMOVED_IMAGE, MOCK_PRODUCT_SHOT_IMAGES } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { sceneGenerateRequestSchema } from "@/lib/ai/sceneSchemas";

export const runtime = "nodejs";

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = sceneGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid scene generation request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const estimatedCost = estimateSceneCostUsd(data.mode);

  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model:
        data.mode === "exact-background"
          ? "mock-exact-background"
          : "mock-creative-scene",
      image: {
        url:
          data.mode === "exact-background"
            ? MOCK_BACKGROUND_REMOVED_IMAGE
            : MOCK_PRODUCT_SHOT_IMAGES[0].url,
      },
      requestId: "mock-scene-request",
      estimatedCost,
    });
  }

  try {
    assertPaidAiAllowed({
      provider: "fal",
      route: "/api/ai/scene/generate",
      estimatedCostUsd: estimatedCost,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    throw error;
  }

  return NextResponse.json(
    {
      ok: false,
      errorCode: "FAL_VIDEO_MODEL_NOT_CONFIGURED",
      message:
        "Real scene generation пока не включён: нужна отдельная проверка Fal image-edit модели и схемы.",
      estimatedCost,
    },
    { status: 400 }
  );
}
