/**
 * Source crop/framing guidance helper for on-model lingerie try-on.
 *
 * Pure, browser- and server-safe: no `server-only`, no I/O, no env access.
 * Wired via `productAnalysisForModelGeneration` → `sourceFramingGuidanceEn` on
 * generate-model requests.
 *
 * Crop scale and body orientation (front/back/side) follow the product reference;
 * standing try-on-safe only — never seated/reclining; synthesize head when reference
 * crops it.
 */

import {
  PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD,
  type ProductDescriptionAnalysis,
  type SourceModelCrop,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import {
  PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN,
  sourceProductZoneBottomCropEn,
} from "@/lib/ai/sourceProductZoneBottomCrop";
import {
  deriveSourceModelOrientation,
  isUnsafeTryOnPosePhrase,
  productZoneMatchMerchantOrientationEn,
  productZoneOrientationHandsEn,
} from "@/lib/ai/sourceModelOrientation";

export const SOURCE_FRAMING_GUIDANCE_MAX_LEN = 1000;

export type FramingAwareCategoryContext =
  | "lingerie"
  | "clothing"
  | "general"
  | "jewelry";

const CLOTHING_ON_MODEL_MIDDLE =
  "match merchant on-model clothing photo crop scale, body orientation (front, back, side, or three-quarter as in the reference), and bottom cut line; standing catalog pose suitable for virtual try-on";

export type SourceFramingCropRisk = "low" | "medium" | "high";

export type SourceFramingGuidance =
  | {
      applied: true;
      text: string;
      sourceCrop: SourceModelCrop;
      cropRisk: SourceFramingCropRisk;
      reason: string;
    }
  | {
      applied: false;
      text: "";
      sourceCrop?: undefined;
      cropRisk?: undefined;
      reason: string;
    };

export type DeriveSourceFramingInput = {
  analysis: ProductDescriptionAnalysis | null | undefined;
  categoryContext: FramingAwareCategoryContext;
  sourcePresentation?: ProductDescriptionAnalysis["sourcePresentation"];
  confidence?: number;
};

const INTRO =
  "Match merchant product photo crop scale and bottom cut line; try-on-safe standing model:";

const TAIL =
  "Do not invent brief edges. Do not copy source seated pose or hand placement. Plain neutral base for try-on only.";

const FULL_BODY_MIDDLE =
  "commercial full-length ecommerce crop with the entire model visible from the top of the head through both feet and the floor, matching a full-length on-model product reference; garment zone composition similar to the source product image";

function productZoneTryOnSafeCore(
  sourceCrop: SourceModelCrop,
  analysis: ProductDescriptionAnalysis
): string {
  const bottom = sourceProductZoneBottomCropEn(sourceCrop);
  const orientation = deriveSourceModelOrientation(analysis.sourceModel);
  const blob = [
    analysis.sourceModel?.pose,
    analysis.sourceModel?.cameraAngle,
    analysis.sourceModel?.promptEn,
  ]
    .filter(Boolean)
    .join(" ");
  const unsafe = isUnsafeTryOnPosePhrase(blob);
  const orientationLine = productZoneMatchMerchantOrientationEn(orientation);
  const handsLine = productZoneOrientationHandsEn(
    orientation,
    analysis.sourceModel?.handsPosition
  );
  const safety = unsafe
    ? "standing only, not seated or reclining, never hand-on-chest"
    : "standing try-on-safe, not seated";
  return [
    orientationLine,
    bottom,
    PRODUCT_ZONE_BOTTOM_CROP_ANCHOR_EN,
    safety,
    "bra, waist, brief large like the reference",
    handsLine,
    "match reference zoom, bottom edge, and body orientation",
  ].join("; ");
}

const FORBIDDEN_DESIGN_TOKENS: readonly RegExp[] = [
  /\bcolou?r\b/i,
  /\bcolou?red\b/i,
  /\bblack base\b/i,
  /\bblack\b/i,
  /\bwhite\b/i,
  /\bred\b/i,
  /\bblue\b/i,
  /\bgreen\b/i,
  /\bemerald\b/i,
  /\bturquoise\b/i,
  /\bteal\b/i,
  /\bnavy\b/i,
  /\bbeige\b/i,
  /\bnude\b/i,
  /\blace\b/i,
  /\bfloral\b/i,
  /\bembroider/i,
  /\bscallop/i,
  /\bdecorative\b/i,
  /\bornament/i,
  /\bpattern\b/i,
  /\bprint\b/i,
  /\bprinted\b/i,
  /\blogo\b/i,
  /\bSKU-specific design\b/i,
  /\bpanel\b/i,
];

export function deriveSourceFramingGuidance(
  input: DeriveSourceFramingInput
): SourceFramingGuidance {
  const { analysis, categoryContext } = input;

  if (categoryContext !== "lingerie" && categoryContext !== "clothing") {
    return notApplied(
      `categoryContext is "${categoryContext}" — source framing guidance applies to lingerie or clothing on-model only`
    );
  }
  if (!analysis) {
    return notApplied("no productAnalysis provided");
  }

  const confidence = input.confidence ?? analysis.confidence;
  if (confidence < PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD) {
    return notApplied(
      `confidence ${confidence.toFixed(2)} < ${PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD} — falling back to UI crop preset`
    );
  }

  const sourcePresentation =
    input.sourcePresentation ?? analysis.sourcePresentation;
  if (sourcePresentation !== "on-model") {
    return notApplied(
      `sourcePresentation is "${sourcePresentation}", not "on-model" — flat-lay and unknown sources have no body crop to match`
    );
  }

  const sourceCrop = analysis.sourceModel?.crop ?? null;
  if (!sourceCrop || sourceCrop === "unknown") {
    return notApplied(
      sourceCrop === "unknown"
        ? "sourceModel.crop is unknown — cannot derive framing guidance"
        : "sourceModel.crop is missing — cannot derive framing guidance"
    );
  }

  const middle = selectMiddlePhrase(
    sourceCrop,
    analysis.setType,
    analysis,
    categoryContext
  );
  const text = composeGuidanceText(middle);
  const cropRisk = assessCropRisk(sourceCrop, analysis.setType);

  for (const re of FORBIDDEN_DESIGN_TOKENS) {
    if (re.test(text)) {
      return notApplied(
        `internal sanitizer: forbidden decorative-design token ${re} appeared in derived text — refusing to emit`
      );
    }
  }

  const riskNote =
    cropRisk === "high"
      ? " — high crop risk: reference is very tight"
      : cropRisk === "medium"
        ? " — medium crop risk: set includes bottoms but reference crop may not show full brief"
        : "";

  return {
    applied: true,
    text,
    sourceCrop,
    cropRisk,
    reason: `${categoryContext} + on-model + confident analysis + sourceModel.crop=${sourceCrop}${riskNote}`,
  };
}

function notApplied(reason: string): SourceFramingGuidance {
  return { applied: false, text: "", reason };
}

function selectMiddlePhrase(
  crop: SourceModelCrop,
  setType: ProductDescriptionAnalysis["setType"],
  analysis: ProductDescriptionAnalysis,
  categoryContext: FramingAwareCategoryContext
): string {
  if (categoryContext === "clothing") {
    return `${CLOTHING_ON_MODEL_MIDDLE}; ${productZoneTryOnSafeCore(crop, analysis)}`;
  }
  const core = productZoneTryOnSafeCore(crop, analysis);
  switch (crop) {
    case "full-body":
      return FULL_BODY_MIDDLE;
    case "upper-thigh":
    case "waist-up":
      return setType === "bra_only"
        ? `${core}; do not invent brief below the reference crop`
        : core;
    case "upper-body":
      if (setType === "bra_only") {
        return `${core}; do not invent brief below the reference crop`;
      }
      if (setType === "bra_brief_set" || setType === "unknown") {
        return `${core}; match only garment zones visible in the reference`;
      }
      return core;
    case "close-up":
      return core;
    default:
      return "";
  }
}

function assessCropRisk(
  crop: SourceModelCrop,
  setType: ProductDescriptionAnalysis["setType"]
): SourceFramingCropRisk {
  if (crop === "close-up") {
    return "high";
  }
  if (
    crop === "upper-body" &&
    (setType === "bra_brief_set" || setType === "unknown")
  ) {
    return "medium";
  }
  return "low";
}

function composeGuidanceText(middle: string): string {
  const composed = `${INTRO} ${middle}. ${TAIL}`;
  if (composed.length <= SOURCE_FRAMING_GUIDANCE_MAX_LEN) {
    return composed;
  }

  const tail = ` ${TAIL}`;
  const budget = SOURCE_FRAMING_GUIDANCE_MAX_LEN - tail.length;
  const head = `${INTRO} ${middle}.`;
  if (head.length > budget) {
    const truncatedHead = head.slice(0, budget - 1).replace(/[,;\s]+$/, "");
    return `${truncatedHead}…${tail}`;
  }
  return `${head}${tail}`;
}

export function hasSourceProductZoneFraming(
  sourceFramingGuidanceEn: string | null | undefined
): boolean {
  return Boolean(sourceFramingGuidanceEn?.trim());
}
