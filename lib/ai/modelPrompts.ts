import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import { bodyTypePromptPhrase } from "@/lib/ai/modelBodyTypes";
import {
  isFullBodyCrop,
  mandatoryFramingGuidance,
  resolvePoseInstruction,
} from "@/lib/ai/modelFraming";
import {
  lingerieBottomCutGuidance,
  lingerieCatalogOutfitGuidance,
  lingerieModelPoseGuidance,
  lingerieNeutralBaseOutfitGuidance,
  MODEL_GENERATION_NO_GARMENT_COPY_RULE,
  neutralBaseOutfitGuidance,
  neutralBaseOutfitLockForEdit,
  shouldUseNeutralBaseModelGeneration,
} from "@/lib/ai/modelIdentityPipeline";
import {
  SOURCE_MODEL_GENERATION_RULE,
  SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE,
} from "@/lib/ai/sourceModelPromptRules";
import { lightingPromptPhrase } from "@/lib/ai/modelLighting";
import {
  isAdultModelAge,
  modelAgeAppearanceGuidance,
  modelAgeNegativePhrase,
  modelAgePromptPhrase,
  modelAgeYears,
} from "@/lib/ai/modelAge";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import {
  lingerieFullBodyFootwearGuidance,
  shouldApplyLingerieFullBodyHeels,
} from "@/lib/ai/lingerieFullBodyFootwear";

function cropPhrase(input: GenerateModelRequest): string {
  if (isFullBodyCrop(input)) {
    return "full-length head-to-toe framing";
  }
  if (input.crop === "upper-thigh") {
    return "commercial lingerie catalog crop from full head through upper-mid thighs, entire bra and brief fully visible";
  }
  if (input.crop === MODEL_PARAM_CUSTOM && input.cropCustom?.trim()) {
    return input.cropCustom.trim();
  }
  if (input.categoryContext === "lingerie" && input.crop === "upper-body") {
    return "waist-up catalog crop with full head, full face, torso, waist and hips visible";
  }
  return input.crop === "full-body"
    ? "full-length head-to-toe framing"
    : "waist-up catalog framing with full head, full face, torso and waist visible";
}

function bodyTypeEnforcement(input: GenerateModelRequest): string | null {
  switch (input.bodyType) {
    case "plus-size":
      return (
        "Body type (mandatory): visibly plus-size curvy woman with full hips, soft belly, thick thighs and arms — US 16–18 commercial fit, clearly not slim straight-size model."
      );
    case "size-2xl":
      return "Body type (mandatory): size 2XL extended plus proportions, full curves on hips waist and thighs, not slim.";
    case "size-xl":
      return "Body type (mandatory): size XL fuller frame with natural curves, not slim straight-size.";
    case "curvy":
      return "Body type (mandatory): curvy hourglass figure with pronounced hips and bust, not slim.";
    case "slim":
    case "size-s":
      return "Body type (mandatory): slim slender frame.";
    default:
      return null;
  }
}

function bodyTypeNegatives(input: GenerateModelRequest): string | null {
  if (
    input.bodyType === "plus-size" ||
    input.bodyType === "size-2xl" ||
    input.bodyType === "size-xl" ||
    input.bodyType === "curvy"
  ) {
    return "no slim runway body, no underweight frame, no straight-size S or M proportions";
  }
  return null;
}

function defaultLightingPhrase(hasUserDirection: boolean): string {
  if (hasUserDirection) {
    return "lighting and atmosphere per user model direction below";
  }
  return lightingPromptPhrase("studio", undefined);
}

function defaultBackdropPhrase(hasUserDirection: boolean): string {
  if (hasUserDirection) {
    return "studio backdrop per user model direction below";
  }
  return (
    "plain white seamless studio backdrop with soft natural floor shadow — " +
    "override color, texture, or depth in user model direction if needed"
  );
}

function wantsVisibleStudioShadows(text?: string): boolean {
  if (!text?.trim()) return false;
  return /тен|shadow/i.test(text);
}

function studioAtmosphereGuidance(hasUserDirection: boolean): string | null {
  if (hasUserDirection) return null;
  return (
    "Studio depth: directional soft key light, clearly visible soft natural shadow behind the model on the backdrop, " +
    "subtle contact shadow under feet — believable professional photoshoot, not flat shadowless lighting."
  );
}

function nationalityClause(input: GenerateModelRequest): string {
  const value = input.modelNationality?.trim();
  return value ? `, ${value} appearance` : "";
}

/** Catalog skin: отполировано, но не «пластик» — без целлюлита и бугристости */
function catalogSkinFinishGuidance(): string {
  return (
    "Even softly retouched catalog skin on all visible body areas: smooth natural finish on legs, thighs, hips, and arms " +
    "without visible cellulite, orange-peel texture, or lumpy dimpling; " +
    "keep subtle realistic pores and skin grain — not plastic over-airbrushed doll skin, not harsh unretouched bumps."
  );
}

