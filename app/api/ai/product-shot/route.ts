import { NextResponse } from "next/server";
import {
  buildProductShotFormPayload,
  productShotRequestSchema,
  type ProductShotFormPayload,
  type ProductShotRequest,
} from "@/lib/ai/productShotSchemas";

export const runtime = "nodejs";

async function runProductShot(
  _data: ProductShotRequest,
  _productImageUrl?: string
) {
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
