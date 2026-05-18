import type { ModelLighting } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

export const MODEL_LIGHTING_PRESET_IDS = [
  "studio",
  "sunny-outdoor",
] as const;

/** English phrasing for Fal — lighting setup for catalog / lookbook shoots */
export function lightingPromptPhrase(
  lighting: ModelLighting,
  customText?: string
): string {
  if (lighting === MODEL_PARAM_CUSTOM) {
    const trimmed = customText?.trim();
    return trimmed ? `${trimmed} lighting` : "professional catalog lighting";
  }

  switch (lighting) {
    case "sunny-outdoor":
      return "bright natural sunny outdoor daylight, clear shadows";
    case "studio":
    default:
      return "even studio softbox lighting, clean catalog look, minimal harsh shadows";
  }
}
