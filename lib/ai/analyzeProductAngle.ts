import "server-only";
import {
  MODEL_ANGLE_PRESETS,
  MODEL_ANGLE_SHOT_PRESET_IDS,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";
import {
  MODEL_CAMERA_ANGLE_PROMPT_MAX,
  PRODUCT_POSE_DESCRIPTION_RU_MAX,
} from "@/lib/ai/modelCustomParams";
import { buildProductPoseSummaryRu } from "@/lib/ai/productPoseSummary";
import type { ProductAngleAnalysisItem } from "@/lib/ai/productAngleAnalysisSchemas";

const ROUTE_ID = "/api/ai/analyze-product-angles";

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

function truncateCameraPrompt(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MODEL_CAMERA_ANGLE_PROMPT_MAX) return trimmed;
  return `${trimmed.slice(0, MODEL_CAMERA_ANGLE_PROMPT_MAX - 1)}…`;
}

/** Полное описание позы на русском для UI (без обрезки до 2–4 слов). */
function normalizePoseDescriptionRu(raw: string): string {
  let text = raw.trim().replace(/\s+/g, " ");

  text = text.replace(/\s+крупно\b/giu, ", крупный план");
  text = text.replace(/\bкрупно\b/giu, "крупный план");

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (!/[.!?…]$/.test(text)) {
    text = `${text}.`;
  }

  return text.slice(0, PRODUCT_POSE_DESCRIPTION_RU_MAX);
}

function mockAngleForIndex(index: number): ProductAngleAnalysisItem {
  const presetId =
    MODEL_ANGLE_SHOT_PRESET_IDS[index % MODEL_ANGLE_SHOT_PRESET_IDS.length]!;
  const preset = MODEL_ANGLE_PRESETS.find((item) => item.id === presetId);
  const summaryLabel = preset
    ? `${preset.label} — ${preset.hint}`
    : `Ракурс ${index + 1}`;
  const ruDescription = preset
    ? `На фото: ${preset.label.toLowerCase()} — ${preset.hint}. Такой же ракурс и положение тела подойдут для генерации модели.`
    : `Каталожный ракурс образца ${index + 1} для генерации модели.`;

  return {
    summaryLabel,
    descriptionRu: normalizePoseDescriptionRu(ruDescription),
    cameraPrompt: truncateCameraPrompt(
      preset?.prompt ??
        "front-facing catalog shot, natural editorial posture, professional studio framing, full body head-to-toe in frame"
    ),
  };
}

function toResolvedAngles(items: ProductAngleAnalysisItem[]): ResolvedModelAngle[] {
  return items.map((item, index) => ({
    key: `product-sample:${index}`,
    label: item.summaryLabel.trim(),
    descriptionRu: item.descriptionRu,
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
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const cameraPrompt =
      typeof parsed.cameraPrompt === "string" ? parsed.cameraPrompt.trim() : "";
    if (!cameraPrompt) return null;

    const legacyLabel =
      typeof parsed.label === "string" ? parsed.label.trim() : "";
    const descriptionRu = normalizePoseDescriptionRu(
      typeof parsed.descriptionRu === "string" && parsed.descriptionRu.trim()
        ? parsed.descriptionRu
        : legacyLabel
    );
    if (!descriptionRu) return null;

    const summaryLabel =
      typeof parsed.summaryLabel === "string" && parsed.summaryLabel.trim()
        ? parsed.summaryLabel.trim().slice(0, 80)
        : buildProductPoseSummaryRu(descriptionRu);

    return {
      summaryLabel,
      descriptionRu,
      cameraPrompt: truncateCameraPrompt(cameraPrompt),
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
        "You are a senior e-commerce photo director. Analyze catalog product photos (model or mannequin) and output pose/camera instructions for AI model generation. Output only valid JSON matching the schema.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Extract ONLY how the body is posed and how the camera is framed — to recreate a similar shot with a different adult fashion model (lingerie/try-on catalog).",
                rules: [
                  "Do NOT describe garment color, lace pattern, fabric, brand, SKU, background props, or mannequin material.",
                  "DO describe: standing vs seated, torso angle (front, back, three-quarter), leg position, arm/hand placement, chin/head tilt, distance (full-length vs close).",
                  "If subject is seated, cameraPrompt must say seated and describe knee/hip angles clearly.",
                  "If sample is full-body catalog, cameraPrompt MUST require full head-to-toe framing (entire head and feet visible).",
                  "cameraPrompt: one dense English sentence for an image model; natural editorial posture; hands not blocking torso.",
                  "summaryLabel: Short Russian UI caption (4-50 chars), catalog style — posture + framing only, e.g. «Сидя, крупный план по бёдра» or «Стоя, в полный рост, полуоборот». No full sentences starting with «Модель».",
                  "descriptionRu: Full Russian explanation for generation (1-2 sentences, 40-220 characters). Describe pose and framing for a photographer.",
                  "Russian only in summaryLabel and descriptionRu; cameraPrompt stays English.",
                  "summaryLabelExample: «Сидя, крупный план по бёдра»",
                  "descriptionRuExample: «Модель сидит, корпус слегка развёрнут к камере, одна рука у плеча; кадр от подбородка до верхней части бёдер.»",
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
              summaryLabel: { type: "string" },
              descriptionRu: { type: "string" },
              cameraPrompt: { type: "string" },
            },
            required: ["summaryLabel", "descriptionRu", "cameraPrompt"],
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

  for (const model of visionModelCandidates()) {
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
