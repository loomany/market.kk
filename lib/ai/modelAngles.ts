import { MODEL_CUSTOM_TEXT_MAX } from "@/lib/ai/modelCustomParams";

/** Один ракурс за запуск (1 товар + 1 модель + 1 примерка). */
export const MAX_MODEL_ANGLES = 1;

/** Ракурсы съёмки (без «Все варианты»). */
export const MODEL_ANGLE_SHOT_PRESET_IDS = [
  "hero-full-front",
  "close-up-detail",
  "angle-three-quarter",
  "front-hands-side",
  "back-view",
  "seated-lifestyle",
] as const;

export type ModelAngleShotPresetId =
  (typeof MODEL_ANGLE_SHOT_PRESET_IDS)[number];

export const FULL_CARD_ANGLE_PRESET_ID = "full-card-set" as const;

export const MODEL_ANGLE_PRESET_IDS = [
  ...MODEL_ANGLE_SHOT_PRESET_IDS,
  FULL_CARD_ANGLE_PRESET_ID,
] as const;

export type ModelAnglePresetId = (typeof MODEL_ANGLE_PRESET_IDS)[number];

const LEGACY_ANGLE_PRESET_MAP: Record<string, ModelAnglePresetId> = {
  "seated-close-front": "seated-lifestyle",
  "standing-front-full": "hero-full-front",
  "three-quarter-front": "angle-three-quarter",
  "standing-front-hands": "front-hands-side",
  "back-view": "back-view",
  "slight-45": "angle-three-quarter",
};

export function coerceAnglePresetId(value: string): ModelAnglePresetId | undefined {
  if ((MODEL_ANGLE_PRESET_IDS as readonly string[]).includes(value)) {
    return value as ModelAnglePresetId;
  }
  return LEGACY_ANGLE_PRESET_MAP[value];
}

export type ModelCustomAngle = {
  id: string;
  text: string;
  saved: boolean;
};

export const MODEL_ANGLE_PRESETS: {
  id: ModelAnglePresetId;
  label: string;
  hint: string;
  prompt: string;
  isBundle?: boolean;
}[] = [
  {
    id: FULL_CARD_ANGLE_PRESET_ID,
    label: "Выбрать всё",
    hint: "Полный набор для карточки",
    prompt: "",
    isBundle: true,
  },
  {
    id: "hero-full-front",
    label: "Главное фото",
    hint: "Во весь рост, спереди",
    prompt:
      "editorial full-length hero shot facing camera, natural relaxed posture with subtle weight on one leg and soft knee bend, shoulders easy not squared, slight asymmetric hand placement (one hand on hip or resting on outer thigh), calm confident expression, premium DTC fashion catalog aesthetic, clean seamless studio background, full body head-to-toe in frame",
  },
  {
    id: "close-up-detail",
    label: "Крупный план",
    hint: "Верх и детали изделия",
    prompt:
      "editorial close shot from collarbone to upper thighs, torso slightly angled to show garment drape and fabric texture, relaxed shoulders and natural neckline, hands away from product details, soft directional studio light, premium ecommerce detail framing",
  },
  {
    id: "angle-three-quarter",
    label: "Полуоборот",
    hint: "Фото под углом",
    prompt:
      "three-quarter full or mid-length shot, body turned about 30–40 degrees with organic S-curve posture, chin gently toward camera, one hip shifted, arms in natural asymmetric relaxed position, modern editorial catalog energy, soft light studio background",
  },
  {
    id: "front-hands-side",
    label: "Спереди",
    hint: "Руки по бокам",
    prompt:
      "front-facing mid-full shot from head to mid-thigh, approachable editorial stance with personality, arms along body with soft elbow bend or one hand lightly on outer thigh, weight on back leg, relaxed confident expression, clean off-white studio background",
  },
  {
    id: "back-view",
    label: "Вид сзади",
    hint: "Спина и посадка сзади",
    prompt:
      "back or back three-quarter view, natural spine curve and relaxed shoulders, medium full framing showing garment back and fit, hair styled away from garment, subtle head turn if needed, editorial catalog not rigid parade-rest stance",
  },
  {
    id: "seated-lifestyle",
    label: "Сидя",
    hint: "Lifestyle-фото",
    prompt:
      "seated lifestyle editorial pose on minimal studio stool or block, relaxed asymmetric posture with knees angled naturally, torso slightly turned toward camera, calm confident expression, modern premium fashion catalog mood, garment clearly visible",
  },
];

export type ResolvedModelAngle = {
  key: string;
  label: string;
  prompt: string;
};

