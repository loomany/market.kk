/**
 * Garment fit-aware neutral-base guidance helper.
 *
 * Pure, browser- and server-safe. Turns product analysis + derived
 * `bottomSilhouette` into whitelisted English guidance for generate-model.
 * Never echoes Vision free-text; black is allowed only via frozen constants.
 */

import {
  type BottomSilhouette,
  bottomSilhouetteHasBottomSignal,
  deriveBottomSilhouetteFromAnalysis,
  hasConfidentBottomSilhouette,
  type DominantBaseTone,
} from "@/lib/ai/bottomSilhouette";
import {
  PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD,
  type ProductDescriptionAnalysis,
} from "@/lib/ai/productDescriptionAnalysisSchemas";

export const NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN = 700;

/** Controlled allowlist phrase — black only via this constant, never free-text. */
export const PLAIN_SOLID_BLACK_NEUTRAL_BASE_PHRASE =
  "plain smooth solid black neutral base";

export const PLAIN_NEUTRAL_NUDE_BASE_PHRASE =
  "plain smooth neutral nude-beige base";

export type FitAwareCategoryContext =
  | "lingerie"
  | "clothing"
  | "general"
  | "jewelry";

export type BraCupCoverage =
  | "full_cup"
  | "balconette"
  | "triangle"
  | "sports"
  | "unknown";

export type StrapWidth =
  | "wide"
  | "medium"
  | "thin"
  | "strapless"
  | "unknown";

export type SupportLevel = "structured" | "soft" | "unknown";

export type DerivedNeutralBaseFitInputs = {
  bra?: {
    cupCoverage: BraCupCoverage;
    strapWidth: StrapWidth;
    supportLevel: SupportLevel;
  };
  bottomSilhouette?: BottomSilhouette;
  dominantBaseTone?: DominantBaseTone;
};

export type NeutralBaseFitGuidance =
  | {
      applied: true;
      text: string;
      inputs: DerivedNeutralBaseFitInputs;
      bottomSilhouette: BottomSilhouette;
      fitAwareBottom: boolean;
      useBlackNeutralBase: boolean;
      reason: string;
    }
  | {
      applied: false;
      text: "";
      inputs?: undefined;
      bottomSilhouette?: undefined;
      fitAwareBottom?: false;
      useBlackNeutralBase?: false;
      reason: string;
    };

export type DeriveNeutralBaseFitInput = {
  analysis: ProductDescriptionAnalysis | null | undefined;
  categoryContext: FitAwareCategoryContext;
};

const NEGATIVE_TAIL =
  "Do not recreate product surface design or SKU-specific accents on the base; keep the base plain and design-neutral. Match fit geometry only.";

const ALLOWED_COLOR_PHRASES: readonly string[] = [
  PLAIN_SOLID_BLACK_NEUTRAL_BASE_PHRASE,
  PLAIN_NEUTRAL_NUDE_BASE_PHRASE,
];

const FORBIDDEN_DESIGN_TOKENS: readonly RegExp[] = [
  /\bcolou?r\b/i,
  /\bcolou?red\b/i,
  /\bblack base\b/i,
  /\bblack\b/i,
  /\bwhite\b/i,
  /\bred\b/i,
  /\bblue\b/i,
  /\bgreen\b/i,
  /\bemerald\b/i,
  /\bturquoise\b/i,
  /\bteal\b/i,
  /\bnavy\b/i,
  /\bbeige\b/i,
  /\bnude\b/i,
  /\blace\b/i,
  /\bfloral\b/i,
  /\bembroider/i,
  /\bscallop/i,
  /\bdecorative\b/i,
  /\bornament/i,
  /\bpattern\b/i,
  /\bprint\b/i,
  /\bprinted\b/i,
  /\blogo\b/i,
  /\bSKU-specific design\b/i,
  /\bgreen accents\b/i,
  /\bdecorative panels\b/i,
];

