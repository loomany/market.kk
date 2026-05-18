import type { ModelBodyType } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

/** English phrasing for Fal — one clear body-type instruction per option */
export function bodyTypePromptPhrase(
  bodyType: ModelBodyType,
  customText?: string
): string {
  if (bodyType === MODEL_PARAM_CUSTOM) {
    const trimmed = customText?.trim();
    return trimmed
      ? trimmed
      : "commercial fashion model with natural realistic proportions";
  }

  switch (bodyType) {
    case "plus-size":
      return "plus-size adult model with realistic fuller proportions, natural curves";
    case "slim":
      return "slim slender model with narrow frame and lean realistic proportions";
    case "athletic":
      return "athletic toned model with fit physique, defined but natural muscle, sporty healthy look";
    case "swimwear":
      return "swimwear and bikini catalog model with toned fit physique, beachwear commercial styling, non-explicit";
    case "curvy":
      return "curvy model with balanced hourglass proportions, natural waist and hips, realistic commercial look";
    case "petite":
      return "petite model with smaller frame and shorter stature, delicate realistic proportions";
    case "tall":
      return "tall model with long legs and elongated proportions, elegant runway-style posture";
    case "standard":
    default:
      return "standard average commercial model proportions, natural realistic look";
  }
}
