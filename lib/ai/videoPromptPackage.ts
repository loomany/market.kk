import type { Locale } from "@/lib/i18n/localeConfig";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import { getPromptLanguageName } from "@/lib/ai/promptLocale";
import type { VideoMotionPreset } from "@/lib/ai/videoCatalog";

export type VideoPromptPackageInput = {
  userPrompt: string;
  soundPrompt?: string;
  negativePrompt?: string;
  useNegativePrompt: boolean;
  generateAudio: boolean;
  motionPreset?: VideoMotionPreset;
  targetPlatform?: string;
  locale: Locale;
  mockMode?: boolean;
};

export type VideoPromptPackageResult = {
  /** English prompt for Fal (motion preset applied later in inputMapper). */
  generationPrompt: string;
  /** English negative line for inputMapper (product rules added in catalog). */
  negativePromptForApi?: string;
  provider: "mock" | "openai";
};

const ESTIMATED_VIDEO_PROMPT_PACKAGE_COST_USD = 0.01;

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
    return JSON.parse(text) as {
      generationPrompt?: string;
      negativePrompt?: string;
    };
  } catch {
    return null;
  }
}

function mockVideoPromptPackage(
  input: VideoPromptPackageInput
): VideoPromptPackageResult {
  const main = input.userPrompt.trim();
  const parts: string[] = [main];

  if (input.generateAudio) {
    const sound = input.soundPrompt?.trim();
    if (sound) {
      parts.push(`Audio direction: ${sound}`);
    } else {
      parts.push("Include natural ambient sound suitable for the scene.");
    }
  }

  return {
    generationPrompt: parts.filter(Boolean).join(". "),
    negativePromptForApi: input.useNegativePrompt
      ? input.negativePrompt?.trim() || undefined
      : undefined,
    provider: "mock",
  };
}

/**
 * Merges main / sound / negative user inputs into API-ready English prompts.
 * Does not change the user's creative intent — only wording and structure for Fal.
 */
export async function prepareVideoPromptPackage(
  input: VideoPromptPackageInput
): Promise<VideoPromptPackageResult> {
  if (input.mockMode) {
    return mockVideoPromptPackage(input);
  }

  assertPaidAiAllowed({
    provider: "openai",
    route: "/api/ai/video/generate",
    estimatedCostUsd: ESTIMATED_VIDEO_PROMPT_PACKAGE_COST_USD,
  });

  if (!process.env.OPENAI_API_KEY) {
    return mockVideoPromptPackage(input);
  }

  const model = process.env.OPENAI_PROMPT_MODEL ?? "gpt-5.5";
  const displayLanguage = getPromptLanguageName(input.locale);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: [
        "You package ecommerce image-to-video prompts for Fal API.",
        "CRITICAL: Do NOT change the user's creative intent, scene, motion idea, or product story.",
        "You may only: translate to clear English, fix grammar, merge fields, and add minimal technical phrasing for video models.",
        "Do NOT invent new objects, locations, actions, or marketing claims.",
        "generationPrompt: single English string for the video model.",
        "When generateAudio is true, weave soundPrompt into generationPrompt as audio/speech/ambient direction (models have no separate audio field).",
        "When generateAudio is false, do not mention audio or sound.",
        "negativePrompt: English only, only when useNegativePrompt is true; list exclusions from user text without inventing.",
        "When useNegativePrompt is false, return empty string for negativePrompt.",
        "Preserve product fidelity: do not suggest changing garment color, shape, or pattern.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                userPrompt: input.userPrompt,
                soundPrompt: input.soundPrompt ?? "",
                negativePrompt: input.negativePrompt ?? "",
                useNegativePrompt: input.useNegativePrompt,
                generateAudio: input.generateAudio,
                motionPreset: input.motionPreset ?? "subtle-motion",
                targetPlatform: input.targetPlatform ?? "marketplace",
                displayLanguage,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "video_prompt_package",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              generationPrompt: { type: "string" },
              negativePrompt: { type: "string" },
            },
            required: ["generationPrompt", "negativePrompt"],
          },
        },
      },
      store: false,
    }),
  });

  if (!res.ok) {
    throw new Error("OPENAI_VIDEO_PROMPT_PACKAGE_FAILED");
  }

  const response = await res.json();
  const parsed = safeJsonParse(extractOutputText(response));

  if (!parsed?.generationPrompt?.trim()) {
    throw new Error("OPENAI_VIDEO_PROMPT_PACKAGE_EMPTY");
  }

  const negative =
    input.useNegativePrompt && parsed.negativePrompt?.trim()
      ? parsed.negativePrompt.trim()
      : undefined;

  return {
    generationPrompt: parsed.generationPrompt.trim(),
    negativePromptForApi: negative,
    provider: "openai",
  };
}
