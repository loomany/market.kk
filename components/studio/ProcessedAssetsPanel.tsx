"use client";

import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Download, Layers, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VIDEO_MODELS, type VideoModelKey } from "@/lib/ai/videoModels";
import type { PromptEnhanceResponse } from "@/lib/ai/promptEnhanceSchemas";
import type { SceneGenerateResponse } from "@/lib/ai/sceneSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";
import type { Locale } from "@/lib/i18n/localeConfig";
import type { StudioSessionAsset } from "./types";
import { downloadImageFile } from "@/lib/studio/downloadImages";
import {
  assetProcessingSourceUrl,
  getAssetDisplayTitle,
  isVideoAsset,
} from "@/lib/studio/assetDisplayLabels";
import {
  VIDEO_EDITORS,
  getImageEditors,
  type PostProcessingMode,
} from "@/lib/studio/postProcessingEditors";
import {
  buildEnhancerUserPrompt,
  buildFallbackGenerationPrompt,
} from "@/lib/studio/imageEnhancementPrompts";
import { StudioFilesList } from "./StudioFilesList";
import { PostProcessingActions } from "./PostProcessingActions";
import { AiEditorPicker } from "./AiEditorPicker";
import {
  VideoSettingsForm,
  mapSaasQualityToVideoApi,
  type VideoAspectRatio,
  type VideoMotionPresetId,
} from "./VideoSettingsForm";
import {
  ImageSettingsForm,
  imageAspectRatioForApi,
  type ImageAspectRatio,
  type ImageOutputFormat,
  type SaasQualityTier,
} from "./ImageSettingsForm";
import { StudioAssetPreview } from "./StudioAssetPreview";

type ProcessedAssetsPanelProps = {
  assets: StudioSessionAsset[];
  mockMode: boolean;
  promptLocale: Locale;
  onDeleteAsset: (id: string) => void;
  onAssetCreated: (asset: StudioSessionAsset) => void;
  onUpdateAsset: (id: string, patch: Partial<StudioSessionAsset>) => void;
};

function newAssetId(): string {
  return crypto.randomUUID();
}

function friendlyPostProcessError(message: string): string {
  if (
    /real scene|не включён|not configured|FAL_VIDEO_MODEL/i.test(message)
  ) {
    return "Создание пока недоступно. Попробуйте позже или включите demo-режим.";
  }
  return message;
}

