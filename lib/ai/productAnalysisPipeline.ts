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
  userDescriptionRu?: string
): string {
  const preserve = analysis.mustPreserve.length
    ? analysis.mustPreserve.join("; ")
    : "exact product colors, pattern, and garment design";
  const fit = analysis.fitNotes.length
    ? analysis.fitNotes.join("; ")
    : "natural fabric integration on the model body";

  const desc = userDescriptionRu?.trim() || analysis.descriptionRu;

  return [
    "Refine this e-commerce try-on result for marketplace catalog quality.",
    `Product: ${analysis.shortAiSummaryEn}`,
    desc ? `Merchant description: ${desc.slice(0, 280)}` : "",
    `MUST preserve: ${preserve}.`,
    `Fit: ${fit}.`,
    "Improve natural fabric integration and realistic shadows; reduce pasted-on look.",
    "Do NOT change product design, lace placement, strap width, cup depth, or brief rise.",
    "Do NOT change base color or accent lace colors.",
    "Commercial catalog, non-explicit, no text or watermark.",
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
