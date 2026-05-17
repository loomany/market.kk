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
import type { ProductShotResponse } from "@/lib/ai/productShotSchemas";
import { mapCategoryForTryOn, type TryOnResponse } from "@/lib/ai/falSchemas";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import { isMarketplaceScenePreset } from "@/lib/ai/productShotFidelity";
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
  CardDescription,
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
import { BeforeAfterPreview } from "./BeforeAfterPreview";
import {
  ProductMaskEditor,
  type ProductMaskApplyResult,
} from "./ProductMaskEditor";
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
      title: "Вставьте ссылку",
      description: "Нужна ссылка на готовое изображение.",
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

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function friendlyAiError(errorCode?: string, message?: string): string {
  if (errorCode === "FAL_KEY_MISSING") {
    return "AI-сервис не настроен на сервере. Обратитесь к администратору.";
  }

  if (errorCode === "FAL_UPLOAD_FAILED") {
    return "Не удалось временно отправить изображение в Fal. Попробуйте файл меньше 10MB в JPEG, PNG или WEBP.";
  }

  if (message?.includes("Product image file or URL is required")) {
    return "Загрузите фото товара или вставьте ссылку.";
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
  const [useSelectedForCreative, setUseSelectedForCreative] = useState(false);

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
    const trimmed = modelUrl.trim();
    if (trimmed && isHttpUrl(trimmed)) return trimmed;
    return mockMode ? MOCK_MODEL_IMAGE : null;
  }, [modelFile, generatedModelUrl, modelUrl, mockMode]);

  const effectiveModelPreview =
    modelPreviewUrl ??
    (generatedModelUrl && !modelFile ? generatedModelUrl : null) ??
    (modelUrl && isHttpUrl(modelUrl) ? modelUrl : null) ??
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

    if (!modelFile && modelUrlTrimmed && !isHttpUrl(modelUrlTrimmed)) {
      setError(
        "Вставьте ссылку на модель, которая начинается с https://, или загрузите файл модели."
      );
      return;
    }

    const resolvedModelUrl = modelFile ? null : resolveModelImageUrl();

    if (!modelFile && !resolvedModelUrl) {
      setError("Загрузите фото модели или сгенерируйте AI-модель.");
      return;
    }

    const useMultipart = Boolean(productFile || modelFile);

    if (
      useMultipart === false &&
      productUrlTrimmed &&
      !isHttpUrl(productUrlTrimmed)
    ) {
      setError(
        "Вставьте ссылку, которая начинается с https://, или загрузите файл товара."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

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
            modelImageUrl: resolvedModelUrl,
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

  const usesExactProductCard = () =>
    productShotSettings.fidelityMode === "exact-card" ||
    isMarketplaceScenePreset(productShotSettings.scenePreset);

  const removeBackgroundForProduct = async (
    productUrlTrimmed: string,
    imageFileOverride?: File | null
  ): Promise<RemoveBackgroundResponse> => {
    let res: Response;
    const fileForBg = imageFileOverride ?? productFile;

    if (fileForBg) {
      const formData = new FormData();
      formData.append("imageFile", fileForBg);
      if (productUrlTrimmed && !imageFileOverride) {
        formData.append("imageUrl", productUrlTrimmed);
      }
      formData.append("syncMode", "false");
      res = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });
    } else {
      res = await fetch("/api/ai/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: productUrlTrimmed,
          provider: "bria",
          syncMode: false,
        }),
      });
    }

    return (await res.json()) as RemoveBackgroundResponse;
  };

  const handleExactProductCard = async () => {
    const productUrlTrimmed = productUrl.trim();

    if (!productFile && !productUrlTrimmed) {
      setError("Загрузите фото товара или вставьте ссылку.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const maskUsed = Boolean(selectedProductFile);
      const bgSourceFile = selectedProductFile ?? productFile;
      const bgData = await removeBackgroundForProduct(
        productUrlTrimmed,
        bgSourceFile
      );

      if (!bgData.ok) {
        setError(friendlyAiError(bgData.errorCode, bgData.message));
        return;
      }

      const cutoutUrl = bgData.image.url;
      const background = scenePresetToExactBackground(
        productShotSettings.scenePreset
      );
      const cardUrl = await composeExactProductCard(cutoutUrl, {
        background,
        shotSizePreset: productShotSettings.shotSizePreset,
      });

      setResults(
        mapProductShotStudioResults(
          [{ url: cardUrl }],
          "exact-card",
          {
            cutoutPreviewUrl: cutoutUrl,
            selectedProductPreviewUrl: selectedProductPreviewUrl ?? undefined,
            manualMaskUsed: maskUsed,
            exactCardWithoutMask: !maskUsed,
            provider: bgData.provider,
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

  const handleCreativeProductShot = async () => {
    const productUrlTrimmed = productUrl.trim();

    if (!productFile && !productUrlTrimmed) {
      setError("Загрузите фото товара или вставьте ссылку.");
      return;
    }

    if (isMarketplaceScenePreset(productShotSettings.scenePreset)) {
      setError("Пресеты маркетплейса работают только в режиме «Точная карточка».");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let res: Response;
      const creativeProductFile =
        useSelectedForCreative && selectedProductFile
          ? selectedProductFile
          : productFile;

      if (creativeProductFile) {
        const formData = new FormData();
        formData.append("productImageFile", creativeProductFile);
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
        formData.append("fidelityMode", "creative-scene");

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
            fidelityMode: "creative-scene",
          }),
        });
      }

      const data = (await res.json()) as ProductShotResponse;

      if (!data.ok) {
        setError(friendlyAiError(data.errorCode, data.message));
        return;
      }

      setResults(
        mapProductShotStudioResults(data.images, "creative-scene", {
          provider: data.provider,
        })
      );
      setLastGenerationMode("product-shot");
    } catch {
      setError("Не удалось создать товарное фото. Проверьте фото и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductShot = async () => {
    if (usesExactProductCard()) {
      await handleExactProductCard();
      return;
    }
    await handleCreativeProductShot();
  };

  const handleBackgroundRemoveOnly = async () => {
    const imageUrl = productUrl.trim();
    if (!imageUrl || !isHttpUrl(imageUrl)) {
      setError("Вставьте ссылку на изображение (https://…).");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

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
                  backgroundRemoveError: friendlyAiError(
                    data.errorCode,
                    data.message
                  ),
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
  const productUrlPreview =
    productUrlTrimmed && isHttpUrl(productUrlTrimmed) ? productUrlTrimmed : null;
  const effectiveProductPreviewUrl = isBgOnlyMode
    ? productUrlPreview
    : productPreviewUrl ?? productUrlPreview;
  const productUrlIsValid = Boolean(productUrlPreview);
  const modelUrlIsValid = Boolean(modelUrlTrimmed && isHttpUrl(modelUrlTrimmed));
  const hasProductInput = isBgOnlyMode
    ? productUrlIsValid
    : Boolean(productFile || productUrlIsValid);
  const hasModelInput = Boolean(
    modelFile || generatedModelUrl || modelUrlIsValid || mockMode
  );
  const primaryBlocker = (() => {
    if (isBgOnlyMode) {
      if (!productUrlTrimmed) return "Сначала вставьте ссылку на изображение.";
      if (!productUrlIsValid) return "Ссылка должна начинаться с https:// или http://.";
      return null;
    }

    if (!productFile && productUrlTrimmed && !productUrlIsValid) {
      return "Ссылка на товар должна начинаться с https:// или http://.";
    }

    if (!hasProductInput) return "Сначала загрузите фото товара.";

    if (isClothingMode && !modelFile && modelUrlTrimmed && !modelUrlIsValid) {
      return "Ссылка на модель должна начинаться с https:// или http://.";
    }

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
      ? "Создать Product Shot"
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
            <CardHeader>
              <CardTitle>Рабочая область</CardTitle>
              <CardDescription>
                Загрузите фото, выберите понятные настройки и запустите
                генерацию.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader
                label={
                  isBgOnlyMode
                    ? "Изображение для удаления фона"
                    : "Загрузите фото товара"
                }
                hint={
                  isBgOnlyMode
                    ? "В этом режиме используйте ссылку на готовое изображение."
                    : "Лучше всего: товар хорошо виден, без сильного размытия и без лишних предметов."
                }
                previewUrl={
                  effectiveProductPreviewUrl
                }
                selectedFile={isBgOnlyMode ? null : productFile}
                onFileSelect={isBgOnlyMode ? undefined : handleProductFile}
                onClearFile={isBgOnlyMode ? undefined : clearProductFile}
                onUrlChange={(url) => {
                  if (productFile && !isBgOnlyMode) return;
                  setProductUrl(url);
                  clearSelectedProduct();
                  setProductPreviewUrl(
                    url && isHttpUrl(url)
                      ? productPreview.setFromHttpUrl(url)
                      : productPreview.setFromHttpUrl(null)
                  );
                }}
                urlValue={productUrl}
                urlLabel="Или вставьте ссылку на изображение"
              />

              {isClothingMode && (
                <>
                  <ImageUploader
                    label="Загрузите фото модели или сгенерируйте AI-модель"
                    hint="Для одежды лучше подходит фото в полный рост или по пояс, где одежду легко заменить."
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
                    urlLabel="Или вставьте ссылку на изображение модели"
                  />

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

                  <GarmentSettingsPanel
                    productCategory={productCategory}
                    onProductCategoryChange={setProductCategory}
                    garmentPhotoType={garmentPhotoType}
                    onGarmentPhotoTypeChange={setGarmentPhotoType}
                    qualityMode={qualityMode}
                    onQualityModeChange={setQualityMode}
                    numSamples={numSamples}
                    onNumSamplesChange={setNumSamples}
                    lingerieMode={modelSettings.categoryContext === "lingerie"}
                  />
                </>
              )}

              {isProductShotMode && (
                <ProductShotSettingsPanel
                  settings={productShotSettings}
                  onChange={setProductShotSettings}
                  hasSelectedProduct={Boolean(selectedProductFile)}
                  useSelectedForCreative={useSelectedForCreative}
                  onUseSelectedForCreativeChange={setUseSelectedForCreative}
                />
              )}

              {isProductShotMode &&
                usesExactProductCard() &&
                hasProductInput &&
                effectiveProductPreviewUrl &&
                !maskEditorOpen && (
                  <div className="space-y-3 rounded-[22px] border border-teal-100 bg-teal-50/50 p-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => setMaskEditorOpen(true)}
                    >
                      Выделить товар
                    </Button>
                    <p className="text-xs leading-5 text-slate-600">
                      Если на фото есть ветки, руки, декор или лишние предметы
                      — выделите только товар. Так карточка получится точнее.
                    </p>
                    {!selectedProductFile && (
                      <p className="text-xs leading-5 text-amber-800">
                        Без выделения AI может оставить лишние объекты рядом с
                        товаром.
                      </p>
                    )}
                    {selectedProductPreviewUrl && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-700">
                          Выбранный товар
                        </p>
                        <div className="overflow-hidden rounded-[16px] border border-border bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                          style={{
                            backgroundImage:
                              "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedProductPreviewUrl}
                            alt="Выбранный товар"
                            className="max-h-48 w-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => setMaskEditorOpen(true)}
                        >
                          Изменить выделение
                        </Button>
                      </div>
                    )}
                  </div>
                )}

              {isProductShotMode && maskEditorOpen && effectiveProductPreviewUrl && (
                <ProductMaskEditor
                  key={effectiveProductPreviewUrl}
                  imageUrl={effectiveProductPreviewUrl}
                  onApply={handleMaskApply}
                  onCancel={() => setMaskEditorOpen(false)}
                />
              )}

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
                <p className="text-xs leading-5 text-amber-800">
                  {primaryHelper}
                </p>
              ) : null}
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
                url={
                  effectiveProductPreviewUrl
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
                showRegenerate={!isBgOnlyMode && results.length > 0}
                regenerateLoading={loading}
                isProductShotMode={isProductShotMode}
                onAccept={handleAcceptResult}
                onReject={handleRejectResult}
                onRegenerate={handleRegenerate}
                onRemoveBackground={handleRemoveBackground}
              />
              {isClothingMode && (
                <BeforeAfterPreview
                  beforeUrl={
                    effectiveProductPreviewUrl
                  }
                  afterUrl={firstResultUrl}
                />
              )}
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
