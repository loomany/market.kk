import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { bodyTypePromptPhrase } from "@/lib/ai/modelBodyTypes";
import { isAdultModelAge, modelAgeAppearanceGuidance, modelAgePromptPhrase } from "@/lib/ai/modelAge";
import { lightingPromptPhrase } from "@/lib/ai/modelLighting";
import { MODEL_IDENTITY_LOCK_MAX } from "@/lib/ai/modelCustomParams";

export { MODEL_IDENTITY_LOCK_MAX };

const IDENTITY_LOCK_PREFIX =
  "IDENTITY LOCK — exact same woman in every catalog shot; do not change face, age, ethnicity, skin tone, hair, makeup, smile, body proportions, or styling:";

/**
 * Multi-angle / product-set follow-ups: nano-banana edit is unreliable (lingerie 422,
 * inconsistent). Use text-to-image with a strict identity block from step-1 settings.
 */
export function shouldPreferTextOnlyAngleFollowUp(
  isFollowUpAngle: boolean
): boolean {
  return isFollowUpAngle;
}

export function catalogExpressionLock(input: GenerateModelRequest): string {
  if (input.gender === "female" && isAdultModelAge(input.modelAge)) {
    return (
      "warm natural smile with bright white teeth, professional salon makeup, " +
      "salon-styled hair, manicured nails, direct friendly eye contact"
    );
  }
  if (input.gender === "male" && isAdultModelAge(input.modelAge)) {
    return "calm confident catalog expression, well-groomed hair, natural skin";
  }
  return "calm confident age-appropriate catalog expression";
}

function nationalityLock(input: GenerateModelRequest): string | null {
  const value = input.modelNationality?.trim();
  if (!value) return null;
  return `Nationality / ethnicity appearance (mandatory): ${value}.`;
}

function sceneStyleLock(input: GenerateModelRequest): string | null {
  const scene = input.customDescription?.trim();
  if (!scene) return null;
  return `Scene and styling from merchant (mandatory): ${scene}.`;
}

/**
 * English identity bible from studio model settings (screen 1) — reused on every
 * follow-up angle when products/angles > 1.
 */
export function buildStudioModelIdentityLockEn(
  input: GenerateModelRequest
): string {
  const parts = [
    IDENTITY_LOCK_PREFIX,
    `${modelAgePromptPhrase(input.modelAge)}.`,
    modelAgeAppearanceGuidance(input.modelAge),
    `Gender: ${input.gender} fashion model.`,
    nationalityLock(input),
    `Body type (mandatory): ${bodyTypePromptPhrase(input.bodyType, input.bodyTypeCustom)}.`,
    `Skin: natural warm catalog skin tone with subtle realistic texture — not plastic, not doll-like.`,
    `Hair and beauty (mandatory): ${catalogExpressionLock(input)}.`,
    "Hair color from hero reference is mandatory — exact same shade, length, and texture on every angle; never switch blonde/brunette between shots.",
    "Skin tone mandatory — same warm undertone on face, torso, back, and arms; no lighter patches or mismatched skin on back views.",
    `Lighting (mandatory): ${lightingPromptPhrase(input.lighting, input.lightingCustom)}.`,
    sceneStyleLock(input),
    "Do not generate a different person, different ethnicity, different age, different hair color, or closed-mouth neutral face.",
  ].filter(Boolean);

  const assembled = parts.join(" ");
  if (assembled.length <= MODEL_IDENTITY_LOCK_MAX) {
    return assembled;
  }
  return `${assembled.slice(0, MODEL_IDENTITY_LOCK_MAX - 1)}…`;
}

/**
 * Settings lock (step 1 UI) + optional Vision paragraph from hero image.
 */
export function mergeStudioAndVisionIdentityLock(
  input: GenerateModelRequest,
  visionSupplementEn?: string | null
): string {
  const settingsLock = buildStudioModelIdentityLockEn(input);
  const vision = visionSupplementEn?.trim();
  if (!vision) return settingsLock;

  const visionBlock = `Hero photo visual lock (mandatory match — especially exact hair color, skin undertone, and the same subtle smile): ${vision}`;
  const combined = `${settingsLock} ${visionBlock}`;
  if (combined.length <= MODEL_IDENTITY_LOCK_MAX) {
    return combined;
  }

  const visionBudget = Math.max(
    120,
    MODEL_IDENTITY_LOCK_MAX - settingsLock.length - 35
  );
  const trimmedVision =
    vision.length <= visionBudget
      ? vision
      : `${vision.slice(0, visionBudget - 1)}…`;
  const merged = `${settingsLock} Hero photo visual lock (mandatory match): ${trimmedVision}`;
  if (merged.length <= MODEL_IDENTITY_LOCK_MAX) return merged;
  return `${merged.slice(0, MODEL_IDENTITY_LOCK_MAX - 1)}…`;
}

export function appendModelIdentityLockToT2iPrompt(input: {
  basePrompt: string;
  identityLockEn: string;
  cameraAnglePrompt?: string;
}): string {
  const angle = input.cameraAnglePrompt?.trim();
  const backSkinGuard =
    angle && /\b(back|behind|rear|спин)\b/i.test(angle)
      ? "Uniform natural skin on back and arms, no patches or ghosting."
      : "";
  const tail = [
    input.identityLockEn,
    angle
      ? `Change ONLY pose and camera to: ${angle}. Keep the same person, hair color, skin tone, smile, and styling.`
      : "Change ONLY pose and camera. Keep the same person, hair color, skin tone, smile, and styling.",
    backSkinGuard,
    "Photorealistic commercial marketplace catalog, non-explicit.",
  ]
    .filter(Boolean)
    .join(" ");

  const combined = `${input.basePrompt.trim()} ${tail}`.trim();
  if (combined.length <= 3500) return combined;
  return `${combined.slice(0, 3499)}…`;
}
