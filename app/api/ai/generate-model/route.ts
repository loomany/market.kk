import { NextResponse } from "next/server";
import {
  getFalClientOrThrow,
  MODEL_GENERATION_MODEL,
} from "@/lib/ai/falClient";
import { generateModelRequestSchema } from "@/lib/ai/modelGenerationSchemas";
import { buildModelGenerationPrompt } from "@/lib/ai/modelPrompts";
import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";

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

  const parsed = generateModelRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid model generation request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const prompt = buildModelGenerationPrompt(data);
  const promptPreview = prompt.slice(0, 300);

  if (isMockMode()) {
    return NextResponse.json({
      ok: true,
      provider: "mock",
      model: "mock-model-generation",
      images: [{ url: MOCK_MODEL_IMAGE }],
      requestId: "mock-model-request",
      promptPreview,
    });
  }

  try {
    const fal = getFalClientOrThrow();
    const result = await fal.subscribe(MODEL_GENERATION_MODEL, {
      input: {
        prompt,
        num_images: data.numImages,
        aspect_ratio: data.aspectRatio,
        output_format: data.outputFormat,
        safety_tolerance: "4",
        resolution: data.resolution,
        limit_generations: true,
        ...(typeof data.seed === "number" ? { seed: data.seed } : {}),
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log(
            "[fal generate-model]",
            update.logs?.map((log) => log.message).join("\n")
          );
        }
      },
    });

    const resultData = result.data as {
      images?: { url: string; width?: number; height?: number }[];
      description?: string;
    };

    const images = resultData.images ?? [];

    return NextResponse.json({
      ok: true,
      provider: "fal",
      model: MODEL_GENERATION_MODEL,
      images,
      description: resultData.description,
      requestId: result.requestId,
      promptPreview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("FAL_KEY")) {
      console.error("[fal generate-model] FAL_KEY missing");
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

    console.error("[fal generate-model] failed:", error);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FAL_MODEL_GENERATION_FAILED",
        message: "Failed to generate AI model image. Please try again.",
      },
      { status: 500 }
    );
  }
}
