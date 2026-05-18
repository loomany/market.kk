import { NextResponse } from "next/server";
import { promptEnhanceRequestSchema } from "@/lib/ai/promptEnhanceSchemas";

export const runtime = "nodejs";

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

function buildMockEnhancedPrompt(input: {
  context: string;
  userPrompt: string;
  targetPlatform: string;
}) {
  const base = input.userPrompt.trim();
  const fidelity =
    "Preserve the exact product identity: color, shape, pattern, texture, edges, fit, and materials. No text, no watermark, no logos, no fake claims.";

  if (input.context === "video") {
    return `${base}. Slow premium ecommerce motion, stable camera, gentle natural movement, product remains unchanged, ${fidelity}`;
  }

  if (input.context === "model-description") {
    return `${base}. Adult commercial catalog model, neutral pose, relaxed arms not covering the product area, clean studio lighting, non-explicit, not sexualized, ${fidelity}`;
  }

  return `${base}. Clean premium marketplace composition, natural light, accurate product proportions, ${fidelity}`;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as {
      enhancedPrompt?: string;
      negativePrompt?: string;
      safetyNotes?: string;
      suggestions?: string[];
    };
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

  if (isMockMode() || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      ok: true,
      originalPrompt: data.userPrompt,
      enhancedPrompt: buildMockEnhancedPrompt(data),
      negativePrompt:
        "wrong product, changed color, changed pattern, distorted shape, extra text, watermark, logo, low quality",
      safetyNotes:
        "Демо-усиление. Перед real generation проверьте, что prompt не добавил новых деталей товара.",
      suggestions: [
        "Проверьте цвет и форму товара после генерации.",
        "Для маркетплейса избегайте текста, логотипов и обещаний на изображении.",
      ],
      provider: "mock",
      model: "mock-prompt-enhancer",
    });
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
          "You improve prompts for ecommerce product photo/video generation. Do not invent product details. Preserve product identity. Return only compact JSON with enhancedPrompt, negativePrompt, safetyNotes, suggestions.",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  context: data.context,
                  userPrompt: data.userPrompt,
                  sourceImageDescription: data.sourceImageDescription,
                  targetPlatform: data.targetPlatform,
                  language: data.language,
                  rules: [
                    "Do not invent product details.",
                    "For clothing model: adult only, non-explicit, commercial catalog style.",
                    "For marketplace: no fake claims, no logos, no text, no watermark.",
                    "For video: describe motion, camera, duration, product fidelity.",
                    "Return Russian explanation and English generation prompt when useful.",
                  ],
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
                negativePrompt: { type: "string" },
                safetyNotes: { type: "string" },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "enhancedPrompt",
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

    return NextResponse.json({
      ok: true,
      originalPrompt: data.userPrompt,
      enhancedPrompt: parsedOutput.enhancedPrompt,
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
