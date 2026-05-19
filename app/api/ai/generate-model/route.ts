import { NextResponse } from "next/server";

import { getFalClientOrThrow } from "@/lib/ai/falClient";

import { generateModelRequestSchema } from "@/lib/ai/modelGenerationSchemas";

import { composeModelGenerationPrompt } from "@/lib/ai/composeModelGenerationPrompt";
import { buildModelAngleEditPrompt } from "@/lib/ai/modelPrompts";

import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";

import { defaultLocale } from "@/lib/i18n/localeConfig";

import { translateModelGenerationTextFields } from "@/lib/ai/translateModelGenerationFields";

import {

  falErrorMessage,

  isFalContentOrValidationError,

  isFalTimeoutError,

} from "@/lib/ai/falErrorMessage";

import { shouldUseNeutralBaseModelGeneration } from "@/lib/ai/modelIdentityPipeline";
import { runFalModelGeneration } from "@/lib/ai/runFalModelGeneration";

import {

  isPaidAiGuardError,

  paidAiGuardResponse,

} from "@/lib/ai/paidAiGuard";



export const runtime = "nodejs";



const ROUTE_ID = "/api/ai/generate-model";

const ESTIMATED_MODEL_GENERATION_COST_USD = 0.15;



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

  const promptLocale = data.promptLocale ?? defaultLocale;



  const referenceImageUrl = data.referenceImageUrl?.trim();
  const useAngleEdit = Boolean(referenceImageUrl);

  let generationInput = data;

  if (useAngleEdit) {
    try {
      generationInput = await translateModelGenerationTextFields(
        data,
        promptLocale,
        ROUTE_ID
      );
    } catch (error) {
      if (isPaidAiGuardError(error)) {
        return NextResponse.json(paidAiGuardResponse(error), {
          status: error.status,
        });
      }
      throw error;
    }
  }

  const neutralBaseForTryOn = shouldUseNeutralBaseModelGeneration(generationInput);

  let prompt: string;
  let promptComposer: "openai" | "template" = "template";
  let openAiPromptModel: string | undefined;
  let generationPromptForFal: string | undefined;

  if (useAngleEdit) {
    prompt = buildModelAngleEditPrompt(generationInput);
  } else {
    try {
      const composed = await composeModelGenerationPrompt({
        request: generationInput,
        promptLocale,
        productPoseDescriptionRu: data.productPoseDescriptionRu,
        neutralBaseForTryOn,
      });
      prompt = composed.prompt;
      promptComposer = composed.source;
      openAiPromptModel = composed.promptModel;
      generationPromptForFal = composed.prompt;
    } catch (error) {
      if (isPaidAiGuardError(error)) {
        return NextResponse.json(paidAiGuardResponse(error), {
          status: error.status,
        });
      }
      throw error;
    }
  }

  const promptPreview = prompt.slice(0, 300);



  if (isMockMode()) {

    return NextResponse.json({

      ok: true,

      provider: "mock",

      model: useAngleEdit ? "mock-model-angle-edit" : "mock-model-generation",

      images: [{ url: MOCK_MODEL_IMAGE }],

      requestId: "mock-model-request",

      promptPreview,
      promptComposer,
    });

  }



  try {

    const fal = getFalClientOrThrow({

      provider: "fal",

      route: ROUTE_ID,

      estimatedCostUsd: ESTIMATED_MODEL_GENERATION_COST_USD,

    });



    const { result, model, usedAngleEditFallback } = await runFalModelGeneration({

      fal,

      generationInput,

      referenceImageUrl,

      generationPrompt: generationPromptForFal,

    });



    const resultData = result.data as {

      images?: { url: string; width?: number; height?: number }[];

      description?: string;

    };



    const images = resultData.images ?? [];



    return NextResponse.json({

      ok: true,

      provider: "fal",

      model,

      images,

      description: resultData.description,

      requestId: result.requestId,

      promptPreview,

      promptComposer,

      openAiPromptModel,

      usedAngleEditFallback,

      identityPipeline: neutralBaseForTryOn ? "neutral-base-tryon" : "direct",

    });

  } catch (error) {

    if (isPaidAiGuardError(error)) {

      return NextResponse.json(paidAiGuardResponse(error), {

        status: error.status,

      });

    }



    const message = falErrorMessage(error);



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



    const errorCode = isFalTimeoutError(message)

      ? "FAL_MODEL_GENERATION_TIMEOUT"

      : isFalContentOrValidationError(message)

        ? "FAL_MODEL_CONTENT_BLOCKED"

        : "FAL_MODEL_GENERATION_FAILED";



    console.error("[fal generate-model] failed:", message);

    return NextResponse.json(

      {

        ok: false,

        errorCode,

        message:

          errorCode === "FAL_MODEL_GENERATION_TIMEOUT"

            ? "Generation took too long. Try again or fewer angles."

            : errorCode === "FAL_MODEL_CONTENT_BLOCKED"

              ? "Fal blocked this angle (content filter). Try another angle or settings."

              : useAngleEdit

                ? "Failed to generate this camera angle. Please try again."

                : "Failed to generate AI model image. Please try again.",

        detail: message.slice(0, 500),

      },

      { status: errorCode === "FAL_MODEL_CONTENT_BLOCKED" ? 422 : 500 }

    );

  }

}


