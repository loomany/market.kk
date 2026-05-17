import { NextResponse } from "next/server";
import {
  getFalClientOrThrow,
  PRODUCT_SHOT_MODEL,
} from "@/lib/ai/falClient";
import { buildProductShotSceneDescription } from "@/lib/ai/productShotPrompts";
import {
  buildProductShotFormPayload,
  productShotRequestSchema,
  shotSizePresetToDimensions,
  type ProductShotFormPayload,
  type ProductShotRequest,
} from "@/lib/ai/productShotSchemas";
import { uploadImageToFalStorage } from "@/lib/ai/falUpload";
import { MOCK_PRODUCT_SHOT_IMAGES } from "@/lib/ai/mockResults";

export const runtime = "nodejs";

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

async function resolveProductImageUrl(
  payload: ProductShotFormPayload,
  mockMode: boolean
): Promise<string> {
  let productImageUrl = payload.productImageUrl;

  if (payload.productImageFile) {
    if (mockMode) {
      productImageUrl = productImageUrl ?? "https://mock.local/product";
    } else {
      try {
        productImageUrl = await uploadImageToFalStorage(
          payload.productImageFile,
          "Product image"
        );
      } catch (uploadError) {
        console.error("[fal product-shot] upload failed:", uploadError);
        throw new Error("Fal storage upload failed for product image");
      }
    }
  }

  if (!productImageUrl) {
    throw new Error("Product image file or URL is required.");
  }

  return productImageUrl;
}

function mockResponse(data: ProductShotRequest, sceneDescription: string) {
  const images = MOCK_PRODUCT_SHOT_IMAGES.slice(0, data.numResults);
  return NextResponse.json({
    ok: true,
    provider: "mock",
    model: "mock-product-shot",
    images,
    requestId: "mock-product-shot-request",
    sceneDescription,
  });
}

async function runProductShot(
  data: ProductShotRequest,
  productImageUrl: string
) {
  const sceneDescription = buildProductShotSceneDescription(data);
  const shotSize = shotSizePresetToDimensions(data.shotSizePreset);

  if (isMockMode()) {
    return mockResponse(data, sceneDescription);
  }

  try {
    const fal = getFalClientOrThrow();
    const result = await fal.subscribe(PRODUCT_SHOT_MODEL, {
      input: {
        image_url: productImageUrl,
        scene_description: sceneDescription,
        optimize_description: true,
        num_results: data.numResults,
        fast: data.fast,
        placement_type: data.placementType,
        shot_size: shotSize,
        manual_placement_selection: data.manualPlacementSelection,
        sync_mode: data.syncMode,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log(
            "[fal product-shot]",
            update.logs?.map((log) => log.message).join("\n")
          );
        }
      },
    });

    const resultData = result.data as {
      images?: {
        url: string;
        width?: number;
        height?: number;
        content_type?: string;
        file_name?: string;
        file_size?: number;
      }[];
    };

    const images = resultData.images ?? [];

    return NextResponse.json({
      ok: true,
      provider: "fal",
      model: PRODUCT_SHOT_MODEL,
      images,
      requestId: result.requestId,
      sceneDescription,
    });
  } catch (error) {
    return handleProductShotError(error);
  }
}

function handleProductShotError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (message.includes("FAL_KEY")) {
    console.error("[fal product-shot] FAL_KEY missing");
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_KEY_MISSING",
        message:
          "Fal API key is not configured. Add FAL_KEY to .env.local or enable AI_MOCK_MODE=1.",
      },
      { status: 500 }
    );
  }

  if (
    message.includes("too large") ||
    message.includes("must be JPEG") ||
    message.includes("is required")
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message,
      },
      { status: 400 }
    );
  }

  if (message.includes("upload") || message.includes("storage")) {
    console.error("[fal product-shot] upload failed:", error);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_UPLOAD_FAILED",
        message:
          "Failed to upload image. Please try a smaller JPEG, PNG, or WEBP file.",
      },
      { status: 500 }
    );
  }

  console.error("[fal product-shot] failed:", error);
  return NextResponse.json(
    {
      ok: false,
      errorCode: "FAL_PRODUCT_SHOT_FAILED",
      message: "Failed to generate product shot. Please try again.",
    },
    { status: 500 }
  );
}

async function processFormPayload(payload: ProductShotFormPayload) {
  const mockMode = isMockMode();

  try {
    const productImageUrl = await resolveProductImageUrl(payload, mockMode);
    const params: ProductShotRequest = {
      scenePreset: payload.scenePreset,
      customSceneDescription: payload.customSceneDescription,
      numResults: payload.numResults,
      fast: payload.fast,
      placementType: payload.placementType,
      manualPlacementSelection: payload.manualPlacementSelection,
      shotSizePreset: payload.shotSizePreset,
      syncMode: payload.syncMode,
    };
    return runProductShot(params, productImageUrl);
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
