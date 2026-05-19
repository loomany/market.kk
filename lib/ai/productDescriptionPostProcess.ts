import type {
  ProductDescriptionAnalysis,
  ProductDescriptionAnalysisDebug,
} from "@/lib/ai/productDescriptionAnalysisSchemas";

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
  "бедра",
  "плечо",
  "торс",
  "талия",
  "кожа",
] as const;

const ON_MODEL_TEXT_SIGNALS_EN = [
  "on model",
  "on-model",
  "worn on",
  "wearing",
  "human body",
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
  "model",
] as const;

export function textSignalsOnModel(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    ON_MODEL_TEXT_SIGNALS_RU.some((signal) => normalized.includes(signal)) ||
    ON_MODEL_TEXT_SIGNALS_EN.some((signal) => normalized.includes(signal))
  );
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

  let next: ProductDescriptionAnalysis = { ...analysis };
  let correctedBySafetyRule = false;
  const postProcessingOverrides: string[] = [];
  let reason: string | null = null;

  if (
    next.sourcePresentation === "on-model" &&
    next.garmentPhotoType === "flat-lay"
  ) {
    next = { ...next, garmentPhotoType: "model" };
    correctedBySafetyRule = true;
    postProcessingOverrides.push("garmentPhotoType: flat-lay → model");
    reason =
      "sourcePresentation is on-model but garmentPhotoType was flat-lay; corrected to model.";
  }

  const forceLingerieOnModel =
    next.categoryContext === "lingerie" &&
    onModelSignals &&
    (next.sourcePresentation !== "on-model" ||
      next.garmentPhotoType === "flat-lay");

  if (forceLingerieOnModel) {
    next = {
      ...next,
      sourcePresentation: "on-model",
      garmentPhotoType: "model",
    };
    correctedBySafetyRule = true;
    postProcessingOverrides.push(
      "lingerie + on-model signals → sourcePresentation on-model, garmentPhotoType model"
    );
    reason =
      "Garment is worn on a visible human torso with skin, chest, waist and hand visible, so source is on-model.";
  } else if (
    !correctedBySafetyRule &&
    next.categoryContext === "lingerie" &&
    next.sourcePresentation === "on-model" &&
    next.garmentPhotoType === "auto"
  ) {
    next = { ...next, garmentPhotoType: "model" };
    correctedBySafetyRule = true;
    postProcessingOverrides.push("lingerie on-model → garmentPhotoType model");
    reason =
      "Lingerie on-model presentation; garmentPhotoType set to model for try-on.";
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

  if (
    next.categoryContext === "lingerie" &&
    next.productCategory === "auto"
  ) {
    next = { ...next, productCategory: "one-pieces" };
    postProcessingOverrides.push("lingerie productCategory auto → one-pieces");
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
