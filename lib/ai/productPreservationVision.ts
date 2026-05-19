import "server-only";

import {
  PRODUCT_PRESERVATION_VISION_JSON_SCHEMA,
  PRODUCT_PRESERVATION_VISION_RULES,
  productPreservationAnalysisSchema,
  type ProductPreservationAnalysis,
} from "@/lib/ai/productPreservationSchemas";

const ROUTE_ID = "/api/ai/image/preservation-analyze";

function visionModelCandidates(): string[] {
  const raw = [
    process.env.OPENAI_VISION_MODEL,
    process.env.OPENAI_PROMPT_MODEL,
    "gpt-5.5",
    "gpt-4.1",
    "gpt-4o",
  ].filter((value): value is string => Boolean(value?.trim()));
  return [...new Set(raw)];
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
        ? ((item as { content?: { text?: string }[] }).content ?? [])
        : []
    )
    .map((part) => part.text)
    .filter(Boolean)
    .join("");
}

function safeParse(text: string): ProductPreservationAnalysis | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const normalized = {
      primaryObject:
        typeof parsed.primaryObject === "string" ? parsed.primaryObject : "",
      objectType:
        typeof parsed.objectType === "string" ? parsed.objectType : "unknown",
      shortDescription:
        typeof parsed.shortDescription === "string"
          ? parsed.shortDescription
          : "",
      visibleDetails: Array.isArray(parsed.visibleDetails)
        ? parsed.visibleDetails.filter((v): v is string => typeof v === "string")
        : [],
      colors: Array.isArray(parsed.colors)
        ? parsed.colors.filter((v): v is string => typeof v === "string")
        : [],
      materials: Array.isArray(parsed.materials)
        ? parsed.materials.filter((v): v is string => typeof v === "string")
        : [],
      shapeSilhouette:
        typeof parsed.shapeSilhouette === "string"
          ? parsed.shapeSilhouette
          : "",
      patternOrTexture:
        typeof parsed.patternOrTexture === "string"
          ? parsed.patternOrTexture
          : "",
      edgesAndConstruction: Array.isArray(parsed.edgesAndConstruction)
        ? parsed.edgesAndConstruction.filter(
            (v): v is string => typeof v === "string"
          )
        : [],
      mustPreserve: Array.isArray(parsed.mustPreserve)
        ? parsed.mustPreserve.filter((v): v is string => typeof v === "string")
        : [],
      mustNotChange: Array.isArray(parsed.mustNotChange)
        ? parsed.mustNotChange.filter((v): v is string => typeof v === "string")
        : [],
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    };
    const result = productPreservationAnalysisSchema.safeParse(normalized);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function callOpenAi(input: {
  imageUrl: string;
  userPromptHint?: string;
  model: string;
}): Promise<ProductPreservationAnalysis | null> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      store: false,
      instructions:
        "You are an e-commerce vision analyst. Look at the image and describe ONLY the main visible product/object that must be preserved during AI image editing. Do not assume it is clothing. Return STRICT JSON only.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Return a strict product preservation JSON for downstream image-edit prompts (Nano Banana / FLUX Kontext).",
                hints: {
                  userPromptHint: input.userPromptHint?.slice(0, 500) ?? "",
                },
                rules: PRODUCT_PRESERVATION_VISION_RULES,
              }),
            },
            {
              type: "input_image",
              image_url: input.imageUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "product_preservation_analysis",
          strict: true,
          schema: PRODUCT_PRESERVATION_VISION_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(
      `[${ROUTE_ID}] OpenAI vision failed model=${input.model} status=${res.status}`,
      body.slice(0, 200)
    );
    return null;
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    return null;
  }
  const rawText = extractResponseText(payload);
  return safeParse(rawText);
}

/**
 * Generic mock used in demo/dev so the post-processing UI can show a
 * preservation block without burning OpenAI tokens. The mock intentionally
 * stays object-agnostic — we do NOT pretend Vision saw lingerie or any
 * specific category here.
 */
export function mockProductPreservationAnalysis(): ProductPreservationAnalysis {
  return {
    primaryObject: "main visible product",
    objectType: "product",
    shortDescription:
      "Main commercial product visible in the source photo, demo-mode preservation snapshot.",
    visibleDetails: [
      "overall silhouette",
      "primary surface texture",
      "main visible color",
    ],
    colors: [],
    materials: [],
    shapeSilhouette: "as shown in the source photo",
    patternOrTexture: "as shown in the source photo",
    edgesAndConstruction: ["visible edges", "visible seams or joints"],
    mustPreserve: [
      "exact product silhouette",
      "exact product proportions",
      "all visible decorative or construction details",
      "exact placement within the frame",
    ],
    mustNotChange: [
      "do not replace the product with a different item",
      "do not change the dominant product color or pattern",
    ],
    confidence: 0.7,
    notes: "Demo mock — Vision was not called.",
  };
}

export async function analyzeProductPreservationFromImageUrl(input: {
  imageUrl: string;
  userPromptHint?: string;
}): Promise<{
  analysis: ProductPreservationAnalysis;
  usedVision: boolean;
  model: string;
}> {
  for (const model of visionModelCandidates()) {
    try {
      const vision = await callOpenAi({
        imageUrl: input.imageUrl,
        userPromptHint: input.userPromptHint,
        model,
      });
      if (vision) {
        return { analysis: vision, usedVision: true, model };
      }
    } catch (error) {
      console.warn(
        `[${ROUTE_ID}] vision error model=${model}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return {
    analysis: mockProductPreservationAnalysis(),
    usedVision: false,
    model: "mock-product-preservation",
  };
}
