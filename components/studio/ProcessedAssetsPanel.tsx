"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { VIDEO_MODELS, type VideoModelKey } from "@/lib/ai/videoModels";
import type { PromptEnhanceResponse } from "@/lib/ai/promptEnhanceSchemas";
import type { VideoGenerateResponse } from "@/lib/ai/videoSchemas";
import {
  IMAGE_EDITOR_CAPABILITIES,
  type ImageEditorId,
  type ImageEnhanceRequest,
  type ImageEnhanceResponse,
} from "@/lib/ai/imageEnhanceSchemas";
import type { ImageEnhanceDebugTrace } from "@/lib/ai/imageEnhanceDebugTypes";
import type { ProductPreservationResponse } from "@/lib/ai/productPreservationSchemas";
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
import { normalizePostProcessPrompt } from "@/lib/studio/postProcessPromptNormalizer";
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
  type ImageAspectRatio,
  type ImageOutputFormat,
  type SaasQualityTier,
} from "./ImageSettingsForm";
import { StudioAssetPreview } from "./StudioAssetPreview";

type ProcessedAssetsPanelProps = {
  assets: StudioSessionAsset[];
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  promptLocale: Locale;
  onDeleteAsset: (id: string) => void;
  onAssetCreated: (asset: StudioSessionAsset) => void;
  onUpdateAsset: (id: string, patch: Partial<StudioSessionAsset>) => void;
};

function newAssetId(): string {
  return crypto.randomUUID();
}

function friendlyPostProcessError(message: string | undefined | null): string {
  const text = (message ?? "").trim();
  if (!text) return "Не удалось создать файл. Попробуйте ещё раз.";

  if (
    /real scene|real image|не включён|not configured|FAL_VIDEO_MODEL|PAID_AI_RUNS_DISABLED|disabled/i.test(
      text
    )
  ) {
    return "Создание пока недоступно. Попробуйте позже или включите demo-режим.";
  }
  if (/FAL_KEY/i.test(text)) {
    return "Ключ AI-провайдера не настроен. Обратитесь к администратору.";
  }
  return text;
}