export function ProcessedAssetsPanel({
  assets,
  mockMode,
  promptLocale,
  onDeleteAsset,
  onAssetCreated,
  onUpdateAsset,
}: ProcessedAssetsPanelProps) {
  const imageEditors = useMemo(() => getImageEditors(mockMode), [mockMode]);
  const showTechnical = process.env.NODE_ENV === "development";

  const selectableAssets = useMemo(
    () => assets.filter((a) => a.status !== "processing"),
    [assets]
  );

  const firstSelectableId = selectableAssets[0]?.id ?? assets[0]?.id ?? "";
  const [selectedAssetId, setSelectedAssetId] = useState(firstSelectableId);
  const [processingMode, setProcessingMode] = useState<PostProcessingMode | null>(
    "image"
  );
  const [videoEditorId, setVideoEditorId] = useState<VideoModelKey>("kling");
  const [imageEditorId, setImageEditorId] = useState("nano-banana-pro");
  const [prompt, setPrompt] = useState("");
  const [generationLoading, setGenerationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saasQuality, setSaasQuality] = useState<SaasQualityTier>("balanced");
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] =
    useState<VideoAspectRatio>("9:16");
  const [imageAspectRatio, setImageAspectRatio] =
    useState<ImageAspectRatio>("9:16");
  const [motionPreset, setMotionPreset] =
    useState<VideoMotionPresetId>("subtle-motion");
  const [preserveProduct, setPreserveProduct] = useState(true);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("png");

  useEffect(() => {
    if (!assets.some((a) => a.id === selectedAssetId)) {
      setSelectedAssetId(firstSelectableId);
    }
  }, [assets, selectedAssetId, firstSelectableId]);

  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId) ??
    selectableAssets[0] ??
    assets[0];

  const sourceImageUrl = selectedAsset
    ? assetProcessingSourceUrl(selectedAsset)
    : null;

  const canProcessSource = Boolean(sourceImageUrl);

  const activeImageEditor = imageEditors.find((e) => e.id === imageEditorId);
  const imageEditorReady =
    processingMode === "image" &&
    activeImageEditor?.available &&
    !activeImageEditor.comingSoon;

  const canGenerate = Boolean(
    selectedAsset &&
      processingMode &&
      sourceImageUrl &&
      prompt.trim().length >= 4 &&
      !generationLoading &&
      (processingMode === "video" || imageEditorReady)
  );

  const resolveFinalPrompt = async (
    task: "image" | "video"
  ): Promise<string> => {
    const wrapped = buildEnhancerUserPrompt({
      userPrompt: prompt,
      task,
      preserveProduct,
    });

    try {
      const res = await fetch("/api/ai/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: task === "video" ? "video" : "scene",
          userPrompt: wrapped,
          sourceImageDescription: selectedAsset
            ? getAssetDisplayTitle(selectedAsset)
            : undefined,
          targetPlatform:
            (task === "video" ? videoAspectRatio : imageAspectRatio) === "9:16"
              ? "reels"
              : "marketplace",
          language: promptLocale,
        }),
      });
      const data = (await res.json()) as PromptEnhanceResponse;
      if (data.ok) {
        return data.generationPrompt?.trim() || data.enhancedPrompt.trim();
      }
    } catch {
      // fall through to local fallback
    }

    return buildFallbackGenerationPrompt({
      userPrompt: prompt,
      task,
      preserveProduct,
    });
  };

  const handleGenerate = async () => {
    if (!selectedAsset || !sourceImageUrl || !processingMode) {
      setError("Сначала выберите файл и что создать.");
      return;
    }
    if (!canGenerate) {
      setError("Напишите, что сделать с фото, и выберите доступный редактор.");
      return;
    }

    const pendingId = newAssetId();
    const startedAt = new Date().toISOString();
    const isVideo = processingMode === "video";

    onAssetCreated({
      id: pendingId,
      type: isVideo ? "video" : "scene",
      url: "",
      sourceImageUrl,
      parentAssetId: selectedAsset.id,
      mode: isVideo ? "video" : "scene",
      createdAt: startedAt,
      startedAt,
      status: "processing",
      label: isVideo ? "Видео" : "Изображение",
    });

    setGenerationLoading(true);
    setError(null);

    try {
      const finalPrompt = await resolveFinalPrompt(isVideo ? "video" : "image");

      if (isVideo) {
        const apiQuality = mapSaasQualityToVideoApi(videoEditorId, saasQuality);
        const res = await fetch("/api/ai/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceImageUrl,
            prompt: finalPrompt,
            modelKey: videoEditorId,
            quality: apiQuality,
            durationSeconds,
            aspectRatio: videoAspectRatio,
            motionPreset,
            promptLocale,
          }),
        });
        const data = (await res.json()) as VideoGenerateResponse;
        if (!data.ok) {
          const msg = friendlyPostProcessError(data.message);
          onUpdateAsset(pendingId, {
            status: "error",
            errorMessage: msg,
          });
          setError(msg);
          return;
        }
        onUpdateAsset(pendingId, {
          status: "ready",
          url: data.video.url,
          provider: data.provider,
          model: data.model,
          requestId: data.requestId,
          estimatedCost: data.estimatedCost,
          width: data.video.width,
          height: data.video.height,
          duration: data.video.duration,
          format: data.video.format ?? "mp4",
          label: "Видео",
          prompt: finalPrompt,
        });
        return;
      }

      const sceneMode = preserveProduct ? "exact-background" : "creative-scene";
      const apiAspect = imageAspectRatioForApi(imageAspectRatio);

      const res = await fetch("/api/ai/scene/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImageUrl,
          prompt: finalPrompt,
          mode: sceneMode,
          aspectRatio: apiAspect,
          outputFormat,
          promptLocale,
        }),
      });
      const data = (await res.json()) as SceneGenerateResponse;
      if (!data.ok) {
        const msg = friendlyPostProcessError(data.message);
        onUpdateAsset(pendingId, {
          status: "error",
          errorMessage: msg,
        });
        setError(msg);
        return;
      }
      onUpdateAsset(pendingId, {
        status: "ready",
        url: data.image.url,
        type: "scene",
        provider: data.provider,
        model: data.model,
        requestId: data.requestId,
        estimatedCost: data.estimatedCost,
        width: data.image.width,
        height: data.image.height,
        format: outputFormat,
        label: "Улучшенное фото",
        prompt: finalPrompt,
      });
    } catch {
      onUpdateAsset(pendingId, {
        status: "error",
        errorMessage: "Не удалось создать файл.",
      });
      setError("Не удалось создать файл. Попробуйте ещё раз.");
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleRetry = (asset: StudioSessionAsset) => {
    if (asset.parentAssetId) {
      setSelectedAssetId(asset.parentAssetId);
    }
    setProcessingMode(asset.type === "video" ? "video" : "image");
    if (asset.prompt) {
      setPrompt(asset.prompt);
    }
    onDeleteAsset(asset.id);
  };

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[360px] items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-teal-50 text-teal-700">
              <Layers className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">
              Здесь появятся ваши файлы
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Сначала создайте фото в режимах «Одежда на модели» или «Товарная
              карточка». Затем здесь можно прокачать фото или создать видео.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <StudioFilesList
        assets={assets}
        selectedAssetId={selectedAsset?.id ?? ""}
        onSelectAsset={setSelectedAssetId}
      />

      <Card>
        <CardHeader>
          <CardTitle>Проработка выбранного файла</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canProcessSource && selectedAsset ? (
            <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Для этого файла нет исходного изображения. Выберите фото слева.
            </p>
          ) : null}

          {selectedAsset ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-950">
                Выбранный файл
              </h3>
              <div className="flex items-center gap-3 rounded-[18px] border border-border bg-slate-50 p-3">
                <StudioAssetPreview
                  asset={selectedAsset}
                  compact
                  className="h-20 w-16 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {getAssetDisplayTitle(selectedAsset)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAsset.url && !isVideoAsset(selectedAsset) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          void downloadImageFile(
                            selectedAsset.url,
                            `${selectedAsset.id}.png`
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                        Скачать
                      </Button>
                    ) : null}
                    {selectedAsset.url && isVideoAsset(selectedAsset) ? (
                      <a
                        href={selectedAsset.url}
                        download
                        className="inline-flex min-h-10 items-center gap-2 rounded-[14px] border border-border bg-white px-3.5 text-sm font-semibold text-slate-900 shadow-sm hover:border-teal-200"
                      >
                        <Download className="h-4 w-4" />
                        Скачать
                      </a>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteAsset(selectedAsset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <PostProcessingActions
            value={processingMode}
            onChange={setProcessingMode}
            disabled={!canProcessSource || generationLoading}
          />

          {processingMode ? (
            <AiEditorPicker
              editors={
                processingMode === "video" ? VIDEO_EDITORS : imageEditors
              }
              value={
                processingMode === "video" ? videoEditorId : imageEditorId
              }
              onChange={(id) => {
                if (processingMode === "video") {
                  const nextKey = id as VideoModelKey;
                  const nextModel = VIDEO_MODELS[nextKey];
                  setVideoEditorId(nextKey);
                  setDurationSeconds(nextModel.durationOptions[0] ?? 5);
                  setVideoAspectRatio(
                    nextModel.aspectRatioOptions[0] ?? "9:16"
                  );
                } else {
                  setImageEditorId(id);
                }
              }}
              disabled={generationLoading}
              showTechnical={showTechnical}
            />
          ) : null}

          {processingMode === "image" ? (
            <>
              <ImageSettingsForm
                outputFormat={outputFormat}
                aspectRatio={imageAspectRatio}
                quality={saasQuality}
                preserveProduct={preserveProduct}
                onOutputFormatChange={setOutputFormat}
                onAspectRatioChange={setImageAspectRatio}
                onQualityChange={setSaasQuality}
                onPreserveProductChange={setPreserveProduct}
                disabled={generationLoading}
              />
              {mockMode ? (
                <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  Demo-режим: улучшение фото показывается на mock-результатах.
                  Real Nano Banana enhancement подключим отдельным этапом.
                </p>
              ) : null}
            </>
          ) : null}

          {processingMode === "video" ? (
            <VideoSettingsForm
              modelKey={videoEditorId}
              quality={saasQuality}
              durationSeconds={durationSeconds}
              aspectRatio={videoAspectRatio}
              motionPreset={motionPreset}
              onQualityChange={setSaasQuality}
              onDurationChange={setDurationSeconds}
              onAspectRatioChange={setVideoAspectRatio}
              onMotionPresetChange={setMotionPreset}
              disabled={generationLoading}
            />
          ) : null}

          {processingMode ? (
            <section className="space-y-2">
              <label className="text-sm font-semibold text-slate-950">
                Что сделать с фото?
              </label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                disabled={generationLoading}
                placeholder="Например: мягкий студийный свет, дорогой интерьер, фон у окна, пляжный кадр, реалистичная кожа, убрать пластиковость."
                className="w-full rounded-[18px] border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              <p className="text-xs leading-5 text-slate-500">
                AI автоматически улучшит ваш промт перед созданием — вам не
                нужно писать технические термины.
              </p>
            </section>
          ) : null}

          {error ? (
            <p className="rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {processingMode ? (
            <Button
              className="w-full"
              size="lg"
              loading={generationLoading}
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              {processingMode === "video" ? (
                <Clapperboard className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {processingMode === "video"
                ? "Создать видео"
                : "Создать изображение"}
            </Button>
          ) : null}

          {assets.some((a) => a.status === "error") ? (
            <div className="space-y-2 border-t border-border pt-4">
              {assets
                .filter((a) => a.status === "error")
                .slice(0, 3)
                .map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between gap-2 rounded-[14px] border border-red-100 bg-red-50/50 px-3 py-2"
                  >
                    <p className="text-xs text-red-800">
                      {asset.errorMessage ?? "Ошибка"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(asset)}
                    >
                      Повторить
                    </Button>
                  </div>
                ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
