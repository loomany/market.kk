import { NextResponse } from "next/server";
import { analyzeGarmentSelectionRefinement } from "@/lib/ai/refineGarmentSelectionVision";
import type {
  RefineProductMaskErrorResponse,
  RefineProductMaskSuccessResponse,
} from "@/lib/ai/refineGarmentSelectionSchemas";
import { validateImageFile } from "@/lib/ai/imageConstraints";
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/refine-product-mask";
const ESTIMATED_VISION_COST_USD = 0.012;

function mockRefinement(): RefineProductMaskSuccessResponse {
  return {
    ok: true,
    usedVision: false,
    model: "mock-garment-refinement",
    refinement: {
      garmentPiece: "unknown",
      garmentLabelRu: "Товар",
      tightGarmentBox: { x: 0.2, y: 0.35, width: 0.6, height: 0.35 },
      excludeRegions: [],
      confidence: 0.5,
      notes: "Mock: клиент использует маску без vision.",
    },
  };
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid form data",
      } satisfies RefineProductMaskErrorResponse,
      { status: 400 }
    );
  }

  const photoEntry = formData.get("productImageFile");
  const maskEntry = formData.get("maskImageFile");

  if (!(photoEntry instanceof File) || photoEntry.size === 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Загрузите исходное фото.",
      } satisfies RefineProductMaskErrorResponse,
      { status: 400 }
    );
  }

  if (!(maskEntry instanceof File) || maskEntry.size === 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Нет маски выделения.",
      } satisfies RefineProductMaskErrorResponse,
      { status: 400 }
    );
  }

  try {
    validateImageFile(photoEntry, "Product image");
    validateImageFile(maskEntry, "Mask image");
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message:
          error instanceof Error ? error.message : "Invalid image",
      } satisfies RefineProductMaskErrorResponse,
      { status: 400 }
    );
  }

  if (isMockMode()) {
    return NextResponse.json(mockRefinement());
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_VISION_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    throw error;
  }

  const { refinement, model } = await analyzeGarmentSelectionRefinement({
    photoFile: photoEntry,
    maskFile: maskEntry,
  });

  if (!refinement) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VISION_UNAVAILABLE",
        message:
          "Не удалось уточнить выделение. Обведите товар кистью по контуру и попробуйте снова.",
      } satisfies RefineProductMaskErrorResponse,
      { status: 503 }
    );
  }

  const response: RefineProductMaskSuccessResponse = {
    ok: true,
    refinement,
    usedVision: true,
    model: model ?? undefined,
  };

  return NextResponse.json(response);
}
