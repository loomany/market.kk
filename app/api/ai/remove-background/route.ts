import { NextResponse } from "next/server";
import {
  BACKGROUND_REMOVE_MODEL,
  getFalClientOrThrow,
} from "@/lib/ai/falClient";
import {
  buildRemoveBackgroundFormPayload,
  removeBackgroundRequestSchema,
} from "@/lib/ai/backgroundRemovalSchemas";
import { uploadImageToFalStorage } from "@/lib/ai/falUpload";
import { MOCK_BACKGROUND_REMOVED_IMAGE } from "@/lib/ai/mockResults";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
  type PaidAiGuardInput,
} from "@/lib/ai/paidAiGuard";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/remove-background";
const ESTIMATED_BACKGROUND_REMOVE_COST_USD = 0.03;

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

async function resolveImageUrl(
  imageUrl: string | undefined,
  imageFile: File | null,
  mockMode: boolean,
  guard: PaidAiGuardInput
): Promise<string> {
  let resolved = imageUrl;

  if (imageFile) {
    if (mockMode) {
      resolved = resolved ?? "https://mock.local/product";
    } else {
      resolved = await uploadImageToFalStorage(imageFile, "Product image", guard);
    }
  }

  if (!resolved) {
    throw new Error("Image file or URL is required.");
  }

  return resolved;
}

async function runRemoveBackground(imageUrl: string, syncMode: boolean) {
  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model: "mock-background-removal",
      image: { url: MOCK_BACKGROUND_REMOVED_IMAGE },
      requestId: "mock-bg-request",
    });
  }

  try {
    const fal = getFalClientOrThrow({
      provider: "fal",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_BACKGROUND_REMOVE_COST_USD,
    });
    const result = await fal.subscribe(BACKGROUND_REMOVE_MODEL, {
      input: {
        image_url: imageUrl,
        sync_mode: syncMode,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log(
            "[fal remove-background]",
            update.logs?.map((log) => log.message).join("\n")
          );
        }
      },
    });

    const resultData = result.data as {
      image?: {
        url: string;
        width?: number;
        height?: number;
        content_type?: string;
        file_name?: string;
        file_size?: number;
      };
    };

    if (!resultData.image?.url) {
      throw new Error("Background removal returned no image");
    }

    return NextResponse.json({
      ok: true,
      provider: "fal",
      model: BACKGROUND_REMOVE_MODEL,
      image: resultData.image,
      requestId: result.requestId,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("FAL_KEY")) {
      console.error("[fal remove-background] FAL_KEY missing");
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

    console.error("[fal remove-background] failed:", message);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_BACKGROUND_REMOVE_FAILED",
        message: "Failed to remove background. Please try again.",
      },
      { status: 500 }
    );
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
      const payload = buildRemoveBackgroundFormPayload(formData);
      const mockMode = isMockMode();
      const guard: PaidAiGuardInput = {
        provider: "fal",
        route: ROUTE_ID,
        estimatedCostUsd: ESTIMATED_BACKGROUND_REMOVE_COST_USD,
      };
      if (!mockMode) {
        assertPaidAiAllowed(guard);
      }
      const imageUrl = await resolveImageUrl(
        payload.imageUrl,
        payload.imageFile,
        mockMode,
        guard
      );
      return runRemoveBackground(imageUrl, payload.syncMode);
    } catch (error) {
      if (isPaidAiGuardError(error)) {
        return NextResponse.json(paidAiGuardResponse(error), {
          status: error.status,
        });
      }

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

  const parsed = removeBackgroundRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid background removal request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  if (!parsed.data.imageUrl) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "imageUrl is required for JSON requests",
      },
      { status: 400 }
    );
  }

  return runRemoveBackground(parsed.data.imageUrl, parsed.data.syncMode);
}
