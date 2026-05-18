import "server-only";
import {
  MODEL_ANGLE_PRESETS,
  MODEL_ANGLE_SHOT_PRESET_IDS,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";
import { MODEL_CAMERA_ANGLE_PROMPT_MAX } from "@/lib/ai/modelCustomParams";
import type { ProductAngleAnalysisItem } from "@/lib/ai/productAngleAnalysisSchemas";

const ROUTE_ID = "/api/ai/analyze-product-angles";

const VISION_MODEL_CANDIDATES = [
  process.env.OPENAI_VISION_MODEL,
  process.env.OPENAI_PROMPT_MODEL,
  "gpt-4.1",
  "gpt-4o",
].filter((value): value is string => Boolean(value?.trim()));

function truncateCameraPrompt(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MODEL_CAMERA_ANGLE_PROMPT_MAX) return trimmed;
  return `${trimmed.slice(0, MODEL_CAMERA_ANGLE_PROMPT_MAX - 1)}…`;
}

function mockAngleForIndex(index: number): ProductAngleAnalysisItem {
  const presetId =
    MODEL_ANGLE_SHOT_PRESET_IDS[index % MODEL_ANGLE_SHOT_PRESET_IDS.length]!;
  const preset = MODEL_ANGLE_PRESETS.find((item) => item.id === presetId);
  return {
    label: preset?.label ?? `Образец ${index + 1}`,
    cameraPrompt: truncateCameraPrompt(
      preset?.prompt ??
        "front-facing catalog shot, natural editorial posture, professional studio framing, full body head-to-toe in frame"
    ),
  };
}

function toResolvedAngles(items: ProductAngleAnalysisItem[]): ResolvedModelAngle[] {
  return items.map((item, index) => ({
    key: `product-sample:${index}`,
    label: item.label,
    prompt: item.cameraPrompt,
  }));
}

export function mockProductAnglesFromCount(count: number): ResolvedModelAngle[] {
  const items = Array.from({ length: count }, (_, index) =>
    mockAngleForIndex(index)
  );
  return toResolvedAngles(items);
}

async function imageFileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
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
        ? (item as { content?: { text?: string }[] }).content ?? []
        : []
    )
    .map((part) => part.text)
    .filter(Boolean)
    .join("");
}

function parseAngleItem(text: string): ProductAngleAnalysisItem | null {
  try {
    const parsed = JSON.parse(text) as ProductAngleAnalysisItem;
    if (!parsed.label?.trim() || !parsed.cameraPrompt?.trim()) return null;
    return {
      label: parsed.label.trim().slice(0, 80),
      cameraPrompt: truncateCameraPrompt(parsed.cameraPrompt),
    };
  } catch {
    return null;
  }
}

async function requestVisionAngle(
  file: File,
  index: number,
  model: string
): Promise<ProductAngleAnalysisItem | null> {
  const imageUrl = await imageFileToDataUrl(file);

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
        "You analyze factory/catalog product photos for an AI fashion studio. The photo may show a mannequin or model wearing the garment. Output only valid JSON.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Describe camera angle and pose only for recreating this shot with a different adult fashion model in underwear catalog style.",
                rules: [
                  "Do NOT describe garment color, lace, brand, or mannequin.",
                  "Describe body orientation (front, back, three-quarter), pose, hand position, seated vs standing.",
                  "If the sample is a catalog full-body shot, cameraPrompt must require full head-to-toe framing with entire head and feet visible — never torso-only or headless crop.",
                  "Write cameraPrompt in English for an image generation model.",
                  "Write label in Russian, short (2-4 words) for UI.",
                ],
                sampleIndex: index + 1,
              }),
            },
            {
              type: "input_image",
              image_url: imageUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "product_angle",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              cameraPrompt: { type: "string" },
            },
            required: ["label", "cameraPrompt"],
          },
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

  return parseAngleItem(extractResponseText(payload));
}

async function analyzeOneProductImage(
  file: File,
  index: number
): Promise<{ item: ProductAngleAnalysisItem; usedVision: boolean }> {
  if (process.env.AI_MOCK_MODE !== "0" || !process.env.OPENAI_API_KEY) {
    return { item: mockAngleForIndex(index), usedVision: false };
  }

  for (const model of VISION_MODEL_CANDIDATES) {
    try {
      const item = await requestVisionAngle(file, index, model);
      if (item) return { item, usedVision: true };
    } catch (error) {
      console.warn(
        `[${ROUTE_ID}] vision error model=${model} sample=${index + 1}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return { item: mockAngleForIndex(index), usedVision: false };
}

export async function analyzeProductAngleFiles(
  files: File[]
): Promise<{ angles: ResolvedModelAngle[]; usedPresetFallback: boolean }> {
  const items: ProductAngleAnalysisItem[] = [];
  let usedPresetFallback = false;

  for (let index = 0; index < files.length; index++) {
    try {
      const { item, usedVision } = await analyzeOneProductImage(
        files[index]!,
        index
      );
      if (!usedVision) usedPresetFallback = true;
      items.push(item);
    } catch (error) {
      console.error(
        `[${ROUTE_ID}] sample ${index + 1} failed:`,
        error instanceof Error ? error.message : error
      );
      items.push(mockAngleForIndex(index));
      usedPresetFallback = true;
    }
  }

  return {
    angles: toResolvedAngles(items),
    usedPresetFallback,
  };
}