export function ProcessedAssetsPanel({
  assets,
  mockMode,
  paidAiRunsAllowed,
  promptLocale,
  onDeleteAsset,
  onAssetCreated,
  onUpdateAsset,
}: ProcessedAssetsPanelProps) {
  const imageEditors = useMemo(
    () => getImageEditors({ mockMode, paidAiRunsAllowed }),
    [mockMode, paidAiRunsAllowed]
  );
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
  const [imageEditorId, setImageEditorId] = useState<ImageEditorId>("nano-banana-pro");
  /** Inline hint shown when switching editor reset incompatible options. */
  const [editorSwitchHint, setEditorSwitchHint] = useState<string | null>(null);
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

  /**
   * In-memory cache for product preservation analyses, keyed by asset id.
   * Avoids re-calling OpenAI when the user retries or re-edits the same
   * selected asset. Source-of-truth is also written to asset metadata via
   * `onUpdateAsset` so the cache survives prop reshuffles.
   */
  const preservationCacheRef = useRef<
    Map<string, NonNullable<StudioSessionAsset["productPreservation"]>>
  >(new Map());

  const [analyzingPreservation, setAnalyzingPreservation] = useState(false);
  /** Dev-only: last final prompt actually sent to Fal (from enhance response). */
  const [lastFinalPrompt, setLastFinalPrompt] = useState<string | null>(null);
  /** Dev-only: full diagnostic trace from /api/ai/image/enhance. */
  const [lastImageEnhanceDebug, setLastImageEnhanceDebug] =
    useState<ImageEnhanceDebugTrace | null>(null);

  /** Resolves Vision preservation for a given asset/url, using cache. */
  const resolveProductPreservation = async (
    asset: StudioSessionAsset,
    imageUrl: string,
    userPromptHint: string
  ): Promise<NonNullable<StudioSessionAsset["productPreservation"]> | null> => {
    const cached =
      preservationCacheRef.current.get(asset.id) ??
      asset.productPreservation ??
      null;
    if (cached) {
      preservationCacheRef.current.set(asset.id, cached);
      return cached;
    }

    setAnalyzingPreservation(true);
    try {
      const res = await fetch("/api/ai/image/preservation-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          userPromptHint: userPromptHint || undefined,
          sourceAssetId: asset.id,
        }),
      });
      const data = (await res.json()) as ProductPreservationResponse;
      if (!data.ok) return null;

      const snapshot: NonNullable<StudioSessionAsset["productPreservation"]> = {
        analysis: data.analysis,
        preservationBlock: data.preservationBlock,
        externalPreservationBlock: data.externalPreservationBlock,
        provider: data.provider,
        model: data.model,
        usedVision: data.usedVision,
        analyzedAt: new Date().toISOString(),
      };
      preservationCacheRef.current.set(asset.id, snapshot);
      onUpdateAsset(asset.id, { productPreservation: snapshot });
      return snapshot;
    } catch {
      return null;
    } finally {
      setAnalyzingPreservation(false);
    }
  };

  const showDevDebug = process.env.NODE_ENV !== "production";

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

  /** Active analysis for the currently selected asset (dev debug). */
  const activePreservation = selectedAsset
    ? (preservationCacheRef.current.get(selectedAsset.id) ??
        selectedAsset.productPreservation ??
        null)
    : null;

  const canProcessSource = Boolean(sourceImageUrl);

  const activeImageEditor = imageEditors.find((e) => e.id === imageEditorId);
  const imageEditorReady =
    processingMode === "image" &&
    activeImageEditor?.available &&
    !activeImageEditor.comingSoon;

  /**
   * Pre-flight prompt analysis: detects whether the user pasted a full AI
   * prompt vs a short natural intent, strips mode-conflicting phrases, and
   * clamps length. Recomputed on each relevant input change so the UI hint
   * stays in sync with the textarea.
   */
  const promptNormalization = useMemo(
    () =>
      normalizePostProcessPrompt({
        userPrompt: prompt,
        selectedEditor: imageEditorId,
        outputMode: processingMode === "video" ? "video" : "image",
        preserveProduct,
      }),
    [prompt, imageEditorId, processingMode, preserveProduct]
  );

  const canGenerate = Boolean(
    selectedAsset &&
      processingMode &&
      sourceImageUrl &&
      promptNormalization.normalizedUserIntent.length >= 4 &&
      !generationLoading &&
      (processingMode === "video" || imageEditorReady)
  );

  /**
   * Calls /api/ai/prompt/enhance to expand the raw user prompt into a richer
   * English prompt. The server-side image-enhance route applies the final
   * photorealism + preservation guardrails on top of the result.
   *
   * `userIntent` is the already-normalized intent (see
   * `normalizePostProcessPrompt`) — pre-baked AI prompts and mode-mismatched
   * phrases are stripped before this point, so the enhancer receives a
   * clean, single-intent string.
   */
  const enhancePromptViaApi = async (
    task: "image" | "video",
    userIntent: string
  ): Promise<string | null> => {
    const wrapped = buildEnhancerUserPrompt({
      userPrompt: userIntent,
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
            task === "video"
              ? videoAspectRatio === "9:16"
                ? "reels"
                : "marketplace"
              : imageAspectRatio === "9:16"
                ? "social_static_vertical"
                : "marketplace",
          language: promptLocale,
        }),
      });
      const data = (await res.json()) as PromptEnhanceResponse;
      if (data.ok) {
        return data.generationPrompt?.trim() || data.enhancedPrompt.trim();
      }
    } catch {
      // fall through
    }
    return null;
  };

  /** Legacy: returns one final prompt string for routes that don't apply
   *  server-side guardrails (currently the video route). */
  const resolveFinalPrompt = async (
    task: "image" | "video",
    userIntent: string
  ): Promise<string> => {
    const enhanced = await enhancePromptViaApi(task, userIntent);
    if (enhanced) return enhanced;

    return buildFallbackGenerationPrompt({
      userPrompt: userIntent,
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

    const userIntent = promptNormalization.normalizedUserIntent;

    try {
      if (isVideo) {
        const finalPrompt = await resolveFinalPrompt("video", userIntent);
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

      // ai_prompt path: user pasted a ready-made AI prompt — skip the
      // enhancer entirely so we don't stack a second set of guardrails on top
      // of the already-stripped intent. The server builder will add exactly
      // one canonical guardrail block.
      const enhancedPrompt = promptNormalization.shouldRunEnhancer
        ? await enhancePromptViaApi("image", userIntent)
        : null;

      // Vision-based product preservation snapshot (cached per asset).
      // Only requested when the user keeps "Сохранять товар точно" on.
      const preservation = preserveProduct
        ? await resolveProductPreservation(
            selectedAsset,
            sourceImageUrl,
            userIntent
          )
        : null;

      const apiOutputFormat: ImageEnhanceRequest["outputFormat"] =
        outputFormat === "jpeg" ? "jpg" : outputFormat;

      const enhanceRequest: ImageEnhanceRequest = {
        sourceImageUrl,
        userPrompt: userIntent,
        enhancedPrompt: enhancedPrompt ?? null,
        preserveProduct,
        aspectRatio: imageAspectRatio,
        outputFormat: apiOutputFormat,
        quality: saasQuality,
        locale: promptLocale,
        selectedEditor: imageEditorId,
        sourceAssetId: selectedAsset.id,
        productPreservationBlock:
          preservation?.externalPreservationBlock ?? null,
      };

      const res = await fetch("/api/ai/image/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enhanceRequest),
      });
      const data = (await res.json()) as ImageEnhanceResponse;
      if (!data.ok) {
        setLastImageEnhanceDebug(data.debug ?? null);
        const msg = friendlyPostProcessError(data.error);
        onUpdateAsset(pendingId, {
          status: "error",
          errorMessage: msg,
        });
        setError(msg);
        return;
      }
      setLastFinalPrompt(data.promptUsed ?? null);
      setLastImageEnhanceDebug(data.debug ?? null);
      onUpdateAsset(pendingId, {
        status: "ready",
        url: data.imageUrl,
        type: "scene",
        provider: data.provider,
        model: data.model,
        requestId: data.requestId ?? undefined,
        estimatedCost: data.estimatedCostUsd ?? undefined,
        format: outputFormat,
        label: "Улучшенное фото",
        prompt: data.promptUsed,
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

  const handleDownloadAsset = (asset: StudioSessionAsset) => {
    if (!asset.url) return;
    if (isVideoAsset(asset)) {
      const anchor = document.createElement("a");
      anchor.href = asset.url;
      anchor.download = `${asset.id}.${asset.format ?? "mp4"}`;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }
    void downloadImageFile(asset.url, `${asset.id}.${asset.format ?? "png"}`);
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
        onDownloadAsset={handleDownloadAsset}
        onDeleteAsset={onDeleteAsset}
      />

      <Card>
        <CardHeader className="text-center">
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
                  circle
                  className="h-14 w-14 shrink-0"
                />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">
                  {getAssetDisplayTitle(selectedAsset)}
                </p>
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
                  return;
                }

                const nextEditor = id as ImageEditorId;
                if (nextEditor === imageEditorId) return;

                const capability = IMAGE_EDITOR_CAPABILITIES[nextEditor];
                const aspectSupported = (
                  capability.aspectRatios as readonly string[]
                ).includes(imageAspectRatio);
                const schemaFormat: "png" | "jpg" | "webp" =
                  outputFormat === "jpeg" ? "jpg" : outputFormat;
                const formatSupported = (
                  capability.outputFormats as readonly string[]
                ).includes(schemaFormat);

                const resetMessages: string[] = [];
                if (!aspectSupported) {
                  const fallbackAspect =
                    (capability.aspectRatios as readonly string[]).includes(
                      "1:1"
                    )
                      ? "1:1"
                      : (capability.aspectRatios[0] as ImageAspectRatio);
                  setImageAspectRatio(fallbackAspect as ImageAspectRatio);
                  resetMessages.push(
                    `формат кадра ${imageAspectRatio} не поддерживается, переключили на ${fallbackAspect}`
                  );
                }
                if (!formatSupported) {
                  // PNG is supported by every editor — safe universal fallback.
                  const fallbackFormat: ImageOutputFormat = "png";
                  setOutputFormat(fallbackFormat);
                  resetMessages.push(
                    `формат файла ${outputFormat.toUpperCase()} не поддерживается, переключили на ${fallbackFormat.toUpperCase()}`
                  );
                }

                setImageEditorId(nextEditor);
                setEditorSwitchHint(
                  resetMessages.length > 0
                    ? `Этот редактор: ${resetMessages.join("; ")}.`
                    : null
                );
              }}
              disabled={generationLoading}
            />
          ) : null}

          {processingMode === "image" ? (
            <>
              {editorSwitchHint ? (
                <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {editorSwitchHint}
                </p>
              ) : null}
              <ImageSettingsForm
                editorId={imageEditorId}
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
                  Включите real-режим, чтобы запускать настоящее AI-улучшение.
                </p>
              ) : !paidAiRunsAllowed ? (
                <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  Real AI-улучшение временно отключено администратором. Скоро
                  будет доступно.
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
              {promptNormalization.warningForUi ? (
                <p className="rounded-[12px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
                  {promptNormalization.warningForUi}
                </p>
              ) : null}
              <p className="text-xs leading-5 text-slate-500">
                {promptNormalization.promptType === "ai_prompt"
                  ? "Мы используем ваш промт без повторного усиления — добавим только обязательные правила сохранения товара и качества."
                  : "AI автоматически улучшит ваш промт перед созданием — вам не нужно писать технические термины."}
              </p>
            </section>
          ) : null}

          {analyzingPreservation && processingMode === "image" ? (
            <p className="rounded-[12px] border border-teal-200 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-900">
              AI определяет товар, чтобы сохранить детали…
            </p>
          ) : null}

          {showDevDebug &&
          processingMode === "image" &&
          (activePreservation || lastFinalPrompt) ? (
            <details className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">
              <summary className="cursor-pointer select-none font-medium text-slate-800">
                dev · product preservation snapshot
              </summary>
              <div className="mt-2 space-y-2">
                {activePreservation ? (
                  <>
                    <p>
                      <span className="font-semibold">primaryObject:</span>{" "}
                      {activePreservation.analysis.primaryObject || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">objectType:</span>{" "}
                      {activePreservation.analysis.objectType}
                    </p>
                    <p>
                      <span className="font-semibold">confidence:</span>{" "}
                      {activePreservation.analysis.confidence.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">provider:</span>{" "}
                      {activePreservation.provider} ({activePreservation.model})
                    </p>
                    {activePreservation.analysis.mustPreserve.length > 0 ? (
                      <p>
                        <span className="font-semibold">mustPreserve:</span>{" "}
                        {activePreservation.analysis.mustPreserve.join("; ")}
                      </p>
                    ) : null}
                    <p className="break-words">
                      <span className="font-semibold">
                        detailed block (debug only):
                      </span>{" "}
                      {activePreservation.preservationBlock}
                    </p>
                    <p className="break-words">
                      <span className="font-semibold">
                        external block (sent to Fal):
                      </span>{" "}
                      {activePreservation.externalPreservationBlock}
                    </p>
                  </>
                ) : null}
                {lastFinalPrompt ? (
                  <p className="break-words">
                    <span className="font-semibold">
                      finalPrompt sent to Fal:
                    </span>{" "}
                    {lastFinalPrompt}
                  </p>
                ) : null}
              </div>
            </details>
          ) : null}

          {showDevDebug &&
          processingMode === "image" &&
          lastImageEnhanceDebug ? (
            <details className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">
              <summary className="cursor-pointer select-none font-medium text-slate-800">
                dev · debug image enhance
              </summary>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="font-semibold">traceId:</span>{" "}
                  <code className="break-all">
                    {lastImageEnhanceDebug.traceId}
                  </code>
                </p>
                <p>
                  <span className="font-semibold">editor:</span>{" "}
                  {lastImageEnhanceDebug.editor} ·{" "}
                  {lastImageEnhanceDebug.aspectRatio} ·{" "}
                  {lastImageEnhanceDebug.outputFormat} ·{" "}
                  {lastImageEnhanceDebug.quality} · preserveProduct=
                  {String(lastImageEnhanceDebug.preserveProduct)}
                </p>
                <p>
                  <span className="font-semibold">sourceImageCheck:</span>{" "}
                  ok={String(lastImageEnhanceDebug.sourceImageCheck.ok)} ·
                  status={lastImageEnhanceDebug.sourceImageCheck.status ?? "—"}{" "}
                  · contentType=
                  {lastImageEnhanceDebug.sourceImageCheck.contentType ?? "—"} ·
                  size={lastImageEnhanceDebug.sourceImageCheck.contentLength ?? "—"}
                  {lastImageEnhanceDebug.sourceImageCheck.error
                    ? ` · err=${lastImageEnhanceDebug.sourceImageCheck.error}`
                    : ""}
                </p>
                <p
                  className={
                    lastImageEnhanceDebug.promptDebug.containsSensitiveWords
                      .length > 0 ||
                    lastImageEnhanceDebug.promptDebug.containsBrokenDuplicates
                      .length > 0 ||
                    lastImageEnhanceDebug.promptDebug.containsVideoWords
                      .length > 0
                      ? "rounded-md border border-red-300 bg-red-50 p-1.5 text-red-700"
                      : ""
                  }
                >
                  <span className="font-semibold">promptDebug:</span> len=
                  {lastImageEnhanceDebug.promptDebug.finalPromptLengthBefore}→
                  {lastImageEnhanceDebug.promptDebug.finalPromptLengthAfter} ·
                  video=
                  {lastImageEnhanceDebug.promptDebug.containsVideoWords.join(
                    ","
                  ) || "—"}{" "}
                  · sensitive=
                  {lastImageEnhanceDebug.promptDebug.containsSensitiveWords.join(
                    ","
                  ) || "—"}{" "}
                  · duplicates=
                  {lastImageEnhanceDebug.promptDebug.containsBrokenDuplicates.join(
                    ","
                  ) || "—"}
                </p>
                {lastImageEnhanceDebug.promptDebug.removedSensitiveWords
                  .length > 0 ||
                lastImageEnhanceDebug.promptDebug.removedDuplicatePatterns
                  .length > 0 ? (
                  <p>
                    <span className="font-semibold">sanitized:</span> removed
                    sensitive=
                    {lastImageEnhanceDebug.promptDebug.removedSensitiveWords.join(
                      ", "
                    ) || "—"}{" "}
                    · removed duplicates=
                    {lastImageEnhanceDebug.promptDebug.removedDuplicatePatterns.join(
                      ", "
                    ) || "—"}
                  </p>
                ) : null}
                <p className="break-words">
                  <span className="font-semibold">
                    finalPromptBeforeFalSanitize:
                  </span>{" "}
                  {
                    lastImageEnhanceDebug.promptDebug
                      .finalPromptBeforeFalSanitize
                  }
                </p>
                <p className="break-words">
                  <span className="font-semibold">finalPromptSentToFal:</span>{" "}
                  {lastImageEnhanceDebug.promptDebug.finalPromptSentToFal}
                </p>
                <p className="break-words">
                  <span className="font-semibold">falPayloadSummary:</span>{" "}
                  <code>
                    {JSON.stringify(
                      lastImageEnhanceDebug.falPayloadSummary,
                      null,
                      0
                    )}
                  </code>
                </p>
                {lastImageEnhanceDebug.falResponseSummary ? (
                  <p className="break-words">
                    <span className="font-semibold">falResponseSummary:</span>{" "}
                    requestId=
                    {lastImageEnhanceDebug.falResponseSummary.providerRequestId ??
                      "—"}{" "}
                    · images=
                    {lastImageEnhanceDebug.falResponseSummary.imageCount} ·
                    shape=
                    {lastImageEnhanceDebug.falResponseSummary.responseShape}
                  </p>
                ) : null}
                {lastImageEnhanceDebug.falErrorSummary ? (
                  <p className="break-words text-red-700">
                    <span className="font-semibold">falErrorSummary:</span>{" "}
                    status={String(lastImageEnhanceDebug.falErrorSummary.status ?? "—")} ·
                    name=
                    {lastImageEnhanceDebug.falErrorSummary.rawErrorName ?? "—"}{" "}
                    · msg={lastImageEnhanceDebug.falErrorSummary.message}
                  </p>
                ) : null}
                {lastImageEnhanceDebug.outputImageCheck ? (
                  <p
                    className={`break-words ${
                      lastImageEnhanceDebug.outputImageCheck.isProbablyBlack
                        ? "rounded-md border border-red-300 bg-red-50 p-1.5 text-red-700"
                        : ""
                    }`}
                  >
                    <span className="font-semibold">outputImageCheck:</span>{" "}
                    ok={String(lastImageEnhanceDebug.outputImageCheck.ok)} ·
                    status=
                    {lastImageEnhanceDebug.outputImageCheck.status ?? "—"} ·
                    type=
                    {lastImageEnhanceDebug.outputImageCheck.contentType ?? "—"}{" "}
                    · size=
                    {lastImageEnhanceDebug.outputImageCheck.contentLength ?? "—"}{" "}
                    · {lastImageEnhanceDebug.outputImageCheck.width ?? "—"}×
                    {lastImageEnhanceDebug.outputImageCheck.height ?? "—"} ·
                    bpp=
                    {lastImageEnhanceDebug.outputImageCheck.bytesPerPixel?.toFixed(
                      4
                    ) ?? "—"}{" "}
                    · isProbablyBlack=
                    {String(
                      lastImageEnhanceDebug.outputImageCheck.isProbablyBlack
                    )}
                    {lastImageEnhanceDebug.outputImageCheck.error
                      ? ` · err=${lastImageEnhanceDebug.outputImageCheck.error}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </details>
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
