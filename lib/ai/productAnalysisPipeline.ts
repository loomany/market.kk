import "server-only";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";

export {
  effectiveProductDescriptionRu,
  productAnalysisForModelGeneration,
  resolveCategoryContext,
  resolveTryOnGarmentSettings,
  type ProductAnalysisUiOverrides,
} from "@/lib/ai/productAnalysisShared";

export function buildTryOnRepairPrompt(
  analysis: ProductDescriptionAnalysis,
  _userDescriptionRu?: string
): string {
  if (analysis.categoryContext === "lingerie") {
    return [
      "Improve this adult e-commerce lingerie try-on result. Keep the same model, face, pose and body.",
      "Preserve the uploaded product design: black base, emerald/turquoise floral lace, wide straps, supportive bra cups, high-waist brief.",
      "Fix garment realism: natural cup shape, realistic lace edges, correct high-waist brief fit, natural shadows and fabric integration.",
      "Do not turn the briefs into leggings, shorts, skirt, dress, or low-rise bottoms.",
      "Non-explicit marketplace catalog image.",
    ].join(" ");
  }

  const preserve = analysis.mustPreserve.slice(0, 6).join(", ");
  return [
    "Improve this adult e-commerce try-on result. Keep the same model, face, pose and body.",
    preserve ? `Preserve: ${preserve}.` : "",
    "Fix natural fabric integration and shadows; reduce pasted-on look.",
    "Non-explicit marketplace catalog image.",
  ]
    .filter(Boolean)
    .join(" ");
}

export const TRY_ON_JUDGE_CRITERIA = [
  "product fidelity vs source garment",
  "correct base color",
  "correct accent/lace color",
  "cup shape preserved",
  "straps preserved",
  "high-waist fit preserved when applicable",
  "lace texture preserved",
  "no pasted-on look",
  "realistic bra fit",
  "realistic bottom fit",
  "commercial image quality",
] as const;

export function buildTryOnJudgeInstructions(
  analysis: ProductDescriptionAnalysis
): string {
  const preserveList = [
    ...analysis.mustPreserve,
    ...TRY_ON_JUDGE_CRITERIA,
  ].join("\n- ");

  return [
    "Compare the try-on result image to the original product garment image.",
    "Score product fidelity, not artistic beauty alone.",
    "Criteria:",
    `- ${preserveList}`,
    analysis.warnings.length
      ? `Warnings from product analysis: ${analysis.warnings.join("; ")}`
      : "",
    "Return JSON: { pass: boolean, score: 0-1, issues: string[], preservedWell: string[] }",
  ].join("\n");
}
