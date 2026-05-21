import { NextResponse } from "next/server";
import {
  buildProductShotFormPayload,
  productShotRequestSchema,
  type ProductShotFormPayload,
  type ProductShotRequest,
} from "@/lib/ai/productShotSchemas";
import { MOCK_PRODUCT_SHOT_IMAGES } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { wrapAiPost } from "@/lib/tokens/wrapAiPost";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/product-shot";
const ESTIMATED_PRODUCT_SHOT_COST_USD = 0.08;

async function runProductShot(data: ProductShotRequest, productImageUrl?: string) {
  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model: "mock-product-shot",
      images: MOCK_PRODUCT_SHOT_IMAGES.slice(0, data.numResults).map((image) => ({
        url: image.url,
      })),
      requestId: "mock-product-shot-request",
      sceneDescription: productImageUrl ? "Demo product card" : undefined,
    });
  }

  try {
    assertPaidAiAllowed({
      provider: "fal",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_PRODUCT_SHOT_COST_USD,
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
      errorCode: "FEATURE_DISABLED",
      message:
        "Креативная сцена отключена. Используйте точную карточку в студии.",
    },
    { status: 400 }
  );
}

function handleProductShotError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message,
    },
    { status: 400 }
  );
}

async function processFormPayload(payload: ProductShotFormPayload) {
  try {
    const params: ProductShotRequest = {
      scenePreset: payload.scenePreset,
      customSceneDescription: payload.customSceneDescription,
      numResults: payload.numResults,
      fast: payload.fast,
      placementType: payload.placementType,
      manualPlacementSelection: payload.manualPlacementSelection,
      shotSizePreset: payload.shotSizePreset,
      syncMode: payload.syncMode,
      fidelityMode: payload.fidelityMode,
    };
    return runProductShot(params);
  } catch (error) {
    return handleProductShotError(error);
  }
}

export async function POST(request: Request) {
  return wrapAiPost(request, "product-shot", ROUTE_ID, handleProductShotPost);
}

async function handleProductShotPost(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message: "Invalid multipart form data",
        },
        { status: 400 }
      );
    }

    try {
      const payload = buildProductShotFormPayload(formData);
      return processFormPayload(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid form data";
      return NextResponse.json(
        {
          ok: false,
          errorCode: "VALIDATION_ERROR",
          message,
        },
        { status: 400 }
      );
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  const parsed = productShotRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid product shot request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  if (!parsed.data.productImageUrl) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "productImageUrl is required for JSON requests",
      },
      { status: 400 }
    );
  }

  return runProductShot(parsed.data, parsed.data.productImageUrl);
}
