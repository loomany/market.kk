import "server-only";

import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import { buildModelGenerationPrompt } from "@/lib/ai/modelPrompts";
import {
  getPromptLanguageName,
  isEnglishPromptLocale,
} from "@/lib/ai/promptLocale";
import { translateModelGenerationTextFields } from "@/lib/ai/translateModelGenerationFields";
import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
} from "@/lib/ai/paidAiGuard";
import { isFullBodyCrop } from "@/lib/ai/modelFraming";
import { isAdultModelAge } from "@/lib/ai/modelAge";
import {
  lingerieFullBodyFootwearGuidance,
  shouldApplyLingerieFullBodyHeels,
} from "@/lib/ai/lingerieFullBodyFootwear";
import {
  lingerieBottomCutGuidance,
  lingerieModelPoseGuidance,
  MODEL_GENERATION_NO_GARMENT_COPY_RULE,
} from "@/lib/ai/modelIdentityPipeline";
import {
  SOURCE_MODEL_GENERATION_RULE,
  SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE,
} from "@/lib/ai/sourceModelPromptRules";

const ROUTE_ID = "/api/ai/generate-model";
const ESTIMATED_COMPOSE_COST_USD = 0.012;
const GENERATION_PROMPT_MAX = 3500;
const GENERATION_PROMPT_MIN = 120;

export type ComposeModelGenerationPromptInput = {
  request: GenerateModelRequest;
  /** UI locale — user text may be Russian; GPT translates when composing */
  promptLocale?: PromptLocale;
  productPoseDescriptionRu?: string;
  neutralBaseForTryOn?: boolean;
  followUpAngle?: boolean;
};

export type ComposeModelGenerationPromptResult = {
  prompt: string;
  source: "openai" | "template";
  promptModel?: string;
};

function isMockMode() {
  return process.env.AI_MOCK_MODE !== "0";
}

function isLlmComposerEnabled() {
  if (process.env.COMPOSE_MODEL_PROMPT_WITH_LLM === "0") return false;
  return Boolean(process.env.OPENAI_API_KEY?.trim());
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

function normalizeGenerationPrompt(text: string): string | null {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length < GENERATION_PROMPT_MIN) return null;
  if (trimmed.length <= GENERATION_PROMPT_MAX) return trimmed;
  return `${trimmed.slice(0, GENERATION_PROMPT_MAX - 1)}…`;
}

function buildStructuredSettings(request: GenerateModelRequest) {
  return {
    gender: request.gender,
    modelNationality: request.modelNationality,
    bodyType: request.bodyType,
    bodyTypeCustom: request.bodyTypeCustom,
    modelAge: request.modelAge,
    pose: request.pose,
    poseCustom: request.poseCustom,
    crop: request.crop,
    cropCustom: request.cropCustom,
    background: request.background,
    lighting: request.lighting,
    lightingCustom: request.lightingCustom,
    categoryContext: request.categoryContext,
    aspectRatio: request.aspectRatio,
    resolution: request.resolution,
    customDescription: request.customDescription,
    cameraAnglePrompt: request.cameraAnglePrompt,
  };
}