/** Дефолтный каталожный образ для взрослых женских моделей */
function femaleAdultModelBeautyGuidance(input: GenerateModelRequest): string {
  const years = modelAgeYears(input.modelAge);
  const youthHint =
    years <= 23
      ? "youthful early-twenties facial features, "
      : years <= 27
        ? "young mid-twenties facial features, "
        : "";

  return (
    `Mandatory premium glamorous adult female fashion model styling (always): ${youthHint}beautiful symmetrical face with confident eye contact, ` +
    "healthy sun-kissed skin with even golden glow on face and body, " +
    "full professional salon makeup (shaped brows, soft contour, mascara, blush, glossy natural lips — never bare face), " +
    "salon-finished photo-ready hair (volume, blowout, or sleek waves — never messy or unkempt), " +
    "elegant sensual but non-explicit catalog pose energy, warm natural smile with bright clean teeth when smiling, " +
    "professional manicure on all visible hands (neat shaped nails, nude or soft polish). " +
    "Luxury marketplace / boudoir campaign look — polished, attractive, curvy where selected, never plain, boring, matronly, or shapeless."
  );
}

function femaleAdultModelBeautyNegatives(): string {
  return (
    "no bare face without makeup, no unkempt or messy hair, no plain boring catalog model, no auntie or matronly face, " +
    "no shapeless boxy torso, no awkward hands covering garment areas, no neutral closed-mouth without expression, " +
    "no yellow stained or crooked teeth, no chipped bitten or unpolished nails when hands are visible"
  );
}

function expressionPhrase(input: GenerateModelRequest): string {
  if (input.gender === "female" && isAdultModelAge(input.modelAge)) {
    return "confident sensual but non-explicit catalog expression with warm natural smile and bright white teeth, direct eye contact";
  }
  return "calm confident expression";
}

/** Взрослая модель: загар + профессиональный образ */
function professionalModelLookGuidance(
  input: GenerateModelRequest
): string | null {
  if (!isAdultModelAge(input.modelAge)) return null;

  if (input.gender === "female") {
    return femaleAdultModelBeautyGuidance(input);
  }

  return (
    "Professional commercial model look: attractive face, healthy sun-kissed skin tone with even warmth, " +
    "well-groomed styling, polished catalog appearance — natural and believable."
  );
}

function tryOnPoseNegatives(input: GenerateModelRequest): string {
  // Jewelry models never enter FASHN — keep editorial freedom there.
  if (input.categoryContext === "jewelry") return "";
  return (
    ", arms raised above shoulders, hand behind head, hand on neck, hand in hair, " +
    "arms above head, raised-arm Vogue pose, runway raised-arm pose, hands crossing garment area"
  );
}

function safetyNegatives(input: GenerateModelRequest): string {
  const modelAge = input.modelAge;
  if (isAdultModelAge(modelAge)) {
    const femaleExtras =
      input.gender === "female"
        ? `, ${femaleAdultModelBeautyNegatives()}`
        : "";
    const lingerieExtras =
      input.categoryContext === "lingerie"
        ? ", boyshorts, high-waist underwear shorts, biker shorts, long-leg underwear to mid-thigh, seated pose compressing underwear"
        : "";
    const tryOnExtras = tryOnPoseNegatives(input);
    return (
      "Do not generate: child, teen, explicit nudity, sexualized pose, watermark, text, logo, distorted hands, extra limbs, bad anatomy, blurry image, " +
      "visible cellulite, orange-peel skin, lumpy thigh or hip dimpling, rough bumpy skin on legs or arms, " +
      "very pale untanned porcelain skin, bare face without makeup, unkempt unstyled appearance" +
      femaleExtras +
      lingerieExtras +
      tryOnExtras +
      ", " +
      modelAgeNegativePhrase(modelAge) +
      "."
    );
  }
  if (modelAge < 13) {
    return "Do not generate: adult, teenager, teen, sexualized pose, swimsuit, bikini, lingerie, underwear, exposed skin beyond age-appropriate clothing, watermark, text, logo, distorted anatomy, blurry image.";
  }
  return "Do not generate: young child, adult, sexualized pose, swimsuit, bikini, lingerie, underwear, explicit content, watermark, text, logo, distorted anatomy, blurry image.";
}

