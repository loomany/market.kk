import "server-only";

import {
  assertPaidAiAllowed,
  isPaidAiGuardError,
} from "@/lib/ai/paidAiGuard";
import { MODEL_IDENTITY_LOCK_MAX } from "@/lib/ai/modelCustomParams";

const ROUTE_ID = "/api/ai/extract-model-identity";
const ESTIMATED_VISION_COST_USD = 0.008;
const VISION_SUPPLEMENT_MAX = 420;

type VisionCacheEntry = { text: string; at: number };
const visionCache = new Map<string, VisionCacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

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
  return "";
}

function clampVisionSupplement(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= VISION_SUPPLEMENT_MAX) return trimmed;
  return `${trimmed.slice(0, VISION_SUPPLEMENT_MAX - 1)}…`;
}

function parseVisionSupplement(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { identitySupplementEn?: unknown };
    if (
      typeof parsed.identitySupplementEn === "string" &&
      parsed.identitySupplementEn.trim()
    ) {
      return clampVisionSupplement(parsed.identitySupplementEn);
    }
  } catch {
    /* plain text fallback */
    if (raw.trim().length > 40) {
      return clampVisionSupplement(raw);
    }
  }
  return null;
}

async function requestVisionIdentity(
  heroImageUrl: string,
  model: string,
  merchantNationality?: string
): Promise<string | null> {
  const nationalityHint = merchantNationality?.trim()
    ? `Merchant-required nationality/appearance (must stay consistent): ${merchantNationality.trim()}.`
    : "No merchant nationality override.";

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
        "You describe a fashion catalog model's identity for image-generation consistency. Output only JSON.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Describe ONLY the model person's identity from this hero catalog photo — for locking the same face/body across new poses.",
                nationalityHint,
                rules: [
                  "Start identitySupplementEn with EXACT hair color phrase (e.g. dark brown wavy shoulder-length) — this is mandatory for all follow-up shots.",
                  "Describe skin undertone once (warm/cool/neutral) and require identical tone on back and arms.",
                  "Describe ONE consistent expression: subtle natural smile or calm closed-mouth — pick what is visible and lock it.",
                  "Do not guess blonde if hair is dark or vice versa.",
                ],
                include: [
                  "face shape, eye color/shape, eyebrows",
                  "skin tone and undertone",
                  "hair color, length, texture, parting",
                  "makeup style, lip color, smile/teeth",
                  "approximate apparent age",
                  "body silhouette (plus-size/curvy/slim)",
                  "neutral/base outfit colors if visible (not marketplace SKU lace detail)",
                ],
                exclude: [
                  "pose, camera angle, background, furniture, props",
                  "do not invent nationality if unclear — describe visible features only",
                ],
                output:
                  "identitySupplementEn: one dense English paragraph, 80-180 words; hair color and skin undertone in the first two sentences",
              }),
            },
            {
              type: "input_image",
              image_url: heroImageUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "model_identity_vision",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              identitySupplementEn: { type: "string" },
            },
            required: ["identitySupplementEn"],
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(
      `[${ROUTE_ID}] vision failed model=${model} status=${res.status}`,
      body.slice(0, 200)
    );
    return null;
  }

  const payload = await res.json();
  return parseVisionSupplement(extractResponseText(payload));
}

/**
 * Vision supplement from hero nano-banana image (English).
 * Cached per hero URL for product-set follow-ups.
 */
export async function extractModelIdentityVisionFromHeroUrl(input: {
  heroImageUrl: string;
  merchantNationality?: string;
  route?: string;
}): Promise<string | null> {
  const heroImageUrl = input.heroImageUrl.trim();
  if (!heroImageUrl) return null;

  if (process.env.AI_MOCK_MODE !== "0" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const cached = visionCache.get(heroImageUrl);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.text;
  }

  try {
    assertPaidAiAllowed({
      provider: "openai",
      route: input.route ?? ROUTE_ID,
      estimatedCostUsd: ESTIMATED_VISION_COST_USD,
    });
  } catch (error) {
    if (isPaidAiGuardError(error)) throw error;
    return null;
  }

  for (const model of visionModelCandidates()) {
    try {
      const text = await requestVisionIdentity(
        heroImageUrl,
        model,
        input.merchantNationality
      );
      if (text) {
        visionCache.set(heroImageUrl, { text, at: Date.now() });
        return text;
      }
    } catch (error) {
      console.warn(`[${ROUTE_ID}] vision error model=${model}:`, error);
    }
  }

  return null;
}

export function clearModelIdentityVisionCacheForTests(): void {
  visionCache.clear();
}
