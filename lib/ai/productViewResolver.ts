import type { ProductSourceModel } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { ModelPose } from "@/components/studio/types";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import { deriveSourceModelOrientation } from "@/lib/ai/sourceModelOrientation";
import type {
  PoseSource,
  ProductView,
  ProductViewResolverResult,
  ResolvedModelPose,
} from "@/lib/ai/productViewTypes";

export type ResolveModelPoseInput = {
  uiPose: ModelPose;
  poseCustom?: string | null;
  productView: ProductView;
  /** Vision analysis confidence 0–1 when available */
  productViewConfidence?: number | null;
  sourceModel?: ProductSourceModel | null;
};

function orientationToProductView(
  orientation: ReturnType<typeof deriveSourceModelOrientation>
): ProductView {
  switch (orientation) {
    case "back":
      return "back";
    case "side":
      return "side";
    case "three-quarter":
      return "three_quarter";
    case "front":
      return "front";
    default:
      return "unknown";
  }
}

/** Derive merchant product view from structured sourceModel fields only. */
function sourceOrientationBlob(source: ProductSourceModel): string {
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

export function deriveProductView(
  source: ProductSourceModel | null | undefined
): ProductView {
  if (!source) return "unknown";
  if (!sourceOrientationBlob(source).trim()) return "unknown";
  return orientationToProductView(deriveSourceModelOrientation(source));
}

function resolvedPoseFromProductView(productView: ProductView): ResolvedModelPose {
  switch (productView) {
    case "back":
      return "back_view";
    case "side":
      return "side_view";
    case "three_quarter":
      return "three_quarter";
    case "front":
      return "front";
    default:
      return "safe_front";
  }
}

function manualResolvedPoseFromUi(
  uiPose: ModelPose,
  poseCustom?: string | null
): ResolvedModelPose | null {
  if (uiPose === "auto") return null;
  if (uiPose === "front") return "front";
  if (uiPose === "slight-angle") return "three_quarter";
  const custom = poseCustom?.trim() ?? "";
  if (!custom) return "safe_front";
  const t = custom.toLowerCase();
  if (/\b(back view|from behind|rear view|facing away|спиной|со спины|сзади|вид сзади)\b/i.test(t)) {
    return "back_view";
  }
  if (/\b(side view|profile|боком|сбоку|вид сбоку)\b/i.test(t)) {
    return "side_view";
  }
  if (/\b(three[- ]?quarter|3\/4|полуоборот)\b/i.test(t)) {
    return "three_quarter";
  }
  if (/\b(front[- ]?facing|facing (?:the )?camera|анфас|лицом|спереди)\b/i.test(t)) {
    return "front";
  }
  return "safe_front";
}

function manualPoseConflictsProductView(
  manualPose: ResolvedModelPose,
  productView: ProductView
): string | null {
  if (productView === "unknown") return null;
  if (manualPose === "back_view" && productView === "front") {
    return "Product appears to be front-view but selected model pose is back-view.";
  }
  if (manualPose === "front" && productView === "back") {
    return "Product appears to be back-view but selected model pose is front-view.";
  }
  if (manualPose === "side_view" && productView === "front") {
    return "Product appears to be front-view but selected model pose is side-view.";
  }
  if (manualPose === "front" && productView === "side") {
    return "Product appears to be side-view but selected model pose is front-view.";
  }
  return null;
}

export function resolveModelPose(input: ResolveModelPoseInput): ProductViewResolverResult {
  const productView = input.productView;
  const detectedProductViewConfidence =
    input.productViewConfidence ?? null;
  const warnings: string[] = [];

  const manual = manualResolvedPoseFromUi(input.uiPose, input.poseCustom);
  if (manual !== null) {
    const conflict = manualPoseConflictsProductView(manual, productView);
    if (conflict) warnings.push(conflict);
    return {
      productView,
      detectedProductViewConfidence,
      resolvedModelPose: manual,
      poseSource: "manual",
      reason: `uiPose=${input.uiPose}${input.poseCustom?.trim() ? " with custom text" : ""}`,
      warnings,
    };
  }

  if (productView === "unknown") {
    return {
      productView,
      detectedProductViewConfidence,
      resolvedModelPose: "safe_front",
      poseSource: "fallback",
      reason: "productView unknown — safe front catalog pose",
      warnings,
    };
  }

  const resolvedModelPose = resolvedPoseFromProductView(productView);
  return {
    productView,
    detectedProductViewConfidence,
    resolvedModelPose,
    poseSource: "auto",
    reason: `productView=${productView} → resolvedModelPose=${resolvedModelPose}`,
    warnings,
  };
}

export function deriveProductViewFromRequest(input: {
  sourceModelPose?: string | null;
  sourceModelCameraAngle?: string | null;
  sourceModelHandsPosition?: string | null;
  sourceModelFraming?: string | null;
  sourceModelPromptEn?: string | null;
  productView?: ProductView;
}): ProductView {
  if (input.productView) return input.productView;
  return deriveProductView({
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

export function effectiveResolvedModelPoseFromRequest(input: {
  pose: ModelPose;
  poseCustom?: string | null;
  productView?: ProductView;
  resolvedModelPose?: ResolvedModelPose;
  sourceModelPose?: string | null;
  sourceModelCameraAngle?: string | null;
  sourceModelHandsPosition?: string | null;
  sourceModelFraming?: string | null;
  sourceModelPromptEn?: string | null;
}): ResolvedModelPose {
  if (input.resolvedModelPose) return input.resolvedModelPose;
  return resolveModelPose({
    uiPose: input.pose,
    poseCustom: input.poseCustom,
    productView: deriveProductViewFromRequest(input),
  }).resolvedModelPose;
}

export function buildProductViewResolverInput(
  source: ProductSourceModel | null | undefined,
  options: {
    confidence?: number | null;
    uiPose: ModelPose;
    poseCustom?: string | null;
  }
): ResolveModelPoseInput {
  return {
    uiPose: options.uiPose,
    poseCustom: options.poseCustom,
    productView: deriveProductView(source),
    productViewConfidence: options.confidence,
    sourceModel: source,
  };
}