export function buildModelGenerationPrompt(
  input: GenerateModelRequest,
  options?: { followUpAngle?: boolean; neutralBaseForTryOn?: boolean }
): string {
  const neutralBase =
    options?.neutralBaseForTryOn ?? shouldUseNeutralBaseModelGeneration(input);
  const bodyType = bodyTypePromptPhrase(input.bodyType, input.bodyTypeCustom);
  const ageLabel = modelAgePromptPhrase(input.modelAge);
  const adult = isAdultModelAge(input.modelAge);
  const pose = resolvePoseInstruction(input);
  const crop = cropPhrase(input);
  const framing = mandatoryFramingGuidance(input);
  const bodyEnforcement = bodyTypeEnforcement(input);
  const expression = expressionPhrase(input);
  const hasUserDirection = Boolean(input.customDescription?.trim());
  const lighting = defaultLightingPhrase(hasUserDirection);
  const backdrop = defaultBackdropPhrase(hasUserDirection);

  const parts =
    input.categoryContext === "lingerie"
      ? [
          neutralBase
            ? `Realistic full-body studio photo of a ${ageLabel} ${input.gender} fashion model${nationalityClause(input)} for virtual lingerie try-on, ${bodyType}, ${crop}, ${pose}, ${lighting}, ${expression}, ${lingerieNeutralBaseOutfitGuidance()}, natural editorial posture with subtle weight shift, arms relaxed naturally along the body, hands below the shoulder line, both shoulders square to camera, visible torso and hips, ${backdrop}, believable human presence, no sunglasses, no heavy jewelry, no props, no text, no watermark, no logo, non-explicit, not sexualized.`
            : `Realistic full-body studio photo of a ${ageLabel} ${input.gender} fashion model${nationalityClause(input)} for premium lingerie catalog try-on, ${bodyType}, ${crop}, ${pose}, ${lighting}, ${expression}, ${lingerieCatalogOutfitGuidance()}, natural editorial posture with subtle weight shift, arms relaxed naturally along the body, hands below the shoulder line, both shoulders square to camera, visible torso and hips, ${backdrop}, believable human presence, no sunglasses, no heavy jewelry, no props, no text, no watermark, no logo, non-explicit, not sexualized, suitable for virtual try-on.`,
        ]
      : [
          `Realistic premium e-commerce studio photo of a ${ageLabel} ${input.gender} fashion model${nationalityClause(input)}, ${bodyType}, ${crop}, ${pose}, ${lighting}, ${expression}, relaxed natural body language, ${backdrop}, modern DTC catalog photography, realistic proportions, high detail, no text, no watermark, no logo.`,
        ];

  parts.push(modelAgeAppearanceGuidance(input.modelAge));
  parts.push(framing);
  if (bodyEnforcement) {
    parts.push(bodyEnforcement);
  }

  const atmosphere = studioAtmosphereGuidance(hasUserDirection);
  if (atmosphere) {
    parts.push(atmosphere);
  }

  if (adult) {
    parts.push(catalogSkinFinishGuidance());
    const modelLook = professionalModelLookGuidance(input);
    if (modelLook) {
      parts.push(modelLook);
    }
  }

  if (shouldApplyLingerieFullBodyHeels(input)) {
    parts.push(lingerieFullBodyFootwearGuidance());
  }

  if (input.categoryContext === "lingerie") {
    parts.push(
      `Model age ${modelAgeYears(input.modelAge)}+ only, natural editorial styling, hands not covering chest, waist, hips, or garment area, no cropped headshot, no portrait-only framing.`
    );
    if (neutralBase) {
      parts.push(MODEL_GENERATION_NO_GARMENT_COPY_RULE);
      parts.push(
        "Identity for all angles: same woman, same plain neutral bra-and-brief base — marketplace lace, colors, and SKU design come only from try-on, not from this generation."
      );
    } else {
      parts.push(
        "One cohesive lingerie or swimwear set in a single color and lace design — this exact outfit defines the model for all catalog angles."
      );
      parts.push(lingerieBottomCutGuidance());
      parts.push(lingerieModelPoseGuidance());
    }
    if (options?.followUpAngle) {
      parts.push(
        neutralBase
          ? "Same woman identity as the hero shot: match face, age, hair, professional makeup, skin tone, and the same neutral bodysuit — change only camera angle and body pose."
          : "Same woman identity as the hero shot: match face, age, hair, professional makeup, skin tone, and the exact same apparel set — change only camera angle and body pose per the angle instruction."
      );
    }
  }

  if (input.categoryContext === "jewelry") {
    parts.push(
      "Clean neck and ear area visible for jewelry product visualization, simple styling, no heavy accessories."
    );
  }

  if (input.sourceModelPromptEn?.trim()) {
    parts.push(SOURCE_MODEL_GENERATION_RULE);
    parts.push(input.sourceModelPromptEn.trim());
    if (neutralBase && input.categoryContext === "lingerie") {
      parts.push(SOURCE_MODEL_LINGERIE_NEUTRAL_BASE_RULE);
    }
  }

  if (input.shortAiSummaryEn?.trim() && !neutralBase) {
    parts.push(`Product analysis: ${input.shortAiSummaryEn.trim()}`);
  } else if (input.shortAiSummaryEn?.trim() && neutralBase) {
    parts.push(`Try-on context only (do not draw garment): ${input.shortAiSummaryEn.trim()}`);
  }

  if (!neutralBase && input.productMustPreserve?.length) {
    parts.push(
      `Preserve for try-on reference: ${input.productMustPreserve.join("; ")}.`
    );
  }

  if (!neutralBase && input.productFitNotes?.length) {
    parts.push(`Fit notes: ${input.productFitNotes.join("; ")}.`);
  }

  if (!neutralBase && input.productDescriptionRu?.trim()) {
    parts.push(
      `Product context from merchant (highest priority): ${input.productDescriptionRu.trim()}`
    );
  }

  if (!adult) {
    parts.push(
      "Age-appropriate fully clothed children's or teen catalog styling only, modest outfit, no swimwear, no lingerie, no underwear-only look, non-sexualized."
    );
  }

  if (input.customDescription) {
    const shadowPriority = wantsVisibleStudioShadows(input.customDescription);
    parts.push(
      adult
        ? shadowPriority
          ? `Lighting and studio atmosphere (high priority): ${input.customDescription}. Apply visible soft natural shadows behind the model and on the floor as described — overrides flat shadowless lighting. Commercial catalog, adult-only, non-explicit.`
          : `User model direction: ${input.customDescription}. Keep this direction commercial, adult-only, non-explicit, and suitable for marketplace catalog imagery.`
        : `User model direction: ${input.customDescription}. Keep this direction age-appropriate, fully clothed, non-sexualized, and suitable for children's marketplace catalog imagery.`
    );
  }

  if (input.cameraAnglePrompt?.trim()) {
    parts.push(
      isFullBodyCrop(input)
        ? "Follow the specified body orientation and pose only — do not tighten crop; keep mandatory full head-to-toe framing. Natural editorial posture, hands relaxed below the shoulder line, both shoulders square to camera, hands not blocking garment areas."
        : "Follow the specified camera angle, body orientation, and framing. Keep posture natural and editorial — subtle weight shift, relaxed shoulders square to camera, hands relaxed below the shoulder line, no raised-arm pose; avoid rigid mannequin stance. Hands must not block garment areas needed for try-on."
    );
  } else {
    parts.push(
      "Model should face the camera clearly with natural relaxed posture suitable for virtual clothing try-on, hands relaxed below the shoulder line, both shoulders square to camera, hands not covering torso, no oversized clothing, no complex props, no sunglasses."
    );
  }

  const bodyNeg = bodyTypeNegatives(input);
  const safety = safetyNegatives(input).replace(/\.\s*$/, "");
  parts.push(bodyNeg ? `${safety}, ${bodyNeg}.` : `${safety}.`);

  return parts.join(" ");
}

