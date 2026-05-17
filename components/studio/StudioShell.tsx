"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Eraser, Wand2 } from "lucide-react";
import { MOCK_MODEL_IMAGE } from "@/lib/ai/mockResults";
import type { GenerateModelResponse } from "@/lib/ai/modelGenerationSchemas";
import type { RemoveBackgroundResponse } from "@/lib/ai/backgroundRemovalSchemas";
import type { ProductShotResponse } from "@/lib/ai/productShotSchemas";
import {
  mapCategoryForTryOn,
  type TryOnInputSource,
  type TryOnResponse,
} from "@/lib/ai/falSchemas";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import {
  mapApiImagesToStudioResults,
  nextGenerationSeed,
} from "@/lib/studio/resultUtils";
import type { QualityChecklistKey } from "./types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "./ImageUploader";
import { ModelPresetSelector } from "./ModelPresetSelector";
import { GarmentSettingsPanel } from "./GarmentSettingsPanel";
import { ProductShotSettingsPanel } from "./ProductShotSettingsPanel";
import { StudioModeSelector } from "./StudioModeSelector";
import { GenerationResultGrid } from "./GenerationResultGrid";
import { BeforeAfterPreview } from "./BeforeAfterPreview";
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

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
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

export function StudioShell() {
  const productPreview = useObjectUrlPreview();
  const modelPreview = useObjectUrlPreview();

  const [studioMode, setStudioMode] = useState<StudioMode>("clothing-tryon");
  const [productFile, setProductFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(
    null
  );
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");

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
  const [numSamples, setNumSamples] = useState(2);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudioResultImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    provider: string;
    model: string;
    requestId: string;
    seed?: number;
    inputSource?: TryOnInputSource;
    sceneDescription?: string;
  } | null>(null);
  const [generationSeed, setGenerationSeed] = useState(42);
  const [modelGenerationSeed, setModelGenerationSeed] = useState(42);
  const [lastGenerationMode, setLastGenerationMode] =
    useState<LastGenerationMode>("clothing-tryon");

  const handleProductFile = useCallback(
    (file: File) => {
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setProductUrl("");
      setProductFile(file);
      setProductPreviewUrl(productPreview.setFromFile(file));
    },
    [productPreview]
  );

  const handleModelFile = useCallback(
    (file: File) => {
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setModelUrl("");
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
  }, [productPreview]);

  const clearModelFile = useCallback(() => {
    setModelFile(null);
    setModelPreviewUrl(modelPreview.setFromFile(null));
  }, [modelPreview]);

  const resolveModelImageUrl = useCallback((): string | null => {
    if (modelFile) return null;
    if (generatedModelUrl) return generatedModelUrl;
    const trimmed = modelUrl.trim();
    if (trimmed && isHttpUrl(trimmed)) return trimmed;
    return MOCK_MODEL_IMAGE;
  }, [modelFile, generatedModelUrl, modelUrl]);

  const effectiveModelPreview =
    modelPreviewUrl ??
    (generatedModelUrl && !modelFile ? generatedModelUrl : null) ??
    (modelUrl && isHttpUrl(modelUrl) ? modelUrl : null) ??
    MOCK_MODEL_IMAGE;

  const handlePresetChange = useCallback((preset: ModelPreset) => {
    setModelPreset(preset);
    setModelSettings((prev) => ({
      ...prev,
      ...presetToModelSettings(preset),
    }));
  }, []);

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
        setModelGenerateError(data.message);
        return;
      }

      const url = data.images[0]?.url;
      if (!url) {
        setModelGenerateError("Модель не вернула изображение. Попробуйте ещё раз.");
        return;
      }

      setGeneratedModelUrl(url);
      setModelFile(null);
      setModelUrl("");
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
    const productUrlTrimmed = productUrl.trim();

    if (!productFile && !productUrlTrimmed) {
      setError("Загрузите фото товара или вставьте ссылку.");
      return;
    }

    const resolvedModelUrl = modelFile
      ? null
      : resolveModelImageUrl() ?? MOCK_MODEL_IMAGE;

    const useMultipart = Boolean(productFile || modelFile);

    if (
      useMultipart === false &&
      productUrlTrimmed &&
      !isHttpUrl(productUrlTrimmed)
    ) {
      setError(
        "Для real AI mode локальные фото будут временно загружены в Fal Storage. Используйте ссылку https://… или загрузите файл."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);

    try {
      let res: Response;

      if (useMultipart) {
        const formData = new FormData();
        if (productFile) formData.append("productImageFile", productFile);
        if (modelFile) formData.append("modelImageFile", modelFile);
        if (!productFile && productUrlTrimmed) {
          formData.append("productImageUrl", productUrlTrimmed);
        }
        if (!modelFile && resolvedModelUrl) {
          formData.append("modelImageUrl", resolvedModelUrl);
        }
        formData.append("category", mapCategoryForTryOn(productCategory));
        formData.append("garmentPhotoType", garmentPhotoType);
        formData.append("mode", qualityMode);
        formData.append("moderationLevel", "permissive");
        formData.append("numSamples", String(numSamples));
        formData.append("segmentationFree", "true");
        formData.append("outputFormat", "png");
        formData.append("seed", String(useSeed));

        res = await fetch("/api/ai/tryon", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/ai/tryon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productImageUrl: productUrlTrimmed,
            modelImageUrl: resolvedModelUrl ?? MOCK_MODEL_IMAGE,
            category: mapCategoryForTryOn(productCategory),
            garmentPhotoType,
            mode: qualityMode,
            moderationLevel: "permissive",
            numSamples,
            segmentationFree: true,
            outputFormat: "png",
            seed: useSeed,
          }),
        });
      }

      const data = (await res.json()) as TryOnResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setResults(mapApiImagesToStudioResults(data.images, "Вариант"));
      setLastGenerationMode("clothing-tryon");
      setMeta({
        provider: data.provider,
        model: data.model,
        requestId: data.requestId,
        seed: useSeed,
        inputSource: data.inputSource,
      });
      setGenerationSeed(nextGenerationSeed());
    } catch {
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductShot = async () => {
    const productUrlTrimmed = productUrl.trim();

    if (!productFile && !productUrlTrimmed) {
      setError("Загрузите фото товара или вставьте ссылку.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);

    try {
      let res: Response;

      if (productFile) {
        const formData = new FormData();
        formData.append("productImageFile", productFile);
        if (productUrlTrimmed) {
          formData.append("productImageUrl", productUrlTrimmed);
        }
        formData.append("scenePreset", productShotSettings.scenePreset);
        if (productShotSettings.customSceneDescription) {
          formData.append(
            "customSceneDescription",
            productShotSettings.customSceneDescription
          );
        }
        formData.append("numResults", String(productShotSettings.numResults));
        formData.append("fast", "true");
        formData.append("placementType", "manual_placement");
        formData.append("manualPlacementSelection", "center_vertical");
        formData.append("shotSizePreset", productShotSettings.shotSizePreset);
        formData.append("syncMode", "false");

        res = await fetch("/api/ai/product-shot", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/ai/product-shot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productImageUrl: productUrlTrimmed,
            scenePreset: productShotSettings.scenePreset,
            customSceneDescription:
              productShotSettings.customSceneDescription || undefined,
            numResults: productShotSettings.numResults,
            fast: true,
            placementType: "manual_placement",
            manualPlacementSelection: "center_vertical",
            shotSizePreset: productShotSettings.shotSizePreset,
            syncMode: false,
          }),
        });
      }

      const data = (await res.json()) as ProductShotResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setResults(mapApiImagesToStudioResults(data.images, "Product shot"));
      setLastGenerationMode("product-shot");
      setMeta({
        provider: data.provider,
        model: data.model,
        requestId: data.requestId ?? "product-shot",
        sceneDescription: data.sceneDescription,
      });
    } catch {
      setError("Не удалось создать product shot. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundRemoveOnly = async () => {
    if (productFile) {
      setError(
        "Для режима «Удалить фон» на этом этапе используйте URL картинки. Upload для этого режима добавим позже."
      );
      return;
    }

    const imageUrl = productUrl.trim();
    if (!imageUrl || !isHttpUrl(imageUrl)) {
      setError("Вставьте ссылку на изображение (https://…).");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setMeta(null);

    try {
      const res = await fetch("/api/ai/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          provider: "bria",
          syncMode: false,
        }),
      });

      const data = (await res.json()) as RemoveBackgroundResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setResults(
        mapApiImagesToStudioResults(
          [{ url: data.image.url }],
          "Без фона"
        )
      );
      setLastGenerationMode("background-remove-only");
      setMeta({
        provider: data.provider,
        model: data.model,
        requestId: data.requestId ?? "bg-only",
      });
    } catch {
      setError("Не удалось удалить фон. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = useCallback(
    (resultId: string, key: QualityChecklistKey, value: boolean) => {
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? { ...r, checklist: { ...r.checklist, [key]: value } }
            : r
        )
      );
    },
    []
  );

  const handleAcceptResult = useCallback((resultId: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === resultId ? { ...r, reviewStatus: "accepted" as const } : r
      )
    );
  }, []);

  const handleRejectResult = useCallback((resultId: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === resultId ? { ...r, reviewStatus: "rejected" as const } : r
      )
    );
  }, []);

  const handleRemoveBackground = useCallback(async (resultId: string) => {
    let imageUrl: string | undefined;
    setResults((prev) => {
      const result = prev.find((r) => r.id === resultId);
      if (!result) return prev;
      imageUrl = result.url;
      return prev.map((r) =>
        r.id === resultId
          ? {
              ...r,
              backgroundRemoveLoading: true,
              backgroundRemoveError: undefined,
            }
          : r
      );
    });

    if (!imageUrl) return;

    try {
      const res = await fetch("/api/ai/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          provider: "bria",
          syncMode: false,
        }),
      });

      const data = (await res.json()) as RemoveBackgroundResponse;

      if (!data.ok) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? {
                  ...r,
                  backgroundRemoveLoading: false,
                  backgroundRemoveError: data.message,
                }
              : r
          )
        );
        return;
      }

      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                backgroundRemoveLoading: false,
                backgroundRemovedUrl: data.image.url,
                backgroundRemoveError: undefined,
              }
            : r
        )
      );
    } catch {
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                backgroundRemoveLoading: false,
                backgroundRemoveError:
                  "Не удалось удалить фон. Попробуйте ещё раз.",
              }
            : r
        )
      );
    }
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

  const productUrlTrimmed = productUrl.trim();
  const modelUrlTrimmed = modelUrl.trim();
  const firstResultUrl = results[0]?.url ?? null;
  const isClothingMode = studioMode === "clothing-tryon";
  const isProductShotMode = studioMode === "product-shot";
  const isBgOnlyMode = studioMode === "background-remove-only";

  const primaryButtonLabel = isClothingMode
    ? "Создать фото"
    : isProductShotMode
      ? "Создать product shot"
      : "Удалить фон";

  const PrimaryIcon = isClothingMode ? Wand2 : isProductShotMode ? Camera : Eraser;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
          <Badge variant="violet">Demo · Mock mode</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr] lg:px-8">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StudioModeSelector
                value={studioMode}
                onChange={setStudioMode}
              />

              {!isBgOnlyMode && (
                <p className="text-xs text-slate-500">
                  Для real AI mode локальные фото будут временно загружены в
                  Fal Storage.
                </p>
              )}

              <ImageUploader
                label={
                  isBgOnlyMode
                    ? "Image URL / upload"
                    : "Source product image"
                }
                hint={
                  isBgOnlyMode
                    ? "Для удаления фона вставьте URL изображения"
                    : "Фото одежды или товара"
                }
                previewUrl={
                  productPreviewUrl ??
                  (productUrlTrimmed && isHttpUrl(productUrlTrimmed)
                    ? productUrlTrimmed
                    : null)
                }
                selectedFile={isBgOnlyMode ? null : productFile}
                onFileSelect={isBgOnlyMode ? undefined : handleProductFile}
                onClearFile={isBgOnlyMode ? undefined : clearProductFile}
                onUrlChange={(url) => {
                  if (productFile) return;
                  setProductUrl(url);
                  setProductPreviewUrl(
                    url && isHttpUrl(url)
                      ? productPreview.setFromHttpUrl(url)
                      : productPreview.setFromHttpUrl(null)
                  );
                }}
                urlValue={productUrl}
              />

              {isClothingMode && (
                <>
                  <ImageUploader
                    label="Target model image (optional)"
                    hint="Или выберите пресет ниже"
                    previewUrl={
                      modelPreviewUrl ??
                      (modelUrlTrimmed && isHttpUrl(modelUrlTrimmed)
                        ? modelUrlTrimmed
                        : null)
                    }
                    selectedFile={modelFile}
                    onFileSelect={handleModelFile}
                    onClearFile={clearModelFile}
                    onUrlChange={(url) => {
                      if (modelFile) return;
                      setModelUrl(url);
                      setGeneratedModelUrl(null);
                      setModelGenerateError(null);
                      setModelPreviewUrl(
                        url && isHttpUrl(url)
                          ? modelPreview.setFromHttpUrl(url)
                          : modelPreview.setFromHttpUrl(null)
                      );
                    }}
                    urlValue={modelUrl}
                  />

                  <ModelPresetSelector
                    value={modelPreset}
                    onChange={handlePresetChange}
                    settings={modelSettings}
                    onSettingsChange={setModelSettings}
                    onGenerate={() => void handleGenerateModel()}
                    generating={modelGenerating}
                    generateError={modelGenerateError}
                    generatedPreviewUrl={
                      generatedModelUrl && !modelFile
                        ? generatedModelUrl
                        : null
                    }
                  />

                  <GarmentSettingsPanel
                    productCategory={productCategory}
                    onProductCategoryChange={setProductCategory}
                    garmentPhotoType={garmentPhotoType}
                    onGarmentPhotoTypeChange={setGarmentPhotoType}
                    qualityMode={qualityMode}
                    onQualityModeChange={setQualityMode}
                    numSamples={numSamples}
                    onNumSamplesChange={setNumSamples}
                  />
                </>
              )}

              {isProductShotMode && (
                <ProductShotSettingsPanel
                  settings={productShotSettings}
                  onChange={setProductShotSettings}
                />
              )}

              <Button
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handlePrimaryAction}
              >
                <PrimaryIcon className="h-5 w-5" />
                {primaryButtonLabel}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          {isClothingMode ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <PreviewCard
                title="Товар"
                url={
                  productPreviewUrl ??
                  (productUrlTrimmed && isHttpUrl(productUrlTrimmed)
                    ? productUrlTrimmed
                    : null)
                }
                empty="Загрузите фото товара"
              />
              <PreviewCard
                title="AI-модель"
                url={effectiveModelPreview}
                empty="Сгенерируйте или загрузите модель"
                badge={
                  generatedModelUrl && !modelFile ? "AI generated" : undefined
                }
              />
            </div>
          ) : (
            <PreviewCard
              title={isBgOnlyMode ? "Исходник" : "Товар"}
              url={
                productPreviewUrl ??
                (productUrlTrimmed && isHttpUrl(productUrlTrimmed)
                  ? productUrlTrimmed
                  : null)
              }
              empty={
                isBgOnlyMode
                  ? "Вставьте URL изображения"
                  : "Загрузите фото товара"
              }
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Результаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900">
                Перед публикацией на Kaspi/Instagram проверьте результат: AI
                может изменить цвет, форму, узор или детали товара. Используйте
                только фото, которые прошли ручную проверку.
              </p>
              <GenerationResultGrid
                results={results}
                loading={loading}
                showRegenerate={!isBgOnlyMode && results.length > 0}
                regenerateLoading={loading}
                onChecklistChange={handleChecklistChange}
                onAccept={handleAcceptResult}
                onReject={handleRejectResult}
                onRegenerate={handleRegenerate}
                onRemoveBackground={handleRemoveBackground}
              />
              {meta && (
                <div className="space-y-1 text-xs text-slate-400">
                  <p>
                    {meta.provider} · {meta.model} · {meta.requestId}
                    {meta.seed !== undefined ? ` · seed ${meta.seed}` : ""}
                  </p>
                  {meta.inputSource && (
                    <p>
                      Product: {meta.inputSource.product} · Model:{" "}
                      {meta.inputSource.model}
                    </p>
                  )}
                  {meta.sceneDescription && (
                    <p className="line-clamp-2" title={meta.sceneDescription}>
                      Scene: {meta.sceneDescription.slice(0, 120)}…
                    </p>
                  )}
                </div>
              )}
              {isClothingMode && (
                <BeforeAfterPreview
                  beforeUrl={
                    productPreviewUrl ??
                    (productUrlTrimmed && isHttpUrl(productUrlTrimmed)
                      ? productUrlTrimmed
                      : null)
                  }
                  afterUrl={firstResultUrl}
                />
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
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
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          {badge && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              {badge}
            </span>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={title}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center p-4 text-center text-sm text-slate-400">
              {empty}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
