import { NextResponse } from "next/server";
import { FASHN_TRYON_MODEL, getFalClientOrThrow } from "@/lib/ai/falClient";
import {
  buildTryOnFormPayload,
  getProductAnalysisFromPayload,
  tryOnRequestSchema,
  tryOnParamsToRequest,
  type TryOnFormPayload,
  type TryOnInputSource,
  type TryOnRequest,
} from "@/lib/ai/falSchemas";
import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import { effectiveProductDescriptionRu } from "@/lib/ai/productAnalysisPipeline";
import { runTryOnJudge } from "@/lib/ai/tryOnJudge";
import { runTryOnRepair } from "@/lib/ai/tryOnRepair";
import { uploadImageToFalStorage } from "@/lib/ai/falUpload";
import { prepareGarmentForTryOn } from "@/lib/ai/prepareGarmentForTryOn";
import { shouldRunPremiumGarmentPrep } from "@/lib/ai/fashnEditSchemas";
import { resolveTryOnEngine } from "@/lib/ai/tryOnEngine";
import { buildTryOnPipelineDebug } from "@/lib/ai/tryOnPipelineDebug";
import { buildFashnTryOnMaxPrompt } from "@/lib/ai/fashnTryOnMaxPrompt";
import { runFashnTryOnMax } from "@/lib/ai/fashnTryOnMaxClient";
import {
  FASHN_TRYON_MAX_MODEL_NAME,
  mapModelResolutionToFashnTryOnMax,
} from "@/lib/ai/fashnTryOnMaxSchemas";
import type { QualityMode } from "@/components/studio/types";
import { getMockTryOnResults } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";

export const runtime = "nodejs";
/**
 * Fal try-on usually finishes in 30–90 s, but lingerie / lace / 2K runs can
 * legitimately take several minutes. The client no longer aborts on a 2-min
 * timer (a soft "taking a bit longer" notice fires at 4 min instead); we
 * give the server enough headroom to actually deliver the result. 300 s is
 * Vercel's max on the Pro plan for serverless functions.
 */
export const maxDuration = 300;

const ROUTE_ID = "/api/ai/tryon";

