import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import {
  compactEnglishProductDetails,
  resolveLingerieSetType,
  type LingerieSetType,
} from "@/lib/ai/lingerieSetType";

export type FashnGarmentPrepPromptResult = {
  prompt: string;
  summary: string;
  lingerieSetType: LingerieSetType;
  antiOnePieceApplied: boolean;
};

function buildTypeLockForEdit(type: LingerieSetType): {
  block: string;
  antiOnePieceApplied: boolean;
} {
  switch (type) {
    case "bra_brief_set":
      return {
        block:
          "Preserve a TWO-PIECE lingerie set with a separate bra and separate high-waisted brief. Keep any visible skin gap between top and bottom. Do not connect, merge, or convert the set into a bodysuit, teddy, or one-piece garment.",
        antiOnePieceApplied: true,
      };
    case "bikini_set":
      return {
        block:
          "Preserve a TWO-PIECE bikini set with separate top and bottom. Do not merge into a one-piece swimsuit.",
        antiOnePieceApplied: true,
      };
    case "bra_only":
      return {
        block: "Preserve bra/top only. Do not invent matching briefs or a one-piece garment.",
        antiOnePieceApplied: false,
      };
    case "brief_only":
      return {
        block:
          "Preserve brief/bottom only. Do not invent a matching bra or one-piece garment.",
        antiOnePieceApplied: false,
      };
    case "bodysuit":
    case "teddy":
    case "swimsuit_one_piece":
    case "corset":
      return {
        block:
          "Preserve this as a ONE-PIECE garment. Do not split it into separate bra and brief pieces.",
        antiOnePieceApplied: false,
      };
    default:
      return {
        block:
          "Do not redesign, merge, connect, recolor, simplify, or convert the garment into a different garment type.",
        antiOnePieceApplied: false,
      };
  }
}

/** Lingerie garment reference preparation prompt for FASHN Edit. */
export function buildFashnGarmentPrepPrompt(input: {
  productAnalysis?: ProductDescriptionAnalysis | null;
}): FashnGarmentPrepPromptResult {
  const analysis = input.productAnalysis ?? null;
  const lingerieInfo = analysis
    ? resolveLingerieSetType(analysis)
    : {
        lingerieSetType: "bra_brief_set" as const,
        lingerieSetTypeConfidence: 0.5,
        lingerieSetTypeReason: "Default lingerie prep without analysis.",
        source: "fallback" as const,
      };

  const typeLock = buildTypeLockForEdit(lingerieInfo.lingerieSetType);
  const detail = analysis ? compactEnglishProductDetails(analysis) : null;

  const prompt = [
    "Prepare this product image as a clear garment reference for virtual try-on.",
    typeLock.block,
    detail
      ? `Preserve ${detail}.`
      : "Preserve bra geometry, brief geometry, lace pattern, colors, straps, waistband, and overall fit.",
    "Make the garment shape clearer and easier to read for try-on.",
    "Do not redesign, recolor, simplify, replace, or invent a different garment. No text, logos, or watermark.",
  ].join(" ");

  const summary = `lingerie prep (${lingerieInfo.lingerieSetType}): clarify garment reference; anti-merge=${typeLock.antiOnePieceApplied}`;

  return {
    prompt,
    summary,
    lingerieSetType: lingerieInfo.lingerieSetType,
    antiOnePieceApplied: typeLock.antiOnePieceApplied,
  };
}

/** @deprecated Use buildFashnGarmentPrepPrompt() — kept for tests referencing static prompt shape. */
export const FASHN_GARMENT_PREP_PROMPT = buildFashnGarmentPrepPrompt({})
  .prompt;

export const FASHN_GARMENT_PREP_PROMPT_SUMMARY = buildFashnGarmentPrepPrompt({})
  .summary;
