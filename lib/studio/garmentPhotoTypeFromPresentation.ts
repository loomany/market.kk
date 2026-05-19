import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { GarmentPhotoType } from "@/components/studio/types";

export type SourcePresentation = ProductDescriptionAnalysis["sourcePresentation"];

/** Maps AI sourcePresentation to FASHN garment_photo_type (not always "auto"). */
export function garmentPhotoTypeFromSourcePresentation(
  sourcePresentation: SourcePresentation
): GarmentPhotoType {
  switch (sourcePresentation) {
    case "on-model":
      return "model";
    case "flat-lay":
      return "flat-lay";
    case "unknown":
      return "auto";
  }
}

export function sourcePresentationSummaryRu(
  sourcePresentation: SourcePresentation | null | undefined
): string | null {
  if (!sourcePresentation) return null;
  switch (sourcePresentation) {
    case "on-model":
      return "AI определил: товар на модели";
    case "flat-lay":
      return "AI определил: товар отдельно";
    case "unknown":
      return "AI не уверен: будет использован авто-режим";
  }
}
