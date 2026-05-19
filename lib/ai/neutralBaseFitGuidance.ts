/**
 * Garment fit-aware neutral-base guidance helper.
 *
 * Pure, browser- and server-safe: depends only on the analysis schema types,
 * no `server-only` import, no I/O, no env access. Designed to be wired into
 * `composeModelGenerationPrompt` / `buildModelGenerationPrompt` in a follow-up
 * PR; this PR introduces only the helper + tests and is intentionally NOT
 * called from any runtime path.
 *
 * Goal
 *  Today the lingerie neutral-base prompt forces a low-profile bikini brief
 *  (`neutralBaseMinimalBriefGuidance` in `modelIdentityPipeline.ts`) regardless
 *  of the marketplace SKU's silhouette. For high-waist briefs this leaves
 *  FASHN repainting a much taller brief over bare abdomen — the high-waist
 *  shape, central front panel, and side panels regularly collapse.
 *
 *  This helper turns the existing structured analysis fields
 *  (`bra.cupShape`, `bra.straps`, `bottoms.rise`, `bottoms.style`, plus
 *  `fitNotes`) into a short whitelisted English sentence that describes only
 *  the *fit silhouette* the neutral base should match (cup coverage, strap
 *  width, underband placement, brief waist height, side coverage, leg opening,
 *  back coverage) — never colour, lace, embroidery, pattern, or any
 *  SKU-specific design vocabulary.
 *
 * Safety contract (enforced by `scripts/test-neutralBaseFit.ts`)
 *  - Helper is gated on `categoryContext === "lingerie"`. Any other context
 *    (`clothing`, `general`, `jewelry`) returns `applied: false` with an empty
 *    `text`, so non-lingerie flows are not affected.
 *  - Helper is gated on `analysis.confidence >= PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD`
 *    (0.75). Low-confidence analyses fall back to the existing neutral base.
 *  - Helper never reads free-text from `analysis` into the output. Every
 *    rendered phrase is a hardcoded English constant selected by mapping
 *    Vision strings into a closed enum via regex.
 *  - Helper output is asserted to be free of decorative-design vocabulary
 *    (`lace`, `emerald`, `turquoise`, `floral`, `black base`, `scalloped`)
 *    by both an internal defence-in-depth check and the regression script.
 *  - Helper output is capped at `NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN` (700)
 *    so it cannot blow the `GENERATION_PROMPT_MAX` (3500) budget downstream.
 */

import {
  PRODUCT_ANALYSIS_CONFIDENCE_THRESHOLD,
  type ProductDescriptionAnalysis,
} from "@/lib/ai/productDescriptionAnalysisSchemas";

/** Hard cap on the produced English sentence so it never starves the
 *  downstream prompt budget (`GENERATION_PROMPT_MAX` = 3500 in
 *  `composeModelGenerationPrompt.ts`). */
export const NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN = 700;

/** Lingerie is the only context where FASHN actually needs a fit-matched
 *  base today (`shouldUseNeutralBaseModelGeneration` in
 *  `modelIdentityPipeline.ts` returns true only for `"lingerie"`). The other
 *  enum members are listed so callers stay type-safe; they always yield
 *  `applied: false`. */
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

export type UnderbandPlacement = "standard" | "longline" | "unknown";

export type SupportLevel = "structured" | "soft" | "unknown";

export type BriefWaistHeight =
  | "high_waist"
  | "mid_rise"
  | "low_rise"
  | "unknown";

export type BriefSideCoverage = "wide" | "medium" | "thin" | "unknown";

export type BriefLegOpening = "high_cut" | "medium_cut" | "low_cut" | "unknown";

export type BriefBackCoverage =
  | "full"
  | "cheeky"
  | "brief"
  | "thong"
  | "unknown";

export type DerivedNeutralBaseFitInputs = {
  bra?: {
    cupCoverage: BraCupCoverage;
    strapWidth: StrapWidth;
    underbandPlacement: UnderbandPlacement;
    supportLevel: SupportLevel;
  };
  bottom?: {
    waistHeight: BriefWaistHeight;
    sideCoverage: BriefSideCoverage;
    legOpening: BriefLegOpening;
    backCoverage: BriefBackCoverage;
  };
};

