import type { ModelGenerationSettings } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

export function validateModelCustomParams(
  settings: Pick<
    ModelGenerationSettings,
    | "bodyType"
    | "bodyTypeCustom"
    | "crop"
    | "cropCustom"
    | "lighting"
    | "lightingCustom"
  >
): string | null {
  if (settings.bodyType === MODEL_PARAM_CUSTOM && !settings.bodyTypeCustom.trim()) {
    return "Укажите описание типа фигуры или выберите готовый вариант.";
  }
  if (settings.crop === MODEL_PARAM_CUSTOM && !settings.cropCustom.trim()) {
    return "Укажите описание кадра или выберите готовый вариант.";
  }
  if (settings.lighting === MODEL_PARAM_CUSTOM && !settings.lightingCustom.trim()) {
    return "Укажите описание освещения или выберите готовый вариант.";
  }
  return null;
}
