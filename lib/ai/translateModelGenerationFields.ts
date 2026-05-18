import "server-only";

import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import { isEnglishPromptLocale } from "@/lib/ai/promptLocale";
import { translatePromptToEnglish } from "@/lib/ai/promptTranslate";

const TEXT_FIELDS = [
  "customDescription",
  "modelNationality",
  "bodyTypeCustom",
  "poseCustom",
  "cropCustom",
  "lightingCustom",
  "cameraAnglePrompt",
] as const satisfies readonly (keyof GenerateModelRequest)[];

/** English text for Fal angle-edit and deterministic template prompts. */
export async function translateModelGenerationTextFields(
  data: GenerateModelRequest,
  promptLocale: PromptLocale,
  route: string
): Promise<GenerateModelRequest> {
  if (isEnglishPromptLocale(promptLocale)) {
    return data;
  }

  let generationInput = data;

  for (const field of TEXT_FIELDS) {
    const value = data[field]?.trim();
    if (!value) continue;

    generationInput = {
      ...generationInput,
      [field]: await translatePromptToEnglish(value, promptLocale, route),
    };
  }

  return generationInput;
}
