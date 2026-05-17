import { NextResponse } from "next/server";
import {
  BACKGROUND_REMOVE_MODEL,
  getFalClientOrThrow,
} from "@/lib/ai/falClient";
import { removeBackgroundRequestSchema } from "@/lib/ai/backgroundRemovalSchemas";
import { MOCK_BACKGROUND_REMOVED_IMAGE } from "@/lib/ai/mockResults";

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

  const data = parsed.data;

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
    const fal = getFalClientOrThrow();
    const result = await fal.subscribe(BACKGROUND_REMOVE_MODEL, {
      input: {
        image_url: data.imageUrl,
        sync_mode: data.syncMode,
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

    console.error("[fal remove-background] failed:", error);
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
