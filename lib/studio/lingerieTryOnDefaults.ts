import type { FalModelResolution } from "@/lib/ai/modelOutputSizes";
import type {
  GarmentPhotoType,
  ModelGender,
  ModelGenerationSettings,
  QualityMode,
} from "@/components/studio/types";

export const LINGERIE_MODEL_GENDER = "female" as ModelGender;

export const LINGERIE_TRYON_DEFAULTS = {
  gender: LINGERIE_MODEL_GENDER,
  modelResolution: "2K" as FalModelResolution,
} as const;

/** Пол для сценария «Бельё / купальники». Кадр — только выбор пользователя. */
export function withLingerieModelDefaults(
  settings: ModelGenerationSettings
): ModelGenerationSettings {
  if (settings.categoryContext !== "lingerie") return settings;

  return {
    ...settings,
    gender: LINGERIE_MODEL_GENDER,
  };
}

export function isLingerieTryOnSettingsWeakened(
  garmentPhotoType: GarmentPhotoType,
  qualityMode: QualityMode
): boolean {
  if (qualityMode !== "quality") return true;
  /** Flat lay на карточке — «на человеке» часто даёт неверный крой низа */
  return garmentPhotoType === "model";
}
