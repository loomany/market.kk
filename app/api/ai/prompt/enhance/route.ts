import { NextResponse } from "next/server";
import { promptEnhanceRequestSchema } from "@/lib/ai/promptEnhanceSchemas";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
import {
  getPromptLanguageName,
  isEnglishPromptLocale,
} from "@/lib/ai/promptLocale";
import type { Locale } from "@/lib/i18n/locales";
import { sanitizeImageEnhancerOutputText } from "@/lib/studio/imageEnhancerOutputSanitizer";

export const runtime = "nodejs";

const ROUTE_ID = "/api/ai/prompt/enhance";
const ESTIMATED_PROMPT_ENHANCE_COST_USD = 0.01;

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

function buildMockEnhancedPrompt(input: {
  context: string;
  userPrompt: string;
  targetPlatform: string;
  language: Locale;
  lockedBasePrompt?: string;
}) {
  const base = input.userPrompt.trim();
  const fidelityEn =
    "Preserve the exact product identity: color, shape, pattern, texture, edges, fit, and materials. No text, no watermark, no logos, no fake claims.";
  const fidelityRu =
    "Сохранить точную идентичность товара: цвет, форму, принт, текстуру, края, посадку и материалы. Без текста, водяных знаков, логотипов и ложных обещаний.";

  const displayFidelity = isEnglishPromptLocale(input.language)
    ? fidelityEn
    : fidelityRu;

  if (input.context === "video") {
    const en = `${base}. Slow premium ecommerce motion, stable camera, gentle natural movement, product remains unchanged, ${fidelityEn}`;
    const ru = `${base}. Медленное премиальное движение для e-commerce, стабильная камера, мягкое натуральное движение, товар не меняется, ${fidelityRu}`;
    return isEnglishPromptLocale(input.language) ? en : ru;
  }

  if (input.context === "model-description") {
    const en = `${base}. Adult commercial catalog model, neutral pose, relaxed arms not covering the product area, clean studio lighting, non-explicit, not sexualized, ${fidelityEn}`;
    const ru = `${base}. Взрослая модель для коммерческого каталога, нейтральная поза, руки не закрывают зону одежды, чистый студийный свет, без откровенности, ${fidelityRu}`;
    return isEnglishPromptLocale(input.language) ? en : ru;
  }

  const en = `${base}. Clean premium marketplace composition, natural light, accurate product proportions, ${fidelityEn}`;
  const ru = `${base}. Чистая премиальная композиция для маркетплейса, естественный свет, точные пропорции товара, ${fidelityRu}`;
  return isEnglishPromptLocale(input.language) ? en : ru;
}

function buildMockGenerationPrompt(displayPrompt: string, language: Locale) {
  if (isEnglishPromptLocale(language)) return displayPrompt;
  return `${displayPrompt} (English generation draft: preserve product identity, commercial catalog, no text or watermark.)`;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as {
      enhancedPrompt?: string;
      generationPrompt?: string;
      negativePrompt?: string;
      safetyNotes?: string;
      suggestions?: string[];
    };
  } catch {
    return null;
  }
}

