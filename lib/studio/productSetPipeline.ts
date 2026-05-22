import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import { buildStudioModelGenerationFields } from "@/lib/ai/productGenerationContext";
import { productPoseDescriptionForGeneration } from "@/lib/ai/productPoseSummary";
import type { PromptLocale } from "@/lib/ai/promptLocaleSchema";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";
import type { ModelGenerationSettings } from "@/components/studio/types";
import { buildGenerateModelRequestBody } from "@/lib/studio/buildGenerateModelRequest";
import { appendStudioTryOnFields } from "@/lib/studio/buildTryOnFormData";
import {
  buildClothingPipelineHints,
  clothingPipelineBillingHeadersFromHints,
} from "@/lib/studio/clothingBillingClient";
import type { StudioProductPhoto } from "@/lib/studio/productPhotos";
import type { ProductSetSlotPhase } from "@/lib/studio/productSetProgress";

export type ProductSetSlot = {
  photo: StudioProductPhoto;
  angle: ResolvedModelAngle;
  analysis: ProductDescriptionAnalysis | null;
};

export type ProductSetModelSlotResult = {
  photoId: string;
  label: string;
  url: string;
};

export type ProductSetTryOnSlotResult = {
  photoId: string;
  label: string;
  url: string;
  width?: number;
  height?: number;
};

async function readTryOnJson(res: Response) {
  return (await res.json()) as {
    ok: boolean;
    images?: { url: string; width?: number; height?: number }[];
    errorCode?: string;
    message?: string;
  };
}

export async function generateProductSetModels(input: {
  slots: ProductSetSlot[];
  settings: ModelGenerationSettings;
  outputSize: ModelOutputSizeSelection;
  modelDescription: string;
  promptLocale: PromptLocale;
  seed: number;
  productDescription: string;
  userEditedProductDescription: boolean;
  onProgress?: (message: string) => void;
  onSlotPhase?: (index: number, phase: ProductSetSlotPhase) => void;
  onSlotModelReady?: (index: number, result: ProductSetModelSlotResult) => void;
  signal?: AbortSignal;
  /** Продолжение после перезагрузки: уже готовые модели и индекс следующего слота. */
  resumeFromIndex?: number;
  resumeCompleted?: ProductSetModelSlotResult[];
}): Promise<ProductSetModelSlotResult[]> {
  const results: ProductSetModelSlotResult[] = [
    ...(input.resumeCompleted ?? []),
  ];
  const startIndex = input.resumeFromIndex ?? 0;
  let heroImageUrlForIdentity = results[0]?.url;

  for (let index = startIndex; index < input.slots.length; index++) {
    const slot = input.slots[index]!;
    input.onSlotPhase?.(index, "model");
    input.onProgress?.(
      input.slots.length > 1
        ? `Модель ${index + 1} из ${input.slots.length}: ${slot.angle.label}${
            index === 0 ? " (базовая)" : " (то же лицо)"
          }`
        : "Создаём AI-модель…"
    );

    const genFields = buildStudioModelGenerationFields({
      analysis: slot.analysis,
      overrides: { categoryContext: input.settings.categoryContext },
      settings: input.settings,
      userDescriptionRu: input.productDescription,
      userEditedProductDescription: input.userEditedProductDescription,
    });

    const res = await fetch("/api/ai/generate-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        buildGenerateModelRequestBody({
          settings: {
            ...input.settings,
            categoryContext: genFields.categoryContext,
          },
          outputSize: input.outputSize,
          modelDescription: input.modelDescription,
          shortAiSummaryEn: genFields.shortAiSummaryEn,
          productSetType: genFields.productSetType,
          productSourcePresentation: genFields.productSourcePresentation,
          neutralBaseFitGuidanceEn: genFields.neutralBaseFitGuidanceEn,
          sourceFramingGuidanceEn: genFields.sourceFramingGuidanceEn,
          sourceModelPromptEn: genFields.sourceModelPromptEn,
          sourceModelSizeClass: genFields.sourceModelSizeClass,
          sourceModelPose: genFields.sourceModelPose,
          sourceModelCrop: genFields.sourceModelCrop,
          sourceModelCameraAngle: genFields.sourceModelCameraAngle,
          sourceModelHandsPosition: genFields.sourceModelHandsPosition,
          sourceModelFraming: genFields.sourceModelFraming,
          productView: genFields.productView,
          resolvedModelPose: genFields.resolvedModelPose,
          promptLocale: input.promptLocale,
          seed: input.seed + index,
          angle: slot.angle,
          preferTextOnlyAngleFollowUp: index > 0,
          heroImageUrlForIdentity:
            index > 0 ? heroImageUrlForIdentity : undefined,
          productPoseDescriptionRu: productPoseDescriptionForGeneration(
            slot.angle
          ),
        })
      ),
      signal: input.signal,
    });

    const data = (await res.json()) as GenerateModelResponse & {
      issues?: { path: (string | number)[]; message: string }[];
    };
    if (!data.ok) {
      const issue = data.issues?.[0];
      const issueHint = issue
        ? ` (${[...issue.path, issue.message].filter(Boolean).join(": ")})`
        : "";
      throw new Error(
        (data.message ??
          `Не удалось сгенерировать модель для «${slot.angle.label}».`) + issueHint
      );
    }

    const url = data.images[0]?.url;
    if (!url) {
      throw new Error(`Модель не вернула изображение для «${slot.angle.label}».`);
    }

    if (index === 0) {
      heroImageUrlForIdentity = url;
    }

    const entry = {
      photoId: slot.photo.id,
      label: slot.angle.label,
      url,
    };
    results.push(entry);
    input.onSlotModelReady?.(index, entry);
  }

  return results;
}

