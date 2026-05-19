"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";
import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { RemoveBackgroundResponse } from "@/lib/ai/backgroundRemovalSchemas";
import { isRemoteImageUrl } from "@/lib/ai/clientImageValidation";
import type { TryOnResponse } from "@/lib/ai/falSchemas";
import {
  minorRestrictedChoice,
  minorRestrictionMessage,
} from "@/lib/ai/modelAge";
import {
  FAL_MODEL_RESOLUTIONS,
  DEFAULT_MODEL_OUTPUT_SIZE,
  isModelOutputSizeComplete,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import { appendStudioTryOnFields } from "@/lib/studio/buildTryOnFormData";
import { fetchGenerateSingleStudioModel } from "@/lib/studio/generateSingleStudioModel";
import { isStudioAiDebugEnabled } from "@/lib/studio/studioAiDebug";
import {
  type ResolvedModelAngle,
  validateModelAngles,
} from "@/lib/ai/modelAngles";
import { productPoseDescriptionForGeneration } from "@/lib/ai/productPoseSummary";
import {
  resolveAnglesForGeneration,
  validateProductSampleAnglesMatch,
} from "@/lib/studio/resolveModelAngles";
import { validateModelCustomParams } from "@/lib/ai/modelGenerationValidation";
import { buildGenerateModelRequestBody } from "@/lib/studio/buildGenerateModelRequest";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import { fitCutoutToShotSize, refineCutoutWithUserMask } from "@/lib/studio/cutoutImage";
import { shotSizePresetToDimensions } from "@/lib/ai/productShotSchemas";
import {
  composeExactProductCard,
  scenePresetToExactBackground,
} from "@/lib/studio/exactProductCard";
import {
  estimateTryOnOnlyCostUsd,
  formatSaasPipelineCostKztRange,
  SAAS_MODEL_GENERATION_COUNTDOWN_SEC,
} from "@/lib/studio/clothingTryOnEstimates";
import { mapSourceModelToGenerationSettings } from "@/lib/studio/mapSourceModelToGenerationSettings";
import { isSourceModelPopulated } from "@/lib/ai/sourceModelPostProcess";
import {
  LINGERIE_TRYON_DEFAULTS,
  withLingerieModelDefaults,
} from "@/lib/studio/lingerieTryOnDefaults";
import { applyDefaultLingerieCrop } from "@/lib/studio/lingerieCropDefaults";
import { productAnalysisForModelGeneration } from "@/lib/ai/productAnalysisShared";
import {
  mapApiImagesToStudioResults,
  mapProductShotStudioResults,
  nextGenerationSeed,
} from "@/lib/studio/resultUtils";
import {
  clearSavedModelStorage,
  readSavedModelFromStorage,
  type SavedStudioModel,
  writeSavedModelToStorage,
} from "@/lib/studio/savedModel";
import {
  applySavedModelSnapshotToState,
  buildSavedModelSnapshot,
  parseSavedModelSnapshot,
} from "@/lib/studio/savedModelSettings";
import { Button } from "@/components/ui/Button";
import { WhatsAppLoginModal } from "@/components/auth/WhatsAppLoginModal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProductPhotosUploader } from "./ProductPhotosUploader";
import {
  createStudioProductPhoto,
  revokeStudioProductPhoto,
  revokeStudioProductPhotos,
  type StudioProductPhoto,
} from "@/lib/studio/productPhotos";
import {
  ModelSourcePanel,
  type ModelSourceKind,
} from "./ModelSourcePanel";
import {
  ModelAdvancedControls,
  ModelPresetSelector,
} from "./ModelPresetSelector";
import { GarmentPhotoTypeAdvancedSelect } from "./GarmentSettingsPanel";
import { garmentPhotoTypeFromSourcePresentation } from "@/lib/studio/garmentPhotoTypeFromPresentation";
import { ModelScenarioSelector } from "./ModelScenarioSelector";
import { ProductCheckPanel } from "./ProductCheckPanel";
import type {
  ProductDescriptionAnalysis,
  ProductDescriptionAnalysisDebug,
} from "@/lib/ai/productDescriptionAnalysisSchemas";
import { isConfidentProductAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import { applyConfidentProductAnalysis } from "@/lib/studio/applyProductAnalysis";
import { resolveSourceModelBodyTypeSettings } from "@/lib/studio/mapSourceModelToGenerationSettings";
import { ProductShotSettingsPanel } from "./ProductShotSettingsPanel";
import { StudioModeSelector } from "./StudioModeSelector";
import { downloadImageFile } from "@/lib/studio/downloadImages";
import { GenerationResultGrid } from "./GenerationResultGrid";
import { TryOnResultActions } from "./TryOnResultActions";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "./PreviewImageCarousel";

import { PreviewCard } from "./PreviewCard";
import type { ProductMaskApplyResult } from "./ProductMaskEditor";
import { ProductSelectionPanel } from "./ProductSelectionPanel";
import { StudioWorkflowRail } from "./StudioWorkflowRail";
import { StudioWorkflowStep } from "./StudioWorkflowStep";
import { ProcessedAssetsPanel } from "./ProcessedAssetsPanel";
import { useStudioLocale } from "./useStudioLocale";
import {
  DEFAULT_MODEL_GENERATION_SETTINGS,
  DEFAULT_PRODUCT_SHOT_SETTINGS,
  type GarmentPhotoType,
  type ModelGenerationSettings,
  type ProductShotSettings,
  type StudioMode,
  type StudioResultImage,
  type StudioSessionAsset,
} from "./types";

async function readJsonResponse<T>(res: Response): Promise<
  | { ok: true; data: T }
  | { ok: false; error: string }
> {
  const text = await res.text();
  if (!text.trim()) {
    return {
      ok: false,
      error: res.ok
        ? "Сервер вернул пустой ответ. Попробуйте ещё раз."
        : `Сервер недоступен (${res.status}). Проверьте, что dev-сервер запущен, и попробуйте снова.`,
    };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      error: `Сервер вернул некорректный ответ (${res.status}). Обновите страницу и попробуйте снова.`,
    };
  }
}

function friendlyAiError(errorCode?: string, message?: string): string {
  if (errorCode === "FAL_KEY_MISSING") {
    return "AI-сервис не настроен на сервере. Обратитесь к администратору.";
  }

  if (errorCode === "FAL_UPLOAD_FAILED") {
    return "Не удалось временно отправить изображение в Fal. Попробуйте файл меньше 10MB в JPEG, PNG или WEBP.";
  }

  if (errorCode === "FAL_TRYON_FAILED") {
    return "Не удалось создать фото на модели. Попробуйте повторить примерку или выбрать другое фото.";
  }

  if (errorCode === "FAL_MODEL_GENERATION_FAILED") {
    return "Если модель получилась неудачной, сгенерируйте модель заново.";
  }

  if (message?.includes("did not generate the expected output")) {
    return "Если товар исказился, используйте более чёткое фото товара и режим максимального качества.";
  }

  if (errorCode === "FAL_MODEL_GENERATION_TIMEOUT") {
    return "Генерация заняла слишком долго. Попробуйте ещё раз.";
  }

  if (errorCode === "FAL_MODEL_CONTENT_BLOCKED") {
    return "Fal отклонил запрос. Попробуйте другой вариант фото или сценарий «Одежда» вместо белья. Для белья лучше фото товара на человеке и полный кадр модели.";
  }

  if (message?.includes("Product image file or URL is required")) {
    return "Загрузите фото товара.";
  }

  if (message?.includes("Product and model image sources are required")) {
    return "Загрузите фото товара и модель или сгенерируйте AI-модель.";
  }

  if (errorCode === "VALIDATION_ERROR") {
    return "Проверьте настройки модели (возраст, ракурсы, размер кадра) и попробуйте ещё раз.";
  }

  if (message?.includes("Invalid")) {
    return "Проверьте данные и попробуйте ещё раз.";
  }

  return message ?? "Не удалось создать изображение. Проверьте фото и попробуйте ещё раз.";
}

function useObjectUrlPreview() {
  const objectUrlRef = useRef<string | null>(null);

  const setFromFile = useCallback((file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!file) return null;
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    return url;
  }, []);

  const setFromHttpUrl = useCallback((url: string | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    return url;
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return useMemo(
    () => ({ setFromFile, setFromHttpUrl }),
    [setFromFile, setFromHttpUrl]
  );
}

export function StudioShell({
  mockMode,
  paidAiRunsAllowed,
  locale: localeProp,
}: {
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  locale?: Locale;
}) {
  const promptLocale = useStudioLocale(localeProp);
  const modelPreview = useObjectUrlPreview();

  const [studioMode, setStudioMode] = useState<StudioMode>("clothing-tryon");
  const [productPhotos, setProductPhotos] = useState<StudioProductPhoto[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const productPhotosRef = useRef<StudioProductPhoto[]>([]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [garmentPhotoType, setGarmentPhotoType] =
    useState<GarmentPhotoType>("auto");
  const [productDescription, setProductDescription] = useState("");
  const [productAnalysis, setProductAnalysis] =
    useState<ProductDescriptionAnalysis | null>(null);
  const [productAnalyzing, setProductAnalyzing] = useState(false);
  const [productAnalysisError, setProductAnalysisError] = useState<string | null>(
    null
  );
  const [productAnalysisDebug, setProductAnalysisDebug] =
    useState<ProductDescriptionAnalysisDebug | null>(null);
  const [userEditedProductDescription, setUserEditedProductDescription] =
    useState(false);
  const manualProductSettingsOverride = useRef(false);
  const manualCropOverride = useRef(false);
  const skipCropOverrideMark = useRef(false);
  const manualGarmentPhotoTypeOverride = useRef(false);
  const productAnalysisRequestId = useRef(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const showDevControls = isStudioAiDebugEnabled();
  const showAdvancedSettings = advancedOpen;
  const [modelSettings, setModelSettings] = useState<ModelGenerationSettings>(
    DEFAULT_MODEL_GENERATION_SETTINGS
  );
  const [modelDescription, setModelDescription] = useState("");
  const [productShotSettings, setProductShotSettings] =
    useState<ProductShotSettings>(DEFAULT_PRODUCT_SHOT_SETTINGS);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null
  );
  const [generatedModelPreviews, setGeneratedModelPreviews] = useState<
    PreviewCarouselItem[]
  >([]);
  const [savedStudioModel, setSavedStudioModel] =
    useState<SavedStudioModel | null>(null);
  const [modelSource, setModelSource] = useState<ModelSourceKind>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const savedModelUrl = savedStudioModel?.url ?? null;
  const [modelGenerating, setModelGenerating] = useState(false);
  const [modelGenerateError, setModelGenerateError] = useState<string | null>(
    null
  );
  const [modelGenerateNotice, setModelGenerateNotice] = useState<string | null>(
    null
  );
  const [modelGenerateProgress, setModelGenerateProgress] = useState<
    string | null
  >(null);
  const [productSampleAngles, setProductSampleAngles] = useState<
    ResolvedModelAngle[] | null
  >(null);
  const [useProductSampleAngles, setUseProductSampleAngles] = useState(false);
  const [analyzingProductAngles, setAnalyzingProductAngles] = useState(false);
  const [modelOutputSize, setModelOutputSize] = useState<
    Partial<ModelOutputSizeSelection>
  >(() => ({ ...DEFAULT_MODEL_OUTPUT_SIZE }));
  const [loading, setLoading] = useState(false);
  const [tryOnProgress, setTryOnProgress] = useState<string | null>(null);
  const [results, setResults] = useState<StudioResultImage[]>([]);
  const [sessionAssets, setSessionAssets] = useState<StudioSessionAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationSeed, setGenerationSeed] = useState(42);
  const [modelGenerationSeed, setModelGenerationSeed] = useState(42);
  const [maskEditorOpen, setMaskEditorOpen] = useState(false);
  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(
    null
  );
  const [selectedProductPreviewUrl, setSelectedProductPreviewUrl] = useState<
    string | null
  >(null);
  const selectedProductPreviewRef = useRef<string | null>(null);
  const clearSelectedProduct = useCallback(() => {
    if (selectedProductPreviewRef.current) {
      URL.revokeObjectURL(selectedProductPreviewRef.current);
      selectedProductPreviewRef.current = null;
    }
    setSelectedProductFile(null);
    setSelectedProductPreviewUrl(null);
    setMaskEditorOpen(false);
  }, []);

  useEffect(() => {
    productPhotosRef.current = productPhotos;
  }, [productPhotos]);

  useEffect(() => {
    if (productPhotos.length === 0) {
      setUseProductSampleAngles(false);
      setProductSampleAngles(null);
    }
  }, [productPhotos.length]);

  const generationAnglesOptions = useMemo(
    () => ({
      useProductSampleAngles,
      productSampleAngles,
    }),
    [useProductSampleAngles, productSampleAngles]
  );

  const resolveGenerationAngles = useCallback(
    () => resolveAnglesForGeneration(modelSettings, generationAnglesOptions),
    [modelSettings, generationAnglesOptions]
  );

  const validateGenerationAngles = useCallback((): string | null => {
    if (useProductSampleAngles) {
      return validateProductSampleAnglesMatch(
        productPhotos.length,
        productSampleAngles,
        true
      );
    }
    return validateModelAngles(modelSettings);
  }, [
    useProductSampleAngles,
    productPhotos.length,
    productSampleAngles,
    modelSettings,
  ]);

  const handleApplyAnglesFromProducts = useCallback(async () => {
    if (productPhotos.length === 0) {
      setModelGenerateError("Сначала загрузите фото товара.");
      return;
    }
    setAnalyzingProductAngles(true);
    setModelGenerateError(null);
    setModelGenerateNotice(null);
    try {
      const formData = new FormData();
      formData.append("productImageFile", productPhotos[0]!.file);
      const res = await fetch("/api/ai/analyze-product-angles", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        ok: boolean;
        angles?: ResolvedModelAngle[];
        message?: string;
        usedPresetFallback?: boolean;
      };
      if (!res.ok) {
        setModelGenerateError(
          data.message ?? `Ошибка сервера (${res.status}). Попробуйте ещё раз.`
        );
        return;
      }
      if (!data.ok || !data.angles?.length) {
        setModelGenerateError(
          data.message ?? "Не удалось разобрать позу с фото товара."
        );
        return;
      }
      setProductSampleAngles(data.angles.slice(0, 1));
      setUseProductSampleAngles(true);
      if (data.usedPresetFallback && data.message) {
        setModelGenerateNotice(data.message);
      }
    } catch {
      setModelGenerateError("Не удалось разобрать позу. Попробуйте ещё раз.");
    } finally {
      setAnalyzingProductAngles(false);
    }
  }, [productPhotos]);

  const handleClearProductSampleAngles = useCallback(() => {
    setUseProductSampleAngles(false);
    setProductSampleAngles(null);
  }, []);

  const activeProduct = useMemo(
    () =>
      productPhotos.find((photo) => photo.id === activeProductId) ??
      productPhotos[0] ??
      null,
    [productPhotos, activeProductId]
  );

  const productFile = activeProduct?.file ?? null;
  const effectiveProductPreviewUrl = activeProduct?.previewUrl ?? null;

  const productCarouselItems = useMemo(
    (): PreviewCarouselItem[] =>
      productPhotos.map((photo, index) => ({
        id: photo.id,
        url: photo.previewUrl,
        label: `Фото ${index + 1}`,
      })),
    [productPhotos]
  );

  const resetProductAnalysisState = useCallback(() => {
    productAnalysisRequestId.current += 1;
    setProductDescription("");
    setProductAnalysis(null);
    setProductAnalysisDebug(null);
    setProductAnalysisError(null);
    setUserEditedProductDescription(false);
    manualProductSettingsOverride.current = false;
    manualCropOverride.current = false;
    manualGarmentPhotoTypeOverride.current = false;
    setGarmentPhotoType("auto");
  }, []);

  const applyLingerieCropIfAllowed = useCallback(
    (settings: ModelGenerationSettings) =>
      manualCropOverride.current
        ? settings
        : applyDefaultLingerieCrop(settings),
    []
  );

  const runProductDescriptionAnalysis = useCallback(
    async (file: File): Promise<ProductDescriptionAnalysis | null> => {
      const requestId = ++productAnalysisRequestId.current;
      setProductAnalyzing(true);
      setProductAnalysisError(null);

      try {
        const formData = new FormData();
        formData.append("productImageFile", file);
        const res = await fetch("/api/ai/analyze-product-description", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as {
          ok: boolean;
          analysis?: ProductDescriptionAnalysis;
          debug?: ProductDescriptionAnalysisDebug;
          appliedSettingsRecommended?: boolean;
          message?: string;
        };

        if (requestId !== productAnalysisRequestId.current) return null;

        if (!res.ok || !data.ok || !data.analysis) {
          setProductAnalysisError(
            data.message ?? `Ошибка анализа (${res.status}). Заполните поля вручную.`
          );
          return null;
        }

        const { analysis } = data;
        setProductAnalysis(analysis);
        setProductAnalysisDebug(data.debug ?? null);
        setProductDescription(analysis.descriptionRu);
        setUserEditedProductDescription(false);

        const confident = isConfidentProductAnalysis(analysis.confidence);
        const hasSourceModel =
          analysis.sourcePresentation === "on-model" &&
          isSourceModelPopulated(analysis.sourceModel);

        if (!manualProductSettingsOverride.current) {
          skipCropOverrideMark.current = true;
          setModelSettings((prev) => {
            let next = prev;
            if (confident) {
              const applied = applyConfidentProductAnalysis({
                analysis,
                modelSettings: prev,
              });
              next = applied.modelSettings;
              if (analysis.categoryContext === "lingerie") {
                next = withLingerieModelDefaults(next);
                next = applyLingerieCropIfAllowed(next);
              }
            } else if (hasSourceModel && analysis.sourceModel) {
              next = {
                ...next,
                ...resolveSourceModelBodyTypeSettings(analysis.sourceModel),
              };
            }
            return next;
          });
          if (!manualGarmentPhotoTypeOverride.current) {
            setGarmentPhotoType(
              garmentPhotoTypeFromSourcePresentation(analysis.sourcePresentation)
            );
          }
          if (analysis.categoryContext === "lingerie") {
            setModelOutputSize((prev) => ({
              ...prev,
              resolution: LINGERIE_TRYON_DEFAULTS.modelResolution,
            }));
          }
        }
        return analysis;
      } catch {
        if (requestId !== productAnalysisRequestId.current) return null;
        setProductAnalysisError(
          "Не удалось проанализировать фото. Заполните параметры вручную."
        );
        return null;
      } finally {
        if (requestId === productAnalysisRequestId.current) {
          setProductAnalyzing(false);
        }
      }
    },
    [applyLingerieCropIfAllowed]
  );

  const handleReanalyzeProduct = useCallback(() => {
    const file = productPhotosRef.current[0]?.file;
    if (!file) return;
    void runProductDescriptionAnalysis(file);
  }, [runProductDescriptionAnalysis]);

  const handleAddProductFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      setError(null);
      resetProductAnalysisState();
      const file = files[0]!;
      const newPhoto = createStudioProductPhoto(file);
      setProductPhotos((prev) => {
        revokeStudioProductPhotos(prev);
        return [newPhoto];
      });
      setActiveProductId(newPhoto.id);
      setUseProductSampleAngles(false);
      setProductSampleAngles(null);
      clearSelectedProduct();
      void runProductDescriptionAnalysis(file);
    },
    [
      clearSelectedProduct,
      resetProductAnalysisState,
      runProductDescriptionAnalysis,
    ]
  );

  const handleRemoveProductPhoto = useCallback(
    (id: string) => {
      setProductPhotos((prev) => {
        const removed = prev.find((photo) => photo.id === id);
        if (removed) revokeStudioProductPhoto(removed);
        const next = prev.filter((photo) => photo.id !== id);
        setActiveProductId((active) => {
          if (active !== id) return active;
          return next[0]?.id ?? null;
        });
        if (next.length === 0) {
          resetProductAnalysisState();
        }
        return next;
      });
      clearSelectedProduct();
    },
    [clearSelectedProduct, resetProductAnalysisState]
  );

  const clearProductPhotos = useCallback(() => {
    setProductPhotos((prev) => {
      revokeStudioProductPhotos(prev);
      return [];
    });
    setActiveProductId(null);
    clearSelectedProduct();
    resetProductAnalysisState();
  }, [clearSelectedProduct, resetProductAnalysisState]);

  const handleModelFile = useCallback(
    (file: File) => {
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setGeneratedModelUrl(null);
      setGeneratedModelPreviews([]);
      setModelGenerateError(null);
      setModelFile(file);
      setModelPreviewUrl(modelPreview.setFromFile(file));
      setModelSource("upload");
    },
    [modelPreview]
  );

  useEffect(() => {
    return () => {
      revokeStudioProductPhotos(productPhotosRef.current);
      if (selectedProductPreviewRef.current) {
        URL.revokeObjectURL(selectedProductPreviewRef.current);
      }
    };
  }, []);

  const handleMaskApply = useCallback((result: ProductMaskApplyResult) => {
    if (selectedProductPreviewRef.current) {
      URL.revokeObjectURL(selectedProductPreviewRef.current);
    }
    selectedProductPreviewRef.current = result.previewUrl;
    setSelectedProductFile(result.file);
    setSelectedProductPreviewUrl(result.previewUrl);
    setMaskEditorOpen(false);
    setError(null);
  }, []);

  const clearModelFile = useCallback(() => {
    setModelFile(null);
    setModelPreviewUrl(modelPreview.setFromFile(null));
    setModelSource(savedModelUrl ? "saved" : null);
  }, [modelPreview, savedModelUrl]);

  const restoreSavedModelParameters = useCallback(
    (settings?: Record<string, unknown>) => {
      const snapshot = parseSavedModelSnapshot(settings);
      if (!snapshot) return;
      const restored = applySavedModelSnapshotToState(snapshot);
      setModelSettings(restored.generation);
      if (restored.outputSize) {
        setModelOutputSize(restored.outputSize);
      }
      setModelDescription(restored.modelDescription);
    },
    []
  );

  const handleSelectSavedModel = useCallback(() => {
    if (!savedStudioModel?.url) return;
    setModelFile(null);
    setModelPreviewUrl(modelPreview.setFromFile(null));
    setModelSource("saved");
    setGeneratedModelUrl(savedStudioModel.url);
    setGeneratedModelPreviews([
      {
        id: "saved-model",
        url: savedStudioModel.url,
        label: "Сохранённая модель",
      },
    ]);
    restoreSavedModelParameters(savedStudioModel.settings);
    setError(null);
  }, [modelPreview, restoreSavedModelParameters, savedStudioModel]);

  const applySavedStudioModel = useCallback(
    (model: SavedStudioModel, selectForTryOn = true) => {
      setSavedStudioModel(model);
      restoreSavedModelParameters(model.settings);
      if (selectForTryOn) {
        setModelSource("saved");
        setModelFile(null);
        setModelPreviewUrl(modelPreview.setFromFile(null));
        setGeneratedModelUrl(model.url);
        setGeneratedModelPreviews([
          {
            id: "saved-model",
            url: model.url,
            label: "Сохранённая модель",
          },
        ]);
      }
    },
    [modelPreview, restoreSavedModelParameters]
  );

  const loadPersistedSavedModel = useCallback(async () => {
    const local = readSavedModelFromStorage();
    if (local) {
      applySavedStudioModel(local, true);
    }

    try {
      const res = await fetch("/api/studio/saved-model", { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        model?: SavedStudioModel | null;
      };
      if (data.ok && data.model?.url) {
        writeSavedModelToStorage(data.model);
        applySavedStudioModel(data.model, true);
      }
    } catch {
      // Guest / offline — localStorage only.
    }
  }, [applySavedStudioModel]);

  const handleSaveModel = useCallback(async () => {
    if (!generatedModelUrl) return;
    if (!isRemoteImageUrl(generatedModelUrl)) {
      setModelGenerateError(
        "Сначала дождитесь окончания генерации модели или сгенерируйте её заново."
      );
      return;
    }

    const localModel: SavedStudioModel = {
      id: crypto.randomUUID(),
      url: generatedModelUrl,
      savedAt: new Date().toISOString(),
      settings: buildSavedModelSnapshot({
        generation: modelSettings,
        outputSize: modelOutputSize,
        modelDescription,
      }),
    };

    writeSavedModelToStorage(localModel);
    applySavedStudioModel(localModel, true);
    setError(null);
    setModelGenerateError(null);

    try {
      const res = await fetch("/api/studio/saved-model", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: generatedModelUrl,
          settings: buildSavedModelSnapshot({
            generation: modelSettings,
            outputSize: modelOutputSize,
            modelDescription,
          }),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        model?: SavedStudioModel;
        message?: string;
      };
      if (data.ok && data.model?.url) {
        writeSavedModelToStorage(data.model);
        setSavedStudioModel(data.model);
      } else if (!data.ok && res.status !== 401 && data.message) {
        setModelGenerateError(data.message);
      }
    } catch {
      // Local save already applied.
    }
  }, [
    applySavedStudioModel,
    generatedModelUrl,
    modelDescription,
    modelOutputSize,
    modelSettings,
  ]);

  const handleDeleteSavedModel = useCallback(async () => {
    clearSavedModelStorage();
    setSavedStudioModel(null);
    if (modelSource === "saved") {
      setModelSource(null);
    }

    try {
      await fetch("/api/studio/saved-model", { method: "DELETE" });
    } catch {
      // Guest — local clear is enough.
    }
  }, [modelSource]);

  const handleStartOverModel = useCallback(() => {
    setGeneratedModelUrl(null);
    setGeneratedModelPreviews([]);
    setModelGenerateError(null);
    setModelGenerateProgress(null);
  }, []);

  const savedModelPersistenceHint = savedModelUrl
    ? isAuthenticated
      ? "Хранится в вашем аккаунте, пока не удалите."
      : "Хранится на этом устройстве. Войдите, чтобы сохранить в аккаунте."
    : undefined;

  const persistAsset = useCallback(async (asset: StudioSessionAsset) => {
    try {
      await fetch("/api/studio/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
    } catch {
      // Session-only mode must keep working when auth or Supabase is absent.
    }
  }, []);

  const loadSavedAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/assets", { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        assets?: StudioSessionAsset[];
      };
      if (!data.ok || !data.assets?.length) return;
      setSessionAssets((prev) => {
        const savedIds = new Set(data.assets?.map((asset) => asset.id));
        return [
          ...(data.assets ?? []),
          ...prev.filter((asset) => !savedIds.has(asset.id)),
        ].slice(0, 48);
      });
    } catch {
      // History is an enhancement; anonymous/local studio flow should not fail.
    }
  }, []);

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user?: { id: string } | null }) => {
        setIsAuthenticated(Boolean(data.user));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const persistedLoadStartedRef = useRef(false);

  useEffect(() => {
    const runPersistedLoad = () => {
      void loadSavedAssets();
      void loadPersistedSavedModel();
    };

    if (!persistedLoadStartedRef.current) {
      persistedLoadStartedRef.current = true;
      runPersistedLoad();
    }

    const handler = () => runPersistedLoad();
    window.addEventListener("vitrina-auth-changed", handler);
    return () => window.removeEventListener("vitrina-auth-changed", handler);
  }, [loadSavedAssets, loadPersistedSavedModel]);

  const addAssetsToSession = useCallback((assets: StudioSessionAsset[]) => {
    setSessionAssets((prev) => [...assets, ...prev].slice(0, 48));
    assets.forEach((asset) => void persistAsset(asset));
  }, [persistAsset]);

  const addSingleAssetToSession = useCallback((asset: StudioSessionAsset) => {
    setSessionAssets((prev) => [asset, ...prev].slice(0, 48));
    void persistAsset(asset);
  }, [persistAsset]);

  const deleteSessionAsset = useCallback((id: string) => {
    setSessionAssets((prev) => prev.filter((asset) => asset.id !== id));
    void fetch("/api/studio/assets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  }, []);

  const mapResultsToSessionAssets = useCallback(
    (
      mappedResults: StudioResultImage[],
      type: StudioSessionAsset["type"],
      metadata: {
        mode: StudioSessionAsset["mode"];
        provider?: string;
        model?: string;
        requestId?: string;
        sourceImageUrl?: string;
        prompt?: string;
        estimatedCost?: number;
      }
    ): StudioSessionAsset[] =>
      mappedResults.map((result) => ({
        id: result.id,
        type,
        url: result.url,
        sourceImageUrl: metadata.sourceImageUrl,
        mode: metadata.mode,
        provider: metadata.provider ?? result.provider,
        model: metadata.model,
        requestId: metadata.requestId,
        createdAt: new Date().toISOString(),
        prompt: metadata.prompt,
        estimatedCost: metadata.estimatedCost,
        reviewStatus: result.reviewStatus,
        width: result.width,
        height: result.height,
        format: type === "video" ? "mp4" : "png",
        label: result.label,
      })),
    []
  );

  const resolveModelImageUrl = useCallback((): string | null => {
    if (modelFile) return null;
    if (savedModelUrl && modelSource === "saved" && isRemoteImageUrl(savedModelUrl)) {
      return savedModelUrl;
    }
    if (isRemoteImageUrl(generatedModelUrl)) return generatedModelUrl;
    return mockMode ? MOCK_MODEL_IMAGE : null;
  }, [modelFile, savedModelUrl, modelSource, generatedModelUrl, mockMode]);

  const step2ModelPreview =
    modelSource === "upload"
      ? modelPreviewUrl
      : modelSource === "saved"
        ? savedModelUrl
        : null;

  const effectiveModelPreview =
    step2ModelPreview ??
    (generatedModelUrl && !modelFile ? generatedModelUrl : null) ??
    (mockMode ? MOCK_MODEL_IMAGE : null);

  const modelCarouselItems = useMemo((): PreviewCarouselItem[] => {
    if (generatedModelPreviews.length > 0) {
      return generatedModelPreviews;
    }
    if (!effectiveModelPreview) return [];
    return [
      {
        id: "current-model",
        url: effectiveModelPreview,
        label:
          modelSource === "saved"
            ? "Сохранённая модель"
            : modelSource === "upload"
              ? "Загруженная модель"
              : "AI-модель",
      },
    ];
  }, [generatedModelPreviews, effectiveModelPreview, modelSource]);

  const handleModelSettingsChange = useCallback(
    (settings: ModelGenerationSettings) => {
      if (!skipCropOverrideMark.current) {
        if (
          settings.crop !== modelSettings.crop ||
          settings.cropCustom !== modelSettings.cropCustom
        ) {
          manualCropOverride.current = true;
        }
      }
      skipCropOverrideMark.current = false;

      const wasLingerie = modelSettings.categoryContext === "lingerie";
      const isLingerie = settings.categoryContext === "lingerie";
      let nextSettings = settings;

      if (isLingerie && !wasLingerie) {
        setModelOutputSize((prev) => ({
          ...prev,
          resolution: LINGERIE_TRYON_DEFAULTS.modelResolution,
        }));
        nextSettings = applyLingerieCropIfAllowed(nextSettings);
      }

      if (isLingerie) {
        nextSettings = withLingerieModelDefaults(nextSettings);
      }

      setModelSettings(nextSettings);
    },
    [
      applyLingerieCropIfAllowed,
      modelSettings.categoryContext,
      modelSettings.crop,
      modelSettings.cropCustom,
    ]
  );

  const handleGenerateModel = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? modelGenerationSeed;
    setModelGenerating(true);
    setModelGenerateError(null);
    setModelGenerateNotice(null);

    const minorRestriction = minorRestrictedChoice(modelSettings);
    if (minorRestriction) {
      setModelGenerateError(minorRestrictionMessage(minorRestriction));
      setModelGenerating(false);
      return;
    }

    if (!isModelOutputSizeComplete(modelOutputSize)) {
      setModelGenerateError(
        "Выберите соотношение сторон изображения."
      );
      setModelGenerating(false);
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setModelGenerateError(anglesError);
      setModelGenerating(false);
      return;
    }

    const customParamsError = validateModelCustomParams(modelSettings);
    if (customParamsError) {
      setModelGenerateError(customParamsError);
      setModelGenerating(false);
      return;
    }

    const angles = resolveGenerationAngles();
    const collected: PreviewCarouselItem[] = [];
    setGeneratedModelPreviews([]);
    setGeneratedModelUrl(null);
    let identityReferenceUrl: string | null = null;

    try {
      for (let index = 0; index < angles.length; index++) {
        const angle = angles[index]!;
        setModelGenerateProgress(
          angles.length > 1
            ? index === 0
              ? `Ракурс 1 из ${angles.length}: ${angle.label} (базовая модель)`
              : `Ракурс ${index + 1} из ${angles.length}: ${angle.label} (то же лицо и образ)`
            : "Генерируем AI-модель…"
        );

        const controller = new AbortController();
        const requestTimeoutMs = 150_000;
        const timeoutId = window.setTimeout(
          () => controller.abort(),
          requestTimeoutMs
        );

        const productGen = productAnalysisForModelGeneration(
          productAnalysis,
          { categoryContext: modelSettings.categoryContext },
          productDescription,
          userEditedProductDescription
        );

        let res: Response;
        try {
          res = await fetch("/api/ai/generate-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              buildGenerateModelRequestBody({
                settings: {
                  ...modelSettings,
                  categoryContext: productGen.categoryContext,
                },
                outputSize: modelOutputSize,
                modelDescription,
                shortAiSummaryEn: productGen.shortAiSummaryEn,
                productSetType: productGen.productSetType,
                productSourcePresentation: productGen.productSourcePresentation,
                promptLocale,
                seed: useSeed,
                angle,
                referenceImageUrl:
                  index > 0 ? identityReferenceUrl : undefined,
                productPoseDescriptionRu: useProductSampleAngles
                  ? productPoseDescriptionForGeneration(angle)
                  : undefined,
              })
            ),
            signal: controller.signal,
          });
        } catch (fetchError) {
          if (
            fetchError instanceof Error &&
            fetchError.name === "AbortError"
          ) {
            if (collected.length > 0) {
              setGeneratedModelPreviews([...collected]);
              setGeneratedModelUrl(collected[0]!.url);
            }
            setModelGenerateError(
              `Ракурс «${angle.label}»: генерация заняла слишком долго (больше 2,5 мин).` +
                (collected.length > 0
                  ? ` Готово ${collected.length} из ${angles.length}.`
                  : "")
            );
            return;
          }
          throw fetchError;
        } finally {
          window.clearTimeout(timeoutId);
        }

        const data = (await res.json()) as GenerateModelResponse & {
          detail?: string;
          usedAngleEditFallback?: boolean;
        };

        if (!data.ok) {
          if (collected.length > 0) {
            setGeneratedModelPreviews([...collected]);
            setGeneratedModelUrl(collected[0]!.url);
          }
          const partialHint =
            collected.length > 0
              ? ` Готово ${collected.length} из ${angles.length}.`
              : "";
          const detailHint = data.detail
            ? ` (${data.detail.slice(0, 120)}…)`
            : "";
          setModelGenerateError(
            (angles.length > 1
              ? `Ракурс «${angle.label}»: ${friendlyAiError(
                  data.errorCode,
                  data.message
                )}`
              : friendlyAiError(data.errorCode, data.message)) +
              partialHint +
              detailHint
          );
          return;
        }

        if (data.usedAngleEditFallback && index > 0) {
          setModelGenerateProgress(
            `Ракурс ${index + 1} из ${angles.length}: ${angle.label} (отдельная генерация, то же лицо по промпту)`
          );
        }

        const url = data.images[0]?.url;
        if (!url) {
          setModelGenerateError(
            angles.length > 1
              ? `Ракурс «${angle.label}»: модель не вернула изображение.`
              : "Модель не вернула изображение. Попробуйте ещё раз."
          );
          return;
        }

        collected.push({ id: angle.key, url, label: angle.label });
        setGeneratedModelPreviews([...collected]);
        if (index === 0) {
          identityReferenceUrl = url;
        }
      }

      const primaryUrl = collected[0]?.url;
      if (!primaryUrl) {
        setModelGenerateError("Модель не вернула изображение. Попробуйте ещё раз.");
        return;
      }

      setGeneratedModelUrl(primaryUrl);
      setModelFile(null);
      setModelPreviewUrl(modelPreview.setFromFile(null));
      setModelSource(null);
      setModelGenerationSeed(nextGenerationSeed());
    } catch {
      setModelGenerateError(
        "Не удалось сгенерировать модель. Попробуйте ещё раз."
      );
    } finally {
      setModelGenerating(false);
      setModelGenerateProgress(null);
    }
  };

  const resolvePipelineOutputSize = useCallback((): ModelOutputSizeSelection => {
    const size = isModelOutputSizeComplete(modelOutputSize)
      ? modelOutputSize
      : { ...DEFAULT_MODEL_OUTPUT_SIZE };
    if (!showDevControls && size.resolution !== "2K") {
      return { ...size, resolution: "2K" };
    }
    return size;
  }, [modelOutputSize, showDevControls]);

  const hasUserUploadedModel = useCallback(
    () =>
      Boolean(
        (modelSource === "upload" && modelFile) ||
          (modelSource === "saved" && isRemoteImageUrl(savedModelUrl))
      ),
    [modelFile, modelSource, savedModelUrl]
  );

  const handleGenerateTryOn = async (options?: {
    seedOverride?: number;
    appendResults?: boolean;
    analysisOverride?: ProductDescriptionAnalysis | null;
    skipLoadingState?: boolean;
    /** SaaS orchestrator — model may be created in the same run */
    modelImageUrlOverride?: string | null;
    requireExistingModel?: boolean;
  }) => {
    const useSeed = options?.seedOverride ?? generationSeed;

    if (!productFile) {
      setError("Загрузите фото товара.");
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setError(anglesError);
      return;
    }

    const pipelineSize = resolvePipelineOutputSize();
    if (!isModelOutputSizeComplete(pipelineSize)) {
      setError("Выберите соотношение сторон в настройках модели.");
      return;
    }

    const requireModel = options?.requireExistingModel !== false;
    const resolvedModelUrl = modelFile
      ? null
      : (options?.modelImageUrlOverride?.trim() ||
          resolveModelImageUrl());
    if (requireModel && !modelFile && !resolvedModelUrl) {
      if (generatedModelUrl && !isRemoteImageUrl(generatedModelUrl)) {
        setError(
          "Ссылка на AI-модель устарела. Нажмите «Сгенерировать AI-модель» ещё раз или загрузите фото модели."
        );
      } else {
        setError(
          "Сначала загрузите фото модели или сгенерируйте AI-модель — примерка использует уже готовую модель."
        );
      }
      return;
    }

    const angles = resolveGenerationAngles();
    const angle = angles[0];
    if (!angle) {
      setError("Выберите вариант фото для карточки.");
      return;
    }

    if (!options?.skipLoadingState) {
      setLoading(true);
    }
    setTryOnProgress("Переносим товар на модель…");
    setError(null);
    if (!options?.appendResults) {
      setResults([]);
    }

    const perStepTimeoutMs = 120_000;

    try {
      const analysisForTryOn =
        options?.analysisOverride ?? productAnalysis;

      const formData = new FormData();
      appendStudioTryOnFields(formData, {
        productFile,
        modelFile,
        modelImageUrl: resolvedModelUrl,
        garmentPhotoType,
        garmentPhotoTypeManualOverride: manualGarmentPhotoTypeOverride.current,
        categoryContext: modelSettings.categoryContext,
        isLingerie: isLingerieScenario,
        productAnalysis: analysisForTryOn,
        productDescription,
        userEditedProductDescription,
        modelResolution: pipelineSize.resolution,
        seed: useSeed,
      });

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        perStepTimeoutMs
      );

      let res: Response;
      try {
        res = await fetch("/api/ai/tryon", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      const parsed = await readJsonResponse<TryOnResponse>(res);

      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      const data = parsed.data;

      if (!data.ok) {
        setError(friendlyAiError(data.errorCode, data.message));
        return;
      }

      const mappedResults = mapApiImagesToStudioResults(data.images, angle.label, {
        provider: data.provider,
        model: data.model,
        requestId: data.requestId,
        seed: useSeed,
        estimatedCost: estimateTryOnOnlyCostUsd(),
      });

      setResults((prev) =>
        options?.appendResults ? [...prev, ...mappedResults] : mappedResults
      );

      addAssetsToSession(
        mapResultsToSessionAssets(mappedResults, "tryon", {
          mode: "clothing-tryon",
          provider: mappedResults[0]?.provider,
          model: data.ok ? data.model : undefined,
          requestId: data.ok ? data.requestId : undefined,
          sourceImageUrl: effectiveProductPreviewUrl ?? undefined,
        })
      );
      setGenerationSeed(nextGenerationSeed());
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "Примерка заняла слишком много времени. Попробуйте режим «1K» или другое фото модели."
        );
        return;
      }
      const detail =
        error instanceof Error && error.message
          ? error.message
          : "сеть или dev-сервер";
      setError(
        detail === "Failed to fetch"
          ? "Не удалось связаться с сервером. Проверьте, что dev-сервер запущен (npm run dev), откройте ту же страницу без перезагрузки во время генерации и попробуйте снова."
          : `Не удалось связаться с сервером (${detail}). Убедитесь, что приложение запущено, и попробуйте ещё раз.`
      );
    } finally {
      if (!options?.skipLoadingState) {
        setTryOnProgress(null);
        setLoading(false);
      }
    }
  };

  const removeBackgroundForProduct = async (
    imageFile: File
  ): Promise<RemoveBackgroundResponse> => {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    formData.append("syncMode", "false");
    const res = await fetch("/api/ai/remove-background", {
      method: "POST",
      body: formData,
    });
    return (await res.json()) as RemoveBackgroundResponse;
  };

  const handleExactProductCard = async () => {
    const bgSourceFile = selectedProductFile ?? productFile;

    if (!bgSourceFile) {
      setError("Загрузите фото товара.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const maskUsed = Boolean(selectedProductFile);
      let cutoutUrl: string;

      const bgData = await removeBackgroundForProduct(bgSourceFile);

      if (!bgData.ok) {
        setError(friendlyAiError(bgData.errorCode, bgData.message));
        return;
      }

      const bgProvider = bgData.provider;

      if (selectedProductFile) {
        cutoutUrl = await refineCutoutWithUserMask(
          bgData.image.url,
          selectedProductFile
        );
      } else {
        cutoutUrl = bgData.image.url;
      }
      const [exportWidth, exportHeight] = shotSizePresetToDimensions(
        productShotSettings.shotSizePreset,
        productShotSettings.imageQuality
      );
      let sizedCutoutUrl = cutoutUrl;
      try {
        sizedCutoutUrl = await fitCutoutToShotSize(
          cutoutUrl,
          productShotSettings.shotSizePreset,
          productShotSettings.imageQuality
        );
      } catch {
        /* keep API url if canvas processing fails */
      }
      const background = scenePresetToExactBackground(
        productShotSettings.scenePreset,
        productShotSettings.sceneCustomDescription
      );
      const cardUrl = await composeExactProductCard(sizedCutoutUrl, {
        background,
        shotSizePreset: productShotSettings.shotSizePreset,
        imageQuality: productShotSettings.imageQuality,
      });

      const mappedResults = mapProductShotStudioResults(
        [{ url: cardUrl, width: exportWidth, height: exportHeight }],
        "exact-card",
        {
          cutoutPreviewUrl: sizedCutoutUrl,
          selectedProductPreviewUrl: selectedProductPreviewUrl ?? undefined,
          manualMaskUsed: maskUsed,
          exactCardWithoutMask: !maskUsed,
          provider: bgProvider,
        }
      );
      setResults(mappedResults);
      addAssetsToSession(
        mapResultsToSessionAssets(mappedResults, "exact-card", {
          mode: "product-shot",
          provider: bgProvider,
          model: bgData.ok ? bgData.model : undefined,
          requestId: bgData.ok ? bgData.requestId : undefined,
          sourceImageUrl:
            effectiveProductPreviewUrl ?? selectedProductPreviewUrl ?? undefined,
        })
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось собрать точную карточку.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductShot = async () => {
    await handleExactProductCard();
  };

  const handleStartOver = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const handleCreatePhotoOnModel = async () => {
    if (!productFile) {
      setError("Сначала загрузите фото товара.");
      return;
    }

    const minorRestriction = minorRestrictedChoice(modelSettings);
    if (minorRestriction) {
      setError(minorRestrictionMessage(minorRestriction));
      return;
    }

    const pipelineSize = resolvePipelineOutputSize();
    if (!isModelOutputSizeComplete(pipelineSize)) {
      setError("Выберите соотношение сторон в настройках модели.");
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setError(anglesError);
      return;
    }

    const customParamsError = validateModelCustomParams(modelSettings);
    if (customParamsError) {
      setError(customParamsError);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setTryOnProgress("Проверяем товар…");

    try {
      let analysis = productAnalysis;
      if (!analysis) {
        analysis = await runProductDescriptionAnalysis(productFile);
        if (!analysis) {
          setError(
            productAnalysisError ??
              "Не удалось проанализировать товар. Проверьте описание и попробуйте снова."
          );
          return;
        }
      }

      let modelUrlForTryOn: string | null = null;

      if (hasUserUploadedModel()) {
        modelUrlForTryOn = modelFile ? null : resolveModelImageUrl();
      } else {
        const needsFreshModel =
          !generatedModelUrl || !isRemoteImageUrl(generatedModelUrl);
        if (needsFreshModel) {
          setTryOnProgress("Создаём модель…");
          setModelGenerating(true);
          setModelGenerateError(null);

          const angles = resolveGenerationAngles();
          const angle = angles[0];
          if (!angle) {
            setError("Не удалось определить позу для генерации.");
            return;
          }

          const controller = new AbortController();
          const timeoutId = window.setTimeout(
            () => controller.abort(),
            150_000
          );

          try {
            const hasSourceModel =
              analysis.sourcePresentation === "on-model" &&
              isSourceModelPopulated(analysis.sourceModel);
            const mapped = mapSourceModelToGenerationSettings({
              settings: modelSettings,
              sourceModel: analysis.sourceModel,
            });
            let genSettings = withLingerieModelDefaults(mapped.settings);
            if (analysis.categoryContext === "lingerie") {
              genSettings = applyLingerieCropIfAllowed(genSettings);
            }

            const { url } = await fetchGenerateSingleStudioModel({
              settings: genSettings,
              outputSize: pipelineSize,
              modelDescription,
              promptLocale,
              seed: modelGenerationSeed,
              angle,
              productAnalysis: analysis,
              productDescription,
              userEditedProductDescription,
              useProductSampleAngles,
              cameraAnglePromptOverride: mapped.cameraAnglePrompt,
              signal: controller.signal,
            });
            modelUrlForTryOn = url;
            setGeneratedModelUrl(url);
            setGeneratedModelPreviews([
              { id: angle.key, url, label: angle.label },
            ]);
            setModelFile(null);
            setModelPreviewUrl(modelPreview.setFromFile(null));
            setModelSource(null);
            setModelGenerationSeed(nextGenerationSeed());
          } catch (genError) {
            setError(
              genError instanceof Error
                ? genError.message
                : "Не удалось сгенерировать модель."
            );
            return;
          } finally {
            window.clearTimeout(timeoutId);
            setModelGenerating(false);
          }
        } else {
          modelUrlForTryOn = resolveModelImageUrl();
        }
      }

      if (!modelFile && !modelUrlForTryOn) {
        setError("Не удалось получить изображение модели для примерки.");
        return;
      }

      setTryOnProgress("Переносим товар на модель…");
      await handleGenerateTryOn({
        analysisOverride: analysis,
        skipLoadingState: true,
        modelImageUrlOverride: modelUrlForTryOn,
        requireExistingModel: false,
      });
    } finally {
      setLoading(false);
      setTryOnProgress(null);
    }
  };

  const handlePrimaryAction = () => {
    if (studioMode === "clothing-tryon") return void handleCreatePhotoOnModel();
    return handleProductShot();
  };

  const isClothingMode = studioMode === "clothing-tryon";
  const isProductShotMode = studioMode === "product-shot";
  const isPostProcessingMode = studioMode === "post-processing";
  const hasProductInput = productPhotos.length > 0;
  const primaryBlocker = (() => {
    if (!hasProductInput) return "Сначала загрузите фото.";
    if (productAnalyzing) return "Идёт AI-анализ товара…";

    if (isClothingMode) {
      const anglesError = validateGenerationAngles();
      if (anglesError) return anglesError;

      if (!isModelOutputSizeComplete(modelOutputSize)) {
        return "Выберите соотношение сторон в настройках модели.";
      }
    }

    if (
      isProductShotMode &&
      productShotSettings.scenePreset === "custom" &&
      !productShotSettings.sceneCustomDescription.trim()
    ) {
      return "Опишите фон своими словами.";
    }

    return null;
  })();
  const canRunPrimary =
    !loading && !modelGenerating && !productAnalyzing && primaryBlocker === null;
  const primaryHelper = primaryBlocker;

  const primaryButtonLabel = isClothingMode
    ? "Создать фото на модели"
    : "Создать карточку";

  const PrimaryIcon = isClothingMode ? Wand2 : Camera;

  const isLingerieScenario = modelSettings.categoryContext === "lingerie";
  const finalTryOnResult = results[0] ?? null;
  const pipelineBusy = isClothingMode && loading;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
          <span className="hidden text-sm font-bold tracking-tight text-slate-950 sm:inline">
            Vitrina <span className="text-teal-700">AI</span>
          </span>
          <WhatsAppLoginModal />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <section>
            <Badge variant="violet" className="mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Vitrina AI Studio
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Студия товарных фото
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Создавайте фото для карточек товаров: одежда на модели, точная
              товарная карточка и проработка готовых изображений для видео,
              фона и Reels.
            </p>
        </section>

        <StudioModeSelector value={studioMode} onChange={setStudioMode} />

        {isPostProcessingMode ? (
          <ProcessedAssetsPanel
            assets={sessionAssets}
            mockMode={mockMode}
            promptLocale={promptLocale}
            onDeleteAsset={deleteSessionAsset}
            onAssetCreated={addSingleAssetToSession}
          />
        ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-stretch">
          <aside className="space-y-4">
            <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="overflow-visible px-0 pb-2 pt-2">
              <StudioWorkflowRail>
                    <StudioWorkflowStep
                      step={1}
                        label={isClothingMode ? "Товар" : "Фото товара"}
                    >
                      <ProductPhotosUploader
                        label="Загрузите фото товара"
                        hint={
                          isClothingMode
                            ? "Подойдёт фото товара на модели или отдельно. AI сам определит параметры."
                            : "Одно фото за раз. Для следующего SKU замените файл после примерки."
                        }
                        photos={productPhotos}
                        activePhotoId={activeProductId}
                        onAddFiles={handleAddProductFiles}
                        onSelectPhoto={setActiveProductId}
                        onRemovePhoto={handleRemoveProductPhoto}
                        onClearAll={clearProductPhotos}
                      />
                      {isClothingMode ? (
                        <div className="mt-6 space-y-6 border-t border-border/50 pt-6">
                          <ProductCheckPanel
                            hasPhoto={productPhotos.length > 0}
                            description={productDescription}
                            analyzing={productAnalyzing}
                            error={productAnalysisError}
                            analysis={productAnalysis}
                            scenario={modelSettings.categoryContext}
                            onReanalyze={handleReanalyzeProduct}
                          />
                          <ModelScenarioSelector
                            value={modelSettings.categoryContext}
                            modelAge={modelSettings.modelAge}
                            disabled={productAnalyzing}
                            onChange={(categoryContext) => {
                              manualProductSettingsOverride.current = true;
                              let next: ModelGenerationSettings = {
                                ...modelSettings,
                                categoryContext,
                              };
                              if (categoryContext === "lingerie") {
                                next = applyLingerieCropIfAllowed(
                                  withLingerieModelDefaults(next)
                                );
                              }
                              skipCropOverrideMark.current = true;
                              handleModelSettingsChange(next);
                            }}
                          />
                        </div>
                      ) : null}
                    </StudioWorkflowStep>

                    {isProductShotMode && (
                      <StudioWorkflowStep
                        step={2}
                        label="Выделение товара"
                        optional
                      >
                        <ProductSelectionPanel
                          active={
                            hasProductInput &&
                            Boolean(effectiveProductPreviewUrl)
                          }
                          previewUrl={effectiveProductPreviewUrl}
                          maskEditorOpen={maskEditorOpen}
                          hasSelectedProduct={Boolean(selectedProductFile)}
                          selectedProductPreviewUrl={
                            selectedProductPreviewUrl
                          }
                          onOpenEditor={() => setMaskEditorOpen(true)}
                          onApply={handleMaskApply}
                          onCancelEditor={() => setMaskEditorOpen(false)}
                          onClearSelection={clearSelectedProduct}
                        />
                      </StudioWorkflowStep>
                    )}

                    {isClothingMode && (
                      <>
                        <StudioWorkflowStep
                          step={2}
                          label="Модель"
                          softCorner="bottom"
                        >
                          <ModelPresetSelector
                            key={
                              modelSource === "saved" && savedStudioModel
                                ? `saved-${savedStudioModel.id}`
                                : "model-draft"
                            }
                            settings={modelSettings}
                            onSettingsChange={handleModelSettingsChange}
                            outputSize={modelOutputSize}
                            onOutputSizeChange={(patch) =>
                              setModelOutputSize((prev) => {
                                const next = { ...prev, ...patch };
                                if (
                                  next.resolution &&
                                  !FAL_MODEL_RESOLUTIONS.includes(
                                    next.resolution
                                  )
                                ) {
                                  delete next.resolution;
                                }
                                return next;
                              })
                            }
                            settingsLocked={
                              loading || modelGenerating || productAnalyzing
                            }
                            settingsLockMessage={
                              productAnalyzing
                                ? "Идёт AI-анализ товара. Настройки модели откроются после завершения."
                                : undefined
                            }
                          />
                          <div className="relative mt-6">
                            {productAnalyzing ? (
                              <div
                                className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-white/80 px-4 backdrop-blur-[2px]"
                                role="status"
                                aria-live="polite"
                              >
                                <p className="text-center text-sm leading-5 text-slate-700">
                                  Идёт AI-анализ товара. Дополнительные настройки
                                  откроются после завершения.
                                </p>
                              </div>
                            ) : null}
                            <details
                              className={`rounded-[14px] border border-slate-200/80 bg-slate-50/50 px-3 py-2${
                                productAnalyzing
                                  ? " pointer-events-none select-none opacity-60"
                                  : ""
                              }`}
                              open={productAnalyzing ? false : advancedOpen}
                              onToggle={(event) => {
                                if (productAnalyzing) {
                                  event.preventDefault();
                                  return;
                                }
                                setAdvancedOpen(
                                  (event.currentTarget as HTMLDetailsElement).open
                                );
                              }}
                            >
                            <summary
                              className={`text-sm font-medium text-slate-800${
                                productAnalyzing
                                  ? " cursor-not-allowed"
                                  : " cursor-pointer"
                              }`}
                            >
                              Дополнительные настройки
                            </summary>
                            <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
                              {(showAdvancedSettings || showDevControls) && (
                                <GarmentPhotoTypeAdvancedSelect
                                  garmentPhotoType={garmentPhotoType}
                                  onGarmentPhotoTypeChange={(value) => {
                                    manualGarmentPhotoTypeOverride.current = true;
                                    setGarmentPhotoType(value);
                                  }}
                                />
                              )}
                              <ModelAdvancedControls
                                settings={modelSettings}
                                onSettingsChange={handleModelSettingsChange}
                                onGenerate={() => void handleGenerateModel()}
                                modelDescription={modelDescription}
                                onModelDescriptionChange={setModelDescription}
                                generating={modelGenerating}
                                generateError={modelGenerateError}
                                generateNotice={modelGenerateNotice}
                                generateProgress={modelGenerateProgress}
                                generatedPreviewItems={
                                  !modelFile ? generatedModelPreviews : []
                                }
                                isModelSaved={Boolean(
                                  savedModelUrl &&
                                    generatedModelUrl &&
                                    savedModelUrl === generatedModelUrl
                                )}
                                onSaveModel={() => void handleSaveModel()}
                                onStartOverModel={handleStartOverModel}
                                outputSize={modelOutputSize}
                                onOutputSizeChange={(patch) =>
                                  setModelOutputSize((prev) => {
                                    const next = { ...prev, ...patch };
                                    if (
                                      next.resolution &&
                                      !FAL_MODEL_RESOLUTIONS.includes(
                                        next.resolution
                                      )
                                    ) {
                                      delete next.resolution;
                                    }
                                    return next;
                                  })
                                }
                                productPhotoCount={productPhotos.length}
                                useProductSampleAngles={useProductSampleAngles}
                                productSampleAngles={productSampleAngles}
                                analyzingProductAngles={analyzingProductAngles}
                                onApplyAnglesFromProducts={() =>
                                  void handleApplyAnglesFromProducts()
                                }
                                onClearProductSampleAngles={
                                  handleClearProductSampleAngles
                                }
                                dictationLocale={promptLocale}
                                showDevControls={showDevControls}
                                modelGenerationSeed={modelGenerationSeed}
                                tryOnSeed={generationSeed}
                              />
                              <ModelSourcePanel
                                label="Загрузите фото модели"
                                hint={
                                  isLingerieScenario
                                    ? "Для белья лучше полный рост или кадр до бёдер."
                                    : "Своя модель вместо AI — необязательно."
                                }
                                savedModelUrl={savedModelUrl}
                                savedModelPersistenceHint={
                                  savedModelPersistenceHint
                                }
                                modelSource={modelSource}
                                onSelectSaved={handleSelectSavedModel}
                                onDeleteSaved={handleDeleteSavedModel}
                                previewUrl={step2ModelPreview}
                                selectedFile={modelFile}
                                onFileSelect={handleModelFile}
                                onClearFile={clearModelFile}
                              />
                              {showDevControls ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  disabled={loading || !hasProductInput}
                                  onClick={() =>
                                    void handleGenerateTryOn({
                                      requireExistingModel: true,
                                    })
                                  }
                                >
                                  Только примерка (dev)
                                </Button>
                              ) : null}
                            </div>
                          </details>
                          </div>
                        </StudioWorkflowStep>

                        <StudioWorkflowStep step={3} label="Создание фото" isLast>
                          <div className="space-y-3">
                            <Button
                              className="w-full"
                              size="lg"
                              loading={loading || modelGenerating}
                              disabled={!canRunPrimary}
                              title={primaryBlocker ?? undefined}
                              onClick={handlePrimaryAction}
                            >
                              <PrimaryIcon className="h-5 w-5" />
                              {primaryButtonLabel}
                            </Button>
                            <p className="text-center text-xs leading-5 text-slate-600">
                              AI сам создаст модель, перенесёт товар и улучшит
                              финальный кадр.
                            </p>
                            <p className="text-center text-xs font-medium tabular-nums text-slate-500">
                              {formatSaasPipelineCostKztRange()}
                            </p>
                            {productAnalysis?.sourcePresentation === "on-model" &&
                            isSourceModelPopulated(productAnalysis.sourceModel) ? (
                              <p className="text-center text-xs leading-5 text-teal-900">
                                AI подберёт модель похожей комплекции и позы
                              </p>
                            ) : null}
                            {tryOnProgress ? (
                              <p className="rounded-[12px] border border-teal-100 bg-teal-50 px-3 py-2 text-center text-sm text-teal-900">
                                {tryOnProgress}
                              </p>
                            ) : null}
                            {primaryHelper ? (
                              <p className="text-center text-xs leading-5 text-amber-800">
                                {primaryHelper}
                              </p>
                            ) : null}
                          </div>
                        </StudioWorkflowStep>
                      </>
                    )}

                    {isProductShotMode && (
                      <StudioWorkflowStep
                        step={3}
                        label="Карточка маркетплейса"
                      >
                        <ProductShotSettingsPanel
                          settings={productShotSettings}
                          onChange={setProductShotSettings}
                        />
                      </StudioWorkflowStep>
                    )}

                    {!isClothingMode ? (
                      <StudioWorkflowStep step={4} label="Готово" isLast>
                        <Button
                          className="w-full"
                          size="lg"
                          loading={loading}
                          disabled={!canRunPrimary}
                          title={primaryBlocker ?? undefined}
                          onClick={handlePrimaryAction}
                        >
                          <PrimaryIcon className="h-5 w-5" />
                          {primaryButtonLabel}
                        </Button>
                        {primaryHelper ? (
                          <p className="mt-2 text-center text-xs leading-5 text-amber-800">
                            {primaryHelper}
                          </p>
                        ) : null}
                      </StudioWorkflowStep>
                    ) : null}
              </StudioWorkflowRail>
            </CardContent>
            </Card>
          </aside>

          <section className="flex min-h-0 flex-col pt-2 lg:self-stretch">
            <div
              className={
                isClothingMode
                  ? "space-y-4 lg:sticky lg:top-6 lg:z-10"
                  : "space-y-4"
              }
            >
              {error ? (
                <div
                  role="alert"
                  className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              {isClothingMode ? (
                <div className="mx-auto w-full max-w-4xl">
                  <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6">
                    <div className="flex min-w-0">
                      <PreviewCard
                        catalogViewport
                        className="w-full"
                        title="Товар"
                        url={
                          productCarouselItems.length === 1
                            ? (productCarouselItems[0]?.url ?? null)
                            : null
                        }
                        empty="Загрузите фото товара"
                        content={
                          productCarouselItems.length > 1 ? (
                            <PreviewImageCarousel
                              items={productCarouselItems}
                              showDownloadActions={false}
                              className="h-full min-h-0"
                              imageClassName="max-h-full max-w-full object-contain"
                            />
                          ) : undefined
                        }
                      />
                    </div>
                    <div className="flex min-w-0">
                        <PreviewCard
                          catalogViewport
                          className="w-full"
                          title="AI-модель"
                          url={
                            modelCarouselItems.length === 1
                              ? (modelCarouselItems[0]?.url ?? null)
                              : null
                          }
                          empty="Сгенерируется при создании фото на модели"
                          loading={modelGenerating}
                          loadingVariant="countdown"
                          countdownSeconds={SAAS_MODEL_GENERATION_COUNTDOWN_SEC}
                          countdownLabel="Создаём AI-модель"
                          loadingSubdetail={
                            pipelineBusy && !modelGenerating
                              ? tryOnProgress
                              : null
                          }
                          content={
                            modelCarouselItems.length > 1 ? (
                              <PreviewImageCarousel
                                items={modelCarouselItems}
                                showDownloadActions={false}
                                className="h-full min-h-0"
                                imageClassName="max-h-full max-w-full object-contain"
                              />
                            ) : undefined
                          }
                        />
                    </div>
                    <div className="min-w-0">
                      <PreviewCard
                        title="Итоговый результат"
                        url={finalTryOnResult?.url ?? null}
                        empty="Нажмите «Создать фото на модели»"
                        loading={pipelineBusy && !finalTryOnResult?.url}
                        loadingVariant="countdown"
                        countdownLabel="Создаём фото на модели"
                        loadingDetail={tryOnProgress}
                        footer={
                          finalTryOnResult ? (
                            <TryOnResultActions
                              onDownload={() =>
                                void downloadImageFile(
                                  finalTryOnResult.url,
                                  `${finalTryOnResult.id}.png`
                                )
                              }
                              onStartOver={handleStartOver}
                            />
                          ) : undefined
                        }
                      />
                    </div>
                    <div className="hidden sm:block" aria-hidden />
                  </div>
                </div>
              ) : (
                <>
                  <PreviewCard
                    title="Товар"
                    url={
                      productCarouselItems.length === 1
                        ? (productCarouselItems[0]?.url ?? null)
                        : null
                    }
                    empty="Загрузите фото"
                    content={
                      productCarouselItems.length > 1 ? (
                      <PreviewImageCarousel
                        items={productCarouselItems}
                        showDownloadActions={false}
                        className="min-h-[260px]"
                      />
                    ) : undefined
                  }
                  />
                  <div className="lg:sticky lg:top-6 lg:z-10">
                    <GenerationResultGrid
                      results={results}
                      loading={loading}
                      loadingDetail={tryOnProgress}
                      isProductShotMode={isProductShotMode}
                      isClothingTryOnMode={false}
                      productPreviewUrl={effectiveProductPreviewUrl}
                      productPreviewItems={productCarouselItems}
                      onStartOver={handleStartOver}
                      embedded
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
        )}
      </main>
    </div>
  );
}

