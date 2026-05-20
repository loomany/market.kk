import "server-only";

import {
  GARMENT_SELECTION_REFINEMENT_JSON_SCHEMA,
  GARMENT_SELECTION_REFINEMENT_VISION_RULES,
  garmentSelectionRefinementSchema,
  type GarmentSelectionRefinement,
} from "@/lib/ai/refineGarmentSelectionSchemas";

const ROUTE_ID = "/api/ai/refine-product-mask";

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

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
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

function parseRefinement(text: string): GarmentSelectionRefinement | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    const result = garmentSelectionRefinementSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function requestVisionRefinement(
  photoFile: File,
  maskFile: File,
  model: string
): Promise<GarmentSelectionRefinement | null> {
  const [photoUrl, maskUrl] = await Promise.all([
    fileToDataUrl(photoFile),
    fileToDataUrl(maskFile),
  ]);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions:
        "You are an e-commerce photo segmentation assistant. The merchant draws a rough region on a product photo; you return JSON describing ONLY the garment fabric to keep for a marketplace card. Output valid JSON only.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Refine merchant garment selection for isolated product-card export.",
                rules: GARMENT_SELECTION_REFINEMENT_VISION_RULES,
              }),
            },
            { type: "input_image", image_url: photoUrl },
            {
              type: "input_text",
              text: "User rough mask (white = selected):",
            },
            { type: "input_image", image_url: maskUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "garment_selection_refinement",
          strict: true,
          schema: GARMENT_SELECTION_REFINEMENT_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(
      `[${ROUTE_ID}] OpenAI vision failed model=${model} status=${res.status}`,
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

  return parseRefinement(extractResponseText(payload));
}

export async function analyzeGarmentSelectionRefinement(input: {
  photoFile: File;
  maskFile: File;
}): Promise<{
  refinement: GarmentSelectionRefinement | null;
  model: string | null;
}> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { refinement: null, model: null };
  }

  for (const model of visionModelCandidates()) {
    const refinement = await requestVisionRefinement(
      input.photoFile,
      input.maskFile,
      model
    );
    if (refinement) {
      return { refinement, model };
    }
  }

  return { refinement: null, model: null };
}
