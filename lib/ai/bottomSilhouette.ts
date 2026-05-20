/**
 * Derived bottom fit silhouette from product analysis (MVP — no Vision schema change).
 *
 * Reads only structured + whitelisted signal fields; maps to closed enums via regex.
 * Never echoes Vision free-text into generate-model output.
 */

import {
  PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD,
  type ProductDescriptionAnalysis,
} from "@/lib/ai/productDescriptionAnalysisSchemas";

export type WaistHeight = "high_waist" | "mid_rise" | "low_rise" | "unknown";
export type SideCoverage =
  | "wide_side_panel"
  | "medium_side"
  | "thin_side"
  | "unknown";
export type FrontCoverage =
  | "full_front"
  | "medium_front"
  | "minimal_front"
  | "unknown";
export type LegOpening = "low_cut" | "medium_cut" | "high_cut" | "unknown";
export type BriefType =
  | "brief"
  | "bikini"
  | "hipster"
  | "shorts"
  | "thong"
  | "unknown";
export type DominantBaseTone =
  | "black_dark"
  | "nude_light"
  | "white_light"
  | "colored"
  | "unknown";

export type BottomSilhouette = {
  waistHeight: WaistHeight;
  sideCoverage: SideCoverage;
  frontCoverage: FrontCoverage;
  legOpening: LegOpening;
  briefType: BriefType;
  dominantBaseTone: DominantBaseTone;
  confidence: number;
};