export type ModelAngleSelectionInput = {
  anglePresets: ModelAnglePresetId[];
  customAngles: ModelCustomAngle[];
};

function expandShotPresetIds(
  anglePresets: ModelAnglePresetId[]
): ModelAngleShotPresetId[] {
  if (anglePresets.includes(FULL_CARD_ANGLE_PRESET_ID)) {
    return [...MODEL_ANGLE_SHOT_PRESET_IDS];
  }
  return anglePresets.filter((id): id is ModelAngleShotPresetId =>
    (MODEL_ANGLE_SHOT_PRESET_IDS as readonly string[]).includes(id)
  );
}

export function resolveSelectedModelAngles(
  input: ModelAngleSelectionInput
): ResolvedModelAngle[] {
  const resolved: ResolvedModelAngle[] = [];
  const shotIds = expandShotPresetIds(input.anglePresets);

  for (const presetId of shotIds) {
    const preset = MODEL_ANGLE_PRESETS.find((item) => item.id === presetId);
    if (!preset || preset.isBundle) continue;
    resolved.push({
      key: `preset:${preset.id}`,
      label: preset.label,
      prompt: preset.prompt,
    });
  }

  for (const custom of input.customAngles) {
    if (!custom.saved) continue;
    const text = custom.text.trim();
    if (!text) continue;
    resolved.push({
      key: `custom:${custom.id}`,
      label: text.length > 48 ? `${text.slice(0, 45)}…` : text,
      prompt: `${text}, natural editorial camera angle and framing with relaxed believable body language, premium fashion catalog aesthetic`,
    });
  }

  return resolved.slice(0, MAX_MODEL_ANGLES);
}

export function countSelectedModelAngles(input: ModelAngleSelectionInput): number {
  const shotCount = expandShotPresetIds(input.anglePresets).length;
  const customCount = input.customAngles.filter(
    (item) => item.saved && item.text.trim().length > 0
  ).length;
  return Math.min(shotCount + customCount, MAX_MODEL_ANGLES);
}

export function normalizeAnglePresetSelection(
  previous: ModelAnglePresetId[],
  next: ModelAnglePresetId[]
): ModelAnglePresetId[] {
  const hadBundle = previous.includes(FULL_CARD_ANGLE_PRESET_ID);
  const hasBundle = next.includes(FULL_CARD_ANGLE_PRESET_ID);
  const shots = next.filter(
    (id): id is ModelAngleShotPresetId =>
      id !== FULL_CARD_ANGLE_PRESET_ID &&
      (MODEL_ANGLE_SHOT_PRESET_IDS as readonly string[]).includes(id)
  );

  if (hasBundle && !hadBundle) {
    return [...MODEL_ANGLE_SHOT_PRESET_IDS, FULL_CARD_ANGLE_PRESET_ID];
  }

  if (!hasBundle && hadBundle) {
    return shots;
  }

  const allShotsSelected = MODEL_ANGLE_SHOT_PRESET_IDS.every((id) =>
    shots.includes(id)
  );

  if (allShotsSelected) {
    return [...MODEL_ANGLE_SHOT_PRESET_IDS, FULL_CARD_ANGLE_PRESET_ID];
  }

  return shots;
}

export function validateModelAngles(
  input: ModelAngleSelectionInput
): string | null {
  const angles = resolveSelectedModelAngles(input);
  if (angles.length === 0) {
    return "Выберите ракурс, возьмите его с фото товара или сохраните свой вариант галочкой.";
  }
  if (countSelectedModelAngles(input) > MAX_MODEL_ANGLES) {
    return `Можно выбрать не больше ${MAX_MODEL_ANGLES} ракурсов.`;
  }
  for (const custom of input.customAngles) {
    if (custom.text.trim().length > MODEL_CUSTOM_TEXT_MAX) {
      return `Описание ракурса — не длиннее ${MODEL_CUSTOM_TEXT_MAX} символов.`;
    }
  }
  return null;
}

export function modelAnglesSummaryRu(
  input: ModelAngleSelectionInput
): string {
  const angles = resolveSelectedModelAngles(input);
  if (angles.length === 0) return "ракурсы не выбраны";
  const labels = angles.map((item) => item.label);
  if (input.anglePresets.includes(FULL_CARD_ANGLE_PRESET_ID)) {
    return `полный набор (${labels.length}): ${labels.join(", ")}`;
  }
  return labels.join("; ");
}

export function createEmptyCustomAngle(): ModelCustomAngle {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `angle-${Date.now()}`,
    text: "",
    saved: false,
  };
}

export const DEFAULT_MODEL_ANGLE_PRESETS: ModelAnglePresetId[] = [
  "hero-full-front",
];