function lc(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function collectBraSignalText(analysis: ProductDescriptionAnalysis): string {
  return [
    analysis.bra.style,
    analysis.bra.cupShape,
    analysis.bra.straps,
    ...analysis.fitNotes,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .toLowerCase();
}

function mapBraCupCoverage(
  cupShape: string | null | undefined,
  braStyle: string | null | undefined
): BraCupCoverage {
  const t = `${lc(cupShape)} ${lc(braStyle)}`;
  if (/\bfull[\s-]?cup\b|\bfull\s+coverage\b|\bmolded\s+cup\b/.test(t)) {
    return "full_cup";
  }
  if (/\bbalconette\b|\bbalcony\b|\bdemi[\s-]?cup\b/.test(t)) {
    return "balconette";
  }
  if (/\btriangle\b|\bbralette\b|\bsoft\s+cup\b|\bunlined\b/.test(t)) {
    return "triangle";
  }
  if (/\bsports?\s*bra\b|\bathletic\s+bra\b|\bcompression\s+bra\b/.test(t)) {
    return "sports";
  }
  return "unknown";
}

function mapStrapWidth(straps: string | null | undefined): StrapWidth {
  const t = lc(straps);
  if (!t) return "unknown";
  if (/\bstrapless\b|\bbandeau\b/.test(t)) return "strapless";
  if (/\bwide\b|\bthick\b|\bbroad\b/.test(t)) return "wide";
  if (/\bthin\b|\bnarrow\b|\bspaghetti\b|\bstring\s*strap/.test(t)) {
    return "thin";
  }
  if (/\bmedium\b|\bstandard\b|\bregular\b/.test(t)) return "medium";
  return "unknown";
}

function detectSupportLevel(
  braStyle: string | null | undefined,
  fitText: string
): SupportLevel {
  const t = `${lc(braStyle)} ${fitText}`;
  if (/\bsupportive\b|\bstructured\b|\bunderwire\b|\bmolded\b|\bpadded\b/.test(t)) {
    return "structured";
  }
  if (/\bsoft\s+cup\b|\bunlined\b|\bwireless\b|\bwire[\s-]?free\b|\blightly\s+lined\b/.test(t)) {
    return "soft";
  }
  return "unknown";
}

export function scrubAllowedColorPhrases(text: string): string {
  let scrubbed = text;
  for (const phrase of ALLOWED_COLOR_PHRASES) {
    scrubbed = scrubbed.split(phrase).join("");
  }
  return scrubbed;
}

export function containsForbiddenDesignTokens(text: string): boolean {
  const scrubbed = scrubAllowedColorPhrases(text);
  return FORBIDDEN_DESIGN_TOKENS.some((re) => re.test(scrubbed));
}

function composeBottomPhrase(silhouette: BottomSilhouette): string {
  const waistLabel =
    silhouette.waistHeight === "high_waist"
      ? "high-waist"
      : silhouette.waistHeight === "mid_rise"
        ? "mid-rise"
        : silhouette.waistHeight === "low_rise"
          ? "low-rise"
          : "";

  const briefLabel =
    silhouette.briefType === "brief"
      ? "full-brief"
      : silhouette.briefType === "bikini"
        ? "bikini"
        : silhouette.briefType === "hipster"
          ? "hipster"
          : silhouette.briefType === "thong"
            ? "thong"
            : silhouette.briefType === "shorts"
              ? "short-style"
              : "brief";

  const parts: string[] = [];
  if (waistLabel) {
    parts.push(`${waistLabel} ${briefLabel} bottom`);
  } else if (silhouette.briefType !== "unknown") {
    parts.push(`${briefLabel} bottom`);
  }

  if (silhouette.sideCoverage === "wide_side_panel") {
    parts.push("wide side coverage");
  } else if (silhouette.sideCoverage === "medium_side") {
    parts.push("standard side coverage");
  } else if (silhouette.sideCoverage === "thin_side") {
    parts.push("narrow side coverage");
  }

  if (silhouette.frontCoverage === "full_front") {
    parts.push("full front coverage");
  } else if (silhouette.frontCoverage === "medium_front") {
    parts.push("medium front coverage");
  } else if (silhouette.frontCoverage === "minimal_front") {
    parts.push("minimal front coverage");
  }

  if (
    silhouette.legOpening === "medium_cut" ||
    silhouette.legOpening === "low_cut"
  ) {
    parts.push("medium-to-low leg opening");
  } else if (silhouette.legOpening === "high_cut") {
    parts.push("higher leg opening");
  }

  if (silhouette.waistHeight !== "unknown") {
    parts.push("similar waist height");
  }

  return parts.join(", ");
}

function composeBraPhrase(inputs: NonNullable<DerivedNeutralBaseFitInputs["bra"]>): string {
  const parts: string[] = [];
  if (inputs.cupCoverage === "full_cup") {
    parts.push("supportive full-cup bra shape");
  } else if (inputs.cupCoverage === "balconette") {
    parts.push("balconette-style neutral bra shape");
  } else if (inputs.cupCoverage === "triangle") {
    parts.push("soft triangle-style neutral bra shape");
  } else if (inputs.cupCoverage === "sports") {
    parts.push("sports-style neutral bra shape");
  } else if (inputs.supportLevel === "structured") {
    parts.push("supportive neutral bra shape");
  }

  if (inputs.strapWidth === "wide") {
    parts.push("wider shoulder straps");
  } else if (inputs.strapWidth === "medium") {
    parts.push("standard-width shoulder straps");
  } else if (inputs.strapWidth === "thin") {
    parts.push("thinner shoulder straps");
  } else if (inputs.strapWidth === "strapless") {
    parts.push("strapless silhouette");
  }

  return parts.join(" with ");
}

function selectBaseColorPhrase(tone: DominantBaseTone): string {
  if (tone === "black_dark") return PLAIN_SOLID_BLACK_NEUTRAL_BASE_PHRASE;
  return PLAIN_NEUTRAL_NUDE_BASE_PHRASE;
}

function composeGuidanceText(
  inputs: DerivedNeutralBaseFitInputs,
  bottomSilhouette: BottomSilhouette
): string {
  const colorPhrase = selectBaseColorPhrase(
    inputs.dominantBaseTone ?? bottomSilhouette.dominantBaseTone
  );
  const segments: string[] = [];

  if (inputs.bra) {
    const braPhrase = composeBraPhrase(inputs.bra);
    if (braPhrase) segments.push(braPhrase);
  }

  if (inputs.bottomSilhouette && bottomSilhouetteHasBottomSignal(bottomSilhouette)) {
    const bottomPhrase = composeBottomPhrase(bottomSilhouette);
    if (bottomPhrase) segments.push(bottomPhrase);
  }

  const middle = segments.join("; ");
  const composed = `Use a ${colorPhrase} set matching only the product fit silhouette: ${middle}. ${NEGATIVE_TAIL}`;

  if (composed.length <= NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN) {
    return composed;
  }

  const tail = ` ${NEGATIVE_TAIL}`;
  const budget = NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN - tail.length;
  const head = `Use a ${colorPhrase} set matching only the product fit silhouette: ${middle}.`;
  if (head.length > budget) {
    const truncatedHead = head.slice(0, budget - 1).replace(/[,;\s]+$/, "");
    return `${truncatedHead}…${tail}`;
  }
  return `${head}${tail}`;
}

export function deriveNeutralBaseFitGuidance(
  input: DeriveNeutralBaseFitInput
): NeutralBaseFitGuidance {
  const { analysis, categoryContext } = input;

  if (categoryContext !== "lingerie") {
    return notApplied(
      `categoryContext is "${categoryContext}", not "lingerie" — neutral-base fit guidance only applies to lingerie/swimwear flows that enter FASHN`
    );
  }
  if (!analysis) {
    return notApplied("no productAnalysis provided");
  }
  if (analysis.confidence < PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD) {
    return notApplied(
      `analysis.confidence ${analysis.confidence.toFixed(2)} < ${PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD} — falling back to default neutral base`
    );
  }

  const bottomSilhouette = analysis.bottoms.present
    ? deriveBottomSilhouetteFromAnalysis(analysis)
    : {
        waistHeight: "unknown",
        sideCoverage: "unknown",
        frontCoverage: "unknown",
        legOpening: "unknown",
        briefType: "unknown",
        dominantBaseTone: "unknown",
        confidence: 0,
      } satisfies BottomSilhouette;

  const braSignalText = collectBraSignalText(analysis);
  const inputs: DerivedNeutralBaseFitInputs = {
    dominantBaseTone: bottomSilhouette.dominantBaseTone,
  };
  let hasSignal = false;

  if (analysis.bra.present) {
    const cupCoverage = mapBraCupCoverage(
      analysis.bra.cupShape,
      analysis.bra.style
    );
    const strapWidth = mapStrapWidth(analysis.bra.straps);
    const supportLevel = detectSupportLevel(analysis.bra.style, braSignalText);
    if (
      cupCoverage !== "unknown" ||
      strapWidth !== "unknown" ||
      supportLevel !== "unknown"
    ) {
      inputs.bra = { cupCoverage, strapWidth, supportLevel };
      hasSignal = true;
    }
  }

  if (analysis.bottoms.present && bottomSilhouetteHasBottomSignal(bottomSilhouette)) {
    inputs.bottomSilhouette = bottomSilhouette;
    hasSignal = true;
  }

  if (!hasSignal) {
    return notApplied(
      "no usable fit signal in analysis (bra/bottoms missing or all enum values unknown)"
    );
  }

  const useBlackNeutralBase = bottomSilhouette.dominantBaseTone === "black_dark";
  const fitAwareBottom = hasConfidentBottomSilhouette(bottomSilhouette);
  const text = composeGuidanceText(inputs, bottomSilhouette);

  if (containsForbiddenDesignTokens(text)) {
    return notApplied(
      "internal sanitizer: forbidden decorative-design token appeared in derived text — refusing to emit"
    );
  }

  return {
    applied: true,
    text,
    inputs,
    bottomSilhouette,
    fitAwareBottom,
    useBlackNeutralBase,
    reason: "lingerie + confident analysis + fit signal present",
  };
}

function notApplied(reason: string): NeutralBaseFitGuidance {
  return { applied: false, text: "", reason };
}

export { deriveBottomSilhouetteFromAnalysis, hasConfidentBottomSilhouette };
export type { BottomSilhouette };
