import type { ModelGenerationSettings } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

export function validateModelCustomParams(
  settings: Pick<
    ModelGenerationSettings,
    "bodyType" | "bodyTypeCustom" | "pose" | "poseCustom" | "crop" | "cropCustom"
  >
): string | null {
  if (settings.bodyType === MODEL_PARAM_CUSTOM && !settings.bodyTypeCustom.trim()) {
    return "Укажите описание типа фигуры или выберите готовый вариант.";
  }
  if (settings.pose === MODEL_PARAM_CUSTOM && !settings.poseCustom.trim()) {
    return "Укажите описание позы или выберите готовый вариант.";
  }
  if (settings.crop === MODEL_PARAM_CUSTOM && !settings.cropCustom.trim()) {
    return "Укажите описание кадра или выберите готовый вариант.";
  }
  return null;
}
