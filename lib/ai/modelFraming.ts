import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

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

  if (input.crop === "upper-body") {
    return (
      "Mandatory framing: from top of head through upper thighs, complete face forehead and hair visible, hips in frame, do not crop forehead or top of head."
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
