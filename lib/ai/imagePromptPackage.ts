import type { Locale } from "@/lib/i18n/localeConfig";
import type { ImageEditorId } from "@/lib/ai/imageEnhanceSchemas";
import {
  assertPaidAiAllowed,
} from "@/lib/ai/paidAiGuard";
import { getPromptLanguageName } from "@/lib/ai/promptLocale";

export type ImagePromptPackageInput = {
  userPrompt: string;
  negativePrompt?: string;
  useNegativePrompt: boolean;
  preserveProduct: boolean;
  selectedEditor: ImageEditorId;
  locale: Locale;
  mockMode?: boolean;
  /** User pasted a ready-made AI prompt — skip OpenAI, only optional negative merge. */
  skipOpenAiPackage?: boolean;
};

export type ImagePromptPackageResult = {
  /** English intent for downstream prompt builders (Nano / Kontext). */
  generationPrompt: string;
  provider: "mock" | "openai" | "passthrough";
};

const ESTIMATED_IMAGE_PROMPT_PACKAGE_COST_USD = 0.01;

function extractOutputText(response: unknown) {
  if (
    typeof response === "object" &&
    response !== null &&
    "output_text" in response &&
    typeof (response as { output_text?: unknown }).output_text === "string"
  ) {
    return (response as { output_text: string }).output_text;
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => (content as { text?: unknown }).text)
    .filter((text): text is string => typeof text === "string")
    .join("\n");
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as { generationPrompt?: string };
  } catch {
    return null;
  }
}

function mergeNegativeIntoPrompt(
  main: string,
  negative: string | undefined,
  useNegative: boolean
): string {
  const base = main.trim();
  if (!useNegative) return base;
  const neg = negative?.trim();
  if (!neg) return base;
  if (!base) return `Avoid: ${neg}`;
  return `${base} Avoid: ${neg}`;
}

function passthroughPackage(
  input: ImagePromptPackageInput
): ImagePromptPackageResult {
  return {
    generationPrompt: mergeNegativeIntoPrompt(
      input.userPrompt,
      input.negativePrompt,
      input.useNegativePrompt
    ),
    provider: "passthrough",
  };
}

function mockImagePromptPackage(
  input: ImagePromptPackageInput
): ImagePromptPackageResult {
  const main = input.userPrompt.trim() || "Improve realism and lighting.";
  return {
    generationPrompt: mergeNegativeIntoPrompt(
      main,
      input.negativePrompt,
      input.useNegativePrompt
    ),
    provider: "mock",
  };
}

/**
 * Packages user image-edit intent into English for Fal builders.
 * Fal image models have no negative_prompt field — exclusions are woven into generationPrompt.
 */
export async function prepareImagePromptPackage(
  input: ImagePromptPackageInput
): Promise<ImagePromptPackageResult> {
  if (input.skipOpenAiPackage) {
    return passthroughPackage(input);
  }

  if (input.mockMode) {
    return mockImagePromptPackage(input);
  }

  assertPaidAiAllowed({
    provider: "openai",
    route: "/api/ai/image/enhance",
    estimatedCostUsd: ESTIMATED_IMAGE_PROMPT_PACKAGE_COST_USD,
  });

  if (!process.env.OPENAI_API_KEY) {
    return mockImagePromptPackage(input);
  }

  const model = process.env.OPENAI_PROMPT_MODEL ?? "gpt-5.5";
  const displayLanguage = getPromptLanguageName(input.locale);
  const editorLabel =
    input.selectedEditor === "flux-kontext-pro"
      ? "FLUX Kontext (scene/context edit)"
      : "Nano Banana Pro (realism/lighting edit)";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: [
        "You package ecommerce image-edit prompts for Fal (static photo only, never video).",
        "CRITICAL: Do NOT change the user's creative intent, scene idea, or product story.",
        "You may only: translate to clear English, fix grammar, merge fields, and add minimal technical phrasing.",
        "Do NOT invent new objects, locations, or marketing claims.",
        "generationPrompt: single English string for the image model.",
        "When useNegativePrompt is true, append exclusions as a final 'Avoid: ...' clause in generationPrompt (no separate API field).",
        "When useNegativePrompt is false, do not add Avoid clauses unless the user asked for exclusions in userPrompt.",
        "Never mention motion, video, Reels, or duration.",
        "Preserve product fidelity when preserveProduct is true.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                userPrompt: input.userPrompt,
                negativePrompt: input.negativePrompt ?? "",
                useNegativePrompt: input.useNegativePrompt,
                preserveProduct: input.preserveProduct,
                selectedEditor: editorLabel,
                displayLanguage,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "image_prompt_package",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              generationPrompt: { type: "string" },
            },
            required: ["generationPrompt"],
          },
        },
      },
      store: false,
    }),
  });

  if (!res.ok) {
    throw new Error("OPENAI_IMAGE_PROMPT_PACKAGE_FAILED");
  }

  const response = await res.json();
  const parsed = safeJsonParse(extractOutputText(response));

  if (!parsed?.generationPrompt?.trim()) {
    throw new Error("OPENAI_IMAGE_PROMPT_PACKAGE_EMPTY");
  }

  return {
    generationPrompt: parsed.generationPrompt.trim(),
    provider: "openai",
  };
}
