import "server-only";
import {
  productDescriptionAnalysisSchema,
  type ProductDescriptionAnalysis,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import { applyProductDescriptionSafetyRules } from "@/lib/ai/productDescriptionPostProcess";
import type { ProductDescriptionAnalysisDebug } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { PRODUCT_POSE_DESCRIPTION_RU_MAX } from "@/lib/ai/modelCustomParams";
import {
  PRODUCT_DESCRIPTION_VISION_JSON_SCHEMA,
  PRODUCT_VISION_ANALYSIS_RULES,
} from "@/lib/ai/productDescriptionVisionSchema";

const ROUTE_ID = "/api/ai/analyze-product-description";

export type AnalyzeProductDescriptionInput = {
  file: File;
  categoryContextHint?: string;
  previousUserDescription?: string;
};

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

function normalizeDescriptionRu(raw: string): string {
  let text = raw.trim().replace(/\s+/g, " ");
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  if (!/[.!?…]$/.test(text)) {
    text = `${text}.`;
  }
  return text.slice(0, PRODUCT_POSE_DESCRIPTION_RU_MAX);
}

/** Reference mock for black/turquoise lingerie set on model */
export function mockLingerieSetOnModelAnalysis(): ProductDescriptionAnalysis {
  return {
    descriptionRu:
      "На фото комплект нижнего белья на модели: чёрный поддерживающий бюстгальтер с широкими бретелями и высокие трусы с бирюзово-зелёным кружевным цветочным узором. Важно сохранить чёрную основу комплекта, контрастное бирюзово-зелёное кружево, форму и глубину чашек бюстгальтера, широкие бретели, кружевную отделку по краям и высокую посадку трусов.",
    shortAiSummaryEn:
      "on-model lingerie set, bra + high-waist brief, black base, turquoise-green floral lace, wide bra straps, supportive full cups, preserve cup shape, preserve lace texture, preserve high-waist fit, do not treat as flat-lay",
    categoryContext: "lingerie",
    productCategory: "auto",
    sourcePresentation: "on-model",
    garmentPhotoType: "model",
    setType: "bra_brief_set",
    baseColor: "black",
    accentColors: ["turquoise", "green"],
    pattern: "floral lace",
    materials: ["lace"],
    bra: {
      present: true,
      style: "supportive bra",
      cupShape: "full cup",
      straps: "wide",
    },
    bottoms: {
      present: true,
      style: "brief",
      rise: "high-waist",
    },
    mustPreserve: [
      "black base color",
      "turquoise-green floral lace pattern",
      "lace texture",
      "wide bra straps",
      "supportive full cup shape",
      "high-waist brief fit",
      "lace edge detailing",
    ],
    fitNotes: [
      "preserve the depth and support of the bra cups",
      "preserve the high-waist silhouette of the briefs",
      "avoid flattening the bust shape",
      "avoid changing lace placement",
      "avoid turning the briefs into low-rise bottoms",
    ],
    warnings: [
      "source image shows garment worn on a human body",
      "do not classify as flat-lay",
      "necklace is visible but is not the product",
    ],
    confidence: 0.95,
    sourceModel: {
      bodyType: "plus-size curvy hourglass",
      sizeClass: "plus-size",
      pose: "front-facing standing pose, torso slightly angled, hands near hips",
      poseRu:
        "стоя анфас, корпус слегка в полуоборот, руки у бёдер",
      crop: "upper-thigh",
      cameraAngle: "straight-on catalog camera angle",
      handsPosition: "relaxed near hips/thighs",
      framing: "product-focused crop from upper body to upper thighs",
      bodyVisibility: "torso, waist, hips, bust visible; full face may be cropped",
      descriptionRu:
        "На фото plus-size модель, стоя, фронтально, кадр по пояс — до верхней части бёдер.",
      promptEn:
        "Create a new synthetic adult female model with similar plus-size curvy hourglass proportions, similar front-facing standing catalog pose, hands relaxed near hips, product-focused framing from upper body to upper thighs, straight-on camera angle. Do not copy the original person's face, identity, tattoos, skin marks, or recognizable features.",
    },
  };
}

function mockProductDescription(): ProductDescriptionAnalysis {
  return mockLingerieSetOnModelAnalysis();
}

function parseAnalysis(
  text: string
): { analysis: ProductDescriptionAnalysis; rawVisionAnswer: string } | null {
  try {
    const rawVisionAnswer = text;
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const descriptionRu = normalizeDescriptionRu(
      typeof parsed.descriptionRu === "string" ? parsed.descriptionRu : ""
    );
    if (descriptionRu.length < 20) return null;

    const sourceModelRaw = parsed.sourceModel;
    const sourceModel =
      sourceModelRaw === null || sourceModelRaw === undefined
        ? null
        : typeof sourceModelRaw === "object"
          ? sourceModelRaw
          : null;

    const result = productDescriptionAnalysisSchema.safeParse({
      ...parsed,
      descriptionRu,
      sourceModel,
      accentColors: Array.isArray(parsed.accentColors)
        ? parsed.accentColors.filter((v): v is string => typeof v === "string")
        : [],
      materials: Array.isArray(parsed.materials)
        ? parsed.materials.filter((v): v is string => typeof v === "string")
        : [],
      mustPreserve: Array.isArray(parsed.mustPreserve)
        ? parsed.mustPreserve.filter((v): v is string => typeof v === "string")
        : [],
      fitNotes: Array.isArray(parsed.fitNotes)
        ? parsed.fitNotes.filter((v): v is string => typeof v === "string")
        : [],
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.filter((v): v is string => typeof v === "string")
        : [],
    });
    if (!result.success) return null;
    return { analysis: result.data, rawVisionAnswer };
  } catch {
    return null;
  }
}

async function requestVisionAnalysis(
  file: File,
  model: string,
  hints?: { categoryContextHint?: string; previousUserDescription?: string }
): Promise<{
  analysis: ProductDescriptionAnalysis;
  rawVisionAnswer: string;
} | null> {
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
        "You are a senior e-commerce merchandiser for Russian marketplaces. Analyze ONLY the main garment product in the photo. Output valid JSON matching the schema exactly.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Return structured product analysis for virtual try-on and AI model generation.",
                hints: {
                  categoryContextHint: hints?.categoryContextHint,
                  previousUserDescription: hints?.previousUserDescription,
                },
                rules: [
                  "descriptionRu: 1-3 sentences Russian for merchant review (40-400 chars).",
                  "shortAiSummaryEn: dense English pipeline summary with preserve tags.",
                  ...PRODUCT_VISION_ANALYSIS_RULES,
                ],
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
          name: "product_description_analysis",
          strict: true,
          schema: PRODUCT_DESCRIPTION_VISION_JSON_SCHEMA,
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

  const rawText = extractResponseText(payload);
  const parsed = parseAnalysis(rawText);
  if (!parsed) return null;
  return parsed;
}

export async function analyzeProductDescriptionFile(
  input: AnalyzeProductDescriptionInput
): Promise<{
  analysis: ProductDescriptionAnalysis;
  usedVision: boolean;
  debug: ProductDescriptionAnalysisDebug;
}> {
  if (process.env.AI_MOCK_MODE !== "0" || !process.env.OPENAI_API_KEY) {
    return {
      ...finalizeAnalysis(mockProductDescription(), null),
      usedVision: false,
    };
  }

  for (const model of visionModelCandidates()) {
    try {
      const vision = await requestVisionAnalysis(input.file, model, {
        categoryContextHint: input.categoryContextHint,
        previousUserDescription: input.previousUserDescription,
      });
      if (vision) {
        return {
          ...finalizeAnalysis(vision.analysis, vision.rawVisionAnswer),
          usedVision: true,
        };
      }
    } catch (error) {
      console.warn(
        `[${ROUTE_ID}] vision error model=${model}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return {
    ...finalizeAnalysis(mockProductDescription(), null),
    usedVision: false,
  };
}

function finalizeAnalysis(
  analysis: ProductDescriptionAnalysis,
  rawVisionAnswer: string | null
): {
  analysis: ProductDescriptionAnalysis;
  debug: ProductDescriptionAnalysisDebug;
} {
  return applyProductDescriptionSafetyRules(analysis, rawVisionAnswer);
}