function estimateTryOnCostUsd(
  numSamples: number,
  tryOnMaxExperimental?: boolean
) {
  const unit = tryOnMaxExperimental ? 0.16 : 0.08;
  return Number((unit * Math.max(1, numSamples)).toFixed(2));
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

async function runTryOnQualityPipeline(input: {
  data: TryOnRequest;
  images: { url: string; width?: number; height?: number }[];
  productAnalysis: NonNullable<ReturnType<typeof getProductAnalysisFromPayload>>;
  userDescriptionRu?: string;
  userEdited?: boolean;
  repairResolution?: FalModelResolution;
  guard: PaidAiGuardInput;
}): Promise<{
  images: { url: string; width?: number; height?: number }[];
  qualityMeta?: {
    judged: boolean;
    repaired: boolean;
    judgeScore?: number;
    judgeIssues?: string[];
    repairAttempted?: boolean;
    repairSucceeded?: boolean;
    repairErrorReason?: string;
  };
}> {
  if (process.env.TRYON_QUALITY_PIPELINE === "0") {
    return { images: input.images };
  }

  let images = input.images;
  const userDesc = effectiveProductDescriptionRu(
    input.productAnalysis,
    input.userDescriptionRu ?? "",
    input.userEdited ?? false
  );

  const judge = await runTryOnJudge({
    productImageUrl: input.data.productImageUrl,
    resultImageUrl: images[0]!.url,
    productAnalysis: input.productAnalysis,
  });

  let repaired = false;
  let repairAttempted = false;
  let repairSucceeded = false;
  let repairErrorReason: string | undefined;

  if (judge.score < 0.72) {
    repairAttempted = true;
    const repair = await runTryOnRepair({
      resultImageUrl: images[0]!.url,
      productAnalysis: input.productAnalysis,
      userDescriptionRu: userDesc,
      resolution: input.repairResolution,
      guard: input.guard,
    });
    if (repair.ok) {
      images = [{ ...images[0]!, url: repair.url }];
      repaired = true;
      repairSucceeded = true;
    } else {
      repairErrorReason = repair.errorReason;
      console.error("[fal tryon] repair did not produce image:", repairErrorReason);
    }
  }

  return {
    images,
    qualityMeta: {
      judged: true,
      repaired,
      judgeScore: judge.score,
      judgeIssues: judge.issues,
      repairAttempted,
      repairSucceeded,
      ...(repairErrorReason ? { repairErrorReason } : {}),
    },
  };
}

async function runTryOn(
  data: TryOnRequest,
  inputSource?: TryOnInputSource,
  options?: {
    payload?: TryOnFormPayload;
    guard?: PaidAiGuardInput;
    premiumGarmentEdit?: import("@/lib/ai/fashnEditSchemas").PremiumGarmentEditDebug;
    tryOnMaxExperimental?: boolean;
    modelResolution?: FalModelResolution;
  }
) {
  if (isMockMode()) {
    return mockResponse(data, inputSource);
  }

  const tryOnMaxExperimental = options?.tryOnMaxExperimental ?? false;
  const guard: PaidAiGuardInput = options?.guard ?? {
    provider: "fal",
    route: ROUTE_ID,
    estimatedCostUsd: estimateTryOnCostUsd(data.numSamples, tryOnMaxExperimental),
  };

  const productAnalysis = options?.payload
    ? getProductAnalysisFromPayload(options.payload)
    : null;

  const fashnTryOnMaxGenerationMode = "quality" as const;
  const fashnTryOnMaxResolution = mapModelResolutionToFashnTryOnMax(
    options?.modelResolution ?? options?.payload?.modelResolution
  );
  const fashnTryOnMaxPromptResult = tryOnMaxExperimental
    ? buildFashnTryOnMaxPrompt({
        productAnalysis,
        userDescriptionRu: options?.payload?.userDescriptionRu,
        userEdited: options?.payload?.userEditedProductDescription,
        category: data.category,
        garmentPhotoType: data.garmentPhotoType,
      })
    : null;
  const fashnTryOnMaxPrompt = fashnTryOnMaxPromptResult?.prompt;

  try {
    let images: { url: string; width?: number; height?: number }[] = [];
    let requestId: string;
    let provider: string;
    let model: string;

    if (tryOnMaxExperimental) {
      const maxResult = await runFashnTryOnMax({
        productImageUrl: data.productImageUrl,
        modelImageUrl: data.modelImageUrl,
        prompt: fashnTryOnMaxPrompt,
        resolution: fashnTryOnMaxResolution,
        generationMode: fashnTryOnMaxGenerationMode,
        outputFormat: data.outputFormat === "jpeg" ? "jpeg" : "png",
        seed: data.seed,
        numImages: data.numSamples,
      });

      if (!maxResult.ok) {
        const status =
          maxResult.errorCode === "FASHN_API_KEY_MISSING" ? 500 : 502;
        return NextResponse.json(
          {
            ok: false,
            errorCode: maxResult.errorCode,
            message: maxResult.errorMessage,
          },
          { status }
        );
      }

      images = [{ url: maxResult.imageUrl }];
      requestId = maxResult.requestId;
      provider = "fashn";
      model = FASHN_TRYON_MAX_MODEL_NAME;
    } else {
      const fal = getFalClientOrThrow(guard);
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

      images =
        (
          result.data as {
            images?: { url: string; width?: number; height?: number }[];
          }
        ).images ?? [];
      requestId = result.requestId;
      provider = "fal";
      model = FASHN_TRYON_MODEL;
    }

    let qualityMeta:
      | {
          judged: boolean;
          repaired: boolean;
          judgeScore?: number;
          judgeIssues?: string[];
          repairAttempted?: boolean;
          repairSucceeded?: boolean;
          repairErrorReason?: string;
        }
      | undefined;

    if (productAnalysis && images.length > 0) {
      const piped = await runTryOnQualityPipeline({
        data,
        images,
        productAnalysis,
        userDescriptionRu: options?.payload?.userDescriptionRu,
        userEdited: options?.payload?.userEditedProductDescription,
        repairResolution: options?.payload?.modelResolution,
        guard,
      });
      images = piped.images;
      qualityMeta = piped.qualityMeta;
    }

    const selectedQualityMode = (data.mode ?? "balanced") as QualityMode;
    const garmentPrepMode = options?.payload?.garmentPrepMode ?? "fast";
    const tryOnEngine = resolveTryOnEngine(selectedQualityMode, {
      tryOnMaxExperimental,
    });

    return NextResponse.json({
      ok: true,
      provider,
      model,
      images,
      requestId,
      ...(inputSource ? { inputSource } : {}),
      ...(options?.premiumGarmentEdit
        ? {
            premiumGarmentEdit: options.premiumGarmentEdit,
            tryOn: {
              requestId,
              finalImageUrl: images[0]?.url,
              garmentImageUrl: data.productImageUrl,
            },
          }
        : {}),
      ...(qualityMeta ? { quality: qualityMeta } : {}),
      ...(productAnalysis
        ? {
            debug: buildTryOnPipelineDebug({
              productAnalysis,
              tryOnRequest: data,
              selectedQualityMode,
              tryOnEngine,
              garmentPrepMode,
              premiumGarmentEdit: options?.premiumGarmentEdit,
              tryOnMaxExperimental,
              fashnTryOnMaxPrompt,
              promptPreview: fashnTryOnMaxPrompt,
              fashnTryOnMaxResolution,
              fashnTryOnMaxGenerationMode,
              garmentTypeLockApplied:
                fashnTryOnMaxPromptResult?.garmentTypeLockApplied,
              antiOnePieceApplied:
                fashnTryOnMaxPromptResult?.antiOnePieceApplied,
              qualityMeta,
            }),
          }
        : {}),
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

  if (
    message.includes("FASHN_API_KEY") ||
    message.includes("FASHN Try-On Max")
  ) {
    console.error("[fashn tryon max] failed:", message);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FASHN_TRYON_MAX_FAILED",
        message:
          "Try-On Max не удалось выполнить. Проверьте FASHN_API_KEY или отключите галочку Try-On Max.",
      },
      { status: 502 }
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
    estimatedCostUsd: estimateTryOnCostUsd(
      payload.numSamples,
      payload.tryOnMaxExperimental
    ),
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

    let garmentImageUrl = productImageUrl;
    let premiumGarmentEdit:
      | import("@/lib/ai/fashnEditSchemas").PremiumGarmentEditDebug
      | undefined;

    if (shouldRunPremiumGarmentPrep(payload.garmentPrepMode)) {
      const prep = await prepareGarmentForTryOn({
        productImageUrl,
        garmentPrepMode: payload.garmentPrepMode,
        garmentPhotoType: payload.garmentPhotoType,
        productAnalysis: getProductAnalysisFromPayload(payload),
        guard,
        mockMode,
      });
      if (!prep.ok) {
        return NextResponse.json(
          {
            ok: false,
            errorCode: prep.errorCode,
            message: prep.message,
          },
          { status: prep.errorCode === "FASHN_API_KEY_MISSING" ? 500 : 502 }
        );
      }
      garmentImageUrl = prep.garmentImageUrl;
      premiumGarmentEdit = prep.premiumGarmentEdit;
    }

    const data = tryOnParamsToRequest(garmentImageUrl, modelImageUrl, params);

    return runTryOn(data, payload.inputSource, {
      payload,
      guard,
      premiumGarmentEdit,
      tryOnMaxExperimental: payload.tryOnMaxExperimental,
      modelResolution: payload.modelResolution,
    });
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