function hardRulesFor(
  request: GenerateModelRequest,
  options?: { neutralBaseForTryOn?: boolean }
): string[] {
  const rules = [
    "Output ONE English paragraph for Fal nano-banana-pro text-to-image — no markdown, no bullet lists.",
    "End with a concise 'Do not generate:' negative list (watermark, text, logo, bad anatomy, extra limbs, blurry).",
    "Commercial e-commerce catalog only — photorealistic, not cartoon.",
    "Never invent product lace, colors, or garment details the user did not specify.",
    MODEL_GENERATION_NO_GARMENT_COPY_RULE,
    "No text, watermark, or logo on the image.",
    "Hands must not cover torso, chest, waist, hips, or garment areas needed for virtual try-on.",
  ];

  if (isFullBodyCrop(request)) {
    rules.push(
      "Mandatory full head-to-toe framing: entire head, face, hair, and feet visible — never portrait-only or cropped forehead/feet."
    );
  } else if (request.crop === "upper-thigh") {
    rules.push(
      "Mandatory lingerie catalog framing: full head and face visible, entire bra and brief in frame, crop ends around upper-mid thigh — not full-body, not waist-only, never crop bra, briefs, forehead, or chin."
    );
  } else if (request.crop === "upper-body") {
    rules.push(
      "Mandatory waist-up / torso-to-upper-thigh framing: full head, full face, forehead, hair, shoulders, torso, waist and hips visible — never crop eyes, forehead, top of head, chin, hands, waist, hips, or garment areas."
    );
  }

  const neutralBase = options?.neutralBaseForTryOn ?? false;

  if (request.shortAiSummaryEn?.trim()) {
    rules.push(
      neutralBase
        ? `Try-on framing context only (do not draw garment): ${request.shortAiSummaryEn.trim()}`
        : `Product analysis summary (high priority): ${request.shortAiSummaryEn.trim()}`
    );
  }

  if (!neutralBase && request.productDescriptionRu?.trim()) {
    rules.push(
      `Merchant product description (highest priority): ${request.productDescriptionRu.trim()}`
    );
  }

  if (request.productSetType && request.productSetType !== "unknown") {
    rules.push(`Product set type: ${request.productSetType}.`);
  }

  if (request.sourceModelPromptEn?.trim()) {
    rules.push(SOURCE_MODEL_GENERATION_RULE);
    rules.push(`Source body/pose reference: ${request.sourceModelPromptEn.trim()}`);
    if (options?.neutralBaseForTryOn && request.categoryContext === "lingerie") {
      rules.push(SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE);
    }
  } else if (request.productSourcePresentation === "on-model") {
    rules.push(
      "Source product photo shows garment worn on a body — generate model suitable for try-on transfer."
    );
  }

  if (request.cameraAnglePrompt?.trim()) {
    rules.push(
      `Honor camera/pose instruction: ${request.cameraAnglePrompt.trim()}`
    );
  }

  if (shouldApplyLingerieFullBodyHeels(request)) {
    rules.push(lingerieFullBodyFootwearGuidance());
  }

  if (request.categoryContext === "lingerie") {
    rules.push("Adult 18+ only, non-explicit, editorial lingerie/swim catalog styling.");
    if (options?.neutralBaseForTryOn) {
      rules.push(
        "Plain seamless neutral bra and brief base for try-on — no lace, no floral pattern, no turquoise or green accents on the base model."
      );
      rules.push(MODEL_GENERATION_NO_GARMENT_COPY_RULE);
    } else {
      rules.push(
        "One cohesive lingerie or swimwear set in a single color and design for catalog consistency."
      );
      rules.push(lingerieBottomCutGuidance());
      rules.push(lingerieModelPoseGuidance());
    }
  }

  if (!isAdultModelAge(request.modelAge)) {
    rules.push(
      "Age-appropriate fully clothed styling only — no swimwear, lingerie, or sexualized poses."
    );
  }

  if (
    request.bodyType === "plus-size" ||
    request.bodyType === "size-2xl" ||
    request.bodyType === "size-xl" ||
    request.bodyType === "curvy"
  ) {
    rules.push(
      "Body type is mandatory: visibly plus-size/curvy — not slim straight-size runway proportions."
    );
  }

  if (request.gender === "female" && isAdultModelAge(request.modelAge)) {
    rules.push(
      "Adult female premium glamorous catalog look: full makeup, salon hair, glossy lips, shaped brows, manicured nails, confident sensual but non-explicit pose, luxury campaign styling — not plain, boring, matronly, or shapeless."
    );
  }

  if (!neutralBase && request.productMustPreserve?.length) {
    rules.push(
      `Must preserve for garment transfer: ${request.productMustPreserve.join("; ")}.`
    );
  }

  if (!neutralBase && request.productFitNotes?.length) {
    rules.push(`Fit notes: ${request.productFitNotes.join("; ")}.`);
  }

  return rules;
}

function templatePromptFromRequest(
  request: GenerateModelRequest,
  input: ComposeModelGenerationPromptInput
): string {
  return buildModelGenerationPrompt(request, {
    followUpAngle: input.followUpAngle,
    neutralBaseForTryOn: input.neutralBaseForTryOn,
  });
}

