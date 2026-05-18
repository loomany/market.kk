import "server-only";
import {
  getFalClientOrThrow,
  MODEL_GENERATION_EDIT_MODEL,
  MODEL_GENERATION_MODEL,
} from "@/lib/ai/falClient";
import {
  falErrorMessage,
  isFalContentOrValidationError,
  isFalTimeoutError,
  sleep,
  withTimeout,
} from "@/lib/ai/falErrorMessage";
import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import {
  buildModelAngleEditPrompt,
  buildModelGenerationPrompt,
} from "@/lib/ai/modelPrompts";
import { useNeutralBaseModelGeneration } from "@/lib/ai/modelIdentityPipeline";

const EDIT_TIMEOUT_MS = 90_000;
const GENERATE_TIMEOUT_MS = 120_000;

type FalClient = ReturnType<typeof getFalClientOrThrow>;
type FalSubscribeResult = Awaited<ReturnType<FalClient["subscribe"]>>;

function safetyToleranceFor(input: GenerateModelRequest): "4" | "6" {
  return input.categoryContext === "lingerie" ? "6" : "4";
}

function buildFalInput(
  prompt: string,
  data: GenerateModelRequest
): Record<string, unknown> {
  return {
    prompt,
    num_images: data.numImages,
    aspect_ratio: data.aspectRatio,
    output_format: data.outputFormat,
    safety_tolerance: safetyToleranceFor(data),
    resolution: data.resolution,
    limit_generations: true,
    ...(typeof data.seed === "number" ? { seed: data.seed } : {}),
  };
}

async function subscribeOnce(
  fal: FalClient,
  modelId: string,
  input: Record<string, unknown>,
  timeoutMs: number
): Promise<FalSubscribeResult> {
  return withTimeout(
    fal.subscribe(modelId, {
      input,
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log(
            "[fal generate-model]",
            update.logs?.map((log) => log.message).join("\n")
          );
        }
      },
    }),
    timeoutMs,
    modelId
  );
}

export type RunFalModelGenerationResult = {
  result: FalSubscribeResult;
  model: string;
  usedAngleEditFallback: boolean;
};

export async function runFalModelGeneration(input: {
  fal: FalClient;
  generationInput: GenerateModelRequest;
  referenceImageUrl?: string;
}): Promise<RunFalModelGenerationResult> {
  const { fal, generationInput, referenceImageUrl } = input;
  const hasReference = Boolean(referenceImageUrl?.trim());
  const useAngleEdit = hasReference;

  if (useAngleEdit) {
    const editPrompt = buildModelAngleEditPrompt(generationInput);
    const editInput = {
      ...buildFalInput(editPrompt, generationInput),
      image_urls: [referenceImageUrl!.trim()],
    };

    try {
      const result = await subscribeOnce(
        fal,
        MODEL_GENERATION_EDIT_MODEL,
        editInput,
        EDIT_TIMEOUT_MS
      );
      return {
        result,
        model: MODEL_GENERATION_EDIT_MODEL,
        usedAngleEditFallback: false,
      };
    } catch (error) {
      const message = falErrorMessage(error);
      console.error(
        "[fal generate-model] angle edit failed:",
        message.slice(0, 400)
      );

      if (
        !isFalContentOrValidationError(message) &&
        !isFalTimeoutError(message)
      ) {
        throw error;
      }

      console.warn(
        "[fal generate-model] edit failed — fallback to text-to-image for this angle:",
        message.slice(0, 120)
      );
      await sleep(800);
    }
  }

  const generatePrompt = buildModelGenerationPrompt(generationInput, {
    followUpAngle: hasReference,
    neutralBaseForTryOn: useNeutralBaseModelGeneration(generationInput),
  });
  const generateInput = buildFalInput(generatePrompt, generationInput);
  const result = await subscribeOnce(
    fal,
    MODEL_GENERATION_MODEL,
    generateInput,
    GENERATE_TIMEOUT_MS
  );

  return {
    result,
    model: MODEL_GENERATION_MODEL,
    usedAngleEditFallback: hasReference && !useAngleEdit,
  };
}