function buildOpenAiEnhancementRules(input: {
  context: string;
  displayLanguage: string;
  lockedBasePrompt?: string;
}): string[] {
  const common: string[] = [
    "Do not invent product details.",
    "For clothing model: adult only, non-explicit, commercial catalog style.",
    "For marketplace: no fake claims, no logos, no text, no watermark.",
  ];

  if (input.context === "video") {
    return [
      ...common,
      "For video: describe motion, camera work, duration, pacing, and product fidelity.",
      `enhancedPrompt: write ONLY in ${input.displayLanguage}. This is what the user reads and edits.`,
      "generationPrompt: same instructions in English for Fal image/video models. No extra details.",
      "negativePrompt: English only.",
      `safetyNotes and suggestions: ${input.displayLanguage} only.`,
    ];
  }

  const staticImageRules: string[] = [
    ...common,
    "This request is for a STATIC image only (photo edit or still catalog composition). generationPrompt must describe lighting, scene, materials, and product fidelity for a single still frame.",
    "FORBIDDEN in generationPrompt and enhancedPrompt: Reels, Instagram/TikTok short video, clip duration, seconds, fps, animation, camera movement, pans, zooms, dolly, tracking shots, push-in, or any motion-directed / video-format language.",
  ];

  if (input.context === "model-description" && input.lockedBasePrompt) {
    return [
      ...staticImageRules,
      "lockedBasePrompt is fixed UI parameters (age, body type, pose, crop, background). Do NOT rewrite or contradict it.",
      "Enhance ONLY userPrompt — the user's optional addition (location, lighting, mood).",
      `enhancedPrompt must contain ONLY the improved user addition in ${input.displayLanguage}, not the locked base.`,
      "generationPrompt: same instructions in English for Fal image models (still image only). No extra details.",
      "negativePrompt: English only.",
      `safetyNotes and suggestions: ${input.displayLanguage} only.`,
    ];
  }

  return [
    ...staticImageRules,
    `enhancedPrompt: write ONLY in ${input.displayLanguage}. This is what the user reads and edits.`,
    "generationPrompt: same instructions in English for Fal image models (still image only). No extra details.",
    "negativePrompt: English only.",
    `safetyNotes and suggestions: ${input.displayLanguage} only.`,
  ];
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = promptEnhanceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "VALIDATION_ERROR",
        message: "Invalid prompt enhance request",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const model = process.env.OPENAI_PROMPT_MODEL ?? "gpt-5.5";
  const displayLanguage = getPromptLanguageName(data.language);

  if (isMockMode()) {
    let enhancedPrompt = buildMockEnhancedPrompt(data);
    let generationPrompt = buildMockGenerationPrompt(
      enhancedPrompt,
      data.language
    );
    if (data.context === "scene") {
      enhancedPrompt = sanitizeImageEnhancerOutputText(enhancedPrompt);
      generationPrompt = sanitizeImageEnhancerOutputText(generationPrompt);
    }
    return NextResponse.json({
      ok: true,
      originalPrompt: data.userPrompt,
      enhancedPrompt,
      generationPrompt,
      negativePrompt:
        "wrong product, changed color, changed pattern, distorted shape, extra text, watermark, logo, low quality",
      safetyNotes: isEnglishPromptLocale(data.language)
        ? "Demo enhancement. Verify the prompt did not add new product details before real generation."
        : "Демо-усиление. Перед real generation проверьте, что промт не добавил новых деталей товара.",
      suggestions: isEnglishPromptLocale(data.language)
        ? [
            "Check product color and shape after generation.",
            "For marketplaces avoid text, logos, and claims on the image.",
          ]
        : [
            "Проверьте цвет и форму товара после генерации.",
            "Для маркетплейса избегайте текста, логотипов и обещаний на изображении.",
          ],
      provider: "mock",
      model: "mock-prompt-enhancer",
    });
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_PROMPT_ENHANCE_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    throw error;
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "OPENAI_API_KEY_MISSING",
        message: "OpenAI API key is not configured. Use demo mode or add OPENAI_API_KEY server-side.",
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions:
          "You improve prompts for ecommerce product photo and video generation. Do not invent product details. Preserve product identity. Return only compact JSON. enhancedPrompt must be in the user's display language. generationPrompt and negativePrompt must be English with the same meaning as enhancedPrompt. When context is 'video', motion and duration are allowed. When context is not 'video', output STATIC image prompts only — never Reels/short-video/duration/motion language.",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  context: data.context,
                  userPrompt: data.userPrompt,
                  lockedBasePrompt: data.lockedBasePrompt,
                  sourceImageDescription: data.sourceImageDescription,
                  targetPlatform: data.targetPlatform,
                  displayLanguage,
                  languageLocale: data.language,
                  rules: buildOpenAiEnhancementRules({
                    context: data.context,
                    displayLanguage,
                    lockedBasePrompt: data.lockedBasePrompt,
                  }),
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "prompt_enhance",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                enhancedPrompt: { type: "string" },
                generationPrompt: { type: "string" },
                negativePrompt: { type: "string" },
                safetyNotes: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "enhancedPrompt",
                "generationPrompt",
                "negativePrompt",
                "safetyNotes",
                "suggestions",
              ],
            },
          },
        },
        store: false,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "OPENAI_PROMPT_ENHANCE_FAILED",
          message: "Не удалось усилить промт. Попробуйте позже.",
        },
        { status: 502 }
      );
    }

    const response = await res.json();
    const parsedOutput = safeJsonParse(extractOutputText(response));

    if (!parsedOutput?.enhancedPrompt) {
      throw new Error("OpenAI response did not include enhancedPrompt");
    }

    const generationPromptRaw =
      parsedOutput.generationPrompt?.trim() || parsedOutput.enhancedPrompt;

    let enhancedPrompt = parsedOutput.enhancedPrompt;
    let generationPrompt = generationPromptRaw;
    if (data.context === "scene") {
      enhancedPrompt = sanitizeImageEnhancerOutputText(enhancedPrompt);
      generationPrompt = sanitizeImageEnhancerOutputText(generationPrompt);
    }

    return NextResponse.json({
      ok: true,
      originalPrompt: data.userPrompt,
      enhancedPrompt,
      generationPrompt,
      negativePrompt: parsedOutput.negativePrompt,
      safetyNotes: parsedOutput.safetyNotes,
      suggestions: parsedOutput.suggestions ?? [],
      provider: "openai",
      model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[openai prompt enhance] failed:", message);
    return NextResponse.json(
      {
        ok: false,
        errorCode: "OPENAI_PROMPT_ENHANCE_FAILED",
        message: "Не удалось усилить промт. Попробуйте позже.",
      },
      { status: 500 }
    );
  }
}
