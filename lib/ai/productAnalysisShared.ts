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
    fashnCategory: mapCategoryForTryOn(productCategory),
  };
}

export function productAnalysisForModelGeneration(
  analysis: ProductDescriptionAnalysis | null | undefined,
  overrides: ProductAnalysisUiOverrides,
  userDescriptionRu: string,
  userEdited: boolean
): Pick<
  GenerateModelRequest,
  | "categoryContext"
  | "productDescriptionRu"
  | "productMustPreserve"
  | "productFitNotes"
> & {
  shortAiSummaryEn?: string;
  productSetType?: GenerateModelRequest["productSetType"];
  productSourcePresentation?: GenerateModelRequest["productSourcePresentation"];
} {
  const description = effectiveProductDescriptionRu(
    analysis,
    userDescriptionRu,
    userEdited
  );

  return {
    categoryContext: resolveCategoryContext(analysis, overrides),
    productDescriptionRu: description || undefined,
    shortAiSummaryEn: analysis?.shortAiSummaryEn,
    productSetType: analysis?.setType,
    productSourcePresentation: analysis?.sourcePresentation,
    productMustPreserve:
      analysis?.mustPreserve?.length ? analysis.mustPreserve : undefined,
    productFitNotes: analysis?.fitNotes?.length ? analysis.fitNotes : undefined,
  };
}
