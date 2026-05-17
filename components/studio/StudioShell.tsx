"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Eraser,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";
import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { RemoveBackgroundResponse } from "@/lib/ai/backgroundRemovalSchemas";
import { mapCategoryForTryOn, type TryOnResponse } from "@/lib/ai/falSchemas";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import {
  centerTransparentCutout,
  fitCutoutToShotSize,
  refineCutoutWithUserMask,
} from "@/lib/studio/cutoutImage";
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
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "./ImageUploader";
import { ModelPresetSelector } from "./ModelPresetSelector";
import { GarmentSettingsPanel } from "./GarmentSettingsPanel";
import { ProductShotSettingsPanel } from "./ProductShotSettingsPanel";
import { StudioModeSelector } from "./StudioModeSelector";
import { GenerationResultGrid } from "./GenerationResultGrid";
import type { ProductMaskApplyResult } from "./ProductMaskEditor";
import { ProductSelectionPanel } from "./ProductSelectionPanel";
import { StudioWorkflowStep } from "./StudioWorkflowStep";
import {
  DEFAULT_MODEL_GENERATION_SETTINGS,
  DEFAULT_PRODUCT_SHOT_SETTINGS,
  presetToModelSettings,
  type GarmentPhotoType,
  type ModelGenerationSettings,
  type ModelPreset,
  type ProductCategory,
  type ProductShotSettings,
  type QualityMode,
  type StudioMode,
  type StudioResultImage,
  type LastGenerationMode,
} from "./types";

const MODE_STEPS: Record<
  StudioMode,
  { title: string; description: string }[]
> = {
  "clothing-tryon": [
    {
      title: "Загрузите товар",
      description: "Фото одежды или белья. Если товар на человеке, выберите это в настройках.",
    },
    {
      title: "Выберите модель",
      description: "Загрузите фото модели или сгенерируйте взрослую AI-модель.",
    },
    {
      title: "Проверьте результат",
      description: "Сравните цвет, форму, узор, посадку и детали изделия.",
    },
  ],
  "product-shot": [
    {
      title: "Загрузите товар",
      description: "Фото бижутерии, сумки, обуви, аксессуара или небольшого товара.",
    },
    {
      title: "Выделите товар",
      description:
        "Если рядом есть ветки, руки или декор — закрасьте только товар кистью.",
    },
    {
      title: "Создайте карточку",
      description: "Проверьте результат и примите только точный вариант.",
    },
  ],
  "background-remove-only": [
    {
      title: "Загрузите фото",
      description: "Выберите файл JPEG, PNG или WEBP.",
    },
    {
      title: "Удалите фон",
      description: "Сервис создаст вариант без фона.",
    },
    {
      title: "Скачайте PNG",
      description: "Сначала проверьте края товара и прозрачность.",
    },
  ],
};

