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
    case "size-s":
      return "fashion model wearing commercial size S: petite narrow frame, small shoulders and hips, lean realistic proportions for size S garment fit";
    case "size-m":
      return "fashion model wearing commercial size M: balanced medium proportions, natural average build typical for size M catalog fit";
    case "size-l":
      return "fashion model wearing commercial size L: slightly fuller than medium, natural realistic proportions for size L garment fit";
    case "size-xl":
      return "fashion model wearing commercial size XL: fuller frame with natural curves, realistic plus-range proportions for size XL catalog fit";
    case "size-2xl":
      return "fashion model wearing commercial size 2XL: extended fuller proportions, natural curves on torso hips and thighs, realistic size 2XL catalog fit";
    case "plus-size":
      return (
        "plus-size curvy woman US size 16–18 / EU 48–52: visibly full soft hips, rounded thighs, soft abdomen, full bust, thick arms and legs, " +
        "clearly heavier than straight-size M — authentic commercial plus-size catalog model, not slim, not fitness-athletic, not straight-size"
      );
    case "slim":
      return "slim slender model with narrow frame and lean realistic proportions";
    case "athletic":
      return "athletic toned model with fit physique, defined but natural muscle, sporty healthy look";
    case "swimwear":
      return "swimwear and bikini catalog model with toned fit physique, beachwear commercial styling, non-explicit";
    case "curvy":
      return "curvy hourglass fashion model with defined waist, full hips and bust, premium glamorous catalog proportions, sensual but non-explicit editorial stance";
    case "petite":
      return "petite model with smaller frame and shorter stature, delicate realistic proportions";
    case "tall":
      return "tall model with long legs and elongated proportions, elegant runway-style posture";
    case "standard":
    default:
      return "standard average commercial model proportions, natural realistic look";
  }
}
