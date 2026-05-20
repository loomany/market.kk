import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import {
  compactEnglishProductDetails,
  resolveLingerieSetType,
} from "@/lib/ai/lingerieSetType";

export function buildTryOnRepairPrompt(
  analysis: ProductDescriptionAnalysis,
  _userDescriptionRu?: string
): string {
  if (analysis.categoryContext === "lingerie") {
    const lingerie = resolveLingerieSetType(analysis);
    const detail = compactEnglishProductDetails(analysis);
    const sentences = [
      "Improve this adult e-commerce lingerie try-on result. Keep the same model, face, pose and body.",
    ];

    if (lingerie.lingerieSetType === "bra_brief_set") {
      sentences.push(
        "Keep the lingerie as a TWO-PIECE set with a separate bra and separate high-waisted brief. Do not turn it into a bodysuit, teddy, swimsuit, or one-piece garment. Preserve a visible natural skin gap between the bra and the brief."
      );
    } else if (lingerie.lingerieSetType === "bra_only") {
      sentences.push(
        "Apply only the bra/top. Do not invent matching briefs or merge into a one-piece garment."
      );
    } else if (lingerie.lingerieSetType === "brief_only") {
      sentences.push(
        "Apply only the brief/bottom. Do not invent a matching bra or merge into a one-piece garment."
      );
    } else if (
      lingerie.lingerieSetType === "bodysuit" ||
      lingerie.lingerieSetType === "teddy" ||
      lingerie.lingerieSetType === "swimsuit_one_piece"
    ) {
      sentences.push(
        "Keep this as a ONE-PIECE garment. Do not split it into separate bra and brief pieces."
      );
    } else {
      sentences.push(
        "Do not change the garment type. Do not merge separate pieces into a one-piece garment."
      );
    }

    if (detail) {
      sentences.push(`Preserve ${detail}.`);
    }

    sentences.push(
      "Fix garment realism: natural cup shape, realistic lace edges, correct brief fit, natural shadows and fabric integration.",
      "Do not turn the briefs into leggings, shorts, skirt, dress, bodysuit, teddy, or low-rise bottoms.",
      "Non-explicit marketplace catalog image."
    );

    return sentences.join(" ");
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
