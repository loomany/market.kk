import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { GenerateModelRequest } from "@/lib/ai/modelGenerationSchemas";
import type {
  GarmentPhotoType,
  ModelCategoryContext,
  ProductCategory,
} from "@/components/studio/types";
import { mapCategoryForTryOn } from "@/lib/ai/falSchemas";

export type ProductAnalysisUiOverrides = {
  categoryContext?: ModelCategoryContext;
  productCategory?: ProductCategory;
  garmentPhotoType?: GarmentPhotoType;
};

export function effectiveProductDescriptionRu(
  analysis: ProductDescriptionAnalysis | null | undefined,
  userDescriptionRu: string,
  userEdited: boolean
): string {
  const userText = userDescriptionRu.trim();
  if (userEdited && userText) return userText;
  if (userText) return userText;
  return analysis?.descriptionRu?.trim() ?? "";
}

export function resolveCategoryContext(
  analysis: ProductDescriptionAnalysis | null | undefined,
  overrides: ProductAnalysisUiOverrides
): ModelCategoryContext {
  return overrides.categoryContext ?? analysis?.categoryContext ?? "clothing";
}

export function resolveTryOnGarmentSettings(
  analysis: ProductDescriptionAnalysis | null | undefined,
  overrides: ProductAnalysisUiOverrides
): {
  productCategory: ProductCategory;
  garmentPhotoType: GarmentPhotoType;
  fashnCategory: ReturnType<typeof mapCategoryForTryOn>;
} {
  const productCategory =
    overrides.productCategory ??
    (analysis?.productCategory as ProductCategory) ??
    "auto";
  const garmentPhotoType =
    overrides.garmentPhotoType ??
    (analysis?.garmentPhotoType as GarmentPhotoType) ??
    "auto";

  return {
    productCategory,
    garmentPhotoType,
    fashnCategory: mapFashnCategoryForTryOn({
      productCategory,
      categoryContext: overrides.categoryContext,
      productAnalysis: analysis,
    }),
  };
}

/** Lingerie uses FASHN auto; other scenarios use AI productCategory. */
export function mapFashnCategoryForTryOn(input: {
  productCategory: ProductCategory;
  categoryContext?: ModelCategoryContext;
  productAnalysis?: ProductDescriptionAnalysis | null;
}): ReturnType<typeof mapCategoryForTryOn> {
  if (input.categoryContext === "lingerie") {
    return "auto";
  }
  return mapCategoryForTryOn(input.productCategory);
}

/** Pose/category context only — no colors, lace, or mustPreserve (try-on owns fidelity). */
export function modelSafeProductSummaryEn(
  analysis: ProductDescriptionAnalysis
): string {
  const parts = [
    `${analysis.setType} lingerie set`,
    analysis.sourcePresentation === "on-model"
      ? "merchant photo shows garment on body"
      : "flat product photo",
    "virtual try-on will apply marketplace garment later",
  ];
  const fitHint = analysis.fitNotes.find((n) =>
    /plus|curvy|size|supportive|high-waist|brief/i.test(n)
  );
  if (fitHint) parts.push(fitHint);
  return parts.join(", ");
}

export function productAnalysisForModelGeneration(
  analysis: ProductDescriptionAnalysis | null | undefined,
  overrides: ProductAnalysisUiOverrides,
  _userDescriptionRu: string,
  _userEdited: boolean
): Pick<GenerateModelRequest, "categoryContext"> & {
  shortAiSummaryEn?: string;
  productSetType?: GenerateModelRequest["productSetType"];
  productSourcePresentation?: GenerateModelRequest["productSourcePresentation"];
  sourceModelPromptEn?: string;
  sourceModelSizeClass?: string;
  sourceModelPose?: string;
  sourceModelCameraAngle?: string;
  sourceModelHandsPosition?: string;
} {
  const sourceModel =
    analysis?.sourcePresentation === "on-model" ? analysis.sourceModel : null;

  return {
    categoryContext: resolveCategoryContext(analysis, overrides),
    shortAiSummaryEn: analysis
      ? modelSafeProductSummaryEn(analysis)
      : undefined,
    productSetType: analysis?.setType,
    productSourcePresentation: analysis?.sourcePresentation,
    ...(sourceModel?.promptEn?.trim()
      ? { sourceModelPromptEn: sourceModel.promptEn.trim() }
      : {}),
    ...(sourceModel?.sizeClass
      ? { sourceModelSizeClass: sourceModel.sizeClass }
      : {}),
    ...(sourceModel?.pose?.trim()
      ? { sourceModelPose: sourceModel.pose.trim() }
      : {}),
    ...(sourceModel?.cameraAngle?.trim()
      ? { sourceModelCameraAngle: sourceModel.cameraAngle.trim() }
      : {}),
    ...(sourceModel?.handsPosition?.trim()
      ? { sourceModelHandsPosition: sourceModel.handsPosition.trim() }
      : {}),
  };
}
