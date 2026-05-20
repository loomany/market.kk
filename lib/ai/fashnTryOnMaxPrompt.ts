import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import {
  compactEnglishProductDetails,
  isOnePieceLingerieSetType,
  isTwoPieceLingerieSetType,
  resolveLingerieSetType,
  type LingerieSetType,
} from "@/lib/ai/lingerieSetType";

export type FashnTryOnMaxPromptResult = {
  prompt: string;
  garmentTypeLockApplied: boolean;
  antiOnePieceApplied: boolean;
  lingerieSetType: LingerieSetType;
};

function buildGarmentTypeLockSentence(type: LingerieSetType): {
  sentence: string;
  garmentTypeLockApplied: boolean;
  antiOnePieceApplied: boolean;
} {
  switch (type) {
    case "bra_brief_set":
      return {
        sentence:
          "This is a TWO-PIECE lingerie set with a separate bra and separate high-waisted brief — do NOT turn it into a bodysuit, teddy, swimsuit, corset, or one-piece garment, and keep a visible natural skin gap between the bra and the brief.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: true,
      };
    case "bikini_set":
      return {
        sentence:
          "This is a TWO-PIECE bikini set: separate bikini top and separate bikini bottom. Do NOT merge them into a one-piece swimsuit.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: true,
      };
    case "bra_only":
      return {
        sentence:
          "This is a bra/top only. Apply only the bra. Do not invent matching briefs, bottoms, or a one-piece garment.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: false,
      };
    case "brief_only":
      return {
        sentence:
          "This is a brief/bottom only. Apply only the brief or panty. Do not invent a matching bra or one-piece garment.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: false,
      };
    case "bodysuit":
    case "teddy":
      return {
        sentence:
          "This is a ONE-PIECE bodysuit/teddy lingerie garment. Keep it as one connected piece; do not split it into separate bra and brief.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: false,
      };
    case "swimsuit_one_piece":
      return {
        sentence:
          "This is a ONE-PIECE swimsuit. Keep it as one connected garment; do not split into separate top and bottom.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: false,
      };
    case "corset":
      return {
        sentence:
          "This is a corset/bustier garment. Preserve its structured one-piece silhouette and do not convert it into a bra-and-brief set.",
        garmentTypeLockApplied: true,
        antiOnePieceApplied: false,
      };
    default:
      return {
        sentence:
          "Preserve the exact garment type from the product image. Do not change a two-piece set into a one-piece garment or vice versa.",
        garmentTypeLockApplied: false,
        antiOnePieceApplied: false,
      };
  }
}

function buildVisualFidelitySentence(
  analysis: ProductDescriptionAnalysis | null
): string | null {
  if (!analysis) return null;
  const compact = compactEnglishProductDetails(analysis);
  if (compact) {
    return `Preserve ${compact}.`;
  }
  return null;
}

function buildOnModelHint(garmentPhotoType: string | undefined): string | null {
  if (garmentPhotoType === "model") {
    return "The product reference shows the garment worn on a model; transfer only the garment design, not the original model body.";
  }
  if (garmentPhotoType === "flat-lay") {
    return "Keep natural drape and proportions when placing the flat product onto the model.";
  }
  return null;
}

/**
 * Try-On Max prompt — garment type lock first, then compact English fidelity.
 */
export function buildFashnTryOnMaxPrompt(input: {
  productAnalysis: ProductDescriptionAnalysis | null;
  userDescriptionRu?: string;
  userEdited?: boolean;
  category?: string;
  garmentPhotoType?: string;
}): FashnTryOnMaxPromptResult {
  const analysis = input.productAnalysis;
  const garmentPhotoType =
    input.garmentPhotoType ??
    analysis?.garmentPhotoType ??
    "auto";

  const lingerieInfo = analysis
    ? resolveLingerieSetType(analysis)
    : {
        lingerieSetType: "unknown" as const,
        lingerieSetTypeConfidence: 0,
        lingerieSetTypeReason: "No product analysis.",
        source: "fallback" as const,
      };

  const typeLock = buildGarmentTypeLockSentence(lingerieInfo.lingerieSetType);
  const sentences: string[] = [typeLock.sentence];

  const fidelity = buildVisualFidelitySentence(analysis);
  if (fidelity) {
    sentences.push(fidelity);
  }

  const onModelHint = buildOnModelHint(garmentPhotoType);
  if (sentences.length < 3 && onModelHint && !fidelity) {
    sentences.push(onModelHint);
  }

  if (
    sentences.length < 3 &&
    isTwoPieceLingerieSetType(lingerieInfo.lingerieSetType) &&
    analysis?.bottoms.rise
  ) {
    sentences.push(
      `Keep the ${analysis.bottoms.rise} brief as a separate bottom with its own waistband and leg openings.`
    );
  } else if (
    sentences.length < 3 &&
    isOnePieceLingerieSetType(lingerieInfo.lingerieSetType)
  ) {
    sentences.push("Do not add a visible skin gap or separate brief area.");
  } else if (sentences.length < 3 && onModelHint) {
    sentences.push(onModelHint);
  }

  return {
    prompt: sentences.slice(0, 3).join(" "),
    garmentTypeLockApplied: typeLock.garmentTypeLockApplied,
    antiOnePieceApplied: typeLock.antiOnePieceApplied,
    lingerieSetType: lingerieInfo.lingerieSetType,
  };
}