export async function runProductSetTryOn(input: {
  slot: ProductSetSlot;
  modelImageUrl: string;
  settings: ModelGenerationSettings;
  productDescription: string;
  userEditedProductDescription: boolean;
  modelResolution: ModelOutputSizeSelection["resolution"];
  seed: number;
  tryOnMaxExperimental?: boolean;
  isLingerie: boolean;
  signal?: AbortSignal;
}): Promise<ProductSetTryOnSlotResult> {
  const formData = new FormData();
  appendStudioTryOnFields(formData, {
    productFile: input.slot.photo.file,
    modelFile: null,
    modelImageUrl: input.modelImageUrl,
    garmentPhotoType: "auto",
    garmentPhotoTypeManualOverride: false,
    categoryContext: input.settings.categoryContext,
    isLingerie: input.isLingerie,
    productAnalysis: input.slot.analysis,
    productDescription: input.productDescription,
    userEditedProductDescription: input.userEditedProductDescription,
    modelResolution: input.modelResolution!,
    seed: input.seed,
    tryOnMaxExperimental: input.tryOnMaxExperimental,
  });

  const billingHints = buildClothingPipelineHints({
    productAnalysis: input.slot.analysis,
    needsModelGeneration: false,
    categoryContext: input.settings.categoryContext,
    modelInputMode: "create",
    tryOnMaxExperimental: Boolean(input.tryOnMaxExperimental),
  });

  const res = await fetch("/api/ai/tryon", {
    method: "POST",
    headers: clothingPipelineBillingHeadersFromHints(billingHints),
    body: formData,
    signal: input.signal,
  });

  const data = await readTryOnJson(res);
  if (!res.ok || !data.ok || !data.images?.[0]?.url) {
    throw new Error(
      data.message ??
        `Примерка не удалась для «${input.slot.angle.label}».`
    );
  }

  const image = data.images[0]!;
  return {
    photoId: input.slot.photo.id,
    label: input.slot.angle.label,
    url: image.url,
    width: image.width,
    height: image.height,
  };
}
