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
      return (
        "professional studio key light with soft fill, gentle natural shadow behind the model on the backdrop, " +
        "subtle floor contact shadow, dimensional commercial catalog lighting — not flat shadowless overlit, not harsh dark shadows"
      );
  }
}