function friendlyAiError(errorCode?: string, message?: string): string {
  if (errorCode === "FAL_KEY_MISSING") {
    return "AI-сервис не настроен на сервере. Обратитесь к администратору.";
  }

  if (errorCode === "FAL_UPLOAD_FAILED") {
    return "Не удалось временно отправить изображение в Fal. Попробуйте файл меньше 10MB в JPEG, PNG или WEBP.";
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

  return { setFromFile, setFromHttpUrl };
}

export function StudioShell({ mockMode }: { mockMode: boolean }) {
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
  const [qualityMode, setQualityMode] = useState<QualityMode>("balanced");
  const [modelPreset, setModelPreset] = useState<ModelPreset>("female-studio");
  const [modelSettings, setModelSettings] = useState<ModelGenerationSettings>(
    DEFAULT_MODEL_GENERATION_SETTINGS
  );
  const [productShotSettings, setProductShotSettings] =
    useState<ProductShotSettings>(DEFAULT_PRODUCT_SHOT_SETTINGS);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null
  );
  const [modelGenerating, setModelGenerating] = useState(false);
  const [modelGenerateError, setModelGenerateError] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudioResultImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationSeed, setGenerationSeed] = useState(42);
  const [modelGenerationSeed, setModelGenerationSeed] = useState(42);
  const [lastGenerationMode, setLastGenerationMode] =
    useState<LastGenerationMode>("clothing-tryon");

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
  }, [modelPreview]);

  const resolveModelImageUrl = useCallback((): string | null => {
    if (modelFile) return null;
    if (generatedModelUrl) return generatedModelUrl;
    return mockMode ? MOCK_MODEL_IMAGE : null;
  }, [modelFile, generatedModelUrl, mockMode]);

  const effectiveModelPreview =
    modelPreviewUrl ??
    (generatedModelUrl && !modelFile ? generatedModelUrl : null) ??
    (mockMode ? MOCK_MODEL_IMAGE : null);

  const handlePresetChange = useCallback((preset: ModelPreset) => {
    setModelPreset(preset);
    setModelSettings((prev) => ({
      ...prev,
      ...presetToModelSettings(preset),
    }));
  }, []);

  const handleModelSettingsChange = useCallback(
    (settings: ModelGenerationSettings) => {
      setModelSettings(settings);
      if (settings.categoryContext === "lingerie") {
        setGarmentPhotoType("model");
        setQualityMode("quality");
      }
    },
    []
  );

  const handleGenerateModel = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? modelGenerationSeed;
    setModelGenerating(true);
    setModelGenerateError(null);

    try {
      const res = await fetch("/api/ai/generate-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: modelSettings.gender,
          bodyType: modelSettings.bodyType,
          ageGroup: "adult",
          pose: modelSettings.pose,
          crop: modelSettings.crop,
          background: modelSettings.background,
          categoryContext: modelSettings.categoryContext,
          aspectRatio: "3:4",
          outputFormat: "png",
          resolution: "1K",
          numImages: 1,
          seed: useSeed,
        }),
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
      setModelPreviewUrl(modelPreview.setFromHttpUrl(url));
      setModelGenerationSeed(nextGenerationSeed());
    } catch {
      setModelGenerateError(
        "Не удалось сгенерировать модель. Попробуйте ещё раз."
      );
    } finally {
      setModelGenerating(false);
    }
  };

  const handleGenerateTryOn = async (seedOverride?: number) => {
    const useSeed = seedOverride ?? generationSeed;

    if (!productFile) {
      setError("Загрузите фото товара.");
      return;
    }

    const resolvedModelUrl = modelFile ? null : resolveModelImageUrl();

    if (!modelFile && !resolvedModelUrl) {
      setError("Загрузите фото модели или сгенерируйте AI-модель.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("productImageFile", productFile);
      if (modelFile) formData.append("modelImageFile", modelFile);
      else if (resolvedModelUrl) {
        formData.append("modelImageUrl", resolvedModelUrl);
      }
      formData.append("category", mapCategoryForTryOn(productCategory));
      formData.append("garmentPhotoType", garmentPhotoType);
      formData.append("mode", qualityMode);
      formData.append("moderationLevel", "permissive");
      formData.append("numSamples", "1");
      formData.append("segmentationFree", "true");
      formData.append("outputFormat", "png");
      formData.append("seed", String(useSeed));

      const res = await fetch("/api/ai/tryon", { method: "POST", body: formData });

      const data = (await res.json()) as TryOnResponse;

      if (!data.ok) {
        setError(friendlyAiError(data.errorCode, data.message));
        return;
      }

      setResults(mapApiImagesToStudioResults(data.images, "Вариант", data.provider));
      setLastGenerationMode("clothing-tryon");
      setGenerationSeed(nextGenerationSeed());
    } catch {
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
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
        productShotSettings.shotSizePreset
      );
      let sizedCutoutUrl = cutoutUrl;
      try {
        sizedCutoutUrl = await fitCutoutToShotSize(
          cutoutUrl,
          productShotSettings.shotSizePreset
        );
      } catch {
        /* keep API url if canvas processing fails */
      }
      const background = scenePresetToExactBackground(
        productShotSettings.scenePreset
      );
      const cardUrl = await composeExactProductCard(sizedCutoutUrl, {
        background,
        shotSizePreset: productShotSettings.shotSizePreset,
      });

      setResults(
        mapProductShotStudioResults(
          [{ url: cardUrl, width: exportWidth, height: exportHeight }],
          "exact-card",
          {
            cutoutPreviewUrl: sizedCutoutUrl,
            selectedProductPreviewUrl: selectedProductPreviewUrl ?? undefined,
            manualMaskUsed: maskUsed,
            exactCardWithoutMask: !maskUsed,
            provider: bgProvider,
          }
        )
      );
      setLastGenerationMode("product-shot");
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

  const handleBackgroundRemoveOnly = async () => {
    if (!productFile) {
      setError("Загрузите изображение.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await removeBackgroundForProduct(productFile);

      if (!data.ok) {
        setError(friendlyAiError(data.errorCode, data.message));
        return;
      }

      setResults(
        mapApiImagesToStudioResults(
          [{ url: data.image.url }],
          "Без фона",
          data.provider
        )
      );
      setLastGenerationMode("background-remove-only");
    } catch {
      setError("Не удалось удалить фон. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const handleRegenerate = () => {
    const nextSeed = nextGenerationSeed();
    setGenerationSeed(nextSeed);

    if (lastGenerationMode === "clothing-tryon") {
      void handleGenerateTryOn(nextSeed);
    } else if (lastGenerationMode === "product-shot") {
      void handleProductShot();
    }
  };

  const handlePrimaryAction = () => {
    if (studioMode === "clothing-tryon") return handleGenerateTryOn();
    if (studioMode === "product-shot") return handleProductShot();
    return handleBackgroundRemoveOnly();
  };

  const isClothingMode = studioMode === "clothing-tryon";
  const isProductShotMode = studioMode === "product-shot";
  const isBgOnlyMode = studioMode === "background-remove-only";
  const effectiveProductPreviewUrl = productPreviewUrl;
  const hasProductInput = Boolean(productFile);
  const hasModelInput = Boolean(
    modelFile || generatedModelUrl || mockMode
  );
  const primaryBlocker = (() => {
    if (!hasProductInput) return "Сначала загрузите фото.";

    if (isClothingMode && !hasModelInput) {
      return "Загрузите фото модели или сгенерируйте AI-модель.";
    }

    return null;
  })();
  const canRunPrimary = !loading && primaryBlocker === null;
  const primaryHelper = primaryBlocker;

  const primaryButtonLabel = isClothingMode
    ? "Создать фото на модели"
    : isProductShotMode
      ? "Создать карточку"
      : "Удалить фон";

  const PrimaryIcon = isClothingMode
    ? Wand2
    : isProductShotMode
      ? Camera
      : Eraser;
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge variant="violet" className="mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Vitrina AI Studio
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Студия товарных фото
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Создавайте фото для карточек товаров: одежда на модели, Product
              Shot для аксессуаров и удаление фона. Перед скачиванием проверьте
              результат по чеклисту.
            </p>
          </div>

          <div className="rounded-[24px] border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <p>
                Фото не сохраняются в нашей базе. Для генерации изображения
                временно обрабатываются в защищённом облачном AI-сервисе.
              </p>
            </div>
          </div>
        </section>

        <StudioModeSelector value={studioMode} onChange={setStudioMode} />
        <ModeStepper mode={studioMode} />

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-4">
            <Card>
            <CardContent className="pt-6">
              <>
                    <StudioWorkflowStep
                      step={1}
                      label={
                        isBgOnlyMode ? "Исходное фото" : "Фото товара"
                      }
                    >
                      <ImageUploader
                        label={
                          isBgOnlyMode
                            ? "Изображение для удаления фона"
                            : "Загрузите фото товара"
                        }
                        hint={
                          isBgOnlyMode
                            ? "Загрузите готовое фото — сервис уберёт фон и вернёт PNG."
                            : "Лучше всего: товар хорошо виден, без сильного размытия и без лишних предметов."
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
                        >
                          <ImageUploader
                            label="Загрузите фото модели или сгенерируйте AI-модель"
                            hint="Для одежды лучше подходит фото в полный рост или по пояс, где одежду легко заменить."
                            previewUrl={effectiveModelPreview}
                            selectedFile={modelFile}
                            onFileSelect={handleModelFile}
                            onClearFile={clearModelFile}
                          />
                        </StudioWorkflowStep>

                        <StudioWorkflowStep
                          step={3}
                          label="AI-модель"
                        >
                          <ModelPresetSelector
                            value={modelPreset}
                            onChange={handlePresetChange}
                            settings={modelSettings}
                            onSettingsChange={handleModelSettingsChange}
                            onGenerate={() => void handleGenerateModel()}
                            generating={modelGenerating}
                            generateError={modelGenerateError}
                            generatedPreviewUrl={
                              generatedModelUrl && !modelFile
                                ? generatedModelUrl
                                : null
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
                        isClothingMode ? 5 : isProductShotMode ? 4 : 2
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
                        <p className="mt-2 text-xs leading-5 text-amber-800">
                          {primaryHelper}
                        </p>
                      ) : null}
                    </StudioWorkflowStep>
              </>
            </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            {isClothingMode ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard
                  title="Товар"
                  url={
                    effectiveProductPreviewUrl
                  }
                  empty="Загрузите фото товара"
                />
                <PreviewCard
                  title="AI-модель"
                  url={effectiveModelPreview}
                  empty="Сгенерируйте или загрузите модель"
                  badge={
                    generatedModelUrl && !modelFile ? "AI-модель" : undefined
                  }
                />
              </div>
            ) : (
              <PreviewCard
                title={isBgOnlyMode ? "Исходник" : "Товар"}
                url={effectiveProductPreviewUrl}
                empty="Загрузите фото"
              />
            )}

            <Card>
            <CardHeader>
              <CardTitle>Результаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <GenerationResultGrid
                results={results}
                loading={loading}
                showRegenerate={
                  !isBgOnlyMode && !isProductShotMode && results.length > 0
                }
                regenerateLoading={loading}
                isProductShotMode={isProductShotMode}
                onStartOver={handleStartOver}
                onRegenerate={handleRegenerate}
              />
            </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function ModeStepper({ mode }: { mode: StudioMode }) {
  const steps = MODE_STEPS[mode];

  return (
    <section className="grid gap-2 sm:grid-cols-3" aria-label="Порядок работы">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="flex min-h-[112px] gap-3 rounded-[20px] border border-border bg-white p-4 shadow-sm"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
            {index + 1}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              {step.title}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

function PreviewCard({
  title,
  url,
  empty,
  badge,
}: {
  title: string;
  url: string | null;
  empty: string;
  badge?: string;
}) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          {badge && <Badge variant="violet">{badge}</Badge>}
        </div>
        <div className="overflow-hidden rounded-[18px] border border-border bg-slate-50">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Предпросмотр: ${title}`}
              className="max-h-[460px] min-h-[220px] w-full object-contain"
            />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center p-4 text-center text-sm leading-6 text-slate-500">
              {empty}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
