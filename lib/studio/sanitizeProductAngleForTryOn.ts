import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import { MODEL_ANGLE_PRESETS } from "@/lib/ai/modelAngles";
import {
  MODEL_CAMERA_ANGLE_PROMPT_MAX,
  PRODUCT_POSE_DESCRIPTION_RU_MAX,
} from "@/lib/ai/modelCustomParams";
import {
  isUnsafeTryOnPosePhrase,
  type SourceModelOrientation,
} from "@/lib/ai/sourceModelOrientation";

/** Only for short vision-derived prompts — catalog presets are already try-on-safe. */
const VISION_TRY_ON_TAIL_EN =
  "Standing catalog pose, hands below shoulders, try-on safe, no props.";

function truncateCameraPrompt(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= MODEL_CAMERA_ANGLE_PROMPT_MAX) return trimmed;
  return `${trimmed.slice(0, MODEL_CAMERA_ANGLE_PROMPT_MAX - 1)}…`;
}

function truncateDescriptionRu(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= PRODUCT_POSE_DESCRIPTION_RU_MAX) return trimmed;
  return `${trimmed.slice(0, PRODUCT_POSE_DESCRIPTION_RU_MAX - 1)}…`;
}

export function orientationFromAngleText(text: string): SourceModelOrientation {
  const t = text.toLowerCase();
  if (/\b(back view|from behind|rear view|спиной|со спины|сзади)\b/i.test(t)) {
    return "back";
  }
  if (/\b(side view|profile|боком|сбоку)\b/i.test(t)) {
    return "side";
  }
  if (/\b(three[- ]?quarter|3\/4|полуоборот)\b/i.test(t)) {
    return "three-quarter";
  }
  return "front";
}

export function catalogPresetForOrientation(
  orientation: SourceModelOrientation
): (typeof MODEL_ANGLE_PRESETS)[number] | undefined {
  switch (orientation) {
    case "back":
      return MODEL_ANGLE_PRESETS.find((p) => p.id === "back-view");
    case "three-quarter":
      return MODEL_ANGLE_PRESETS.find((p) => p.id === "angle-three-quarter");
    case "side":
      return MODEL_ANGLE_PRESETS.find((p) => p.id === "front-hands-side");
    case "front":
    default:
      return MODEL_ANGLE_PRESETS.find((p) => p.id === "hero-full-front");
  }
}

/**
 * Vision may copy editorial poses (seated, hand on shoulder, props).
 * Keep merchant orientation (front/back/3/4) but swap to try-on-safe catalog prompts.
 */
export function sanitizeProductAngleForTryOn(
  angle: ResolvedModelAngle,
  index: number
): ResolvedModelAngle {
  const blob = [angle.label, angle.descriptionRu, angle.prompt]
    .filter(Boolean)
    .join(" ");
  const unsafe = isUnsafeTryOnPosePhrase(blob);
  const orientation = orientationFromAngleText(blob);
  const preset = catalogPresetForOrientation(orientation);

  if (!unsafe && angle.prompt.trim() && !preset) {
    return {
      key: angle.key || `product-set:${index}`,
      label: angle.label,
      descriptionRu: angle.descriptionRu
        ? truncateDescriptionRu(angle.descriptionRu)
        : undefined,
      prompt: truncateCameraPrompt(
        `${angle.prompt.trim()} ${VISION_TRY_ON_TAIL_EN}`
      ),
    };
  }

  const safe =
    preset ?? MODEL_ANGLE_PRESETS.find((p) => p.id === "hero-full-front")!;
  const label =
    unsafe && angle.label.trim() ? `${angle.label} (каталог)` : safe.label;

  const descriptionRu = unsafe
    ? angle.descriptionRu?.trim()
      ? truncateDescriptionRu(
          `${angle.descriptionRu.replace(/\s+/g, " ").trim()} Поза для примерки: стоя, руки не закрывают бельё.`
        )
      : truncateDescriptionRu(`Каталожная поза — ${safe.hint}.`)
    : angle.descriptionRu
      ? truncateDescriptionRu(angle.descriptionRu)
      : truncateDescriptionRu(`Каталожная поза — ${safe.hint}.`);

  return {
    key: `product-set-safe:${index}`,
    label,
    descriptionRu,
    prompt: truncateCameraPrompt(safe.prompt),
  };
}

export function sanitizeProductAnglesForTryOn(
  angles: ResolvedModelAngle[]
): ResolvedModelAngle[] {
  return angles.map((angle, index) => sanitizeProductAngleForTryOn(angle, index));
}
