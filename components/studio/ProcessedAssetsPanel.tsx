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
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import {
  getLocalizedImageEditors,
  getLocalizedVideoEditors,
} from "@/lib/studio/i18n/postProcessingEditorsI18n";
import { formatStudioString } from "@/lib/studio/i18n";
import { useStudioCopy } from "./StudioLocaleContext";
import type { StudioCopyFull } from "@/lib/studio/i18n/studioCopyTypes";
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
import { TokenChargeHint } from "./TokenChargeHint";
import { tryApplyTokenBillingError } from "@/lib/tokens/billingErrorPayload";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";

type ProcessedAssetsPanelProps = {
  assets: StudioSessionAsset[];
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  promptLocale: Locale;
  onTokenBillingError?: (payload: TokenBillingErrorPayload) => void;
  onDeleteAsset: (id: string) => void;
  onAssetCreated: (asset: StudioSessionAsset) => void;
  onUpdateAsset: (id: string, patch: Partial<StudioSessionAsset>) => void;
};

function newAssetId(): string {
  return crypto.randomUUID();
}

function friendlyPostProcessError(
  message: string | undefined | null,
  pa: StudioCopyFull["processedAssets"]
): string {
  const text = (message ?? "").trim();
  if (!text) return pa.fileFailed;

  if (
    /real scene|real image|не включён|not configured|FAL_VIDEO_MODEL|PAID_AI_RUNS_DISABLED|disabled/i.test(
      text
    )
  ) {
    return pa.unavailable;
  }
  if (/FAL_KEY/i.test(text)) {
    return pa.falKeyMissing;
  }
  return text;
}

