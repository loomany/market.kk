import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";

function poseLabel(pose: GenerateModelRequest["pose"]): string {
  return pose === "front" ? "neutral front-facing" : "slight angle";
}

function cropLabel(
  crop: GenerateModelRequest["crop"],
  categoryContext: GenerateModelRequest["categoryContext"]
): string {
  if (categoryContext === "lingerie" && crop === "upper-body") {
    return "torso-to-thigh crop with visible torso and hips";
  }
  return crop === "full-body" ? "full body" : "upper body";
}

function backgroundLabel(
  background: GenerateModelRequest["background"]
): string {
  if (background === "light-gray") return "light gray";
  return background;
}

export function buildModelGenerationPrompt(
  input: GenerateModelRequest
): string {
  const bodyType =
    input.bodyType === "plus-size"
      ? "plus-size adult model, realistic proportions"
      : `${input.bodyType} body type, realistic proportions`;

  const parts =
    input.categoryContext === "lingerie"
      ? [
          `Realistic full-body studio photo of an adult ${input.gender} fashion model for commercial lingerie catalog try-on, ${bodyType}, ${cropLabel(input.crop, input.categoryContext)}, ${poseLabel(input.pose)} pose, front-facing or slight natural turn, relaxed arms slightly away from torso, visible torso and hips, clean ${backgroundLabel(input.background)} studio background, natural proportions, no sunglasses, no heavy jewelry, no props, no text, no watermark, no logo, non-explicit, not sexualized, suitable for virtual try-on.`,
        ]
      : [
          `Realistic professional e-commerce studio photo of an adult ${input.gender} fashion model, ${bodyType}, ${cropLabel(input.crop, input.categoryContext)}, ${poseLabel(input.pose)} pose, neutral expression, relaxed arms, clean ${backgroundLabel(input.background)} background, marketplace catalog photography, natural skin texture, realistic proportions, high detail, no text, no watermark, no logo.`,
        ];

  if (input.categoryContext === "lingerie") {
    parts.push(
      "Adult model only, commercial catalog pose, hands not covering chest, waist, hips, or garment area, no cropped headshot, no portrait-only framing."
    );
  }

  if (input.categoryContext === "jewelry") {
    parts.push(
      "Clean neck and ear area visible for jewelry product visualization, simple styling, no heavy accessories."
    );
  }

  parts.push(
    "Model should face the camera clearly, body posture suitable for virtual clothing try-on, hands not covering torso, no oversized clothing, no complex props, no sunglasses."
  );

  parts.push(
    "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo, distorted hands, extra limbs, bad anatomy, blurry image."
  );

  return parts.join(" ");
}
