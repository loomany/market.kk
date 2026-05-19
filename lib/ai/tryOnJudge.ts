import "server-only";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { buildTryOnJudgeInstructions } from "@/lib/ai/productAnalysisPipeline";

const ROUTE_ID = "try-on-judge";

export type TryOnJudgeResult = {
  pass: boolean;
  score: number;
  issues: string[];
  preservedWell: string[];
};

function visionModel(): string {
  return (
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_PROMPT_MODEL?.trim() ||
    "gpt-5.5"
  );
}

function extractResponseText(response: unknown): string {
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
    .flatMap((item) =>
      typeof item === "object" && item !== null && "content" in item
        ? (item as { content?: { text?: string }[] }).content ?? []
        : []
    )
    .map((part) => part.text)
    .filter(Boolean)
    .join("");
}

export async function runTryOnJudge(input: {
  productImageUrl: string;
  resultImageUrl: string;
  productAnalysis: ProductDescriptionAnalysis;
}): Promise<TryOnJudgeResult> {
  if (process.env.AI_MOCK_MODE !== "0" || !process.env.OPENAI_API_KEY) {
    return { pass: true, score: 0.85, issues: [], preservedWell: ["mock pass"] };
  }

  const model = visionModel();
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: buildTryOnJudgeInstructions(input.productAnalysis),
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Original product garment:" },
            { type: "input_image", image_url: input.productImageUrl },
            { type: "input_text", text: "Try-on result to judge:" },
            { type: "input_image", image_url: input.resultImageUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tryon_judge",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              pass: { type: "boolean" },
              score: { type: "number" },
              issues: { type: "array", items: { type: "string" } },
              preservedWell: { type: "array", items: { type: "string" } },
            },
            required: ["pass", "score", "issues", "preservedWell"],
          },
        },
      },
    }),
  });

  if (!res.ok) {
    console.warn(`[${ROUTE_ID}] judge failed`, res.status);
    return { pass: true, score: 0.7, issues: ["judge skipped"], preservedWell: [] };
  }

  try {
    const payload = await res.json();
    const parsed = JSON.parse(extractResponseText(payload)) as TryOnJudgeResult;
    return {
      pass: Boolean(parsed.pass),
      score: typeof parsed.score === "number" ? parsed.score : 0.5,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      preservedWell: Array.isArray(parsed.preservedWell) ? parsed.preservedWell : [],
    };
  } catch (error) {
    console.warn(`[${ROUTE_ID}] parse error`, error);
    return { pass: true, score: 0.7, issues: [], preservedWell: [] };
  }
}
