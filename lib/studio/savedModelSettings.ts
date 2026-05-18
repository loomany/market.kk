import {
  DEFAULT_MODEL_GENERATION_SETTINGS,
  MODEL_BODY_TYPE_IDS,
  type ModelBackground,
  type ModelCategoryContext,
  type ModelCrop,
  type ModelCustomAngle,
  type ModelGender,
  type ModelGenerationSettings,
  type ModelLighting,
  type ModelPose,
} from "@/components/studio/types";
import {
  coerceAnglePresetId,
  DEFAULT_MODEL_ANGLE_PRESETS,
  type ModelAnglePresetId,
} from "@/lib/ai/modelAngles";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import {
  FAL_MODEL_ASPECT_RATIOS,
  FAL_MODEL_RESOLUTIONS,
  type FalModelAspectRatio,
  type FalModelResolution,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import {
  clampModelAge,
  sanitizeModelSettingsForAge,
} from "@/lib/ai/modelAge";
import { MODEL_LIGHTING_PRESET_IDS } from "@/lib/ai/modelLighting";

export const SAVED_MODEL_SETTINGS_VERSION = 1 as const;

export type SavedModelSettingsSnapshot = {
  version: typeof SAVED_MODEL_SETTINGS_VERSION;
  generation: ModelGenerationSettings;
  outputSize?: Partial<ModelOutputSizeSelection>;
  modelDescription?: string;
};

export function buildSavedModelSnapshot(input: {
  generation: ModelGenerationSettings;
  outputSize?: Partial<ModelOutputSizeSelection>;
  modelDescription?: string;
}): Record<string, unknown> {
  const snapshot: SavedModelSettingsSnapshot = {
    version: SAVED_MODEL_SETTINGS_VERSION,
    generation: input.generation,
    ...(input.modelDescription?.trim()
      ? { modelDescription: input.modelDescription.trim() }
      : {}),
  };

  const aspectRatio = input.outputSize?.aspectRatio;
  const resolution = input.outputSize?.resolution;
  if (
    aspectRatio &&
    FAL_MODEL_ASPECT_RATIOS.includes(aspectRatio as FalModelAspectRatio) &&
    resolution &&
    FAL_MODEL_RESOLUTIONS.includes(resolution as FalModelResolution)
  ) {
    snapshot.outputSize = { aspectRatio, resolution };
  }

  return snapshot as unknown as Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function readAnglePresets(value: unknown): ModelAnglePresetId[] {
  if (!Array.isArray(value)) return [...DEFAULT_MODEL_ANGLE_PRESETS];
  const presets = value
    .map((item) =>
      typeof item === "string" ? coerceAnglePresetId(item) : undefined
    )
    .filter((item): item is ModelAnglePresetId => item !== undefined);
  return presets.length > 0 ? presets : [...DEFAULT_MODEL_ANGLE_PRESETS];
}

function readCustomAngles(value: unknown): ModelCustomAngle[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ModelCustomAngle | null => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const id = readString(record.id);
      const text = readString(record.text) ?? "";
      if (!id) return null;
      return {
        id,
        text,
        saved: record.saved === true,
      };
    })
    .filter((item): item is ModelCustomAngle => item !== null);
}

function coerceGenerationSettings(
  raw: Record<string, unknown>
): ModelGenerationSettings {
  const gender = readEnum(raw.gender, ["female", "male"] as const) ?? "female";
  const bodyType =
    readEnum(raw.bodyType, MODEL_BODY_TYPE_IDS) ?? "standard";
  const pose =
    readEnum(raw.pose, ["front", "slight-angle", MODEL_PARAM_CUSTOM] as const) ??
    "front";
  const crop =
    readEnum(raw.crop, ["full-body", "upper-body", MODEL_PARAM_CUSTOM] as const) ??
    "full-body";
  const background =
    readEnum(raw.background, ["white", "light-gray", "studio"] as const) ?? "white";
  const lighting =
    readEnum(raw.lighting, [...MODEL_LIGHTING_PRESET_IDS, MODEL_PARAM_CUSTOM]) ??
    "studio";
  const categoryContext =
    readEnum(raw.categoryContext, [
      "general",
      "clothing",
      "lingerie",
      "jewelry",
    ] as const) ?? "clothing";

  const modelAgeRaw =
    typeof raw.modelAge === "number"
      ? raw.modelAge
      : typeof raw.modelAge === "string"
        ? Number(raw.modelAge)
        : DEFAULT_MODEL_GENERATION_SETTINGS.modelAge;

  return sanitizeModelSettingsForAge({
    gender: gender as ModelGender,
    modelNationality: readString(raw.modelNationality) ?? "",
    anglePresets: readAnglePresets(raw.anglePresets),
    customAngles: readCustomAngles(raw.customAngles),
    bodyType,
    bodyTypeCustom: readString(raw.bodyTypeCustom) ?? "",
    modelAge: clampModelAge(
      Number.isFinite(modelAgeRaw)
        ? modelAgeRaw
        : DEFAULT_MODEL_GENERATION_SETTINGS.modelAge
    ),
    pose: pose as ModelPose,
    poseCustom: readString(raw.poseCustom) ?? "",
    crop: crop as ModelCrop,
    cropCustom: readString(raw.cropCustom) ?? "",
    background: background as ModelBackground,
    lighting: lighting as ModelLighting,
    lightingCustom: readString(raw.lightingCustom) ?? "",
    categoryContext: categoryContext as ModelCategoryContext,
  });
}

export function parseSavedModelSnapshot(
  raw?: Record<string, unknown>
): SavedModelSettingsSnapshot | null {
  if (!raw) return null;

  if (raw.version === SAVED_MODEL_SETTINGS_VERSION && isObject(raw.generation)) {
    const generation = coerceGenerationSettings(raw.generation);
    const aspectRatio = readEnum(
      isObject(raw.outputSize) ? raw.outputSize.aspectRatio : undefined,
      FAL_MODEL_ASPECT_RATIOS
    );
    const resolution = readEnum(
      isObject(raw.outputSize) ? raw.outputSize.resolution : undefined,
      FAL_MODEL_RESOLUTIONS
    );

    return {
      version: SAVED_MODEL_SETTINGS_VERSION,
      generation,
      ...(aspectRatio && resolution
        ? { outputSize: { aspectRatio, resolution } }
        : {}),
      ...(readString(raw.modelDescription)
        ? { modelDescription: readString(raw.modelDescription) }
        : {}),
    };
  }

  // Legacy: settings was a flat ModelGenerationSettings object.
  if (readEnum(raw.gender, ["female", "male"] as const)) {
    return {
      version: SAVED_MODEL_SETTINGS_VERSION,
      generation: coerceGenerationSettings(raw),
    };
  }

  return null;
}

export function applySavedModelSnapshotToState(snapshot: SavedModelSettingsSnapshot): {
  generation: ModelGenerationSettings;
  outputSize?: Partial<ModelOutputSizeSelection>;
  modelDescription: string;
} {
  return {
    generation: snapshot.generation,
    ...(snapshot.outputSize ? { outputSize: snapshot.outputSize } : {}),
    modelDescription: snapshot.modelDescription ?? "",
  };
}