/** Deterministic English prompt — translates user text first when locale is not English. */
async function templateFallback(
  input: ComposeModelGenerationPromptInput
): Promise<ComposeModelGenerationPromptResult> {
  const locale = input.promptLocale ?? "ru";
  const request = isEnglishPromptLocale(locale)
    ? input.request
    : await translateModelGenerationTextFields(
        input.request,
        locale,
        ROUTE_ID
      );

  return {
    prompt: templatePromptFromRequest(request, input),
    source: "template",
  };
}

/**
 * Compose the Fal image prompt with GPT 5.5 (OPENAI_PROMPT_MODEL), falling back to
 * the deterministic server template when LLM is disabled or fails.
 */
export async function composeModelGenerationPrompt(
  input: ComposeModelGenerationPromptInput
): Promise<ComposeModelGenerationPromptResult> {
  if (isMockMode() || !isLlmComposerEnabled()) {
    return templateFallback(input);
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route: ROUTE_ID,
      estimatedCostUsd: ESTIMATED_COMPOSE_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      throw error;
    }
    console.warn("[compose-model-prompt] paid guard error, using template:", error);
    return templateFallback(input);
  }

  const model = process.env.OPENAI_PROMPT_MODEL ?? "gpt-5.5";
  const templateBaseline = templatePromptFromRequest(input.request, input);
  const request = input.request;
  const displayLanguage = getPromptLanguageName(input.promptLocale ?? "ru");

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: [
          "You are an expert prompt engineer for photorealistic fashion catalog image models (Fal nano-banana-pro).",
          "Write a single dense English generation prompt that faithfully implements ALL structured settings and hard rules.",
          "You may reorganize and enrich wording for clarity and visual quality, but you must NOT contradict mandatory body type, age, crop/framing, category, or pose instructions.",
          "Treat templateBaseline as a quality reference — improve flow and specificity; do not drop mandatory safety or framing constraints.",
          "User text in settings may be in any language (see promptLocale) — translate faithfully into English inside generationPrompt; do not drop or invent details.",
          "If productDescriptionRu is provided, treat it as the highest-priority garment/product facts (type, colors, presentation) — translate faithfully into English inside generationPrompt.",
          "If productPoseDescriptionRu is provided, translate its meaning into precise English camera/pose language inside the prompt (secondary to productDescriptionRu).",
          "If customDescription is set, weave it as high-priority atmosphere/lighting/backdrop direction.",
          "Always end with 'Do not generate:' followed by comma-separated negatives.",
        ].join(" "),
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  targetImageModel: "fal-ai/nano-banana-pro",
                  promptLocale: input.promptLocale ?? "ru",
                  displayLanguage,
                  settings: buildStructuredSettings(request),
                  productDescriptionRu:
                    input.request.productDescriptionRu?.trim() || undefined,
                  shortAiSummaryEn:
                    input.request.shortAiSummaryEn?.trim() || undefined,
                  productSetType: input.request.productSetType,
                  productSourcePresentation:
                    input.request.productSourcePresentation,
                  productPoseDescriptionRu:
                    input.productPoseDescriptionRu?.trim() || undefined,
                  followUpAngle: Boolean(input.followUpAngle),
                  neutralBaseForTryOn: Boolean(input.neutralBaseForTryOn),
                  hardRules: hardRulesFor(request, {
                    neutralBaseForTryOn: input.neutralBaseForTryOn,
                  }),
                  templateBaseline,
                }),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "model_generation_prompt",
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
      const errText = await res.text().catch(() => "");
      console.warn(
        "[compose-model-prompt] OpenAI HTTP",
        res.status,
        errText.slice(0, 200)
      );
      return templateFallback(input);
    }

    const response = await res.json();
    const parsed = safeJsonParse(extractOutputText(response));
    const normalized = normalizeGenerationPrompt(
      parsed?.generationPrompt ?? ""
    );

    if (!normalized) {
      console.warn("[compose-model-prompt] empty or short LLM output, using template");
      return templateFallback(input);
    }

    return {
      prompt: normalized,
      source: "openai",
      promptModel: model,
    };
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn("[compose-model-prompt] failed, using template:", message);
    return templateFallback(input);
  }
}
