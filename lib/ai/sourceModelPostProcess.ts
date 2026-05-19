import type {
  ProductSourceModel,
  SourceModelSizeClass,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import { MODEL_CAMERA_ANGLE_PROMPT_MAX } from "@/lib/ai/modelCustomParams";
import { translateSourceModelPoseEnToRu } from "@/lib/studio/sourceModelPoseRu";

const PRODUCT_DETAIL_IN_PROMPT =
  /\b(lace|black\s+base|turquoise|green\s+embroidery|floral\s+pattern|product\s+design|bra\s+color|brief\s+color|embroider|patterned|lace\s+trim|sku)\b/i;

const IDENTITY_IN_PROMPT =
  /\b(same\s+person|same\s+woman|copy\s+(the\s+)?face|identical\s+face|look\s+like\s+the\s+photo|recognizable)\b/i;

export function isSourceModelPopulated(
  sourceModel: ProductSourceModel | null | undefined
): boolean {
  if (!sourceModel) return false;
  return Boolean(
    sourceModel.bodyType?.trim() ||
      (sourceModel.sizeClass && sourceModel.sizeClass !== "unknown") ||
      sourceModel.pose?.trim() ||
      (sourceModel.crop && sourceModel.crop !== "unknown") ||
      sourceModel.cameraAngle?.trim() ||
      sourceModel.handsPosition?.trim() ||
      sourceModel.framing?.trim() ||
      sourceModel.bodyVisibility?.trim()
  );
}

export function promptEnContainsProductDetails(text: string): boolean {
  return PRODUCT_DETAIL_IN_PROMPT.test(text);
}

function sizeClassPhrase(sizeClass: SourceModelSizeClass | null): string | null {
  switch (sizeClass) {
    case "plus-size":
      return "plus-size curvy hourglass proportions";
    case "curvy":
      return "curvy hourglass proportions";
    case "xl":
      return "size XL fuller frame with natural curves";
    case "2xl":
      return "size 2XL extended plus proportions";
    case "slim":
      return "slim slender proportions";
    case "petite":
      return "petite smaller frame";
    case "standard":
      return "standard commercial model proportions";
    default:
      return null;
  }
}

/** Safe English prompt from structured fields only — no garment colors/design. */
export function buildSourceModelCameraAnglePrompt(
  sourceModel: ProductSourceModel
): string | undefined {
  const parts = [
    sourceModel.cameraAngle?.trim(),
    sourceModel.handsPosition?.trim()
      ? `hands ${sourceModel.handsPosition.trim()}`
      : null,
  ].filter(Boolean) as string[];

  if (parts.length === 0) return undefined;

  const text = parts.join(", ");
  if (text.length <= MODEL_CAMERA_ANGLE_PROMPT_MAX) return text;
  return `${text.slice(0, MODEL_CAMERA_ANGLE_PROMPT_MAX - 1)}…`;
}

export function buildSourceModelPromptEn(
  sourceModel: ProductSourceModel
): string {
  const parts: string[] = [
    "Create a new synthetic adult fashion model with a new face and new identity.",
  ];

  const body = sourceModel.bodyType?.trim() || sizeClassPhrase(sourceModel.sizeClass);
  if (body) {
    parts.push(`Match similar body proportions: ${body}.`);
  }

  if (sourceModel.pose?.trim()) {
    parts.push(`Match similar pose: ${sourceModel.pose.trim()}.`);
  }

  if (sourceModel.cameraAngle?.trim()) {
    parts.push(`Camera: ${sourceModel.cameraAngle.trim()}.`);
  }

  if (sourceModel.handsPosition?.trim()) {
    parts.push(`Hands: ${sourceModel.handsPosition.trim()}.`);
  }

  if (sourceModel.bodyVisibility?.trim()) {
    parts.push(`Body visibility: ${sourceModel.bodyVisibility.trim()}.`);
  }

  parts.push(
    "Do not copy the original person's face, identity, likeness, tattoos, skin marks, jewelry, or recognizable features.",
    "Do not recreate or pre-wear the marketplace garment; virtual try-on will apply the product later."
  );

  return parts.join(" ");
}

export function sanitizeSourceModelPromptEn(
  promptEn: string | null | undefined
): string | null {
  if (!promptEn?.trim()) return null;
  if (promptEnContainsProductDetails(promptEn) || IDENTITY_IN_PROMPT.test(promptEn)) {
    return null;
  }
  return promptEn.trim().slice(0, 900);
}

export function finalizeSourceModel(
  analysis: {
    sourcePresentation: "on-model" | "flat-lay" | "unknown";
    sourceModel: ProductSourceModel | null;
  }
): ProductSourceModel | null {
  if (analysis.sourcePresentation !== "on-model") {
    return null;
  }

  const raw = analysis.sourceModel;
  if (!raw || !isSourceModelPopulated(raw)) {
    return null;
  }

  let promptEn =
    sanitizeSourceModelPromptEn(raw.promptEn) ?? buildSourceModelPromptEn(raw);

  if (promptEnContainsProductDetails(promptEn)) {
    promptEn = buildSourceModelPromptEn(raw);
  }

  const poseRu =
    raw.poseRu?.trim() ||
    (raw.pose?.trim() ? translateSourceModelPoseEnToRu(raw.pose) : null) ||
    null;

  return {
    ...raw,
    poseRu,
    promptEn,
  };
}
