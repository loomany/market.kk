import "server-only";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";

export {
  effectiveProductDescriptionRu,
  productAnalysisForModelGeneration,
  resolveCategoryContext,
  resolveTryOnGarmentSettings,
  type ProductAnalysisUiOverrides,
} from "@/lib/ai/productAnalysisShared";

export {
  buildTryOnRepairPrompt,
  buildTryOnJudgeInstructions,
  TRY_ON_JUDGE_CRITERIA,
} from "@/lib/ai/tryOnRepairPrompt";
