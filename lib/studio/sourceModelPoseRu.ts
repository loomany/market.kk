import type { ProductSourceModel } from "@/lib/ai/productDescriptionAnalysisSchemas";

const CYRILLIC = /[а-яё]/i;

/** Phrase replacements (longer patterns first). */
const POSE_EN_TO_RU: [RegExp, string][] = [
  [
    /seated relaxed pose with torso angled slightly to camera/gi,
    "сидя в расслабленной позе, корпус слегка повёрнут к камере",
  ],
  [
    /front-facing standing pose,?\s*torso slightly angled,?\s*hands near hips/gi,
    "стоя анфас, корпус слегка в полуоборот, руки у бёдер",
  ],
  [
    /front-facing standing pose,?\s*torso slightly angled/gi,
    "стоя анфас, корпус слегка в полуоборот",
  ],
  [/front-facing standing pose/gi, "стоя анфас"],
  [/standing pose,?\s*torso slightly angled/gi, "стоя, корпус слегка в полуоборот"],
  [/seated relaxed pose/gi, "сидя в расслабленной позе"],
  [/relaxed standing catalog pose/gi, "стоя в расслабленной позе для фото товара"],
  [/torso angled slightly to camera/gi, "корпус слегка повёрнут к камере"],
  [/torso slightly angled/gi, "корпус слегка в полуоборот"],
  [/torso slightly turned toward camera/gi, "корпус слегка повёрнут к камере"],
  [/hands near hips/gi, "руки у бёдер"],
  [/hands relaxed near hips/gi, "руки расслабленно у бёдер"],
  [/hands on hips/gi, "руки на бёдрах"],
  [/three-quarter turn/gi, "полуоборот"],
  [/slight three-quarter/gi, "лёгкий полуоборот"],
  [/front-facing/gi, "анфас"],
  [/back-facing/gi, "со спины"],
  [/profile view/gi, "в профиль"],
  [/seated/gi, "сидя"],
  [/standing/gi, "стоя"],
  [/relaxed pose/gi, "расслабленная поза"],
  [/catalog pose/gi, "поза для фото товара"],
  [/slightly angled/gi, "слегка в полуоборот"],
  [/angled to camera/gi, "повёрнут к камере"],
  [/with torso/gi, "корпус"],
];

function isMostlyRussian(text: string): boolean {
  if (!CYRILLIC.test(text)) return false;
  return !/\b[a-z]{3,}\b/i.test(text);
}

/** English pose → short Russian phrase for merchant UI. */
export function translateSourceModelPoseEnToRu(poseEn: string): string | null {
  const raw = poseEn.trim();
  if (!raw) return null;
  if (isMostlyRussian(raw)) return raw.slice(0, 120);

  let text = raw;
  for (const [pattern, replacement] of POSE_EN_TO_RU) {
    text = text.replace(pattern, replacement);
  }

  text = text
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();

  if (!text || !isMostlyRussian(text)) return null;
  return text.slice(0, 120);
}

export function resolveSourceModelPoseRu(
  sourceModel: ProductSourceModel
): string | null {
  const poseRu = sourceModel.poseRu?.trim();
  if (poseRu) return poseRu.slice(0, 120);

  const descRu = sourceModel.descriptionRu?.trim();
  if (descRu && isMostlyRussian(descRu)) return descRu.slice(0, 120);

  const poseEn = sourceModel.pose?.trim();
  if (!poseEn) return null;
  if (isMostlyRussian(poseEn)) return poseEn.slice(0, 120);

  return translateSourceModelPoseEnToRu(poseEn);
}
