export const MODEL_PARAM_CUSTOM = "custom" as const;

export type ModelParamCustom = typeof MODEL_PARAM_CUSTOM;

export const MODEL_CUSTOM_SELECT_OPTION = {
  id: MODEL_PARAM_CUSTOM,
  label: "Свой вариант",
  shortHint: "свой текст",
  hint: "Опишите своими словами — учтём в промпте генерации",
} as const;

export const MODEL_CUSTOM_TEXT_MAX = 300;

/** Preset angle prompts (server-side); longer than user custom fields */
export const MODEL_CAMERA_ANGLE_PROMPT_MAX = 512;

/** Full Russian pose description from product photo analysis (UI). */
export const PRODUCT_POSE_DESCRIPTION_RU_MAX = 400;
