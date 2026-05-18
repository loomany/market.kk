export const MODEL_PARAM_CUSTOM = "custom" as const;

export type ModelParamCustom = typeof MODEL_PARAM_CUSTOM;

export const MODEL_CUSTOM_SELECT_OPTION = {
  id: MODEL_PARAM_CUSTOM,
  label: "Свой вариант",
  shortHint: "свой текст",
  hint: "Опишите своими словами — учтём в промпте генерации",
} as const;

export const MODEL_CUSTOM_TEXT_MAX = 300;
