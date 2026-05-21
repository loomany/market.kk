"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/localeConfig";
import {
  AlertTriangle,
  Camera,
  Info,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";
import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { RemoveBackgroundResponse } from "@/lib/ai/backgroundRemovalSchemas";
import { isRemoteImageUrl } from "@/lib/ai/clientImageValidation";
import type { TryOnResponse } from "@/lib/ai/falSchemas";
import {
  DEFAULT_MODEL_AGE,
  minorRestrictedChoice,
  minorRestrictionMessage,
  parseModelAgeFromDescription,
  resolveModelAgeFromDescription,
  sanitizeModelSettingsForAge,
} from "@/lib/ai/modelAge";
import {
  FAL_MODEL_ASPECT_RATIOS,
  FAL_MODEL_RESOLUTIONS,
  DEFAULT_MODEL_OUTPUT_SIZE,
  type FalModelAspectRatio,
  isModelOutputSizeComplete,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import { appendStudioTryOnFields } from "@/lib/studio/buildTryOnFormData";
import { cn } from "@/lib/utils";
import { fetchGenerateSingleStudioModel } from "@/lib/studio/generateSingleStudioModel";
import { isStudioAiDebugEnabled } from "@/lib/studio/studioAiDebug";
import { isTryOnMaxToggleEnabled } from "@/lib/studio/tryOnMaxToggle";
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
import { fitCutoutToShotSize, prepareCutoutCanvas } from "@/lib/studio/cutoutImage";
import { prepareGarmentExtractionFile } from "@/lib/studio/extractGarmentForProductCard";
import {
  PRODUCT_SHOT_EXPORT_QUALITY,
  aspectRatioForShotSizePreset,
  shotSizePresetToDimensions,
} from "@/lib/ai/productShotSchemas";
import { DEFAULT_PREVIEW_ASPECT } from "@/lib/studio/previewImageAspect";
import {
  composeExactProductCard,
  scenePresetToExactBackground,
} from "@/lib/studio/exactProductCard";
import {
  estimateTryOnOnlyCostUsd,
  STUDIO_PRODUCT_CARD_RESULT_COUNTDOWN_SEC,
} from "@/lib/studio/clothingTryOnEstimates";
import { mapSourceModelToGenerationSettings } from "@/lib/studio/mapSourceModelToGenerationSettings";
import { isSourceModelPopulated } from "@/lib/ai/sourceModelPostProcess";
import {
  LINGERIE_TRYON_DEFAULTS,
  withLingerieModelDefaults,
} from "@/lib/studio/lingerieTryOnDefaults";
import { applyDefaultLingerieCrop } from "@/lib/studio/lingerieCropDefaults";
import { buildStudioModelGenerationFields } from "@/lib/ai/productGenerationContext";
import { isSourceProductZoneFramingActive } from "@/lib/ai/productAnalysisShared";
import type { ModelGenerationDebugInfo } from "@/lib/ai/modelGenerationSchemas";
import type { TryOnPipelineDebug } from "@/lib/ai/tryOnPipelineDebug";
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
import { removePendingGenerationJob } from "@/lib/studio/pendingGenerationClient";
import {
  loadStudioSessionAssets,
  removeStudioSessionAsset,
  saveStudioSessionAssets,
  upsertStudioSessionAsset,
} from "@/lib/studio/studioSessionPersistence";
import { Button } from "@/components/ui/Button";
import { TokenBalancePill } from "@/components/auth/TokenBalancePill";
import { WhatsAppLoginModal } from "@/components/auth/WhatsAppLoginModal";
import { TokenBillingModal } from "@/components/studio/TokenBillingModal";
import { StudioSignupGateModal } from "@/components/studio/StudioSignupGateModal";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";
import {
  TokenBillingBlockedError,
  tryApplyTokenBillingError,
} from "@/lib/tokens/billingErrorPayload";
import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProductPhotosUploader } from "./ProductPhotosUploader";
import {
  createStudioProductPhoto,
  MAX_CLOTHING_PRODUCT_SET,
  MAX_PRODUCT_PHOTOS,
  revokeStudioProductPhoto,
  revokeStudioProductPhotos,
  type StudioProductPhoto,
} from "@/lib/studio/productPhotos";
import {
  clearProductCardPipelineSession,
  loadProductCardPipelineSession,
  saveProductCardPipelineSession,
} from "@/lib/studio/productCardPipelineSession";
import {
  clearPersistedProductPhotoBlobs,
  clearProductShotMaskBlob,
  loadPersistedProductPhotoBlobs,
  loadProductShotMaskBlob,
  persistProductPhotoBlobs,
  persistProductShotMaskBlob,
  type PersistedProductPhotoBlob,
} from "@/lib/studio/productPhotoPersistence";
import {
  mergeWorkspaceSnapshot,
  studioPhotosFromPersistedBlobs,
} from "@/lib/studio/hydrateStudioWorkspace";
import {
  isStudioProductPhotoMode,
  type StudioProductPhotoMode,
} from "@/lib/studio/studioProductPhotoMode";
import {
  loadStudioWorkspaceSession,
  saveStudioWorkspaceSession,
  type ClothingWorkspaceDraft,
} from "@/lib/studio/studioWorkspaceSession";
import {
  ModelSourcePanel,
  type ModelSourceKind,
} from "./ModelSourcePanel";
import {
  ModelInputModeSelector,
  type ModelInputMode,
} from "./ModelInputModeSelector";
import { ModelPresetSelector } from "./ModelPresetSelector";
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
import {
  ClothingPreviewPanel,
  type ClothingPreviewTabId,
} from "./ClothingPreviewPanel";
import type { PreviewCarouselItem } from "./PreviewImageCarousel";
import type { ProductMaskApplyResult } from "./ProductMaskEditor";
import { ProductSelectionPanel } from "./ProductSelectionPanel";
import { StudioWorkflowRail } from "./StudioWorkflowRail";
import { StudioWorkflowStep } from "./StudioWorkflowStep";
import { ProcessedAssetsPanel } from "./ProcessedAssetsPanel";
import {
  StudioLocaleProvider,
  useStudioCopy,
} from "./StudioLocaleContext";
import { StudioLanguageSwitcher } from "./StudioLanguageSwitcher";
import {
  friendlyAiError,
  readJsonResponseError,
} from "@/lib/studio/i18n/friendlyAiErrors";
import { formatStudioString, getStudioCopy } from "@/lib/studio/i18n";
import type { StudioCopy } from "@/lib/studio/i18n/studioCopyTypes";
import {
  DEFAULT_MODEL_GENERATION_SETTINGS,
  DEFAULT_PRODUCT_SHOT_SETTINGS,
  type ModelGenerationSettings,
  type ProductShotSettings,
  type StudioMode,
  type StudioResultImage,
  type StudioSessionAsset,
} from "./types";

async function readJsonResponse<T>(
  res: Response,
  copy: StudioCopy
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const text = await res.text();
  if (!text.trim()) {
    return {
      ok: false,
      error: readJsonResponseError(copy, res, res.ok),
    };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return {
      ok: false,
      error: copy.errors.serverInvalid.replace("{status}", String(res.status)),
    };
  }
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

function StudioShellInner({
  mockMode,
  paidAiRunsAllowed,
  locale: localeProp,
}: {
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  locale?: Locale;
}) {
  const { locale: promptLocale, copy } = useStudioCopy();
  const resolveAiError = useCallback(
    (errorCode?: string, message?: string): string =>
      friendlyAiError(copy, errorCode, message),
    [copy]
  );
  const modelPreview = useObjectUrlPreview();

  const [studioMode, setStudioMode] = useState<StudioMode>("clothing-tryon");
  const [studioSessionHydrated, setStudioSessionHydrated] = useState(false);
  const studioHydrationStartedRef = useRef(false);
  const skipPhotoPersistRef = useRef(false);
  const [productPhotos, setProductPhotos] = useState<StudioProductPhoto[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const productPhotosRef = useRef<StudioProductPhoto[]>([]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
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
  const productAnalysisRequestId = useRef(0);
  const showDevControls = isStudioAiDebugEnabled();
  const showTryOnMaxToggle = isTryOnMaxToggleEnabled();
  const [tryOnMaxExperimental, setTryOnMaxExperimental] = useState(false);
  const [modelSettings, setModelSettings] = useState<ModelGenerationSettings>(
    DEFAULT_MODEL_GENERATION_SETTINGS
  );
  const sourceProductZoneFramingActive = useMemo(
    () =>
      isSourceProductZoneFramingActive(
        productAnalysis,
        modelSettings.categoryContext
      ),
    [productAnalysis, modelSettings.categoryContext]
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
  const [modelInputMode, setModelInputMode] = useState<ModelInputMode>("create");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signupGateOpen, setSignupGateOpen] = useState(false);
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
  const [pipelineDebug, setPipelineDebug] = useState<{
    model?: ModelGenerationDebugInfo;
    tryOn?: TryOnPipelineDebug;
  } | null>(null);
  const [productSampleAngles, setProductSampleAngles] = useState<
    ResolvedModelAngle[] | null
  >(null);
  const [useProductSampleAngles, setUseProductSampleAngles] = useState(false);
  const [analyzingProductAngles, setAnalyzingProductAngles] = useState(false);
  const [modelOutputSize, setModelOutputSize] = useState<
    Partial<ModelOutputSizeSelection>
  >(() => ({ ...DEFAULT_MODEL_OUTPUT_SIZE }));
  const [loading, setLoading] = useState(false);
  const [clothingPreviewTab, setClothingPreviewTab] =
    useState<ClothingPreviewTabId>("product");
  const [tryOnProgress, setTryOnProgress] = useState<string | null>(null);
  const [clothingPipelineCountdownStartedAt, setClothingPipelineCountdownStartedAt] =
    useState<number | null>(null);
  const [modelGenerationCountdownStartedAt, setModelGenerationCountdownStartedAt] =
    useState<number | null>(null);
  const [productCardCountdownStartedAt, setProductCardCountdownStartedAt] =
    useState<number | null>(null);
  const [productCardResetNotice, setProductCardResetNotice] = useState<
    string | null
  >(null);
  const [results, setResults] = useState<StudioResultImage[]>([]);
  const [sessionAssets, setSessionAssets] = useState<StudioSessionAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tokenBilling, setTokenBilling] =
    useState<TokenBillingErrorPayload | null>(null);
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
    void clearProductShotMaskBlob();
  }, []);

  useEffect(() => {
    productPhotosRef.current = productPhotos;
  }, [productPhotos]);

  const persistModeProductPhotos = useCallback(
    async (mode: StudioProductPhotoMode) => {
      const photos = productPhotosRef.current;
      const items: PersistedProductPhotoBlob[] = photos.map((photo) => ({
        id: photo.id,
        name: photo.file.name,
        type: photo.file.type || "image/png",
        blob: photo.file,
      }));
      await persistProductPhotoBlobs(mode, items);
    },
    []
  );

  const restoreProductShotSelection = useCallback(async () => {
    const maskFile = await loadProductShotMaskBlob();
    if (!maskFile) return;
    if (selectedProductPreviewRef.current) {
      URL.revokeObjectURL(selectedProductPreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(maskFile);
    selectedProductPreviewRef.current = previewUrl;
    setSelectedProductFile(maskFile);
    setSelectedProductPreviewUrl(previewUrl);
    setMaskEditorOpen(false);
  }, []);

  const applyClothingWorkspaceDraft = useCallback((draft: ClothingWorkspaceDraft) => {
      setModelSettings(draft.modelSettings);
      setModelOutputSize(draft.modelOutputSize);
      setModelDescription(draft.modelDescription);
      setProductDescription(draft.productDescription);
      setModelInputMode(draft.modelInputMode);
      setClothingPreviewTab(draft.clothingPreviewTab);
      setUserEditedProductDescription(draft.userEditedProductDescription);
      setProductAnalysis(draft.productAnalysis);
  }, []);

  const persistStudioWorkspace = useCallback(() => {
    saveStudioWorkspaceSession({
      version: 1,
      savedAt: Date.now(),
      activeMode: studioMode,
      clothing: {
        modelSettings,
        modelOutputSize,
        modelDescription,
        productDescription,
        modelInputMode,
        clothingPreviewTab,
        userEditedProductDescription,
        productAnalysis,
      },
      productCard: { productShotSettings },
    });
  }, [
    studioMode,
    modelSettings,
    modelOutputSize,
    modelDescription,
    productDescription,
    modelInputMode,
    clothingPreviewTab,
    userEditedProductDescription,
    productAnalysis,
    productShotSettings,
  ]);

  const flushStudioDraftBeforeLogin = useCallback(() => {
    persistStudioWorkspace();
    if (isStudioProductPhotoMode(studioMode)) {
      void persistModeProductPhotos(studioMode);
    }
  }, [persistStudioWorkspace, persistModeProductPhotos, studioMode]);

  const requireAuthForGeneration = useCallback((): boolean => {
    if (isAuthenticated) return true;
    flushStudioDraftBeforeLogin();
    setSignupGateOpen(true);
    return false;
  }, [isAuthenticated, flushStudioDraftBeforeLogin]);

  const handleStudioModeChange = useCallback(
    async (next: StudioMode) => {
      if (next === studioMode) return;

      if (isStudioProductPhotoMode(studioMode)) {
        await persistModeProductPhotos(studioMode);
      }

      setStudioMode(next);

      if (isStudioProductPhotoMode(next)) {
        skipPhotoPersistRef.current = true;
        const rows = await loadPersistedProductPhotoBlobs(next);
        const restored = studioPhotosFromPersistedBlobs(rows);
        setProductPhotos((prev) => {
          revokeStudioProductPhotos(prev);
          return restored;
        });
        setActiveProductId(restored[0]?.id ?? null);
        if (next === "product-shot") {
          await restoreProductShotSelection();
        } else {
          clearSelectedProduct();
        }
        skipPhotoPersistRef.current = false;
        return;
      }

      setProductPhotos((prev) => {
        revokeStudioProductPhotos(prev);
        return [];
      });
      setActiveProductId(null);
      clearSelectedProduct();
    },
    [
      studioMode,
      persistModeProductPhotos,
      restoreProductShotSelection,
      clearSelectedProduct,
    ]
  );

  useEffect(() => {
    if (studioHydrationStartedRef.current) return;
    studioHydrationStartedRef.current = true;

    const hydrate = async () => {
      const workspace = mergeWorkspaceSnapshot(loadStudioWorkspaceSession());
      const activeMode = workspace?.activeMode ?? "clothing-tryon";
      setStudioMode(activeMode);

      if (workspace) {
        applyClothingWorkspaceDraft(workspace.clothing);
        setProductShotSettings(workspace.productCard.productShotSettings);
      }

      if (isStudioProductPhotoMode(activeMode)) {
        skipPhotoPersistRef.current = true;
        const rows = await loadPersistedProductPhotoBlobs(activeMode);
        const restored = studioPhotosFromPersistedBlobs(rows);
        setProductPhotos(restored);
        setActiveProductId(restored[0]?.id ?? null);
        skipPhotoPersistRef.current = false;

        if (activeMode === "product-shot") {
          await restoreProductShotSelection();
          const cardSession = loadProductCardPipelineSession();
          if (cardSession?.results?.length) {
            setResults(cardSession.results);
          }
        }
      }

      setStudioSessionHydrated(true);
    };

    void hydrate();
  }, [applyClothingWorkspaceDraft, restoreProductShotSelection]);

  useEffect(() => {
    if (!studioSessionHydrated) return;
    persistStudioWorkspace();
  }, [studioSessionHydrated, persistStudioWorkspace]);

  useEffect(() => {
    if (!studioSessionHydrated || skipPhotoPersistRef.current) return;
    if (!isStudioProductPhotoMode(studioMode)) return;

    const timer = window.setTimeout(() => {
      void persistModeProductPhotos(studioMode);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    studioSessionHydrated,
    studioMode,
    productPhotos,
    persistModeProductPhotos,
  ]);

  useEffect(() => {
    if (!studioSessionHydrated || studioMode !== "product-shot") return;
    if (results.length === 0) {
      clearProductCardPipelineSession();
      return;
    }
    saveProductCardPipelineSession({
      version: 1,
      savedAt: Date.now(),
      results,
      previewSlideIndex: 0,
    });
  }, [studioSessionHydrated, studioMode, results]);

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
      setModelGenerateError(copy.errors.uploadProductFirst);
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
          data.message ??
            formatStudioString(copy.progress.serverError, { status: res.status })
        );
        return;
      }
      if (!data.ok || !data.angles?.length) {
        setModelGenerateError(
          data.message ?? copy.progress.parsePoseFromPhoto
        );
        return;
      }
      setProductSampleAngles(data.angles.slice(0, 1));
      setUseProductSampleAngles(true);
      if (data.usedPresetFallback && data.message) {
        setModelGenerateNotice(data.message);
      }
    } catch {
      setModelGenerateError(copy.errors.parsePoseFailed);
    } finally {
      setAnalyzingProductAngles(false);
    }
  }, [productPhotos, copy]);

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
        label: formatStudioString(copy.progress.photoN, { n: index + 1 }),
      })),
    [productPhotos, copy.progress.photoN]
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
            data.message ??
              formatStudioString(copy.progress.analysisError, {
                status: res.status,
              })
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
          copy.errors.analyzePhotoFailed
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

  const beginClothingPipelineLoading = useCallback(() => {
    setClothingPipelineCountdownStartedAt((prev) => prev ?? Date.now());
    setLoading(true);
  }, []);

  const endClothingPipelineLoading = useCallback(() => {
    setLoading(false);
    setClothingPipelineCountdownStartedAt(null);
  }, []);

  const beginModelGeneration = useCallback(() => {
    setModelGenerationCountdownStartedAt((prev) => prev ?? Date.now());
    setModelGenerating(true);
  }, []);

  const endModelGeneration = useCallback(() => {
    setModelGenerating(false);
    setModelGenerationCountdownStartedAt(null);
  }, []);

  const resetClothingModelAndResult = useCallback(() => {
    setGeneratedModelUrl(null);
    setGeneratedModelPreviews([]);
    setModelGenerateError(null);
    setModelGenerateProgress(null);
    setModelGenerateNotice(null);
    setResults([]);
    setError(null);
    setTryOnProgress(null);
    endClothingPipelineLoading();
    endModelGeneration();
    if (modelSource === "upload") {
      setModelFile(null);
      setModelPreviewUrl(modelPreview.setFromFile(null));
      setModelSource(savedModelUrl ? "saved" : null);
    } else if (modelSource === "saved") {
      setModelSource(null);
    }
  }, [
    endClothingPipelineLoading,
    endModelGeneration,
    modelPreview,
    modelSource,
    savedModelUrl,
  ]);

  const handleAddProductFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const replacingProduct = productPhotosRef.current.length > 0;
      setError(null);
      resetProductAnalysisState();
      if (replacingProduct) {
        resetClothingModelAndResult();
        setClothingPreviewTab("product");
      }
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
      resetClothingModelAndResult,
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
    setProductCardResetNotice(null);
    if (isStudioProductPhotoMode(studioMode)) {
      void clearPersistedProductPhotoBlobs(studioMode);
    }
    if (studioMode === "product-shot") {
      clearProductCardPipelineSession();
    }
  }, [clearSelectedProduct, resetProductAnalysisState, studioMode]);

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
      setModelInputMode("upload");
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
    void persistProductShotMaskBlob(result.file);
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
        label: copy.model.saved,
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
            label: copy.model.saved,
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
        copy.model.waitGeneration
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

  const handleReplaceModel = useCallback(() => {
    resetClothingModelAndResult();
  }, [resetClothingModelAndResult]);

  const handleStartOverModel = handleReplaceModel;

  const savedModelPersistenceHint = savedModelUrl
    ? isAuthenticated
      ? copy.model.savedPersistenceAccount
      : copy.model.savedPersistenceDevice
    : undefined;

  const persistAsset = useCallback(async (asset: StudioSessionAsset) => {
    const payload = {
      ...asset,
      url: asset.url || asset.sourceImageUrl || "pending",
    };
    try {
      await fetch("/api/studio/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Session-only mode must keep working when auth or Supabase is absent.
    }
  }, []);

  const mergeSessionAssets = useCallback(
    (incoming: StudioSessionAsset[]) => {
      if (incoming.length === 0) return;
      setSessionAssets((prev) => {
        const savedIds = new Set(incoming.map((asset) => asset.id));
        return [
          ...incoming,
          ...prev.filter((asset) => !savedIds.has(asset.id)),
        ].slice(0, 48);
      });
    },
    []
  );

  const loadSavedAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/assets", { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        assets?: StudioSessionAsset[];
      };
      if (!data.ok || !data.assets?.length) return;
      mergeSessionAssets(data.assets);
    } catch {
      // History is an enhancement; anonymous/local studio flow should not fail.
    }
  }, [mergeSessionAssets]);

  useEffect(() => {
    const loadAuth = () => {
      void fetch("/api/auth/me", { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { user?: { id: string } | null }) => {
          const signedIn = Boolean(data.user);
          setIsAuthenticated(signedIn);
          if (signedIn) setSignupGateOpen(false);
        })
        .catch(() => setIsAuthenticated(false));
    };
    loadAuth();
    window.addEventListener("vitrina-auth-changed", loadAuth);
    return () => window.removeEventListener("vitrina-auth-changed", loadAuth);
  }, []);

  const persistedLoadStartedRef = useRef(false);

  useEffect(() => {
    const runPersistedLoad = () => {
      const local = loadStudioSessionAssets();
      if (local.length > 0) mergeSessionAssets(local);
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
  }, [loadSavedAssets, loadPersistedSavedModel, mergeSessionAssets]);

  const addAssetsToSession = useCallback((assets: StudioSessionAsset[]) => {
    setSessionAssets((prev) => {
      const next = [...assets, ...prev].slice(0, 48);
      saveStudioSessionAssets(next);
      return next;
    });
    assets.forEach((asset) => {
      if (asset.status !== "error") {
        void persistAsset(asset);
      }
    });
  }, [persistAsset]);

  const addSingleAssetToSession = useCallback(
    (asset: StudioSessionAsset) => {
      setSessionAssets((prev) => {
        const next = [asset, ...prev].slice(0, 48);
        saveStudioSessionAssets(next);
        return next;
      });
      upsertStudioSessionAsset(asset);
      if (asset.status !== "error") {
        void persistAsset(asset);
      }
    },
    [persistAsset]
  );

  const updateSessionAsset = useCallback(
    (id: string, patch: Partial<StudioSessionAsset>) => {
      setSessionAssets((prev) => {
        const next = prev.map((asset) =>
          asset.id === id ? { ...asset, ...patch } : asset
        );
        const updated = next.find((asset) => asset.id === id);
        if (updated && updated.status !== "error") {
          upsertStudioSessionAsset(updated);
          if (updated.status !== "processing" && updated.url) {
            void persistAsset(updated);
          } else if (updated.status === "processing") {
            void persistAsset(updated);
          }
        }
        saveStudioSessionAssets(next);
        return next;
      });
    },
    [persistAsset]
  );

  const deleteSessionAsset = useCallback((id: string) => {
    setSessionAssets((prev) => {
      const next = prev.filter((asset) => asset.id !== id);
      saveStudioSessionAssets(next);
      return next;
    });
    removeStudioSessionAsset(id);
    removePendingGenerationJob(id);
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
            ? copy.model.saved
            : modelSource === "upload"
              ? copy.model.uploaded
              : "AI model",
      },
    ];
  }, [generatedModelPreviews, effectiveModelPreview, modelSource]);

  const clothingPreviewAspect = useMemo((): FalModelAspectRatio => {
    const size = isModelOutputSizeComplete(modelOutputSize)
      ? modelOutputSize
      : DEFAULT_MODEL_OUTPUT_SIZE;
    return size.aspectRatio;
  }, [modelOutputSize]);

  const productCardPreviewAspect = useMemo((): FalModelAspectRatio => {
    const ratio = aspectRatioForShotSizePreset(
      productShotSettings.shotSizePreset
    ) as FalModelAspectRatio;
    return FAL_MODEL_ASPECT_RATIOS.includes(ratio)
      ? ratio
      : DEFAULT_PREVIEW_ASPECT;
  }, [productShotSettings.shotSizePreset]);

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

  const handleModelDescriptionChange = useCallback((value: string) => {
    setModelDescription(value);
    const parsedAge = parseModelAgeFromDescription(value);
    setModelSettings((prev) =>
      sanitizeModelSettingsForAge({
        ...prev,
        modelAge: parsedAge ?? DEFAULT_MODEL_AGE,
      })
    );
  }, []);

  const modelSettingsForGeneration = useMemo(
    () =>
      sanitizeModelSettingsForAge({
        ...modelSettings,
        modelAge: resolveModelAgeFromDescription(modelDescription),
      }),
    [modelDescription, modelSettings]
  );

  const handleGenerateModel = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? modelGenerationSeed;
    beginModelGeneration();
    setModelGenerateError(null);
    setModelGenerateNotice(null);

    const minorRestriction = minorRestrictedChoice(modelSettingsForGeneration);
    if (minorRestriction) {
      setModelGenerateError(minorRestrictionMessage(minorRestriction));
      endModelGeneration();
      return;
    }

    if (!isModelOutputSizeComplete(modelOutputSize)) {
      setModelGenerateError(
        copy.errors.selectAspectRatio
      );
      endModelGeneration();
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setModelGenerateError(anglesError);
      endModelGeneration();
      return;
    }

    const customParamsError = validateModelCustomParams(modelSettingsForGeneration);
    if (customParamsError) {
      setModelGenerateError(customParamsError);
      endModelGeneration();
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
              ? formatStudioString(copy.angleProgress.base, {
                  total: angles.length,
                  label: angle.label,
                })
              : formatStudioString(copy.angleProgress.nth, {
                  n: index + 1,
                  total: angles.length,
                  label: angle.label,
                })
            : copy.status.generatingModel
        );

        const controller = new AbortController();
        const requestTimeoutMs = 150_000;
        const timeoutId = window.setTimeout(
          () => controller.abort(),
          requestTimeoutMs
        );

        const genFields = buildStudioModelGenerationFields({
          analysis: productAnalysis,
          overrides: { categoryContext: modelSettingsForGeneration.categoryContext },
          settings: modelSettingsForGeneration,
          userDescriptionRu: productDescription,
          userEditedProductDescription,
        });

        let res: Response;
        try {
          res = await fetch("/api/ai/generate-model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              buildGenerateModelRequestBody({
                settings: {
                  ...modelSettingsForGeneration,
                  categoryContext: genFields.categoryContext,
                },
                outputSize: modelOutputSize,
                modelDescription,
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
              formatStudioString(copy.angleProgress.timeout, {
                label: angle.label,
              }) +
                (collected.length > 0
                  ? formatStudioString(copy.angleProgress.partialDone, {
                      done: collected.length,
                      total: angles.length,
                    })
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
          if (tryApplyTokenBillingError(data, setTokenBilling)) {
            endModelGeneration();
            return;
          }
          if (collected.length > 0) {
            setGeneratedModelPreviews([...collected]);
            setGeneratedModelUrl(collected[0]!.url);
          }
          const partialHint =
            collected.length > 0
              ? formatStudioString(copy.angleProgress.partialDone, {
                  done: collected.length,
                  total: angles.length,
                })
              : "";
          const detailHint = data.detail
            ? ` (${data.detail.slice(0, 120)}…)`
            : "";
          setModelGenerateError(
            (angles.length > 1
              ? formatStudioString(copy.angleProgress.failed, {
                  label: angle.label,
                  error: resolveAiError(data.errorCode, data.message),
                })
              : resolveAiError(data.errorCode, data.message)) +
              partialHint +
              detailHint
          );
          return;
        }

        if (data.usedAngleEditFallback && index > 0) {
          setModelGenerateProgress(
            formatStudioString(copy.angleProgress.separate, {
              n: index + 1,
              total: angles.length,
              label: angle.label,
            })
          );
        }

        if (data.debug) {
          setPipelineDebug((prev) => ({ ...prev, model: data.debug }));
        }

        const url = data.images[0]?.url;
        if (!url) {
          setModelGenerateError(
            angles.length > 1
              ? formatStudioString(copy.angleProgress.noImage, {
                  label: angle.label,
                })
              : copy.angleProgress.noImageGeneric
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
        setModelGenerateError(copy.errors.modelNoImage);
        return;
      }

      setGeneratedModelUrl(primaryUrl);
      setModelFile(null);
      setModelPreviewUrl(modelPreview.setFromFile(null));
      setModelSource(null);
      setModelGenerationSeed(nextGenerationSeed());
    } catch {
      setModelGenerateError(
        copy.errors.modelGenFailed
      );
    } finally {
      endModelGeneration();
      setModelGenerateProgress(null);
    }
  };

  const resolvePipelineOutputSize = useCallback((): ModelOutputSizeSelection => {
    const size = isModelOutputSizeComplete(modelOutputSize)
      ? modelOutputSize
      : { ...DEFAULT_MODEL_OUTPUT_SIZE };
    if (studioMode === "clothing-tryon") {
      return { ...size, resolution: "2K" };
    }
    if (!showDevControls && size.resolution !== "2K") {
      return { ...size, resolution: "2K" };
    }
    return size;
  }, [modelOutputSize, showDevControls, studioMode]);

  const hasUserUploadedModel = useCallback(
    () =>
      modelInputMode === "upload" &&
      Boolean(
        (modelSource === "upload" && modelFile) ||
          (modelSource === "saved" && isRemoteImageUrl(savedModelUrl))
      ),
    [modelFile, modelInputMode, modelSource, savedModelUrl]
  );

  const handleModelInputModeChange = useCallback(
    (mode: ModelInputMode) => {
      setModelInputMode(mode);
      if (mode === "create") {
        if (modelSource === "upload") {
          setModelFile(null);
          setModelPreviewUrl(modelPreview.setFromFile(null));
          setModelSource(null);
        }
        return;
      }
      if (modelSource === "saved") {
        setModelSource(null);
        setGeneratedModelUrl(null);
        setGeneratedModelPreviews([]);
      }
    },
    [modelPreview, modelSource]
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
      setError(copy.errors.uploadProduct);
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setError(anglesError);
      return;
    }

    const pipelineSize = resolvePipelineOutputSize();
    if (!isModelOutputSizeComplete(pipelineSize)) {
      setError(copy.status.selectAspectRatio);
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
          copy.errors.modelUrlStale
        );
      } else {
        setError(
          copy.errors.modelRequired
        );
      }
      return;
    }

    const angles = resolveGenerationAngles();
    const angle = angles[0];
    if (!angle) {
      setError(copy.errors.selectCardVariant);
      return;
    }

    if (!options?.skipLoadingState) {
      beginClothingPipelineLoading();
    }
    setTryOnProgress(copy.status.transferring);
    setError(null);
    if (!options?.appendResults) {
      setResults([]);
    }

    // Try-on can legitimately take a while on lingerie / 2K / lining-heavy
    // garments. Instead of hard-aborting the fetch, we let it run as long as
    // the server takes and only show a soft "this is taking a bit longer
    // than usual" notice after 4 minutes — no error, no aborted request.
    const slowNoticeAfterMs = 240_000;

    try {
      const analysisForTryOn =
        options?.analysisOverride ?? productAnalysis;

      const formData = new FormData();
      appendStudioTryOnFields(formData, {
        productFile,
        modelFile,
        modelImageUrl: resolvedModelUrl,
        garmentPhotoType: "auto",
        garmentPhotoTypeManualOverride: false,
        categoryContext: modelSettings.categoryContext,
        isLingerie: isLingerieScenario,
        productAnalysis: analysisForTryOn,
        productDescription,
        userEditedProductDescription,
        modelResolution: pipelineSize.resolution,
        seed: useSeed,
        tryOnMaxExperimental,
      });

      // Soft slow-notice timer: after `slowNoticeAfterMs` we just update the
      // progress banner — the fetch itself is NEVER aborted. The user can
      // keep waiting; Fal/FASHN will finish in its own time.
      const slowNoticeTimer = window.setTimeout(() => {
        setTryOnProgress(
          copy.status.tryOnSlow
        );
      }, slowNoticeAfterMs);

      let res: Response;
      try {
        res = await fetch("/api/ai/tryon", {
          method: "POST",
          body: formData,
        });
      } finally {
        window.clearTimeout(slowNoticeTimer);
      }

      const parsed = await readJsonResponse<TryOnResponse>(res, copy);

      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      const data = parsed.data;

      if (!data.ok) {
        if (tryApplyTokenBillingError(data, setTokenBilling)) return;
        setError(resolveAiError(data.errorCode, data.message));
        return;
      }

      if (data.debug) {
        setPipelineDebug((prev) => ({ ...prev, tryOn: data.debug }));
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
      const detail =
        error instanceof Error && error.message
          ? error.message
          : copy.progress.networkDetail;
      setError(
        detail === "Failed to fetch"
          ? copy.errors.networkDevServer
          : formatStudioString(copy.progress.networkContact, { detail })
      );
    } finally {
      if (!options?.skipLoadingState) {
        setTryOnProgress(null);
        endClothingPipelineLoading();
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
    if (!productFile) {
      setError(copy.errors.uploadProduct);
      return;
    }
    if (!selectedProductFile) {
      setError(copy.errors.maskDrawFirst);
      return;
    }

    setProductCardCountdownStartedAt((prev) => prev ?? Date.now());
    setProductCardResetNotice(null);
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const { extractionFile, usedVision, garmentLabelRu } =
        await prepareGarmentExtractionFile({
          originalFile: productFile,
          maskedSelectionFile: selectedProductFile,
          onProgress: setTryOnProgress,
        });

      setTryOnProgress(copy.status.removingBg);
      const bgData = await removeBackgroundForProduct(extractionFile);

      if (!bgData.ok) {
        if (tryApplyTokenBillingError(bgData, setTokenBilling)) return;
        setError(resolveAiError(bgData.errorCode, bgData.message));
        return;
      }

      const bgProvider = bgData.provider;

      let cutoutUrl = bgData.image.url;
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          if (/^https?:\/\//i.test(cutoutUrl)) {
            el.crossOrigin = "anonymous";
          }
          el.onload = () => resolve(el);
          el.onerror = () =>
            reject(new Error(copy.errors.cutoutLoadFailed));
          el.src = cutoutUrl;
        });
        cutoutUrl = prepareCutoutCanvas(img).toDataURL("image/png");
      } catch {
        /* keep Fal url */
      }

      if (usedVision && garmentLabelRu) {
        setTryOnProgress(
          formatStudioString(copy.progress.assemblingCardWith, {
            label: garmentLabelRu,
          })
        );
      } else {
        setTryOnProgress(copy.status.assemblingCard);
      }
      const [exportWidth, exportHeight] = shotSizePresetToDimensions(
        productShotSettings.shotSizePreset,
        PRODUCT_SHOT_EXPORT_QUALITY
      );
      let sizedCutoutUrl = cutoutUrl;
      try {
        sizedCutoutUrl = await fitCutoutToShotSize(
          cutoutUrl,
          productShotSettings.shotSizePreset,
          PRODUCT_SHOT_EXPORT_QUALITY
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
        imageQuality: PRODUCT_SHOT_EXPORT_QUALITY,
      });

      const mappedResults = mapProductShotStudioResults(
        [{ url: cardUrl, width: exportWidth, height: exportHeight }],
        "exact-card",
        {
          cutoutPreviewUrl: sizedCutoutUrl,
          selectedProductPreviewUrl: selectedProductPreviewUrl ?? undefined,
          manualMaskUsed: true,
          exactCardWithoutMask: false,
          visionGarmentRefined: usedVision,
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
          : copy.errors.exactCardFailed;
      setError(message);
    } finally {
      setLoading(false);
      setProductCardCountdownStartedAt(null);
    }
  };

  const handleProductShot = async () => {
    await handleExactProductCard();
  };

  const handleStartOver = useCallback(() => {
    if (studioMode === "clothing-tryon") {
      handleReplaceModel();
      return;
    }
    if (studioMode === "product-shot") {
      setResults([]);
      setError(null);
      setTryOnProgress(null);
      setProductCardCountdownStartedAt(null);
      clearProductCardPipelineSession();
      setProductCardResetNotice(
        copy.preview.cardCleared
      );
      return;
    }
    setResults([]);
    setError(null);
    setProductCardCountdownStartedAt(null);
    clearProductCardPipelineSession();
  }, [studioMode, handleReplaceModel]);

  const handleCreatePhotoOnModel = async () => {
    if (!productFile) {
      setError(copy.errors.uploadProductFirst);
      return;
    }

    if (modelInputMode === "upload" && !modelFile) {
      setError(copy.status.uploadModel);
      return;
    }

    const minorRestriction = minorRestrictedChoice(modelSettingsForGeneration);
    if (minorRestriction) {
      setError(minorRestrictionMessage(minorRestriction));
      return;
    }

    const pipelineSize = resolvePipelineOutputSize();
    if (!isModelOutputSizeComplete(pipelineSize)) {
      setError(copy.status.selectAspectRatio);
      return;
    }

    const anglesError = validateGenerationAngles();
    if (anglesError) {
      setError(anglesError);
      return;
    }

    const customParamsError =
      modelInputMode === "create"
        ? validateModelCustomParams(modelSettingsForGeneration)
        : null;
    if (customParamsError) {
      setError(customParamsError);
      return;
    }

    beginClothingPipelineLoading();
    setError(null);
    setResults([]);
    setClothingPreviewTab("model");
    setTryOnProgress(copy.status.checkingProduct);

    try {
      let analysis = productAnalysis;
      if (!analysis) {
        analysis = await runProductDescriptionAnalysis(productFile);
        if (!analysis) {
          setError(
            productAnalysisError ??
              copy.errors.analyzeProductFailed
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
          setTryOnProgress(copy.status.creatingModel);
          beginModelGeneration();
          setModelGenerateError(null);

          const angles = resolveGenerationAngles();
          const angle = angles[0];
          if (!angle) {
            setError(copy.errors.poseResolveFailed);
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
              settings: modelSettingsForGeneration,
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
            if (genError instanceof TokenBillingBlockedError) {
              setTokenBilling(genError.payload);
              return;
            }
            setError(
              genError instanceof Error
                ? genError.message
                : copy.errors.modelGenFailed
            );
            return;
          } finally {
            window.clearTimeout(timeoutId);
            endModelGeneration();
          }
        } else {
          modelUrlForTryOn = resolveModelImageUrl();
        }
      }

      if (!modelFile && !modelUrlForTryOn) {
        setError(copy.errors.modelImageMissing);
        return;
      }

      setTryOnProgress(copy.status.transferring);
      await handleGenerateTryOn({
        analysisOverride: analysis,
        skipLoadingState: true,
        modelImageUrlOverride: modelUrlForTryOn,
        requireExistingModel: false,
      });
    } finally {
      endClothingPipelineLoading();
      setTryOnProgress(null);
    }
  };

  const handlePrimaryAction = () => {
    if (!requireAuthForGeneration()) return;
    if (studioMode === "clothing-tryon") return void handleCreatePhotoOnModel();
    return handleProductShot();
  };

  const isClothingMode = studioMode === "clothing-tryon";
  const isProductShotMode = studioMode === "product-shot";
  const isPostProcessingMode = studioMode === "post-processing";
  const hasProductInput = productPhotos.length > 0;
  const primaryBlocker = (() => {
    if (!hasProductInput) return copy.status.uploadProductFirst;
    if (productAnalyzing) return copy.status.analyzingProduct;

    if (isProductShotMode) {
      if (maskEditorOpen) {
        return copy.errors.maskRequired;
      }
      if (!selectedProductFile) {
        return copy.errors.maskDrawFirst;
      }
      if (
        productShotSettings.scenePreset === "custom" &&
        !productShotSettings.sceneCustomDescription.trim()
      ) {
        return copy.status.describeBackground;
      }
    }

    if (isClothingMode) {
      const anglesError = validateGenerationAngles();
      if (anglesError) return anglesError;

      if (!isModelOutputSizeComplete(modelOutputSize)) {
        return copy.status.selectAspectRatio;
      }

      if (modelInputMode === "upload" && !modelFile) {
        return copy.status.uploadModel;
      }
    }

    return null;
  })();
  const canRunPrimary =
    !loading && !modelGenerating && !productAnalyzing && primaryBlocker === null;

  const primaryStatusMessage = (() => {
    if (!hasProductInput) return null;
    if (isProductShotMode && (productAnalyzing || loading)) {
      return null;
    }
    if (loading || modelGenerating) {
      return tryOnProgress ?? (isProductShotMode ? copy.status.creatingCard : copy.status.generating);
    }
    if (productAnalyzing) return null;
    return primaryBlocker;
  })();

  const primaryButtonLabel = (() => {
    if (isProductShotMode && productAnalyzing) {
      return copy.status.analyzingAi;
    }
    if (isProductShotMode && loading) {
      return tryOnProgress ?? copy.status.creatingCard;
    }
    return isClothingMode ? copy.actions.createOnModel : copy.actions.createCard;
  })();

  const productCardPrimaryBusy = isProductShotMode && (loading || productAnalyzing);

  const PrimaryIcon = isClothingMode ? Wand2 : Camera;

  const isLingerieScenario = modelSettings.categoryContext === "lingerie";
  const finalTryOnResult = results[0] ?? null;
  const pipelineBusy = isClothingMode && loading;

  const clothingPreviewTabReady = useMemo(
    (): Record<ClothingPreviewTabId, boolean> => ({
      product: productCarouselItems.length > 0,
      model: modelCarouselItems.length > 0,
      result: Boolean(finalTryOnResult?.url),
    }),
    [
      productCarouselItems.length,
      modelCarouselItems.length,
      finalTryOnResult?.url,
    ]
  );

  useEffect(() => {
    if (studioMode !== "clothing-tryon") return;
    if (modelGenerating) setClothingPreviewTab("model");
  }, [modelGenerating, studioMode]);

  useEffect(() => {
    if (studioMode !== "clothing-tryon") return;
    if (
      loading &&
      !modelGenerating &&
      tryOnProgress &&
      /переносим|пример|placing|transfer|көшір/i.test(tryOnProgress)
    ) {
      setClothingPreviewTab("result");
    }
  }, [loading, modelGenerating, tryOnProgress, studioMode]);

  useEffect(() => {
    if (studioMode === "clothing-tryon" && finalTryOnResult?.url) {
      setClothingPreviewTab("result");
    }
  }, [finalTryOnResult?.url, studioMode]);

  if (!studioSessionHydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-700">{copy.loading.title}</p>
        <p className="max-w-sm text-center text-xs leading-5 text-slate-500">
          {copy.loading.subtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href={`/${promptLocale}`}
            className="shrink-0 text-lg font-bold tracking-tight text-slate-950 hover:text-slate-800"
          >
            Vitrina <span className="text-teal-700">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <StudioLanguageSwitcher />
            <TokenBalancePill />
            <WhatsAppLoginModal />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <section>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="violet" className="shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.hero.badge}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {copy.hero.title}
              </h1>
            </div>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {copy.hero.subtitle}
            </p>
        </section>

        <StudioModeSelector
          value={studioMode}
          onChange={(mode) => void handleStudioModeChange(mode)}
        />

        {isPostProcessingMode ? (
          <ProcessedAssetsPanel
            assets={sessionAssets}
            mockMode={mockMode}
            paidAiRunsAllowed={paidAiRunsAllowed}
            promptLocale={promptLocale}
            requireAuthForGeneration={requireAuthForGeneration}
            onTokenBillingError={setTokenBilling}
            onDeleteAsset={deleteSessionAsset}
            onAssetCreated={addSingleAssetToSession}
            onUpdateAsset={updateSessionAsset}
          />
        ) : (
        <div
          className={cn(
            "grid gap-6 lg:items-start",
            isClothingMode
              ? "lg:grid-cols-[minmax(0,420px)_minmax(656px,1fr)]"
              : "lg:grid-cols-[420px_1fr]"
          )}
        >
          <aside className="space-y-4">
            <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="overflow-visible px-0 pb-2 pt-2">
              <StudioWorkflowRail>
                    <StudioWorkflowStep
                      step={1}
                        label={isClothingMode ? copy.workflow.product : copy.workflow.productPhoto}
                    >
                      <ProductPhotosUploader
                        label={copy.upload.productLabel}
                        hint={
                          isClothingMode
                            ? copy.upload.productHintClothing
                            : copy.upload.productHintSingle
                        }
                        maxPhotos={
                          isClothingMode
                            ? MAX_CLOTHING_PRODUCT_SET
                            : MAX_PRODUCT_PHOTOS
                        }
                        singlePhotoMode={isProductShotMode}
                        photos={productPhotos}
                        activePhotoId={activeProductId}
                        onAddFiles={handleAddProductFiles}
                        onSelectPhoto={setActiveProductId}
                        onRemovePhoto={handleRemoveProductPhoto}
                        onClearAll={clearProductPhotos}
                        uploading={productAnalyzing}
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
                        label={copy.workflow.mask}
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
                          label={copy.workflow.model}
                          softCorner="bottom"
                        >
                          <div className="relative space-y-4">
                            {productAnalyzing ? (
                              <div
                                className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-white px-4"
                                role="status"
                                aria-live="polite"
                              >
                                <p className="text-center text-sm leading-5 text-slate-700">
                                  {copy.progress.analyzingProductSettings}
                                </p>
                              </div>
                            ) : null}
                            <ModelInputModeSelector
                              value={modelInputMode}
                              onChange={handleModelInputModeChange}
                              disabled={
                                loading || modelGenerating || productAnalyzing
                              }
                            />
                            {modelInputMode === "create" ? (
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
                                modelDescription={modelDescription}
                                onModelDescriptionChange={
                                  handleModelDescriptionChange
                                }
                                settingsLocked={
                                  loading || modelGenerating || productAnalyzing
                                }
                                sourceProductZoneFramingActive={
                                  sourceProductZoneFramingActive
                                }
                              />
                            ) : (
                              <div
                                className={
                                  productAnalyzing
                                    ? "pointer-events-none select-none opacity-60"
                                    : undefined
                                }
                              >
                                <ModelSourcePanel
                                  uiMode="saas"
                                  label={copy.upload.modelLabel}
                                  hint={
                                    isLingerieScenario
                                      ? copy.upload.modelHintLingerie
                                      : undefined
                                  }
                                  savedModelUrl={null}
                                  modelSource={modelSource}
                                  onSelectSaved={handleSelectSavedModel}
                                  previewUrl={step2ModelPreview}
                                  selectedFile={modelFile}
                                  onFileSelect={handleModelFile}
                                  onClearFile={clearModelFile}
                                />
                              </div>
                            )}
                          </div>
                        </StudioWorkflowStep>

                        <StudioWorkflowStep
                          step={3}
                          label={copy.workflow.createPhoto}
                          tokenOperation="try-on"
                          isLast
                        >
                          <div className="space-y-3">
                            {showTryOnMaxToggle ? (
                              <label className="flex cursor-pointer items-start gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
                                <input
                                  type="checkbox"
                                  checked={tryOnMaxExperimental}
                                  onChange={(event) =>
                                    setTryOnMaxExperimental(event.target.checked)
                                  }
                                  disabled={loading || modelGenerating}
                                  className="mt-0.5 h-4 w-4 rounded border-border accent-teal-700"
                                />
                                <span className="text-xs font-medium leading-5 text-slate-900">
                                  Try-On Max (FASHN API)
                                </span>
                              </label>
                            ) : null}
                            <Button
                              className="w-full"
                              size="lg"
                              loading={loading || modelGenerating}
                              disabled={!canRunPrimary}
                              aria-describedby={
                                primaryStatusMessage
                                  ? "studio-primary-status"
                                  : undefined
                              }
                              onClick={handlePrimaryAction}
                            >
                              <PrimaryIcon className="h-5 w-5" />
                              {primaryButtonLabel}
                            </Button>
                            {primaryStatusMessage ? (
                              <div
                                id="studio-primary-status"
                                role="status"
                                aria-live="polite"
                                className={cn(
                                  "flex items-start gap-2 rounded-[12px] px-3 py-2.5 text-left text-xs leading-5",
                                  loading || modelGenerating
                                    ? "border border-teal-200/90 bg-teal-50 text-teal-950"
                                    : "border border-amber-200/90 bg-amber-50 text-amber-950"
                                )}
                              >
                                <Info
                                  className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
                                  aria-hidden
                                />
                                <span>{primaryStatusMessage}</span>
                              </div>
                            ) : null}
                            {showDevControls && pipelineDebug ? (
                              <details className="rounded-[12px] border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-700">
                                <summary className="cursor-pointer font-medium text-slate-900">
                                  Pipeline debug (view / pose / quality)
                                </summary>
                                <div className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-slate-600">
                                  {productAnalysis ? (
                                    <p>
                                      lingerieSetType:{" "}
                                      {productAnalysis.lingerieSetType} (
                                      {productAnalysis.lingerieSetTypeConfidence.toFixed(2)}
                                      )
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.analysis?.detectedProductView ? (
                                    <p>
                                      productView:{" "}
                                      {pipelineDebug.tryOn.analysis.detectedProductView}
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.resolver?.resolvedModelPose ? (
                                    <p>
                                      resolvedModelPose:{" "}
                                      {pipelineDebug.tryOn.resolver.resolvedModelPose}
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.tryOn?.tryOnEngine ? (
                                    <p>
                                      tryOnEngine:{" "}
                                      {pipelineDebug.tryOn.tryOn.tryOnEngine}
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.premium?.premiumGarmentEditRan !==
                                  undefined ? (
                                    <p>
                                      premiumGarmentEditRan:{" "}
                                      {String(
                                        pipelineDebug.tryOn.premium.premiumGarmentEditRan
                                      )}
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.quality?.repaired !== undefined ? (
                                    <p>
                                      repaired:{" "}
                                      {String(pipelineDebug.tryOn.quality.repaired)} (
                                      score{" "}
                                      {pipelineDebug.tryOn.quality.judgeScore?.toFixed(2) ??
                                        "n/a"}
                                      )
                                    </p>
                                  ) : null}
                                  {pipelineDebug.tryOn?.tryOn?.promptPreview ? (
                                    <p className="whitespace-pre-wrap break-words">
                                      promptPreview:{" "}
                                      {pipelineDebug.tryOn.tryOn.promptPreview}
                                    </p>
                                  ) : null}
                                </div>
                                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
                                  {JSON.stringify(pipelineDebug, null, 2)}
                                </pre>
                              </details>
                            ) : null}
                          </div>
                        </StudioWorkflowStep>
                      </>
                    )}

                    {isProductShotMode && (
                      <StudioWorkflowStep
                        step={3}
                        label={copy.workflow.marketplaceCard}
                      >
                        <ProductShotSettingsPanel
                          settings={productShotSettings}
                          onChange={setProductShotSettings}
                        />
                      </StudioWorkflowStep>
                    )}

                    {!isClothingMode ? (
                      <StudioWorkflowStep
                        step={4}
                        label={copy.workflow.done}
                        tokenOperation="background"
                        isLast
                      >
                        <div className="space-y-3">
                          <Button
                            className="w-full"
                            size="lg"
                            loading={productCardPrimaryBusy}
                            disabled={!canRunPrimary}
                            aria-busy={productCardPrimaryBusy}
                            aria-describedby={
                              primaryStatusMessage
                                ? "studio-primary-status-product"
                                : undefined
                            }
                            onClick={handlePrimaryAction}
                          >
                            {!productCardPrimaryBusy ? (
                              <PrimaryIcon className="h-5 w-5" />
                            ) : null}
                            {primaryButtonLabel}
                          </Button>
                          {primaryStatusMessage ? (
                            <div
                              id="studio-primary-status-product"
                              role="status"
                              aria-live="polite"
                              className={cn(
                                "flex items-start gap-2 rounded-[12px] px-3 py-2.5 text-left text-xs leading-5",
                                loading
                                  ? "border border-teal-200/90 bg-teal-50 text-teal-950"
                                  : "border border-amber-200/90 bg-amber-50 text-amber-950"
                              )}
                            >
                              <Info
                                className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
                                aria-hidden
                              />
                              <span>{primaryStatusMessage}</span>
                            </div>
                          ) : null}
                          {maskEditorOpen && isProductShotMode ? (
                            <p className="text-center text-[11px] leading-5 text-slate-500">
                              {copy.progress.maskStepHint}
                            </p>
                          ) : null}
                        </div>
                      </StudioWorkflowStep>
                    ) : null}
              </StudioWorkflowRail>
            </CardContent>
            </Card>
          </aside>

          <section
            className={cn(
              "flex min-h-0 flex-col pt-2 lg:sticky lg:top-6 lg:z-20 lg:self-start",
              isClothingMode && "max-lg:items-stretch",
              isClothingMode &&
                "lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:[scrollbar-width:thin]"
            )}
          >
            <div className="space-y-4">
              {productCardResetNotice && isProductShotMode ? (
                <div
                  role="status"
                  className="rounded-[20px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950"
                >
                  {productCardResetNotice}
                </div>
              ) : null}

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
                <ClothingPreviewPanel
                  modelOutputAspect={clothingPreviewAspect}
                  activeTab={clothingPreviewTab}
                  onTabChange={setClothingPreviewTab}
                  tabReady={clothingPreviewTabReady}
                  productUrl={
                    productCarouselItems.length === 1
                      ? (productCarouselItems[0]?.url ?? null)
                      : null
                  }
                  productCarouselItems={productCarouselItems}
                  modelUrl={
                    modelCarouselItems.length === 1
                      ? (modelCarouselItems[0]?.url ?? null)
                      : null
                  }
                  modelCarouselItems={modelCarouselItems}
                  modelGenerating={modelGenerating}
                  modelLoadingSubdetail={
                    pipelineBusy && !modelGenerating ? tryOnProgress : null
                  }
                  pipelineBusy={pipelineBusy}
                  pipelineCountdownStartedAt={clothingPipelineCountdownStartedAt}
                  modelCountdownStartedAt={modelGenerationCountdownStartedAt}
                  onReplaceModel={handleReplaceModel}
                  resultUrl={finalTryOnResult?.url ?? null}
                  tryOnProgress={tryOnProgress}
                  onDownloadResult={() => {
                    if (!finalTryOnResult) return;
                    void downloadImageFile(
                      finalTryOnResult.url,
                      `${finalTryOnResult.id}.png`
                    );
                  }}
                  onStartOver={handleStartOver}
                />
              ) : (
                  <div className="lg:sticky lg:top-6 lg:z-10">
                    <GenerationResultGrid
                      results={results}
                      loading={loading}
                      loadingDetail={tryOnProgress}
                      isProductShotMode={isProductShotMode}
                      isClothingTryOnMode={false}
                      productPreviewUrl={effectiveProductPreviewUrl}
                      productPreviewItems={productCarouselItems}
                      resultCountdownSeconds={
                        STUDIO_PRODUCT_CARD_RESULT_COUNTDOWN_SEC
                      }
                      resultCountdownStartedAt={productCardCountdownStartedAt}
                      resultCountdownLabel={
                        tryOnProgress ?? copy.status.creatingCard
                      }
                      saasPreviewChrome
                      previewAspect={productCardPreviewAspect}
                      onStartOver={handleStartOver}
                      embedded
                    />
                  </div>
              )}
            </div>
          </section>
        </div>
        )}
      </main>

      <StudioSignupGateModal
        open={signupGateOpen}
        onClose={() => setSignupGateOpen(false)}
        onBeforeLogin={flushStudioDraftBeforeLogin}
      />
      <TokenBillingModal
        open={tokenBilling !== null}
        payload={tokenBilling}
        onClose={() => setTokenBilling(null)}
      />
    </div>
  );
}

function StudioShellLoadingFallback() {
  const copy = getStudioCopy("ru");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4">
      <p className="text-sm font-medium text-slate-700">{copy.loading.title}</p>
    </div>
  );
}

export function StudioShell(
  props: {
    mockMode: boolean;
    paidAiRunsAllowed: boolean;
    locale?: Locale;
  }
) {
  return (
    <Suspense fallback={<StudioShellLoadingFallback />}>
      <StudioLocaleProvider
        routeLocale={
          props.locale === "en" || props.locale === "kk" || props.locale === "ru"
            ? props.locale
            : undefined
        }
      >
        <StudioShellInner {...props} />
      </StudioLocaleProvider>
    </Suspense>
  );
}
