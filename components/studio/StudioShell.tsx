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
import type { PromptEnhanceResponse } from "@/lib/ai/promptEnhanceSchemas";
import type { RemoveBackgroundResponse } from "@/lib/ai/backgroundRemovalSchemas";
import { isRemoteImageUrl } from "@/lib/ai/clientImageValidation";
import { mapCategoryForTryOn, type TryOnResponse } from "@/lib/ai/falSchemas";
import {
  minorRestrictedChoice,
  minorRestrictionMessage,
} from "@/lib/ai/modelAge";
import {
  FAL_MODEL_RESOLUTIONS,
  isModelOutputSizeComplete,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import {
  resolveSelectedModelAngles,
  validateModelAngles,
} from "@/lib/ai/modelAngles";
import { validateModelCustomParams } from "@/lib/ai/modelGenerationValidation";
import { buildGenerateModelRequestBody } from "@/lib/studio/buildGenerateModelRequest";
import { buildModelBaseSettingsSummaryRu } from "@/lib/ai/modelSettingsSummary";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import { fitCutoutToShotSize, refineCutoutWithUserMask } from "@/lib/studio/cutoutImage";
import { shotSizePresetToDimensions } from "@/lib/ai/productShotSchemas";
import {
  composeExactProductCard,
  scenePresetToExactBackground,
} from "@/lib/studio/exactProductCard";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "./ImageUploader";
import {
  ModelSourcePanel,
  type ModelSourceKind,
} from "./ModelSourcePanel";
import { ModelPresetSelector } from "./ModelPresetSelector";
import { GarmentSettingsPanel } from "./GarmentSettingsPanel";
import { ProductShotSettingsPanel } from "./ProductShotSettingsPanel";
import { StudioModeSelector } from "./StudioModeSelector";
import { GenerationResultGrid } from "./GenerationResultGrid";
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
  type ProductCategory,
  type ProductShotSettings,
  DEFAULT_QUALITY_MODE,
  type QualityMode,
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
    return "Не удалось создать примерку. Попробуйте режим «Баланс» или другое фото модели.";
  }

  if (message?.includes("Product image file or URL is required")) {
    return "Загрузите фото товара.";
  }

  if (message?.includes("Product and model image sources are required")) {
    return "Загрузите фото товара и модель или сгенерируйте AI-модель.";
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
  const productPreview = useObjectUrlPreview();
  const modelPreview = useObjectUrlPreview();

  const [studioMode, setStudioMode] = useState<StudioMode>("clothing-tryon");
  const [productFile, setProductFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(
    null
  );
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [productCategory, setProductCategory] =
    useState<ProductCategory>("auto");
  const [garmentPhotoType, setGarmentPhotoType] =
    useState<GarmentPhotoType>("auto");
  const [qualityMode, setQualityMode] = useState<QualityMode>(
    DEFAULT_QUALITY_MODE
  );
  const [modelSettings, setModelSettings] = useState<ModelGenerationSettings>(
    DEFAULT_MODEL_GENERATION_SETTINGS
  );
  const [modelDescription, setModelDescription] = useState("");
  const [modelDescriptionEnhancing, setModelDescriptionEnhancing] =
    useState(false);
  const [productShotSettings, setProductShotSettings] =
    useState<ProductShotSettings>(DEFAULT_PRODUCT_SHOT_SETTINGS);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null
  );
  const [savedStudioModel, setSavedStudioModel] =
    useState<SavedStudioModel | null>(null);
  const [modelSource, setModelSource] = useState<ModelSourceKind>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const savedModelUrl = savedStudioModel?.url ?? null;
  const [modelGenerating, setModelGenerating] = useState(false);
  const [modelGenerateError, setModelGenerateError] = useState<string | null>(
    null
  );
  const [modelOutputSize, setModelOutputSize] = useState<
    Partial<ModelOutputSizeSelection>
  >({});
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

  const handleProductFile = useCallback(
    (file: File) => {
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setProductFile(file);
      setProductPreviewUrl(productPreview.setFromFile(file));
      clearSelectedProduct();
    },
    [productPreview, clearSelectedProduct]
  );

  const handleModelFile = useCallback(
    (file: File) => {
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setGeneratedModelUrl(null);
      setModelGenerateError(null);
      setModelFile(file);
      setModelPreviewUrl(modelPreview.setFromFile(file));
      setModelSource("upload");
    },
    [modelPreview]
  );

  const clearProductFile = useCallback(() => {
    setProductFile(null);
    setProductPreviewUrl(productPreview.setFromFile(null));
    clearSelectedProduct();
  }, [productPreview, clearSelectedProduct]);

  useEffect(() => {
    return () => {
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
    setModelGenerateError(null);
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

  const handleModelSettingsChange = useCallback(
    (settings: ModelGenerationSettings) => {
      setModelSettings(settings);
    },
    []
  );

  const handleGenerateModel = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? modelGenerationSeed;
    setModelGenerating(true);
    setModelGenerateError(null);

    const minorRestriction = minorRestrictedChoice(modelSettings);
    if (minorRestriction) {
      setModelGenerateError(minorRestrictionMessage(minorRestriction));
      setModelGenerating(false);
      return;
    }

    if (!isModelOutputSizeComplete(modelOutputSize)) {
      setModelGenerateError(
        "Выберите соотношение сторон и разрешение изображения."
      );
      setModelGenerating(false);
      return;
    }

    const anglesError = validateModelAngles(modelSettings);
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

    const angles = resolveSelectedModelAngles(modelSettings);

    try {
      const res = await fetch("/api/ai/generate-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildGenerateModelRequestBody({
            settings: modelSettings,
            outputSize: modelOutputSize,
            modelDescription,
            promptLocale,
            seed: useSeed,
            angle: angles[0],
          })
        ),
      });

      const data = (await res.json()) as GenerateModelResponse;

      if (!data.ok) {
        setModelGenerateError(friendlyAiError(data.errorCode, data.message));
        return;
      }

      const url = data.images[0]?.url;
      if (!url) {
        setModelGenerateError("Модель не вернула изображение. Попробуйте ещё раз.");
        return;
      }

      setGeneratedModelUrl(url);
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
    }
  };

  const handleEnhanceModelDescription = async (
    draft: string
  ): Promise<string | null> => {
    if (!draft.trim()) {
      setModelGenerateError(
        "Сначала добавьте описание — локация, свет или настроение."
      );
      return null;
    }
    setModelDescriptionEnhancing(true);
    setModelGenerateError(null);
    const lockedBasePrompt = buildModelBaseSettingsSummaryRu(
      modelSettings,
      modelOutputSize
    );
    try {
      const res = await fetch("/api/ai/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "model-description",
          userPrompt: draft,
          lockedBasePrompt,
          targetPlatform: "marketplace",
          language: promptLocale,
        }),
      });
      const data = (await res.json()) as PromptEnhanceResponse;
      if (!data.ok) {
        setModelGenerateError(data.message);
        return null;
      }
      return data.enhancedPrompt;
    } catch {
      setModelGenerateError("Не удалось усилить промт. Попробуйте ещё раз.");
      return null;
    } finally {
      setModelDescriptionEnhancing(false);
    }
  };

  const handleGenerateTryOn = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? generationSeed;

    if (!productFile) {
      setError("Загрузите фото товара.");
      return;
    }

    const anglesError = validateModelAngles(modelSettings);
    if (anglesError) {
      setError(anglesError);
      return;
    }

    const customParamsError = validateModelCustomParams(modelSettings);
    if (customParamsError) {
      setError(customParamsError);
      return;
    }

    const angles = resolveSelectedModelAngles(modelSettings);
    const resolvedModelUrl = modelFile ? null : resolveModelImageUrl();
    const canUseExistingModel =
      angles.length === 1 &&
      (Boolean(modelFile) ||
        (resolvedModelUrl !== null && isRemoteImageUrl(resolvedModelUrl)));

    if (!canUseExistingModel) {
      if (!isModelOutputSizeComplete(modelOutputSize)) {
        setError(
          "Выберите соотношение сторон и разрешение — для каждого ракурса создаётся своя AI-модель."
        );
        return;
      }

      const minorRestriction = minorRestrictedChoice(modelSettings);
      if (minorRestriction) {
        setError(minorRestrictionMessage(minorRestriction));
        return;
      }
    } else if (!modelFile && !resolvedModelUrl) {
      if (generatedModelUrl && !isRemoteImageUrl(generatedModelUrl)) {
        setError(
          "Ссылка на AI-модель устарела. Нажмите «Сгенерировать модель» ещё раз или загрузите фото модели."
        );
      } else {
        setError("Загрузите фото модели или сгенерируйте AI-модель.");
      }
      return;
    }

    setLoading(true);
    setTryOnProgress(null);
    setError(null);
    setResults([]);

    const allResults: StudioResultImage[] = [];
    const perStepTimeoutMs = 120_000;

    try {
      for (let index = 0; index < angles.length; index++) {
        const angle = angles[index];
        setTryOnProgress(
          `Ракурс ${index + 1} из ${angles.length}: ${angle.label}`
        );

        let modelImageUrl: string | null = null;
        let modelImageFile: File | null = null;

        if (canUseExistingModel && index === 0) {
          if (modelFile) modelImageFile = modelFile;
          else modelImageUrl = resolvedModelUrl;
        } else {
          const modelRes = await fetch("/api/ai/generate-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              buildGenerateModelRequestBody({
                settings: modelSettings,
                outputSize: modelOutputSize as ModelOutputSizeSelection,
                modelDescription,
                promptLocale,
                seed: useSeed + index,
                angle,
              })
            ),
          });

          const modelData = (await modelRes.json()) as GenerateModelResponse;
          if (!modelData.ok) {
            setError(
              `Ракурс «${angle.label}»: ${friendlyAiError(
                modelData.errorCode,
                modelData.message
              )}`
            );
            return;
          }

          modelImageUrl = modelData.images[0]?.url ?? null;
          if (!modelImageUrl) {
            setError(`Ракурс «${angle.label}»: модель не вернула изображение.`);
            return;
          }

          if (index === angles.length - 1) {
            setGeneratedModelUrl(modelImageUrl);
            setModelFile(null);
            setModelPreviewUrl(modelPreview.setFromFile(null));
            setModelSource(null);
          }
        }

        const formData = new FormData();
        formData.append("productImageFile", productFile);
        if (modelImageFile) formData.append("modelImageFile", modelImageFile);
        else if (modelImageUrl) formData.append("modelImageUrl", modelImageUrl);
        formData.append("category", mapCategoryForTryOn(productCategory));
        formData.append("garmentPhotoType", garmentPhotoType);
        formData.append("mode", qualityMode);
        formData.append("moderationLevel", "permissive");
        formData.append("numSamples", "1");
        formData.append("segmentationFree", "true");
        formData.append("outputFormat", "png");
        formData.append("seed", String(useSeed + index));

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
          setError(
            parsed.error.startsWith("Ракурс")
              ? parsed.error
              : `Ракурс «${angle.label}»: ${parsed.error}`
          );
          return;
        }

        const data = parsed.data;

        if (!data.ok) {
          setError(
            `Ракурс «${angle.label}»: ${friendlyAiError(
              data.errorCode,
              data.message
            )}`
          );
          return;
        }

        const mappedResults = mapApiImagesToStudioResults(
          data.images,
          angle.label,
          data.provider
        );
        allResults.push(...mappedResults);
        setResults([...allResults]);
      }

      addAssetsToSession(
        mapResultsToSessionAssets(allResults, "tryon", {
          mode: "clothing-tryon",
          provider: allResults[0]?.provider,
          sourceImageUrl: productPreviewUrl ?? undefined,
        })
      );
      setGenerationSeed(nextGenerationSeed());
      setModelGenerationSeed(nextGenerationSeed());
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "Примерка заняла слишком много времени. Попробуйте меньше ракурсов или режим «1K» / «0.5K»."
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
      setTryOnProgress(null);
      setLoading(false);
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
          sourceImageUrl: productPreviewUrl ?? selectedProductPreviewUrl ?? undefined,
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

  const handlePrimaryAction = () => {
    if (studioMode === "clothing-tryon") return handleGenerateTryOn();
    return handleProductShot();
  };

  const isClothingMode = studioMode === "clothing-tryon";
  const isProductShotMode = studioMode === "product-shot";
  const isPostProcessingMode = studioMode === "post-processing";
  const effectiveProductPreviewUrl = productPreviewUrl;
  const hasProductInput = Boolean(productFile);
  const hasModelInput = Boolean(
    (modelSource === "upload" && modelFile) ||
      (modelSource === "saved" && isRemoteImageUrl(savedModelUrl)) ||
      isRemoteImageUrl(generatedModelUrl) ||
      mockMode
  );
  const primaryBlocker = (() => {
    if (!hasProductInput) return "Сначала загрузите фото.";

    if (isClothingMode) {
      const anglesError = validateModelAngles(modelSettings);
      if (anglesError) return anglesError;

      const angles = resolveSelectedModelAngles(modelSettings);
      if (angles.length > 1) {
        if (!isModelOutputSizeComplete(modelOutputSize)) {
          return "Выберите соотношение сторон и разрешение для ракурсов.";
        }
        return null;
      }

      if (!hasModelInput) {
        return "Загрузите фото модели или сгенерируйте AI-модель.";
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
  const canRunPrimary = !loading && primaryBlocker === null;
  const primaryHelper = primaryBlocker;

  const primaryButtonLabel = isClothingMode
    ? "Создать фото на модели"
    : "Создать карточку";

  const PrimaryIcon = isClothingMode ? Wand2 : Camera;

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
                        label="Фото товара"
                    >
                      <ImageUploader
                        label="Загрузите фото товара"
                        hint={
                          "Лучше всего: товар хорошо виден, без сильного размытия и без лишних предметов."
                        }
                        previewUrl={effectiveProductPreviewUrl}
                        selectedFile={productFile}
                        onFileSelect={handleProductFile}
                        onClearFile={clearProductFile}
                      />
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
                          label="Фото модели"
                          softCorner="bottom"
                        >
                          <ModelSourcePanel
                            label="Загрузите фото модели или сгенерируйте AI-модель"
                            hint="Для одежды лучше подходит фото в полный рост или по пояс, где одежду легко заменить."
                            savedModelUrl={savedModelUrl}
                            savedModelPersistenceHint={savedModelPersistenceHint}
                            modelSource={modelSource}
                            onSelectSaved={handleSelectSavedModel}
                            onDeleteSaved={handleDeleteSavedModel}
                            previewUrl={step2ModelPreview}
                            selectedFile={modelFile}
                            onFileSelect={handleModelFile}
                            onClearFile={clearModelFile}
                          />
                        </StudioWorkflowStep>

                        <StudioWorkflowStep
                          step={3}
                          label="AI-модель"
                          softCorner="top"
                        >
                          <ModelPresetSelector
                            key={
                              modelSource === "saved" && savedStudioModel
                                ? `saved-${savedStudioModel.id}`
                                : "model-draft"
                            }
                            settings={modelSettings}
                            onSettingsChange={handleModelSettingsChange}
                            onGenerate={() => void handleGenerateModel()}
                            modelDescription={modelDescription}
                            onModelDescriptionChange={setModelDescription}
                            onEnhanceModelDescription={
                              handleEnhanceModelDescription
                            }
                            enhancingDescription={modelDescriptionEnhancing}
                            generating={modelGenerating}
                            generateError={modelGenerateError}
                            generatedPreviewUrl={
                              generatedModelUrl && !modelFile
                                ? generatedModelUrl
                                : null
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
                          />
                        </StudioWorkflowStep>

                        <StudioWorkflowStep
                          step={4}
                          label="Настройки примерки"
                        >
                          <GarmentSettingsPanel
                            productCategory={productCategory}
                            onProductCategoryChange={setProductCategory}
                            garmentPhotoType={garmentPhotoType}
                            onGarmentPhotoTypeChange={setGarmentPhotoType}
                            qualityMode={qualityMode}
                            onQualityModeChange={setQualityMode}
                            lingerieMode={
                              modelSettings.categoryContext === "lingerie"
                            }
                          />
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

                    <StudioWorkflowStep
                      step={
                        isClothingMode ? 5 : 4
                      }
                      label="Готово"
                      isLast
                    >
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
              </StudioWorkflowRail>
            </CardContent>
            </Card>
          </aside>

          <section className="flex min-h-0 flex-col gap-4 pt-2 lg:self-stretch">
            <div className="shrink-0">
              {isClothingMode ? (
                <div className="grid items-stretch gap-4 sm:grid-cols-2">
                  <PreviewCard
                    title="Товар"
                    url={effectiveProductPreviewUrl}
                    empty="Загрузите фото товара"
                  />
                  <PreviewCard
                    title="AI-модель"
                    url={effectiveModelPreview}
                    empty="Сгенерируйте или загрузите модель"
                    badge={
                      modelSource === "saved" && savedModelUrl
                        ? "AI-модель"
                        : undefined
                    }
                  />
                </div>
              ) : (
                <PreviewCard
                  title="Товар"
                  url={effectiveProductPreviewUrl}
                  empty="Загрузите фото"
                />
              )}
            </div>

            <div className="shrink-0 space-y-4 lg:sticky lg:top-6 lg:z-10">
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
              <GenerationResultGrid
                    results={results}
                    loading={loading}
                    loadingDetail={tryOnProgress}
                    isProductShotMode={isProductShotMode}
                    productPreviewUrl={effectiveProductPreviewUrl}
                    onStartOver={handleStartOver}
                    embedded
                  />
                </div>
          </section>
        </div>
        )}
      </main>
    </div>
  );
}

