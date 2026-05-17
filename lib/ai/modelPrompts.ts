import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";

function poseLabel(pose: GenerateModelRequest["pose"]): string {
  return pose === "front" ? "neutral front-facing" : "slight angle";
}

function cropLabel(crop: GenerateModelRequest["crop"]): string {
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
  const parts = [
    `Realistic professional e-commerce studio photo of an adult ${input.gender} fashion model, ${input.bodyType} body type, ${cropLabel(input.crop)}, ${poseLabel(input.pose)} pose, neutral expression, relaxed arms, clean ${backgroundLabel(input.background)} background, marketplace catalog photography, natural skin texture, realistic proportions, high detail, no text, no watermark, no logo.`,
  ];

  if (input.categoryContext === "lingerie") {
    parts.push(
      "Tasteful non-explicit commercial lingerie catalog style, adult model only, neutral pose, not sexualized."
    );
  }

  if (input.categoryContext === "jewelry") {
    parts.push(
      "Clean neck and ear area visible for jewelry product visualization, simple styling, no heavy accessories."
    );
  }

  parts.push(
    "Model should face the camera clearly, body posture suitable for virtual clothing try-on, hands not covering torso, no oversized clothing, no complex props."
  );

  parts.push(
    "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo, distorted hands, extra limbs, bad anatomy, blurry image."
  );

  return parts.join(" ");
}