/** Edit prompt: compact — Fal edit often 422 on long lingerie/safety-heavy prompts */
export function buildModelAngleEditPrompt(input: GenerateModelRequest): string {
  const angle = input.cameraAnglePrompt?.trim();
  if (!angle) {
    throw new Error("cameraAnglePrompt is required for model angle edit");
  }

  const neutralBase = shouldUseNeutralBaseModelGeneration(input);
  const outfitLock =
    input.categoryContext === "lingerie" && neutralBase
      ? neutralBaseOutfitLockForEdit()
      : input.categoryContext === "lingerie"
        ? "Keep the exact same catalog apparel outfit, colors, and fabric details as the reference."
        : "Keep the exact same clothing, styling, and colors.";

  const femaleBeautyLock =
    input.gender === "female" && isAdultModelAge(input.modelAge)
      ? "Keep professional makeup, salon-styled hair, warm smile with bright white teeth, and manicured nails exactly as the reference."
      : null;

  const parts = [
    "Edit this professional e-commerce studio photo.",
    `Same model identity: same face, age ${modelAgeYears(input.modelAge)}, hairstyle, makeup, skin tone, and body proportions.`,
    ...(femaleBeautyLock ? [femaleBeautyLock] : []),
    outfitLock,
    `Change only pose and camera orientation to: ${angle}.`,
    ...(isFullBodyCrop(input)
      ? [
          "Keep mandatory full head-to-toe framing: entire head, face, hair, and feet visible — do not crop forehead or feet.",
        ]
      : []),
    "Same studio backdrop, lighting, and soft shadows as the reference.",
    "Natural relaxed catalog posture; hands not covering torso.",
    "Commercial marketplace catalog, non-explicit, no text or watermark.",
  ];

  if (input.customDescription?.trim()) {
    parts.push(`Atmosphere: ${input.customDescription.trim().slice(0, 200)}.`);
  }

  return parts.join(" ");
}