export function ProcessedAssetsPanel({
  assets,
  mockMode,
  paidAiRunsAllowed,
  promptLocale,
  onTokenBillingError,
  onDeleteAsset,
  onAssetCreated,
  onUpdateAsset,
}: ProcessedAssetsPanelProps) {
  const { locale, copy } = useStudioCopy();
  const pa = copy.processedAssets;
  const ppe = copy.postProcessingEditors;

  const videoEditors = useMemo(
    () => getLocalizedVideoEditors(locale),
    [locale]
  );
  const imageEditors = useMemo(
    () => getLocalizedImageEditors(locale, { mockMode, paidAiRunsAllowed }),
    [locale, mockMode, paidAiRunsAllowed]
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
      if (!data.ok) {
        if (
          onTokenBillingError &&
          tryApplyTokenBillingError(data, onTokenBillingError)
        ) {
          return null;
        }
        return null;
      }

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
      setError(pa.selectFileFirst);
      return;
    }
    if (!canGenerate) {
      setError(pa.needPromptAndEditor);
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
      label: isVideo ? pa.modeVideo : pa.modeImage,
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
          if (
            onTokenBillingError &&
            tryApplyTokenBillingError(data, onTokenBillingError)
          ) {
            onUpdateAsset(pendingId, {
              status: "error",
              errorMessage: data.message ?? pa.fileFailed,
            });
            return;
          }
          const msg = friendlyPostProcessError(data.message, pa);
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
          label: pa.modeVideo,
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
        if (
          onTokenBillingError &&
          tryApplyTokenBillingError(data, onTokenBillingError)
        ) {
          onUpdateAsset(pendingId, {
            status: "error",
            errorMessage: data.error ?? pa.fileFailed,
          });
          return;
        }
        const msg = friendlyPostProcessError(data.error, pa);
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
        label: pa.enhancedPhoto,
        prompt: data.promptUsed,
      });
    } catch {
      onUpdateAsset(pendingId, {
        status: "error",
        errorMessage: pa.fileFailed,
      });
      setError(pa.fileFailed);
    } finally {
      setGenerationLoading(false);
    }
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
              {pa.emptyTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {pa.emptyHint}
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
          <CardTitle>{pa.panelTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canProcessSource && selectedAsset ? (
            <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {pa.selectFileFirst}
            </p>
          ) : null}

          {selectedAsset ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-950">
                {pa.panelTitle}
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
                processingMode === "video" ? videoEditors : imageEditors
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

                const reset = copy.processedAssetsEditorReset;
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
                    formatStudioString(reset.aspectUnsupported, {
                      from: imageAspectRatio,
                      to: fallbackAspect,
                    })
                  );
                }
                if (!formatSupported) {
                  // PNG is supported by every editor — safe universal fallback.
                  const fallbackFormat: ImageOutputFormat = "png";
                  setOutputFormat(fallbackFormat);
                  resetMessages.push(
                    formatStudioString(reset.formatUnsupported, {
                      from: outputFormat.toUpperCase(),
                      to: fallbackFormat.toUpperCase(),
                    })
                  );
                }

                setImageEditorId(nextEditor);
                setEditorSwitchHint(
                  resetMessages.length > 0
                    ? formatStudioString(reset.editorNote, {
                        messages: resetMessages.join("; "),
                      })
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
                  {ppe.nanoBanana.descriptionDemo} {ppe.nanoBanana.limitationsDemo}
                </p>
              ) : !paidAiRunsAllowed ? (
                <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {ppe.nanoBanana.disabled}
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
                {pa.whatToDo}
              </label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                disabled={generationLoading}
                placeholder={pa.promptPlaceholder}
                className="w-full rounded-[18px] border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              {promptNormalization.warningForUi ? (
                <p className="rounded-[12px] border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
                  {promptNormalization.warningForUi}
                </p>
              ) : null}
              <p className="text-xs leading-5 text-slate-500">
                {promptNormalization.promptType === "ai_prompt"
                  ? pa.promptNoEnhance
                  : copy.status.analyzingAi}
              </p>
            </section>
          ) : null}

          {analyzingPreservation && processingMode === "image" ? (
            <p className="rounded-[12px] border border-teal-200 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-900">
              {copy.productCheck.analyzing}
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
                      lastImageEnhanceDebug.outputImageCheck
                        .isFalSafetyPlaceholder ||
                      lastImageEnhanceDebug.outputImageCheck.isProbablyBlack ||
                      lastImageEnhanceDebug.outputImageCheck.likelyDarkOutput
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
                    )}{" "}
                    · meanLum=
                    {lastImageEnhanceDebug.outputImageCheck.meanLuminance ?? "—"}{" "}
                    · P5/P50/P95=
                    {lastImageEnhanceDebug.outputImageCheck.luminanceP5 ?? "—"}/
                    {lastImageEnhanceDebug.outputImageCheck.luminanceP50 ?? "—"}/
                    {lastImageEnhanceDebug.outputImageCheck.luminanceP95 ?? "—"}{" "}
                    · likelyDarkOutput=
                    {String(
                      lastImageEnhanceDebug.outputImageCheck.likelyDarkOutput
                    )}{" "}
                    · rgbPctZero=
                    {lastImageEnhanceDebug.outputImageCheck.rgbPercentZero ??
                      "—"}{" "}
                    · isFalSafetyPlaceholder=
                    {String(
                      lastImageEnhanceDebug.outputImageCheck
                        .isFalSafetyPlaceholder
                    )}
                    {lastImageEnhanceDebug.outputImageCheck.luminanceError
                      ? ` · lumErr=${lastImageEnhanceDebug.outputImageCheck.luminanceError}`
                      : ""}
                    {lastImageEnhanceDebug.outputImageCheck.error
                      ? ` · err=${lastImageEnhanceDebug.outputImageCheck.error}`
                      : ""}
                  </p>
                ) : null}
                {lastImageEnhanceDebug.darkRetry ? (
                  <p
                    className={`break-words ${
                      lastImageEnhanceDebug.darkRetry.usedRetryResult
                        ? "rounded-md border border-amber-300 bg-amber-50 p-1.5 text-amber-800"
                        : "rounded-md border border-red-300 bg-red-50 p-1.5 text-red-700"
                    }`}
                  >
                    <span className="font-semibold">darkRetry:</span> attempt=
                    {lastImageEnhanceDebug.darkRetry.attempt} · reason=
                    {lastImageEnhanceDebug.darkRetry.reason} · guidance=
                    {lastImageEnhanceDebug.darkRetry.guidanceScale} · used=
                    {String(lastImageEnhanceDebug.darkRetry.usedRetryResult)}
                    {lastImageEnhanceDebug.darkRetry.outputImageCheck
                      ? ` · retryMeanLum=${lastImageEnhanceDebug.darkRetry.outputImageCheck.meanLuminance ?? "—"} · retryLikelyDark=${String(lastImageEnhanceDebug.darkRetry.outputImageCheck.likelyDarkOutput)} · retryRgbPctZero=${lastImageEnhanceDebug.darkRetry.outputImageCheck.rgbPercentZero ?? "—"} · retryIsFalSafetyPlaceholder=${String(lastImageEnhanceDebug.darkRetry.outputImageCheck.isFalSafetyPlaceholder)}`
                      : ""}
                  </p>
                ) : null}
                {lastImageEnhanceDebug.nanoSoftRetry ? (
                  <p
                    className={`break-words ${
                      lastImageEnhanceDebug.nanoSoftRetry.success
                        ? "rounded-md border border-emerald-300 bg-emerald-50 p-1.5 text-emerald-800"
                        : "rounded-md border border-red-300 bg-red-50 p-1.5 text-red-700"
                    }`}
                  >
                    <span className="font-semibold">nanoSoftRetry:</span>{" "}
                    attempt={lastImageEnhanceDebug.nanoSoftRetry.attempt} ·
                    reason={lastImageEnhanceDebug.nanoSoftRetry.reason} ·
                    removedResolution=
                    {String(
                      lastImageEnhanceDebug.nanoSoftRetry.removedResolution
                    )}{" "}
                    · removedLimitGenerations=
                    {String(
                      lastImageEnhanceDebug.nanoSoftRetry
                        .removedLimitGenerations
                    )}{" "}
                    · requestId=
                    {lastImageEnhanceDebug.nanoSoftRetry.requestId ?? "—"} ·
                    success=
                    {String(lastImageEnhanceDebug.nanoSoftRetry.success)}
                    {lastImageEnhanceDebug.nanoSoftRetry.retryProviderError
                      ? ` · err=${lastImageEnhanceDebug.nanoSoftRetry.retryProviderError}`
                      : ""}
                    {lastImageEnhanceDebug.nanoSoftRetry.outputImageCheck
                      ? ` · retryMeanLum=${lastImageEnhanceDebug.nanoSoftRetry.outputImageCheck.meanLuminance ?? "—"} · retryRgbPctZero=${lastImageEnhanceDebug.nanoSoftRetry.outputImageCheck.rgbPercentZero ?? "—"} · retryIsFalSafetyPlaceholder=${String(lastImageEnhanceDebug.nanoSoftRetry.outputImageCheck.isFalSafetyPlaceholder)}`
                      : ""}
                  </p>
                ) : null}
                {lastImageEnhanceDebug.effectiveResolution ? (
                  <p className="break-words">
                    <span className="font-semibold">effectiveResolution:</span>{" "}
                    {lastImageEnhanceDebug.effectiveResolution}
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
              className="w-full justify-between gap-2 px-4 sm:gap-3 sm:px-5"
              size="lg"
              loading={generationLoading}
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              <span className="flex min-w-0 items-center gap-2">
                {processingMode === "video" ? (
                  <Clapperboard className="h-5 w-5 shrink-0" />
                ) : (
                  <Sparkles className="h-5 w-5 shrink-0" />
                )}
                <span className="truncate">
                  {processingMode === "video" ? pa.createVideo : pa.createImage}
                </span>
              </span>
              {!generationLoading ? (
                <TokenChargeHint
                  inline
                  operation={processingMode === "video" ? "video" : "enhance"}
                />
              ) : null}
            </Button>
          ) : null}

        </CardContent>
      </Card>
    </div>
  );
}