function lc(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

/** Silhouette signals only — includes mustPreserve/fitNotes for regex, never copied to output. */
export function collectBottomSignalText(
  analysis: ProductDescriptionAnalysis
): string {
  return [
    analysis.bottoms.style,
    analysis.bottoms.rise,
    analysis.shortAiSummaryEn,
    ...analysis.fitNotes,
    ...analysis.mustPreserve,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .toLowerCase();
}

export function mapDominantBaseTone(
  baseColor: string | null | undefined
): DominantBaseTone {
  const t = lc(baseColor);
  if (!t) return "unknown";
  if (/\bblack\b|\bdark\b|\bcharcoal\b|\bnavy\b|\bdeep\s+black\b/.test(t)) {
    return "black_dark";
  }
  if (/\bnude\b|\bbeige\b|\bskin[\s-]?tone\b|\btan\b|\blight\s+neutral\b/.test(t)) {
    return "nude_light";
  }
  if (/\bwhite\b|\bivory\b|\bcream\b|\boff[\s-]?white\b/.test(t)) {
    return "white_light";
  }
  if (/\bcolou?red\b|\bpink\b|\bred\b|\bblue\b|\bgreen\b/.test(t)) {
    return "colored";
  }
  return "unknown";
}

function mapWaistHeight(
  rise: string | null | undefined,
  style: string | null | undefined,
  text: string
): WaistHeight {
  const t = `${lc(rise)} ${lc(style)} ${text}`;
  if (
    /\bhigh[\s-]?waist(?:ed)?\b|\bhigh[\s-]?rise\b|\bretro\s+waist\b|\bcontrol\s+waist\b/.test(
      t
    )
  ) {
    return "high_waist";
  }
  if (/\bmid[\s-]?(?:rise|waist)\b|\bnatural\s+waist(?:line)?\b/.test(t)) {
    return "mid_rise";
  }
  if (/\blow[\s-]?(?:rise|waist)\b|\bhipster\b|\bhip[\s-]?hugger\b/.test(t)) {
    return "low_rise";
  }
  return "unknown";
}

function mapBriefType(style: string | null | undefined, text: string): BriefType {
  const t = `${lc(style)} ${text}`;
  if (/\bthong\b|\bg[\s-]?string\b/.test(t)) return "thong";
  if (/\bboyshort\b|\bshort[\s-]?style\b|\bbiker\b/.test(t)) return "shorts";
  if (/\bhipster\b/.test(t)) return "hipster";
  if (/\bbikini\b/.test(t)) return "bikini";
  if (/\bbrief\b/.test(t)) return "brief";
  return "unknown";
}

function mapSideCoverage(text: string): SideCoverage {
  if (
    /\bwide\s+side|\bbroad\s+side|\bfull\s+side\s+(?:panel|coverage)|\bside\s+panels?\b|\bwide\s+(?:black\s+)?side\s+panel|\bstructured\s+side/.test(
      text
    )
  ) {
    return "wide_side_panel";
  }
  if (/\bthin\s+side|\bnarrow\s+side|\bminimal\s+side\s+edge/.test(text)) {
    return "thin_side";
  }
  if (/\bmedium\s+side|\bstandard\s+side\b/.test(text)) {
    return "medium_side";
  }
  return "unknown";
}

function mapFrontCoverage(text: string): FrontCoverage {
  if (
    /\bfull\s+front|\bhigh\s+front|\btall\s+front|\bcentral\s+front\s+panel|\bfull\s+front\s+coverage|\bpronounced\s+front/.test(
      text
    )
  ) {
    return "full_front";
  }
  if (/\bmedium\s+front|\bmoderate\s+front/.test(text)) {
    return "medium_front";
  }
  if (/\bminimal\s+front|\blow\s+front/.test(text)) {
    return "minimal_front";
  }
  return "unknown";
}

function mapLegOpening(text: string): LegOpening {
  if (/\bhigh[\s-]?cut\s+leg\b|\bhigh\s+leg\s+(?:line|opening)\b/.test(text)) {
    return "high_cut";
  }
  if (
    /\blow[\s-]?cut\s+leg\b|\blow\s+leg\s+(?:line|opening)\b|\blower\s+leg\s+opening/.test(
      text
    )
  ) {
    return "low_cut";
  }
  if (
    /\bmedium[\s-]?(?:to[\s-]?low\s+)?leg\b|\bstandard\s+leg\b|\bmedium\s+leg\s+opening/.test(
      text
    )
  ) {
    return "medium_cut";
  }
  return "unknown";
}

/**
 * Structured dark high-waist brief sets often omit side-panel vocabulary in
 * fitNotes; apply conservative defaults only when analysis is confident.
 */
function applyStructuredBriefDefaults(
  silhouette: BottomSilhouette
): BottomSilhouette {
  if (silhouette.confidence < PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD) {
    return silhouette;
  }
  if (silhouette.waistHeight !== "high_waist" || silhouette.briefType !== "brief") {
    return silhouette;
  }
  if (silhouette.dominantBaseTone !== "black_dark") {
    return silhouette;
  }

  return {
    ...silhouette,
    sideCoverage:
      silhouette.sideCoverage === "unknown"
        ? "wide_side_panel"
        : silhouette.sideCoverage,
    frontCoverage:
      silhouette.frontCoverage === "unknown"
        ? "full_front"
        : silhouette.frontCoverage,
    legOpening:
      silhouette.legOpening === "unknown"
        ? "medium_cut"
        : silhouette.legOpening,
  };
}

export function deriveBottomSilhouetteFromAnalysis(
  analysis: ProductDescriptionAnalysis
): BottomSilhouette {
  const text = collectBottomSignalText(analysis);
  const waistHeight = mapWaistHeight(
    analysis.bottoms.rise,
    analysis.bottoms.style,
    text
  );
  const briefType = mapBriefType(analysis.bottoms.style, text);

  const silhouette: BottomSilhouette = {
    waistHeight,
    sideCoverage: mapSideCoverage(text),
    frontCoverage: mapFrontCoverage(text),
    legOpening: mapLegOpening(text),
    briefType,
    dominantBaseTone: mapDominantBaseTone(analysis.baseColor),
    confidence: analysis.confidence,
  };

  return applyStructuredBriefDefaults(silhouette);
}

export function bottomSilhouetteHasBottomSignal(
  silhouette: BottomSilhouette
): boolean {
  return (
    silhouette.waistHeight !== "unknown" ||
    silhouette.sideCoverage !== "unknown" ||
    silhouette.frontCoverage !== "unknown" ||
    silhouette.legOpening !== "unknown" ||
    silhouette.briefType !== "unknown"
  );
}

export function hasConfidentBottomSilhouette(
  silhouette: BottomSilhouette
): boolean {
  if (silhouette.confidence < PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD) {
    return false;
  }
  if (silhouette.waistHeight === "unknown") {
    return false;
  }
  return bottomSilhouetteHasBottomSignal(silhouette);
}
