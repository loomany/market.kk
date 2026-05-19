import type { ProductSourceModel } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { resolveSourceModelPoseRu } from "@/lib/studio/sourceModelPoseRu";

const SIZE_LABELS: Record<string, string> = {
  "plus-size": "плюс-сайз",
  curvy: "пышная фигура",
  xl: "крупная",
  "2xl": "очень крупная",
  slim: "стройная",
  petite: "миниатюрная",
  standard: "стандартная",
};

const CROP_LABELS: Record<string, string> = {
  "full-body": "в полный рост",
  "upper-body": "по пояс",
  "waist-up": "по пояс",
  "upper-thigh": "до бёдер",
  "close-up": "крупный план",
};

export function sourceModelCheckLinesRu(
  sourceModel: ProductSourceModel | null | undefined
): { bodyLine?: string; cropLine?: string; poseLine?: string } {
  if (!sourceModel) return {};

  const bodyLine =
    sourceModel.sizeClass && sourceModel.sizeClass !== "unknown"
      ? `Комплекция: ${SIZE_LABELS[sourceModel.sizeClass] ?? sourceModel.sizeClass}`
      : sourceModel.bodyType?.trim()
        ? `Комплекция: ${sourceModel.bodyType.trim()}`
        : undefined;

  const cropLine =
    sourceModel.crop && sourceModel.crop !== "unknown"
      ? `Кадр: ${CROP_LABELS[sourceModel.crop] ?? sourceModel.crop}`
      : sourceModel.framing?.trim()
        ? `Кадр: ${sourceModel.framing.trim()}`
        : undefined;

  const poseRu = resolveSourceModelPoseRu(sourceModel);
  const poseLine = poseRu ? `Поза: ${poseRu}` : undefined;

  return { bodyLine, cropLine, poseLine };
}
