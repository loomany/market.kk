import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import { MODEL_CAMERA_ANGLE_PROMPT_MAX } from "@/lib/ai/modelCustomParams";
import {
  orientationFromAngleText,
  catalogPresetForOrientation,
} from "@/lib/studio/sanitizeProductAngleForTryOn";

/** Десять разных каталожных поз для примерки белья — по одной на слот комплекта. */
export const LINGERIE_CATALOG_POSE_PRESETS = [
  {
    id: "lingerie-hero-front",
    labelRu: "Стоя спереди",
    poseEn:
      "standing front-facing full-length, weight on back leg, arms relaxed along body, hands on outer thighs below shoulders, calm warm smile, shoulders square to camera",
  },
  {
    id: "lingerie-hand-hip",
    labelRu: "Рука на бедре",
    poseEn:
      "standing front three-quarter, one hand resting lightly on outer hip, other arm relaxed along body, subtle contrapposto, friendly catalog smile, hands never above waist",
  },
  {
    id: "lingerie-soft-34",
    labelRu: "Мягкий полуоборот",
    poseEn:
      "standing three-quarter about 35 degrees, torso turned organically, chin toward camera, arms relaxed with hands below shoulder line, one hip slightly shifted",
  },
  {
    id: "lingerie-back-catalog",
    labelRu: "Со спины",
    poseEn:
      "standing back view medium-full, natural spine curve, arms along body, hair swept away from garment back, uniform natural skin on back and arms, no skin patches",
  },
  {
    id: "lingerie-back-34",
    labelRu: "Сзади 3/4",
    poseEn:
      "back three-quarter view, shoulders relaxed, slight head turn showing jawline, arms along thighs, garment back and side seams visible, even skin tone on back",
  },
  {
    id: "lingerie-side-profile",
    labelRu: "Профиль",
    poseEn:
      "clean side profile mid-full from head to mid-thigh, straight posture, arms along body, hands below shoulders, neutral confident expression",
  },
  {
    id: "lingerie-close-front",
    labelRu: "Крупно спереди",
    poseEn:
      "front close shot collarbone to upper thighs, shoulders square, hands on outer thighs, emphasize lace fit and drape, soft smile",
  },
  {
    id: "lingerie-walk-in-place",
    labelRu: "Шаг на месте",
    poseEn:
      "subtle walking-in-place energy, front-facing, one knee softly bent, arms natural swing frozen for catalog, dynamic but try-on safe",
  },
  {
    id: "lingerie-lean-forward",
    labelRu: "Лёгкий наклон",
    poseEn:
      "standing front with very slight forward lean from ankles, shoulders relaxed, hands clasped loosely in front below navel, approachable smile",
  },
  {
    id: "lingerie-symmetric-stance",
    labelRu: "Симметричная стойка",
    poseEn:
      "symmetric front stance feet hip-width, equal weight, both hands lightly touching outer thighs, direct eye contact, polished catalog smile",
  },
] as const;

function truncateCameraPrompt(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= MODEL_CAMERA_ANGLE_PROMPT_MAX) return trimmed;
  return `${trimmed.slice(0, MODEL_CAMERA_ANGLE_PROMPT_MAX - 1)}…`;
}

/**
 * Сохраняем ракурс с фото товара (front/back/3/4), но тело и жесты — из набора из 10 поз,
 * чтобы слоты комплекта не выглядели одинаково.
 */
export function applyLingeriePoseVariety(
  angle: ResolvedModelAngle,
  slotIndex: number
): ResolvedModelAngle {
  const variety =
    LINGERIE_CATALOG_POSE_PRESETS[
      slotIndex % LINGERIE_CATALOG_POSE_PRESETS.length
    ]!;
  const orientation = orientationFromAngleText(
    [angle.label, angle.descriptionRu, angle.prompt].filter(Boolean).join(" ")
  );
  const facing = catalogPresetForOrientation(orientation);
  const facingPrompt = facing?.prompt?.trim() ?? angle.prompt.trim();

  const prompt = truncateCameraPrompt(
    `${facingPrompt} ${variety.poseEn}. Standing catalog pose, hands below shoulders, try-on safe, no props.`
  );

  const label = angle.label.trim()
    ? `${angle.label} · ${variety.labelRu}`
    : variety.labelRu;

  return {
    key: angle.key || `lingerie-pose:${slotIndex}`,
    label,
    descriptionRu: angle.descriptionRu,
    prompt,
  };
}

export function applyLingeriePoseVarietyToAngles(
  angles: ResolvedModelAngle[]
): ResolvedModelAngle[] {
  return angles.map((angle, index) => applyLingeriePoseVariety(angle, index));
}