export type NeutralBaseFitGuidance =
  | {
      applied: true;
      text: string;
      inputs: DerivedNeutralBaseFitInputs;
      reason: string;
    }
  | {
      applied: false;
      text: "";
      inputs?: undefined;
      reason: string;
    };

export type DeriveNeutralBaseFitInput = {
  analysis: ProductDescriptionAnalysis | null | undefined;
  categoryContext: FitAwareCategoryContext;
};

// ---------------------------------------------------------------------------
// Whitelisted phrase constants
// ---------------------------------------------------------------------------
// Every phrase is a hardcoded English string. The helper never substitutes
// free-text from the analysis into the output — it only selects which of the
// frozen phrases below to concatenate, based on enum values derived from the
// Vision strings.
//
// Words explicitly avoided (decorative-design tokens, forbidden by the
// regression test): `lace`, `emerald`, `turquoise`, `floral`, `scalloped`,
// `embroidery`, `decorative`, `print`, `pattern`, `colour`/`color`, any
// concrete colour name, "black base".
// ---------------------------------------------------------------------------

const BRA_CUP_PHRASES: Record<BraCupCoverage, string> = {
  full_cup:
    "supportive full-cup neutral bra shape with rounded smooth cups",
  balconette:
    "balconette-style neutral bra shape with a horizontal cup line",
  triangle:
    "soft triangle-style neutral bra shape",
  sports:
    "sports-style neutral bra shape with compressed support",
  unknown: "",
};

const STRAP_PHRASES: Record<StrapWidth, string> = {
  wide: "wider shoulder straps",
  medium: "standard-width shoulder straps",
  thin: "thinner shoulder straps",
  strapless: "strapless silhouette without shoulder straps",
  unknown: "",
};

const UNDERBAND_PHRASES: Record<UnderbandPlacement, string> = {
  standard: "standard underband placement at the natural under-bust line",
  longline: "longline neutral band extending toward the lower ribs",
  unknown: "",
};

const SUPPORT_PHRASES: Record<SupportLevel, string> = {
  structured: "structured supportive bra silhouette",
  soft: "soft unstructured bra silhouette",
  unknown: "",
};

const BRIEF_WAIST_PHRASES: Record<BriefWaistHeight, string> = {
  high_waist:
    "high-waist neutral brief silhouette with the waistband sitting between the navel and the lower ribs",
  mid_rise:
    "mid-rise neutral brief silhouette with the waistband sitting at the natural waistline",
  low_rise:
    "low-rise neutral brief silhouette with the waistband sitting on the hips",
  unknown: "",
};

const BRIEF_SIDE_COVERAGE_PHRASES: Record<BriefSideCoverage, string> = {
  wide: "wider side coverage on the briefs",
  medium: "standard side coverage on the briefs",
  thin: "narrower side coverage on the briefs",
  unknown: "",
};

const BRIEF_LEG_OPENING_PHRASES: Record<BriefLegOpening, string> = {
  high_cut: "higher leg opening shape on the briefs",
  medium_cut: "standard leg opening shape on the briefs",
  low_cut: "lower leg opening shape on the briefs",
  unknown: "",
};

const BRIEF_BACK_COVERAGE_PHRASES: Record<BriefBackCoverage, string> = {
  full: "full back coverage on the briefs",
  cheeky: "cheeky back coverage on the briefs",
  brief: "standard brief back coverage",
  thong: "thong-shape back coverage on the briefs",
  unknown: "",
};

/** Fixed intro — does NOT mention colour or fabric. The existing
 *  `lingerieNeutralBaseOutfitGuidance` already pins nude-beige; this helper
 *  only contributes silhouette guidance and must not redefine colour. */
const INTRO =
  "Use a plain seamless neutral base set that matches only the product fit silhouette:";

/** Fixed negative tail. Deliberately written so that NONE of the forbidden
 *  decorative-design tokens (lace, emerald, turquoise, floral, scalloped,
 *  embroidery, decorative, pattern, print, colour, concrete colour names,
 *  "black base") appear — neither as positive nor as negative wording.
 *  The existing `lingerieNeutralBaseOutfitGuidance` and
 *  `MODEL_GENERATION_NO_GARMENT_COPY_RULE` already carry the detailed
 *  "no lace / no floral / no turquoise" negatives in the prompt; this
 *  helper only needs to reinforce "match silhouette, never surface design". */
