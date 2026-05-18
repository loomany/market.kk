import { NextResponse } from "next/server";
import { FASHN_TRYON_MODEL, getFalClientOrThrow } from "@/lib/ai/falClient";
import {
  buildTryOnFormPayload,
  tryOnRequestSchema,
  tryOnParamsToRequest,
  type TryOnFormPayload,
  type TryOnInputSource,
  type TryOnRequest,
} from "@/lib/ai/falSchemas";
import { uploadImageToFalStorage } from "@/lib/ai/falUpload";
import { getMockTryOnResults } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/tryon";

function estimateTryOnCostUsd(numSamples: number) {
  return Number((0.08 * Math.max(1, numSamples)).toFixed(2));
}

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

function mockResponse(
  data: TryOnRequest,
  inputSource?: TryOnInputSource
) {
  const mock = getMockTryOnResults(
    data.numSamples,
    data.seed ?? Math.floor(Math.random() * 10000)
  );
  return NextResponse.json({
    ok: true,
    provider: "mock",
    model: "mock",
    images: mock.images.map(({ url }) => ({ url })),
    requestId: "mock-request",
    ...(inputSource ? { inputSource } : {}),
  });
}

async function resolveImageUrls(
  payload: TryOnFormPayload,
  mockMode: boolean,
  guard: PaidAiGuardInput
): Promise<{ productImageUrl: string; modelImageUrl: string }> {
  let productImageUrl = payload.productImageUrl;
  let modelImageUrl = payload.modelImageUrl;

  if (payload.productImageFile) {
    if (mockMode) {
      productImageUrl = productImageUrl ?? "https://mock.local/product";
    } else {
      try {
        productImageUrl = await uploadImageToFalStorage(
          payload.productImageFile,
          "Product image",
          guard
        );
      } catch (uploadError) {
        console.error(
          "[fal tryon] product upload failed:",
          uploadError instanceof Error ? uploadError.message : "Unknown error"
        );
        throw new Error("Fal storage upload failed for product image");
      }
    }
  }

  if (payload.modelImageFile) {
    if (mockMode) {
      modelImageUrl = modelImageUrl ?? "https://mock.local/model";
    } else {
      try {
        modelImageUrl = await uploadImageToFalStorage(
          payload.modelImageFile,
          "Model image",
          guard
        );
      } catch (uploadError) {
        console.error(
          "[fal tryon] model upload failed:",
          uploadError instanceof Error ? uploadError.message : "Unknown error"
        );
        throw new Error("Fal storage upload failed for model image");
      }
    }
  }

  if (!productImageUrl || !modelImageUrl) {
    throw new Error("Product and model image sources are required.");
  }

  return { productImageUrl, modelImageUrl };
}

async function runTryOn(
  data: TryOnRequest,
  inputSource?: TryOnInputSource
) {
  if (isMockMode()) {
    return mockResponse(data, inputSource);
  }

  try {
    const fal = getFalClientOrThrow({
      provider: "fal",
      route: ROUTE_ID,
      estimatedCostUsd: estimateTryOnCostUsd(data.numSamples),
    });
    const result = await fal.subscribe(FASHN_TRYON_MODEL, {
      input: {
        model_image: data.modelImageUrl,
        garment_image: data.productImageUrl,
        category: data.category,
        mode: data.mode,
        garment_photo_type: data.garmentPhotoType,
        moderation_level: data.moderationLevel,
        num_samples: data.numSamples,
        segmentation_free: data.segmentationFree,
        output_format: data.outputFormat,
        ...(typeof data.seed === "number" ? { seed: data.seed } : {}),
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log(
            "[fal tryon]",
            update.logs?.map((log) => log.message).join("\n")
          );
        }
      },
    });

    const images =
      (
        result.data as {
          images?: { url: string; width?: number; height?: number }[];
        }
      ).images ?? [];

    return NextResponse.json({
      ok: true,
      provider: "fal",
      model: FASHN_TRYON_MODEL,
      images,
      requestId: result.requestId,
      ...(inputSource ? { inputSource } : {}),
    });
  } catch (error) {
    return handleTryOnError(error);
  }
}

function handleTryOnError(error: unknown) {
  if (isPaidAiGuardError(error)) {
    return NextResponse.json(paidAiGuardResponse(error), {
      status: error.status,
    });
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  if (message.includes("FAL_KEY")) {
    console.error("[fal tryon] FAL_KEY missing");
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

  if (
    message.includes("upload") ||
    message.includes("Upload") ||
    message.includes("storage")
  ) {
    console.error("[fal tryon] upload failed:", message);
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

  console.error("[fal tryon] failed:", message);
  return NextResponse.json(
    {
      ok: false,
      errorCode: "FAL_TRYON_FAILED",
      message: "Failed to generate try-on image. Please try again.",
    },
    { status: 500 }
  );
}

async function processFormPayload(payload: TryOnFormPayload) {
  const mockMode = isMockMode();
  const guard: PaidAiGuardInput = {
    provider: "fal",
    route: ROUTE_ID,
    estimatedCostUsd: estimateTryOnCostUsd(payload.numSamples),
  };

  try {
    if (!mockMode) {
      assertPaidAiAllowed(guard);
    }

    const { productImageUrl, modelImageUrl } = await resolveImageUrls(
      payload,
      mockMode,
      guard
    );

    const params = {
      category: payload.category,
      garmentPhotoType: payload.garmentPhotoType,
      mode: payload.mode,
      moderationLevel: payload.moderationLevel,
      numSamples: payload.numSamples,
      segmentationFree: payload.segmentationFree,
      outputFormat: payload.outputFormat,
      seed: payload.seed,
    };

    const data = tryOnParamsToRequest(
      productImageUrl,
      modelImageUrl,
      params
    );

    return runTryOn(data, payload.inputSource);
  } catch (error) {
    return handleTryOnError(error);
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
      const payload = buildTryOnFormPayload(formData);
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

  const parsed = tryOnRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid try-on request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  return runTryOn(parsed.data);
}
