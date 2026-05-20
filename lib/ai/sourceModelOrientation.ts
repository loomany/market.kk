import type { ProductSourceModel } from "@/lib/ai/productDescriptionAnalysisSchemas";

export type SourceModelOrientation = "front" | "back" | "side" | "three-quarter";

const ORIENTATION_SIGNALS: ReadonlyArray<{
  orientation: SourceModelOrientation;
  pattern: RegExp;
}> = [
  {
    orientation: "back",
    pattern:
      /\b(back view|from behind|rear view|facing away|back to (?:the )?camera|back toward(?:s)? (?:the )?camera|back-facing|view from behind|вид сзади|спиной|со спины|сзади)\b/i,
  },
  {
    orientation: "side",
    pattern:
      /\b(side view|profile view|lateral view|from the side|side profile|боком|профиль|вид сбоку|сбоку)\b/i,
  },
  {
    orientation: "three-quarter",
    pattern:
      /\b(three[- ]?quarter|3\/4 view|полуоборот|torso slightly angled|slight(?:ly)? angle(?:d)?|angled toward)\b/i,
  },
  {
    orientation: "front",
    pattern:
      /\b(front view|front-facing|facing (?:the )?camera|straight-on|toward (?:the )?camera|анфас|фронт|лицом)\b/i,
  },
];

/** Seated / reclining / front hand-on-chest — still blocked; orientation may be kept. */
export function isUnsafeTryOnPosePhrase(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return /\b(seated|sitting|reclin|lying down|on (?:a )?sofa|on (?:a )?bed|hand on chest|hands on chest|hand-over-chest|hand resting on (?:the )?chest)\b/i.test(
    text
  );
}

function orientationBlob(source: ProductSourceModel | null | undefined): string {
  if (!source) return "";
  return [
    source.pose,
    source.cameraAngle,
    source.handsPosition,
    source.framing,
    source.descriptionRu,
    source.promptEn,
  ]
    .filter((s): s is string => Boolean(s?.trim()))
    .join(" ");
}

export function deriveSourceModelOrientation(
  source: ProductSourceModel | null | undefined
): SourceModelOrientation {
  const blob = orientationBlob(source);
  if (!blob.trim()) return "front";

  if (ORIENTATION_SIGNALS[0].pattern.test(blob)) return "back";
  if (ORIENTATION_SIGNALS[1].pattern.test(blob)) return "side";
  // Front-facing catalog beats weak "slightly angled" hints on otherwise frontal photos.
  if (ORIENTATION_SIGNALS[3].pattern.test(blob)) return "front";
  if (ORIENTATION_SIGNALS[2].pattern.test(blob)) return "three-quarter";
  return "front";
}

export function deriveSourceModelOrientationFromRequest(input: {
  sourceModelPose?: string | null;
  sourceModelCameraAngle?: string | null;
  sourceModelHandsPosition?: string | null;
  sourceModelFraming?: string | null;
  sourceModelPromptEn?: string | null;
}): SourceModelOrientation {
  return deriveSourceModelOrientation({
    pose: input.sourceModelPose ?? null,
    cameraAngle: input.sourceModelCameraAngle ?? null,
    handsPosition: input.sourceModelHandsPosition ?? null,
    framing: input.sourceModelFraming ?? null,
    descriptionRu: null,
    promptEn: input.sourceModelPromptEn ?? null,
    bodyType: null,
    sizeClass: null,
    poseRu: null,
    crop: null,
    bodyVisibility: null,
  });
}

export function sourceModelOrientationPoseEn(
  orientation: SourceModelOrientation
): string {
  switch (orientation) {
    case "back":
      return "standing back view — model faces away from the camera, back shoulders and garment back band fully visible";
    case "side":
      return "standing side profile — body turned 90 degrees to the camera, side silhouette and garment side seams visible";
    case "three-quarter":
      return "standing three-quarter view toward the camera — subtle torso angle matching a catalog half-turn";
    default:
      return "standing front-facing toward the camera";
  }
}

export function sourceModelOrientationHeadEn(
  orientation: SourceModelOrientation
): string {
  switch (orientation) {
    case "back":
      return "entire head visible from behind — back of head, hair, and nape in frame with generous headroom; do not require forehead or front face when the merchant photo is a back view";
    case "side":
      return "entire head in profile — full face profile from hairline through chin visible, generous headroom above hair";
    default:
      return "entire head and full face visible from hairline through chin with generous headroom above hair";
  }
}

export function productZoneMatchMerchantOrientationEn(
  orientation: SourceModelOrientation
): string {
  return `Match the merchant product photo body orientation exactly — ${sourceModelOrientationPoseEn(orientation)}; ${sourceModelOrientationHeadEn(orientation)}; do not rotate a back or side reference to front-facing`;
}

export function productZoneOrientationHandsEn(
  orientation: SourceModelOrientation,
  handsPosition?: string | null
): string {
  const refHands = handsPosition?.trim();
  if (orientation === "back" && refHands) {
    return `Hands may follow the merchant back-view placement (${refHands}) when they do not hide the bra back band or closures; never seated, never hand-on-chest`;
  }
  if (orientation === "side" && refHands) {
    return `Hands may follow the merchant side-view placement (${refHands}) along the outer silhouette when garment zones stay visible`;
  }
  return "arms relaxed along outer sides, hands near outer thighs, not on chest, stomach, waist, or briefs";
}
