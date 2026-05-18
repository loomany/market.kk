import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { bodyTypePromptPhrase } from "@/lib/ai/modelBodyTypes";
import { isAdultModelAge, modelAgePromptPhrase } from "@/lib/ai/modelAge";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";

function posePhrase(input: GenerateModelRequest): string {
  if (input.pose === MODEL_PARAM_CUSTOM && input.poseCustom?.trim()) {
    return `${input.poseCustom.trim()}, catalog pose`;
  }
  return input.pose === "front"
    ? "neutral front-facing"
    : "slight angle";
}

function cropPhrase(input: GenerateModelRequest): string {
  if (input.crop === MODEL_PARAM_CUSTOM && input.cropCustom?.trim()) {
    return input.cropCustom.trim();
  }
  if (input.categoryContext === "lingerie" && input.crop === "upper-body") {
    return "torso-to-thigh crop with visible torso and hips";
  }
  return input.crop === "full-body" ? "full body" : "upper body";
}

function backgroundLabel(
  background: GenerateModelRequest["background"]
): string {
  if (background === "light-gray") return "light gray";
  return background;
}

function safetyNegatives(modelAge: number): string {
  if (isAdultModelAge(modelAge)) {
    return "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo, distorted hands, extra limbs, bad anatomy, blurry image.";
  }
  if (modelAge < 13) {
    return "Do not generate: adult, teenager, teen, sexualized pose, swimsuit, bikini, lingerie, underwear, exposed skin beyond age-appropriate clothing, watermark, text, logo, distorted anatomy, blurry image.";
  }
  return "Do not generate: young child, adult, sexualized pose, swimsuit, bikini, lingerie, underwear, explicit content, watermark, text, logo, distorted anatomy, blurry image.";
}

export function buildModelGenerationPrompt(
  input: GenerateModelRequest
): string {
  const bodyType = bodyTypePromptPhrase(input.bodyType, input.bodyTypeCustom);
  const ageLabel = modelAgePromptPhrase(input.modelAge);
  const adult = isAdultModelAge(input.modelAge);
  const pose = posePhrase(input);
  const crop = cropPhrase(input);

  const parts =
    input.categoryContext === "lingerie"
      ? [
          `Realistic full-body studio photo of an adult ${input.gender} fashion model for commercial lingerie catalog try-on, ${bodyType}, ${crop}, ${pose} pose, front-facing or slight natural turn, relaxed arms slightly away from torso, visible torso and hips, clean ${backgroundLabel(input.background)} studio background, natural proportions, no sunglasses, no heavy jewelry, no props, no text, no watermark, no logo, non-explicit, not sexualized, suitable for virtual try-on.`,
        ]
      : [
          `Realistic professional e-commerce studio photo of a ${ageLabel} ${input.gender} fashion model, ${bodyType}, ${crop}, ${pose} pose, neutral expression, relaxed arms, clean ${backgroundLabel(input.background)} background, marketplace catalog photography, natural skin texture, realistic proportions, high detail, no text, no watermark, no logo.`,
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

  if (!adult) {
    parts.push(
      "Age-appropriate fully clothed children's or teen catalog styling only, modest outfit, no swimwear, no lingerie, no underwear-only look, non-sexualized."
    );
  }

  if (input.customDescription) {
    parts.push(
      adult
        ? `User model direction: ${input.customDescription}. Keep this direction commercial, adult-only, non-explicit, and suitable for marketplace catalog imagery.`
        : `User model direction: ${input.customDescription}. Keep this direction age-appropriate, fully clothed, non-sexualized, and suitable for children's marketplace catalog imagery.`
    );
  }

  parts.push(
    "Model should face the camera clearly, body posture suitable for virtual clothing try-on, hands not covering torso, no oversized clothing, no complex props, no sunglasses."
  );

  parts.push(safetyNegatives(input.modelAge));

  return parts.join(" ");
}
