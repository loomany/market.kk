import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";

export const LINGERIE_SET_TYPES = [
  "bra_brief_set",
  "bra_only",
  "brief_only",
  "bodysuit",
  "teddy",
  "corset",
  "swimsuit_one_piece",
  "bikini_set",
  "unknown",
] as const;

export type LingerieSetType = (typeof LINGERIE_SET_TYPES)[number];

export type LingerieSetTypeSource = "vision" | "derived" | "fallback";

export type LingerieSetTypeInfo = {
  lingerieSetType: LingerieSetType;
  lingerieSetTypeConfidence: number;
  lingerieSetTypeReason: string;
  source: LingerieSetTypeSource;
};

const ONE_PIECE_TYPES = new Set<LingerieSetType>([
  "bodysuit",
  "teddy",
  "swimsuit_one_piece",
  "corset",
]);

const TWO_PIECE_TYPES = new Set<LingerieSetType>([
  "bra_brief_set",
  "bikini_set",
]);

export function isOnePieceLingerieSetType(type: LingerieSetType): boolean {
  return ONE_PIECE_TYPES.has(type);
}

export function isTwoPieceLingerieSetType(type: LingerieSetType): boolean {
  return TWO_PIECE_TYPES.has(type);
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function textIncludesAny(text: string, phrases: string[]): boolean {
  const normalized = normalizeText(text);
  return phrases.some((phrase) => normalized.includes(phrase.toLowerCase()));
}

/** Text-only inference for tests and post-process fallback. */
export function inferLingerieSetTypeFromText(text: string): LingerieSetTypeInfo {
  const normalized = normalizeText(text);

  if (
    textIncludesAny(normalized, [
      "one-piece bodysuit",
      "bodysuit",
      "body suit",
      "catsuit",
    ])
  ) {
    return pack("bodysuit", 0.82, "Text mentions bodysuit / one-piece body garment.");
  }

  if (textIncludesAny(normalized, ["teddy", "romper lingerie"])) {
    return pack("teddy", 0.8, "Text mentions teddy lingerie.");
  }

  if (
    textIncludesAny(normalized, [
      "one-piece swimsuit",
      "swimsuit",
      "one piece swim",
      "купальник",
    ])
  ) {
    return pack("swimsuit_one_piece", 0.8, "Text mentions one-piece swimsuit.");
  }

  if (textIncludesAny(normalized, ["corset", "bustier corset"])) {
    return pack("corset", 0.78, "Text mentions corset.");
  }

  if (
    textIncludesAny(normalized, ["bikini set", "bikini top and bottom", "bikini"])
  ) {
    return pack("bikini_set", 0.76, "Text mentions bikini set.");
  }

  if (
    textIncludesAny(normalized, ["bra only", "bra top only", "only bra", "bra without brief"])
  ) {
    return pack("bra_only", 0.78, "Text mentions bra only.");
  }

  if (
    textIncludesAny(normalized, [
      "brief only",
      "panty only",
      "panties only",
      "bottom only",
      "high-waisted brief only",
      "high-waist brief only",
    ])
  ) {
    return pack("brief_only", 0.78, "Text mentions brief/bottom only.");
  }

  const twoPieceSignals =
    textIncludesAny(normalized, [
      "two-piece",
      "two piece",
      "bra and brief",
      "bra + brief",
      "bra and high-waist",
      "bra and high-waisted",
      "high-waisted brief",
      "high-waist brief",
      "visible skin gap",
      "skin gap between",
      "separate bra",
      "separate brief",
      "bra_brief_set",
      "lingerie set",
    ]) ||
    (textIncludesAny(normalized, ["bra", "brief", "panty", "panties"]) &&
      textIncludesAny(normalized, ["high-waist", "high-waisted", "skin gap"]));

  if (twoPieceSignals) {
    return pack(
      "bra_brief_set",
      0.84,
      "Text describes separate bra and brief with two-piece / skin-gap signals."
    );
  }

  if (textIncludesAny(normalized, ["no visible skin gap", "connected top and bottom"])) {
    return pack(
      "bodysuit",
      0.72,
      "Text indicates connected top and bottom without skin gap."
    );
  }

  return pack("unknown", 0.35, "Insufficient lingerie garment-type signals in text.");
}

function pack(
  lingerieSetType: LingerieSetType,
  lingerieSetTypeConfidence: number,
  lingerieSetTypeReason: string,
  source: LingerieSetTypeSource = "derived"
): LingerieSetTypeInfo {
  return {
    lingerieSetType,
    lingerieSetTypeConfidence,
    lingerieSetTypeReason,
    source,
  };
}

function mapLegacySetType(setType: ProductDescriptionAnalysis["setType"]): LingerieSetType {
  switch (setType) {
    case "bra_brief_set":
      return "bra_brief_set";
    case "bra_only":
      return "bra_only";
    case "bottoms_only":
      return "brief_only";
    default:
      return "unknown";
  }
}

function deriveFromStructuredFields(
  analysis: ProductDescriptionAnalysis
): LingerieSetTypeInfo | null {
  if (analysis.categoryContext !== "lingerie") return null;

  const { bra, bottoms, setType } = analysis;

  if (bra.present && bottoms.present) {
    return pack(
      "bra_brief_set",
      0.78,
      "Structured analysis: bra and bottoms both present — two-piece lingerie set.",
      "derived"
    );
  }

  if (bra.present && !bottoms.present) {
    return pack(
      "bra_only",
      0.74,
      "Structured analysis: bra present without matching brief.",
      "derived"
    );
  }

  if (!bra.present && bottoms.present) {
    return pack(
      "brief_only",
      0.74,
      "Structured analysis: brief/bottom present without bra.",
      "derived"
    );
  }

  const legacy = mapLegacySetType(setType);
  if (legacy !== "unknown") {
    return pack(
      legacy,
      0.68,
      `Derived from legacy setType=${setType}.`,
      "derived"
    );
  }

  return null;
}

export function resolveLingerieSetType(
  analysis: ProductDescriptionAnalysis
): LingerieSetTypeInfo {
  if (analysis.categoryContext !== "lingerie") {
    return pack(
      "unknown",
      0.2,
      "Not lingerie category — garment type lock skipped.",
      "fallback"
    );
  }

  const visionType = analysis.lingerieSetType;
  const visionConfidence = analysis.lingerieSetTypeConfidence ?? 0;
  const visionReason = analysis.lingerieSetTypeReason?.trim();

  if (
    visionType &&
    visionType !== "unknown" &&
    visionConfidence >= 0.55 &&
    visionReason
  ) {
    return pack(visionType, visionConfidence, visionReason, "vision");
  }

  const corpus = [
    analysis.shortAiSummaryEn,
    analysis.descriptionRu,
    visionReason ?? "",
    analysis.mustPreserve.join(" "),
    analysis.fitNotes.join(" "),
  ].join("\n");

  const fromText = inferLingerieSetTypeFromText(corpus);
  if (fromText.lingerieSetType !== "unknown" && fromText.lingerieSetTypeConfidence >= 0.7) {
    return fromText;
  }

  const fromStructure = deriveFromStructuredFields(analysis);
  if (fromStructure) return fromStructure;

  if (visionType && visionType !== "unknown") {
    return pack(
      visionType,
      Math.max(visionConfidence, 0.5),
      visionReason ?? "Vision lingerieSetType with moderate confidence.",
      "vision"
    );
  }

  if (fromText.lingerieSetType !== "unknown") {
    return fromText;
  }

  return pack(
    "unknown",
    0.4,
    visionReason ??
      "Could not confidently determine lingerie garment type; using generic lock.",
    "fallback"
  );
}

export function compactEnglishProductDetails(
  analysis: ProductDescriptionAnalysis
): string | null {
  const parts: string[] = [];
  if (analysis.baseColor) parts.push(`${analysis.baseColor} base`);
  if (analysis.accentColors.length > 0) {
    parts.push(`${analysis.accentColors.slice(0, 3).join("/")} accents`);
  }
  if (analysis.pattern) parts.push(`${analysis.pattern} pattern`);
  if (analysis.bra.present && analysis.bra.style) {
    parts.push(`${analysis.bra.style}${analysis.bra.straps ? `, ${analysis.bra.straps} straps` : ""}`);
  }
  if (analysis.bottoms.present && analysis.bottoms.rise) {
    parts.push(`${analysis.bottoms.rise} ${analysis.bottoms.style ?? "brief"}`);
  }
  const preserve = analysis.mustPreserve.slice(0, 4);
  if (preserve.length > 0) parts.push(`preserve ${preserve.join(", ")}`);
  return parts.length > 0 ? parts.join("; ") : null;
}

export function enrichAnalysisWithLingerieSetType(
  analysis: ProductDescriptionAnalysis
): ProductDescriptionAnalysis {
  const resolved = resolveLingerieSetType(analysis);
  return {
    ...analysis,
    lingerieSetType: resolved.lingerieSetType,
    lingerieSetTypeConfidence: resolved.lingerieSetTypeConfidence,
    lingerieSetTypeReason: resolved.lingerieSetTypeReason,
  };
}

/** Test fixture helper — maps legacy setType to lingerieSetType fields. */
export function lingerieSetTypeFieldsForSetType(
  setType: ProductDescriptionAnalysis["setType"]
): Pick<
  ProductDescriptionAnalysis,
  "lingerieSetType" | "lingerieSetTypeConfidence" | "lingerieSetTypeReason"
> {
  switch (setType) {
    case "bra_brief_set":
      return {
        lingerieSetType: "bra_brief_set",
        lingerieSetTypeConfidence: 0.9,
        lingerieSetTypeReason:
          "Visible separate bra and high-waisted brief with skin gap.",
      };
    case "bra_only":
      return {
        lingerieSetType: "bra_only",
        lingerieSetTypeConfidence: 0.88,
        lingerieSetTypeReason: "Only bra/top is present in the product.",
      };
    case "bottoms_only":
      return {
        lingerieSetType: "brief_only",
        lingerieSetTypeConfidence: 0.88,
        lingerieSetTypeReason: "Only brief/bottom is present in the product.",
      };
    default:
      return {
        lingerieSetType: "unknown",
        lingerieSetTypeConfidence: 0.4,
        lingerieSetTypeReason: "Garment type not classified as lingerie set.",
      };
  }
}
