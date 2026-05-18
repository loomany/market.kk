import "server-only";
import type { Locale } from "@/lib/i18n/locales";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
} from "@/lib/ai/paidAiGuard";
import {
  getPromptLanguageName,
  isEnglishPromptLocale,
  looksLikeEnglishPrompt,
} from "@/lib/ai/promptLocale";

const ESTIMATED_TRANSLATE_COST_USD = 0.005;

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as { generationPrompt?: string };
  } catch {
    return null;
  }
}

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

/**
 * Converts the user-visible prompt (site language) to English for Fal / image models.
 * Skips API call when locale is English or text already looks English.
 */
export async function translatePromptToEnglish(
  text: string,
  sourceLocale: Locale,
  route: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  if (
    isMockMode() ||
    isEnglishPromptLocale(sourceLocale) ||
    looksLikeEnglishPrompt(trimmed)
  ) {
    return trimmed;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn("[prompt-translate] OPENAI_API_KEY missing, using source text");
    return trimmed;
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route,
      estimatedCostUsd: ESTIMATED_TRANSLATE_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) throw error;
    throw error;
  }

  const model = process.env.OPENAI_PROMPT_MODEL ?? "gpt-5.5";
  const sourceLanguage = getPromptLanguageName(sourceLocale);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "Translate ecommerce image/video generation prompts to English. Preserve meaning exactly. Do not add, remove, or reinterpret product or model details. Return only JSON.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                sourceLanguage,
                prompt: trimmed,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "prompt_translate",
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
    console.error("[prompt-translate] OpenAI failed", res.status);
    return trimmed;
  }

  const response = await res.json();
  const parsed = safeJsonParse(extractOutputText(response));
  const translated = parsed?.generationPrompt?.trim();

  return translated || trimmed;
}
