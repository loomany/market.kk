/** Merchant product body orientation from Vision / analysis. */
export type ProductView =
  | "front"
  | "back"
  | "side"
  | "three_quarter"
  | "unknown";

/** Target pose for AI model generation before FASHN Try-On. */
export type ResolvedModelPose =
  | "front"
  | "back_view"
  | "side_view"
  | "three_quarter"
  | "safe_front";

export type PoseSource = "auto" | "manual" | "fallback";

export type ProductViewResolverResult = {
  productView: ProductView;
  detectedProductViewConfidence: number | null;
  resolvedModelPose: ResolvedModelPose;
  poseSource: PoseSource;
  reason: string;
  warnings: string[];
};
