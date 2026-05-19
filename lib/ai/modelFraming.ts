import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import { LINGERIE_CATALOG_FRAMING_EN } from "@/lib/studio/lingerieCropDefaults";

export function isFullBodyCrop(input: GenerateModelRequest): boolean {
  if (input.crop === "full-body") return true;
  if (input.crop === MODEL_PARAM_CUSTOM) {
    const text = input.cropCustom?.trim().toLowerCase() ?? "";
    return /полный|full[\s-]?body|head[\s-]?to[\s-]?toe|весь рост|в полный рост/i.test(
      text
    );
  }
  return false;
}

/** UI «кадр для примерки» — не даём ракурсу обрезать голову/ноги */
export function mandatoryFramingGuidance(
  input: GenerateModelRequest
): string {
  if (isFullBodyCrop(input)) {
    return (
      "Mandatory framing (highest priority, overrides conflicting angle text): full-length catalog shot with the entire model visible from top of hair and forehead through chin, both feet and floor visible, camera pulled back with generous headroom and footroom, do not crop or cut off head, face, hair, or feet, not torso-only, not headless, not chin-to-knee close-up."
    );
  }

  if (input.crop === "upper-thigh") {
    return `Mandatory framing (highest priority): ${LINGERIE_CATALOG_FRAMING_EN}`;
  }

  if (input.crop === "upper-body") {
    return (
      "Mandatory framing (highest priority): waist-up / torso-to-upper-thigh catalog crop with the full head, full face, forehead, hair, shoulders, chest, waist and hips visible; do not crop forehead, eyes, top of head, chin, hands, waist, hips, or garment areas; not headless, not mouth-only portrait, not tight face crop."
    );
  }

  if (input.crop === MODEL_PARAM_CUSTOM && input.cropCustom?.trim()) {
    return `Mandatory framing: ${input.cropCustom.trim()}.`;
  }

  return "Mandatory framing: upper body with complete face and hair visible, do not crop forehead.";
}

export function resolvePoseInstruction(input: GenerateModelRequest): string {
  const angle = input.cameraAnglePrompt?.trim();
  const base = posePhraseFromSettings(input);

  if (!angle) return base;

  if (isFullBodyCrop(input)) {
    return `${base}, pose and camera orientation: ${angle} — keep full head-to-toe framing with entire head and feet in frame`;
  }

  return angle;
}

function posePhraseFromSettings(input: GenerateModelRequest): string {
  if (input.pose === MODEL_PARAM_CUSTOM && input.poseCustom?.trim()) {
    return `${input.poseCustom.trim()}, catalog pose`;
  }
  return input.pose === "front"
    ? "neutral front-facing"
    : "slight angle";
}
