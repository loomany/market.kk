import type {
  ProductDescriptionAnalysis,
  ProductDescriptionAnalysisDebug,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import { enrichAnalysisWithLingerieSetType } from "@/lib/ai/lingerieSetType";
import { finalizeSourceModel } from "@/lib/ai/sourceModelPostProcess";
import { garmentPhotoTypeFromSourcePresentation } from "@/lib/studio/garmentPhotoTypeFromPresentation";

export type { ProductDescriptionAnalysisDebug };

const ON_MODEL_TEXT_SIGNALS_RU = [
  "на модели",
  "на человеке",
  "надето",
  "надета",
  "надеты",
  "надет",
  "видна кожа",
  "грудь",
  "живот",
  "рука",
  "нога",
  "бедра",
  "плечо",
  "торс",
  "талия",
  "кожа",
  "лицо",
  "манекен",
  "человек",
] as const;

const ON_MODEL_TEXT_SIGNALS_EN = [
  "on model",
  "on-model",
  "worn on",
  "wearing",
  "human body",
  "mannequin",
  "torso",
  "skin",
  "body",
  "bust",
  "waist",
  "hip",
  "chest",
  "belly",
  "shoulder",
  "arm",
  "leg",
  "face",
  "model",
] as const;

const FLAT_LAY_TEXT_SIGNALS_RU = [
  "flat lay",
  "flat-lay",
  "на вешалке",
  "вешалк",
  "лежит",
  "на полу",
  "на столе",
  "отдельно",
  "без модели",
  "без тела",
] as const;

const FLAT_LAY_TEXT_SIGNALS_EN = [
  "flat lay",
  "flat-lay",
  "on hanger",
  "hanging",
  "on floor",
  "on table",
  "laid flat",
  "product only",
  "no model",
  "no body",
] as const;

export function textSignalsOnModel(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    ON_MODEL_TEXT_SIGNALS_RU.some((signal) => normalized.includes(signal)) ||
    ON_MODEL_TEXT_SIGNALS_EN.some((signal) => normalized.includes(signal))
  );
}

function textSignalsFlatLay(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    FLAT_LAY_TEXT_SIGNALS_RU.some((signal) => normalized.includes(signal)) ||
    FLAT_LAY_TEXT_SIGNALS_EN.some((signal) => normalized.includes(signal))
  );
}

function syncGarmentPhotoTypeFromPresentation(
  analysis: ProductDescriptionAnalysis
): ProductDescriptionAnalysis {
  const garmentPhotoType = garmentPhotoTypeFromSourcePresentation(
    analysis.sourcePresentation
  );
  if (analysis.garmentPhotoType === garmentPhotoType) return analysis;
  return { ...analysis, garmentPhotoType };
}

export function applyProductDescriptionSafetyRules(
  analysis: ProductDescriptionAnalysis,
  rawVisionAnswer?: string | null,
  options?: {
    finalUserDescription?: string | null;
    userEditedProductDescription?: boolean;
  }
): {
  analysis: ProductDescriptionAnalysis;
  debug: ProductDescriptionAnalysisDebug;
} {
  const corpus = [
    analysis.descriptionRu,
    analysis.shortAiSummaryEn,
    rawVisionAnswer ?? "",
  ].join("\n");
  const onModelSignals = textSignalsOnModel(corpus);
  const flatLaySignals = textSignalsFlatLay(corpus);

  let next: ProductDescriptionAnalysis = { ...analysis };
  let correctedBySafetyRule = false;
  const postProcessingOverrides: string[] = [];
  let reason: string | null = null;

  if (onModelSignals) {
    if (next.sourcePresentation !== "on-model") {
      next = {
        ...next,
        sourcePresentation: "on-model",
        garmentPhotoType: "model",
      };
      correctedBySafetyRule = true;
      postProcessingOverrides.push(
        "on-model body signals → sourcePresentation on-model, garmentPhotoType model"
      );
      reason =
        "Visible body, skin, or worn garment on person/mannequin — classified as on-model.";
    } else if (next.garmentPhotoType !== "model") {
      next = { ...next, garmentPhotoType: "model" };
      correctedBySafetyRule = true;
      postProcessingOverrides.push("on-model → garmentPhotoType model");
    }
  } else if (
    flatLaySignals &&
    next.sourcePresentation !== "on-model"
  ) {
    if (next.sourcePresentation !== "flat-lay") {
      next = {
        ...next,
        sourcePresentation: "flat-lay",
        garmentPhotoType: "flat-lay",
      };
      correctedBySafetyRule = true;
      postProcessingOverrides.push(
        "flat-lay signals → sourcePresentation flat-lay, garmentPhotoType flat-lay"
      );
      reason = "Garment shown separately without body — flat-lay.";
    } else if (next.garmentPhotoType !== "flat-lay") {
      next = { ...next, garmentPhotoType: "flat-lay" };
      postProcessingOverrides.push("flat-lay → garmentPhotoType flat-lay");
    }
  } else if (
    next.sourcePresentation === "on-model" &&
    next.garmentPhotoType === "flat-lay"
  ) {
    next = { ...next, garmentPhotoType: "model" };
    correctedBySafetyRule = true;
    postProcessingOverrides.push("garmentPhotoType: flat-lay → model");
    reason =
      "sourcePresentation is on-model but garmentPhotoType was flat-lay; corrected to model.";
  }

  const synced = syncGarmentPhotoTypeFromPresentation(next);
  if (synced.garmentPhotoType !== next.garmentPhotoType) {
    postProcessingOverrides.push(
      `garmentPhotoType synced from sourcePresentation → ${synced.garmentPhotoType}`
    );
    next = synced;
  }

  if (
    next.categoryContext === "lingerie" &&
    next.bra.present &&
    next.bottoms.present &&
    next.setType === "unknown"
  ) {
    next = { ...next, setType: "bra_brief_set" };
    postProcessingOverrides.push("setType unknown → bra_brief_set");
  }

  const finalizedSourceModel = finalizeSourceModel({
    sourcePresentation: next.sourcePresentation,
    sourceModel: next.sourceModel,
  });
  if (finalizedSourceModel !== next.sourceModel) {
    if (next.sourceModel && !finalizedSourceModel) {
      postProcessingOverrides.push("sourceModel cleared (empty or invalid)");
    } else if (next.sourceModel?.promptEn !== finalizedSourceModel?.promptEn) {
      postProcessingOverrides.push("sourceModel.promptEn rebuilt/sanitized");
    }
    next = { ...next, sourceModel: finalizedSourceModel };
  }

  const enriched = enrichAnalysisWithLingerieSetType(next);
  if (
    enriched.lingerieSetType !== next.lingerieSetType ||
    enriched.lingerieSetTypeConfidence !== next.lingerieSetTypeConfidence
  ) {
    postProcessingOverrides.push(
      `lingerieSetType resolved → ${enriched.lingerieSetType} (${enriched.lingerieSetTypeConfidence.toFixed(2)})`
    );
    next = enriched;
  }

  return {
    analysis: next,
    debug: {
      sourcePresentation: next.sourcePresentation,
      garmentPhotoType: next.garmentPhotoType,
      reason,
      confidence: next.confidence,
      rawVisionAnswer: rawVisionAnswer ?? null,
      correctedBySafetyRule,
      postProcessingOverrides,
      finalUserDescription: options?.finalUserDescription ?? null,
      userEditedProductDescription:
        options?.userEditedProductDescription ?? false,
    },
  };
}
