import { MODEL_BODY_TYPES, type ModelGenerationSettings } from "@/components/studio/types";
import { isAdultModelAge } from "@/lib/ai/modelAge";
import { modelAnglesSummaryRu } from "@/lib/ai/modelAngles";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import {
  formatModelOutputSizeLabel,
  isModelOutputSizeComplete,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";

const GENDER_LABELS: Record<ModelGenerationSettings["gender"], string> = {
  female: "женская модель",
  male: "мужская модель",
};

const CROP_LABELS: Record<ModelGenerationSettings["crop"], string> = {
  "full-body": "в полный рост",
  "upper-body": "по пояс",
  [MODEL_PARAM_CUSTOM]: "свой вариант",
};

const CONTEXT_LABELS: Record<
  ModelGenerationSettings["categoryContext"],
  string
> = {
  clothing: "одежда",
  lingerie: "бельё / купальники",
  jewelry: "украшения",
  general: "универсально",
};

function bodyTypeSummary(settings: ModelGenerationSettings): string {
  if (settings.bodyType === MODEL_PARAM_CUSTOM) {
    return settings.bodyTypeCustom.trim() || "свой вариант (уточните)";
  }
  const item = MODEL_BODY_TYPES.find((entry) => entry.id === settings.bodyType);
  return item?.label.toLowerCase() ?? settings.bodyType;
}

function cropSummary(settings: ModelGenerationSettings): string {
  if (settings.crop === MODEL_PARAM_CUSTOM && settings.cropCustom.trim()) {
    return settings.cropCustom.trim();
  }
  return CROP_LABELS[settings.crop];
}

function ageSummary(age: number): string {
  if (isAdultModelAge(age)) {
    return `возраст ${age} лет`;
  }
  if (age < 13) {
    return `детская модель, ${age} лет`;
  }
  return `подростковая модель, ${age} лет`;
}

/** Base prompt from shooting parameters only (read-only in UI). */
export function buildModelBaseSettingsSummaryRu(
  settings: ModelGenerationSettings,
  outputSize: Partial<ModelOutputSizeSelection>,
  options?: { productPoseLabel?: string }
): string {
  const poseSummary =
    options?.productPoseLabel?.trim() ||
    modelAnglesSummaryRu(settings);

  const parts = [
    GENDER_LABELS[settings.gender],
    ...(settings.modelNationality.trim()
      ? [`национальность: ${settings.modelNationality.trim()}`]
      : []),
    `поза: ${poseSummary}`,
    ageSummary(settings.modelAge),
    `тип фигуры: ${bodyTypeSummary(settings)}`,
    `кадр: ${cropSummary(settings)}`,
    `сценарий: ${CONTEXT_LABELS[settings.categoryContext]}`,
  ];

  if (isModelOutputSizeComplete(outputSize)) {
    parts.push(`размер кадра: ${formatModelOutputSizeLabel(outputSize)}`);
  } else if (outputSize.aspectRatio || outputSize.resolution) {
    const sizeBits = [outputSize.aspectRatio, outputSize.resolution]
      .filter(Boolean)
      .join(" · ");
    parts.push(`размер кадра: ${sizeBits} (выберите оба параметра)`);
  }

  return parts.join(", ");
}

export function buildModelCombinedPromptRu(
  basePrompt: string,
  extraDescription?: string
): string {
  const extra = extraDescription?.trim();
  if (!extra) return basePrompt;
  return `${basePrompt}\n\nДополнение: ${extra}`;
}

/** Human-readable Russian summary of shooting parameters for the UI */
export function buildModelSettingsSummaryRu(
  settings: ModelGenerationSettings,
  outputSize: Partial<ModelOutputSizeSelection>,
  extraDescription?: string
): string {
  return buildModelCombinedPromptRu(
    buildModelBaseSettingsSummaryRu(settings, outputSize),
    extraDescription
  );
}
