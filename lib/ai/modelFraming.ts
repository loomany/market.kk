import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type { SourceModelCrop } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import { hasSourceProductZoneFraming } from "@/lib/ai/sourceFramingGuidance";
import { LINGERIE_FULL_HEAD_FACE_MANDATORY_EN } from "@/lib/ai/modelHeadFraming";
import {
  PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN,
  PRODUCT_ZONE_HEAD_HANDS_ADD_EN,
  sourceProductZoneBottomCropEn,
} from "@/lib/ai/sourceProductZoneBottomCrop";
import { effectiveResolvedModelPoseFromRequest } from "@/lib/ai/productViewResolver";
import {
  resolvedModelPosePromptEn,
} from "@/lib/ai/resolvedModelPosePrompts";
import {
  deriveSourceModelOrientationFromRequest,
  isUnsafeTryOnPosePhrase,
  productZoneMatchMerchantOrientationEn,
  sourceModelOrientationHeadEn,
  sourceModelOrientationPoseEn,
} from "@/lib/ai/sourceModelOrientation";
import { LINGERIE_CATALOG_FRAMING_EN } from "@/lib/studio/lingerieCropDefaults";

const SOURCE_MODEL_CROPS = new Set<SourceModelCrop>([
  "full-body",
  "upper-body",
  "waist-up",
  "upper-thigh",
  "close-up",
  "unknown",
]);

function parseSourceModelCrop(value: string | undefined): SourceModelCrop | null {
  const v = value?.trim();
  if (!v || !SOURCE_MODEL_CROPS.has(v as SourceModelCrop) || v === "unknown") {
    return null;
  }
  return v as SourceModelCrop;
}

function sourceProductZoneMandatoryFramingEn(
  input: GenerateModelRequest
): string {
  const crop = parseSourceModelCrop(input.sourceModelCrop);
  const bottom = crop
    ? sourceProductZoneBottomCropEn(crop)
    : "bottom frame edge must match the merchant product photo exactly — never show legs or feet below the reference crop line";
  const orientation = deriveSourceModelOrientationFromRequest(input);
  const orientationLine = productZoneMatchMerchantOrientationEn(orientation);
  const headRule =
    orientation === "back"
      ? sourceModelOrientationHeadEn("back")
      : LINGERIE_FULL_HEAD_FACE_MANDATORY_EN;
  return `${headRule} Mandatory framing (highest priority when server source product-zone guidance is active): ${bottom}; ${orientationLine}; ${PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN}; standing try-on-safe, not seated; bra, waist, and brief large in frame like the reference; not full-length unless the reference is full-body.`;
}

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
  if (hasSourceProductZoneFraming(input.sourceFramingGuidanceEn)) {
    return sourceProductZoneMandatoryFramingEn(input);
  }

  if (isFullBodyCrop(input)) {
    return (
      "Mandatory framing (highest priority, overrides conflicting angle text): full-length catalog shot with the entire model visible from top of hair and forehead through chin, both feet and floor visible, camera pulled back with generous headroom and footroom, do not crop or cut off head, face, hair, or feet, not torso-only, not headless, not chin-to-knee close-up."
    );
  }

  if (input.crop === "upper-thigh") {
    return `Mandatory framing (highest priority): ${LINGERIE_FULL_HEAD_FACE_MANDATORY_EN} ${LINGERIE_CATALOG_FRAMING_EN}`;
  }

  if (input.crop === "upper-body") {
    return (
      `Mandatory framing (highest priority): ${LINGERIE_FULL_HEAD_FACE_MANDATORY_EN} waist-up / torso-to-upper-thigh catalog crop with shoulders, chest, waist and hips visible; do not crop hands, waist, hips, or garment areas.`
    );
  }

  if (input.crop === MODEL_PARAM_CUSTOM && input.cropCustom?.trim()) {
    return `Mandatory framing: ${input.cropCustom.trim()}.`;
  }

  return `Mandatory framing: ${LINGERIE_FULL_HEAD_FACE_MANDATORY_EN}`;
}

export function resolvePoseInstruction(input: GenerateModelRequest): string {
  const angle = input.cameraAnglePrompt?.trim();
  const base = posePhraseFromSettings(input);

  if (hasSourceProductZoneFraming(input.sourceFramingGuidanceEn)) {
    const orientation = deriveSourceModelOrientationFromRequest(input);
    const unsafe = isUnsafeTryOnPosePhrase(
      [input.sourceModelPose, input.sourceModelCameraAngle, input.sourceModelPromptEn]
        .filter(Boolean)
        .join(" ")
    );
    const poseLine = sourceModelOrientationPoseEn(orientation);
    const safety = unsafe
      ? "standing try-on-safe only — do not copy seated, reclining, or hand-on-chest from the reference"
      : "match merchant body orientation from the product reference";
    return `${base}, ${poseLine}, ${safety}`;
  }

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
  if (input.pose === "auto") {
    return resolvedModelPosePromptEn(
      effectiveResolvedModelPoseFromRequest(input)
    );
  }
  return input.pose === "front"
    ? "neutral front-facing"
    : "slight angle";
}