const NEGATIVE_TAIL =
  "Do not recreate the product's surface design or apply any garment-specific accents on the base; keep the base plain and design-neutral. Match silhouette geometry only.";

// ---------------------------------------------------------------------------
// Vision-string → enum mapping
// ---------------------------------------------------------------------------
// All regexes are anchored to silhouette/shape vocabulary only. They never
// match colour names or pattern names, so even if Vision returned a polluted
// string like "supportive black lace bra" the mapping returns at most a
// silhouette enum ("full_cup") — colour/lace tokens cannot escape into the
// output, because we never echo the source string itself.
// ---------------------------------------------------------------------------

function lc(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
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
  // "supportive" alone is too generic to choose a cup shape — let the
  // support-level signal carry it instead.
  return "unknown";
}

function mapStrapWidth(
  straps: string | null | undefined
): StrapWidth {
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

function mapBriefWaistHeight(
  rise: string | null | undefined,
  style: string | null | undefined,
  fitText: string
): BriefWaistHeight {
  const t = `${lc(rise)} ${lc(style)} ${fitText}`;
  if (/\bhigh[\s-]?waist(?:ed)?\b|\bhigh[\s-]?rise\b|\bretro\s+waist\b|\bcontrol\s+waist\b/.test(t)) {
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

function mapBriefBackCoverage(
  style: string | null | undefined,
  fitText: string
): BriefBackCoverage {
  const t = `${lc(style)} ${fitText}`;
  if (/\bthong\b|\bg[\s-]?string\b/.test(t)) return "thong";
  if (/\bcheeky\b|\bbrazilian\s+cut\b/.test(t)) return "cheeky";
  if (/\bfull\s+coverage\b|\bfull\s+brief\b|\bfull\s+back\b/.test(t)) {
    return "full";
  }
  if (/\bbrief\b|\bhipster\b|\bbikini\s+(?:cut|brief)\b/.test(t)) {
    return "brief";
  }
  return "unknown";
}

function detectBriefSideCoverage(fitText: string): BriefSideCoverage {
  if (/\bwide\s+side|\bbroad\s+side|\bfull\s+side\s+(?:panel|coverage)/.test(fitText)) {
    return "wide";
  }
  if (/\bthin\s+side|\bnarrow\s+side\b/.test(fitText)) {
    return "thin";
  }
  if (/\bmedium\s+side|\bstandard\s+side\b/.test(fitText)) {
    return "medium";
  }
  return "unknown";
}

function detectBriefLegOpening(fitText: string): BriefLegOpening {
  if (/\bhigh[\s-]?cut\s+leg\b|\bhigh\s+leg\s+(?:line|opening)\b/.test(fitText)) {
    return "high_cut";
  }
  if (/\blow[\s-]?cut\s+leg\b|\blow\s+leg\s+(?:line|opening)\b/.test(fitText)) {
    return "low_cut";
  }
  if (/\bmedium\s+(?:cut\s+)?leg\b|\bstandard\s+leg\b/.test(fitText)) {
    return "medium_cut";
  }
  return "unknown";
}

function detectUnderbandPlacement(fitText: string): UnderbandPlacement {
  if (/\blongline\b|\blong[\s-]?line\b|\blong\s+band\b/.test(fitText)) {
    return "longline";
  }
  if (/\bstandard\s+(?:band|underband)\b|\bnatural\s+underbust\b/.test(fitText)) {
    return "standard";
  }
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

function collectFitText(analysis: ProductDescriptionAnalysis): string {
  return [
    analysis.bra.style,
    analysis.bra.cupShape,
    analysis.bra.straps,
    analysis.bottoms.style,
    analysis.bottoms.rise,
    ...analysis.fitNotes,
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Defence-in-depth: forbidden decorative-design tokens
// ---------------------------------------------------------------------------
// The phrase constants above are hand-curated to be silhouette-only. If a
// future edit accidentally adds a colour / pattern / lace token, the helper
// returns `applied: false` rather than leak it into the prompt. The
// regression script asserts the same list externally.

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
];

// ---------------------------------------------------------------------------
// Public helper
// ---------------------------------------------------------------------------

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

  const fitText = collectFitText(analysis);
  const inputs: DerivedNeutralBaseFitInputs = {};
  let hasSignal = false;

  if (analysis.bra.present) {
    const cupCoverage = mapBraCupCoverage(
      analysis.bra.cupShape,
      analysis.bra.style
    );
    const strapWidth = mapStrapWidth(analysis.bra.straps);
    const underbandPlacement = detectUnderbandPlacement(fitText);
    const supportLevel = detectSupportLevel(analysis.bra.style, fitText);
    if (
      cupCoverage !== "unknown" ||
      strapWidth !== "unknown" ||
      underbandPlacement !== "unknown" ||
      supportLevel !== "unknown"
    ) {
      inputs.bra = {
        cupCoverage,
        strapWidth,
        underbandPlacement,
        supportLevel,
      };
      hasSignal = true;
    }
  }

  if (analysis.bottoms.present) {
    const waistHeight = mapBriefWaistHeight(
      analysis.bottoms.rise,
      analysis.bottoms.style,
      fitText
    );
    const sideCoverage = detectBriefSideCoverage(fitText);
    const legOpening = detectBriefLegOpening(fitText);
    const backCoverage = mapBriefBackCoverage(
      analysis.bottoms.style,
      fitText
    );
    if (
      waistHeight !== "unknown" ||
      sideCoverage !== "unknown" ||
      legOpening !== "unknown" ||
      backCoverage !== "unknown"
    ) {
      inputs.bottom = {
        waistHeight,
        sideCoverage,
        legOpening,
        backCoverage,
      };
      hasSignal = true;
    }
  }

  if (!hasSignal) {
    return notApplied(
      "no usable fit signal in analysis (bra/bottoms missing or all enum values unknown)"
    );
  }

  const text = composeGuidanceText(inputs);

  for (const re of FORBIDDEN_DESIGN_TOKENS) {
    if (re.test(text)) {
      return notApplied(
        `internal sanitizer: forbidden decorative-design token ${re} appeared in the derived text — refusing to emit`
      );
    }
  }

  return {
    applied: true,
    text,
    inputs,
    reason: "lingerie + confident analysis + fit signal present",
  };
}

function notApplied(reason: string): NeutralBaseFitGuidance {
  return { applied: false, text: "", reason };
}

function composeGuidanceText(inputs: DerivedNeutralBaseFitInputs): string {
  const parts: string[] = [];

  if (inputs.bra) {
    const braParts = [
      BRA_CUP_PHRASES[inputs.bra.cupCoverage],
      STRAP_PHRASES[inputs.bra.strapWidth],
      UNDERBAND_PHRASES[inputs.bra.underbandPlacement],
      SUPPORT_PHRASES[inputs.bra.supportLevel],
    ].filter((s) => s.length > 0);
    parts.push(...braParts);
  }

  if (inputs.bottom) {
    const bottomParts = [
      BRIEF_WAIST_PHRASES[inputs.bottom.waistHeight],
      BRIEF_SIDE_COVERAGE_PHRASES[inputs.bottom.sideCoverage],
      BRIEF_LEG_OPENING_PHRASES[inputs.bottom.legOpening],
      BRIEF_BACK_COVERAGE_PHRASES[inputs.bottom.backCoverage],
    ].filter((s) => s.length > 0);
    parts.push(...bottomParts);
  }

  const middle = parts.join(", ");
  const composed = `${INTRO} ${middle}. ${NEGATIVE_TAIL}`;

  if (composed.length > NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN) {
    const tail = ` ${NEGATIVE_TAIL}`;
    const budget = NEUTRAL_BASE_FIT_GUIDANCE_MAX_LEN - tail.length;
    const head = `${INTRO} ${middle}.`;
    if (head.length > budget) {
      const truncatedHead = head.slice(0, budget - 1).replace(/[,;\s]+$/, "");
      return `${truncatedHead}…${tail}`;
    }
    return `${head}${tail}`;
  }
  return composed;
}
