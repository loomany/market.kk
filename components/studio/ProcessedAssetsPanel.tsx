"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  clampVideoSettingsToVariant,
  DEFAULT_VARIANT_BY_PROVIDER,
  getVideoVariant,
  type KlingMotionOrientation,
  type VideoProviderId,
  type VideoVariantId,
} from "@/lib/ai/videoCatalog";
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
import { downloadImageFile, downloadVideoFile } from "@/lib/studio/downloadImages";
import {
  assetProcessingSourceUrl,
  isVideoAsset,
} from "@/lib/studio/assetDisplayLabels";
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import {
  type PostProcessingUploadedSource,
  uploadedSourceToGalleryAsset,
} from "@/lib/studio/postProcessingUpload";
import {
  clearPostProcessingUploadDraft,
  draftToUploadedSource,
  loadPostProcessingUploadDraft,
} from "@/lib/studio/postProcessingUploadDraft";
import { PostProcessingUploadSection } from "./PostProcessingUploadSection";
import { StudioFilesSectionHeader } from "./StudioFilesSectionHeader";
import { getLocalizedImageEditors } from "@/lib/studio/i18n/postProcessingEditorsI18n";
import { formatStudioString } from "@/lib/studio/i18n";
import { useStudioCopy } from "./StudioLocaleContext";
import type { StudioCopyFull } from "@/lib/studio/i18n/studioCopyTypes";
import { normalizePostProcessPrompt } from "@/lib/studio/postProcessPromptNormalizer";
import { PostProcessingMobileSheet } from "./PostProcessingMobileSheet";
import { useStudioMobileLayout } from "./useStudioMobileLayout";
import { PostProcessingMobileGallery } from "./PostProcessingMobileGallery";
import { PostProcessingDesktopGallery } from "./PostProcessingDesktopGallery";
import { PostProcessingDesktopEditor } from "./PostProcessingDesktopEditor";
import { postProcessingSectionCardClass } from "./StudioSaaSPreviewChrome";
import { ImageEditorSelect } from "./ImageEditorSelect";
import { VideoProviderSelect } from "./VideoProviderSelect";
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
import { TokenChargeHint } from "./TokenChargeHint";
import { tryApplyTokenBillingError } from "@/lib/tokens/billingErrorPayload";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";
import {
  getPendingGenerationJob,
  isPendingGenerationStale,
  removePendingGenerationJob,
  savePendingGenerationJob,
} from "@/lib/studio/pendingGenerationClient";
import {
  resumePendingGeneration,
  runImageGenerationRequest,
  runVideoGenerationRequest,
} from "@/lib/studio/postProcessingGenerationClient";

type ProcessedAssetsPanelProps = {
  assets: StudioSessionAsset[];
  mockMode: boolean;
  paidAiRunsAllowed: boolean;
  promptLocale: Locale;
  requireAuthForGeneration?: () => boolean;
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
  requireAuthForGeneration,
  onTokenBillingError,
  onDeleteAsset,
  onAssetCreated,
  onUpdateAsset,
}: ProcessedAssetsPanelProps) {
  const { locale, copy } = useStudioCopy();
  const isMobileLayout = useStudioMobileLayout();
  const pa = copy.processedAssets;
  const ppe = copy.postProcessingEditors;

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
    null
  );
  const [desktopEditorOpen, setDesktopEditorOpen] = useState(false);
  const [videoProvider, setVideoProvider] = useState<VideoProviderId>("kling");
  const [videoVariantId, setVideoVariantId] = useState<VideoVariantId>(
    DEFAULT_VARIANT_BY_PROVIDER.kling
  );
  const [characterOrientation, setCharacterOrientation] =
    useState<KlingMotionOrientation>("video");
  const [uploadedSource, setUploadedSource] =
    useState<PostProcessingUploadedSource | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [videoGenerateAudio, setVideoGenerateAudio] = useState(false);
  const [videoSoundPrompt, setVideoSoundPrompt] = useState("");
  const [videoUseNegativePrompt, setVideoUseNegativePrompt] = useState(false);
  const [videoNegativePrompt, setVideoNegativePrompt] = useState("");
  const [videoKeepReferenceSound, setVideoKeepReferenceSound] = useState(false);
  const [imageUseNegativePrompt, setImageUseNegativePrompt] = useState(false);
  const [imageNegativePrompt, setImageNegativePrompt] = useState("");

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

  const gallerySourceImageUrl = selectedAsset
    ? assetProcessingSourceUrl(selectedAsset)
    : null;

  const effectiveSourceImageUrl = gallerySourceImageUrl;

  const motionVideoUpload = Boolean(selectedAsset?.referenceVideoUrl?.trim());

  /** Active analysis for the currently selected asset (dev debug). */
  const activePreservation = selectedAsset
    ? (preservationCacheRef.current.get(selectedAsset.id) ??
        selectedAsset.productPreservation ??
        null)
    : null;

  const canProcessSource = Boolean(effectiveSourceImageUrl);

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

  const activeVideoVariant = getVideoVariant(videoVariantId);

  useEffect(() => {
    const variantProvider = activeVideoVariant.provider;
    if (variantProvider !== videoProvider) {
      setVideoProvider(variantProvider);
    }
  }, [activeVideoVariant.provider, videoProvider]);

  const minVideoPromptLength = motionVideoUpload ? 4 : 8;
  const videoGenerationReady =
    promptNormalization.normalizedUserIntent.length >= minVideoPromptLength;

  const workflowReady = Boolean(selectedAsset && processingMode);

  const canGenerate = Boolean(
    workflowReady &&
      effectiveSourceImageUrl &&
      !generationLoading &&
      (processingMode === "video" ? videoGenerationReady : imageEditorReady)
  );

  const applyVideoVariant = (nextVariantId: VideoVariantId) => {
    const nextVariant = getVideoVariant(nextVariantId);
    const clamped = clampVideoSettingsToVariant(nextVariantId, {
      durationSeconds,
      aspectRatio: videoAspectRatio,
      quality: saasQuality,
    });
    setVideoVariantId(nextVariantId);
    setDurationSeconds(clamped.durationSeconds);
    setVideoAspectRatio(clamped.aspectRatio);
    setSaasQuality(clamped.quality);
    const c = nextVariant.capabilities;
    if (!c.supportsNativeAudio) {
      setVideoGenerateAudio(false);
      setVideoSoundPrompt("");
    }
    if (!c.supportsNegativePrompt) {
      setVideoUseNegativePrompt(false);
      setVideoNegativePrompt("");
    }
    if (!c.supportsReferenceVideoSound) setVideoKeepReferenceSound(false);
  };

  useEffect(() => {
    if (!selectedAsset?.referenceVideoUrl?.trim()) return;
    setVideoProvider("kling-motion");
    applyVideoVariant("kling-v2.6-motion-control");
    setCharacterOrientation("video");
  }, [selectedAsset?.id, selectedAsset?.referenceVideoUrl]);

  const handleVideoProviderChange = (provider: VideoProviderId) => {
    if (motionVideoUpload && provider !== "kling-motion") return;
    setVideoProvider(provider);
    applyVideoVariant(DEFAULT_VARIANT_BY_PROVIDER[provider]);
  };

  const handleVideoVariantChange = (nextVariantId: VideoVariantId) => {
    setVideoProvider(getVideoVariant(nextVariantId).provider);
    applyVideoVariant(nextVariantId);
  };

  const handleGenerate = async () => {
    const parentId = selectedAsset?.id;
    if (!parentId || !effectiveSourceImageUrl || !processingMode) {
      setError(pa.selectFileFirst);
      return;
    }
    if (requireAuthForGeneration && !requireAuthForGeneration()) {
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
      sourceImageUrl: effectiveSourceImageUrl,
      parentAssetId: parentId,
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
        const apiQuality = mapSaasQualityToVideoApi(videoVariantId, saasQuality);
        const videoBody = {
          clientAssetId: pendingId,
          sourceImageUrl: effectiveSourceImageUrl,
          prompt: userIntent,
          variantId: videoVariantId,
          quality: apiQuality,
          durationSeconds,
          aspectRatio: videoAspectRatio,
          motionPreset,
          referenceVideoUrl: selectedAsset?.referenceVideoUrl,
          characterOrientation: motionVideoUpload
            ? characterOrientation
            : undefined,
          promptLocale,
          generateAudio: videoGenerateAudio,
          soundPrompt:
            videoGenerateAudio && activeVideoVariant.capabilities.supportsNativeAudio
              ? videoSoundPrompt.trim() || undefined
              : undefined,
          useNegativePrompt: videoUseNegativePrompt,
          negativePrompt: videoNegativePrompt.trim() || undefined,
          keepReferenceSound: videoKeepReferenceSound,
        };
        savePendingGenerationJob({
          kind: "video",
          clientAssetId: pendingId,
          parentAssetId: parentId,
          startedAt,
          body: videoBody,
        });
        const outcome = await runVideoGenerationRequest(videoBody);
        if (outcome.kind === "success") {
          applyVideoSuccess(pendingId, outcome.data, userIntent);
          return;
        }
        if (outcome.kind === "error") {
          if (outcome.billing && onTokenBillingError) {
            tryApplyTokenBillingError(
              { ok: false, errorCode: "INSUFFICIENT_TOKENS", message: outcome.message },
              onTokenBillingError
            );
          }
          const msg = friendlyPostProcessError(outcome.message, pa);
          failPendingAsset(pendingId, msg);
          setError(msg);
          return;
        }
        const polled = await resumePendingGeneration({
          kind: "video",
          clientAssetId: pendingId,
          parentAssetId: parentId,
          startedAt,
          body: videoBody,
        });
        if (polled.kind === "success" && polled.data.ok && "video" in polled.data) {
          applyVideoSuccess(pendingId, polled.data as VideoGenerateResponse, userIntent);
        } else if (polled.kind === "error") {
          failPendingAsset(pendingId, friendlyPostProcessError(polled.message, pa));
          setError(friendlyPostProcessError(polled.message, pa));
        }
        return;
      }

      // Vision-based product preservation snapshot (cached per asset).
      // Only requested when the user keeps "Сохранять товар точно" on.
      const preservation = preserveProduct && selectedAsset
        ? await resolveProductPreservation(
            selectedAsset,
            effectiveSourceImageUrl,
            userIntent
          )
        : null;

      const apiOutputFormat: ImageEnhanceRequest["outputFormat"] =
        outputFormat === "jpeg" ? "jpg" : outputFormat;

      const enhanceRequest: ImageEnhanceRequest & { clientAssetId: string } = {
        clientAssetId: pendingId,
        sourceImageUrl: effectiveSourceImageUrl,
        userPrompt: userIntent,
        preserveProduct,
        aspectRatio: imageAspectRatio,
        outputFormat: apiOutputFormat,
        quality: saasQuality === "ultra" ? "high" : saasQuality,
        locale: promptLocale,
        selectedEditor: imageEditorId,
        sourceAssetId: parentId,
        productPreservationBlock:
          preservation?.externalPreservationBlock ?? null,
        useNegativePrompt: imageUseNegativePrompt,
        negativePrompt: imageNegativePrompt.trim() || undefined,
        skipPromptPackage: !promptNormalization.shouldRunEnhancer,
      };

      savePendingGenerationJob({
        kind: "image",
        clientAssetId: pendingId,
        parentAssetId: parentId,
        startedAt,
        body: enhanceRequest,
      });

      const outcome = await runImageGenerationRequest(enhanceRequest);
      if (outcome.kind === "success") {
        applyImageSuccess(pendingId, outcome.data, outputFormat);
        return;
      }
      if (outcome.kind === "error") {
        if (outcome.billing && onTokenBillingError) {
          tryApplyTokenBillingError(
            { ok: false, errorCode: "INSUFFICIENT_TOKENS", message: outcome.message },
            onTokenBillingError
          );
        }
        const msg = friendlyPostProcessError(outcome.message, pa);
        failPendingAsset(pendingId, msg);
        setError(msg);
        return;
      }
      const polled = await resumePendingGeneration({
        kind: "image",
        clientAssetId: pendingId,
        parentAssetId: parentId,
        startedAt,
        body: enhanceRequest,
      });
      if (polled.kind === "success" && polled.data.ok && "imageUrl" in polled.data) {
        applyImageSuccess(pendingId, polled.data as ImageEnhanceResponse, outputFormat);
      } else if (polled.kind === "error") {
        failPendingAsset(pendingId, friendlyPostProcessError(polled.message, pa));
        setError(friendlyPostProcessError(polled.message, pa));
      }
    } catch {
      failPendingAsset(pendingId, pa.fileFailed);
      setError(pa.fileFailed);
    } finally {
      setGenerationLoading(false);
      setMobileSheetOpen(false);
    }
  };

  const openMobileWorkflow = (assetId: string, mode: PostProcessingMode) => {
    setSelectedAssetId(assetId);
    setProcessingMode(mode);
    setError(null);
    setEditorSwitchHint(null);
    setMobileSheetOpen(true);
  };

  const openDesktopEditor = (assetId: string, mode: PostProcessingMode) => {
    setSelectedAssetId(assetId);
    setProcessingMode(mode);
    setDesktopEditorOpen(true);
    setError(null);
    setEditorSwitchHint(null);
  };

  const closeDesktopEditor = () => {
    setDesktopEditorOpen(false);
    setProcessingMode(null);
    setEditorSwitchHint(null);
    setError(null);
  };

  const closeMobileSheet = () => {
    setMobileSheetOpen(false);
    setProcessingMode(null);
    setEditorSwitchHint(null);
    setError(null);
  };

  const handleUploadSourceChange = (next: PostProcessingUploadedSource | null) => {
    setUploadedSource(next);
    if (!next) {
      clearPostProcessingUploadDraft();
      setProcessingMode(null);
      setDesktopEditorOpen(false);
      setMobileSheetOpen(false);
    }
  };

  const uploadDraftRestoredRef = useRef(false);
  useEffect(() => {
    if (uploadDraftRestoredRef.current) return;
    const draft = loadPostProcessingUploadDraft();
    if (!draft) return;
    uploadDraftRestoredRef.current = true;
    setUploadedSource(draftToUploadedSource(draft));
  }, []);

  const resumeInFlightRef = useRef<Set<string>>(new Set());

  const applyVideoSuccess = (
    pendingId: string,
    data: VideoGenerateResponse,
    userIntent: string
  ) => {
    if (!data.ok) return;
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
      prompt: userIntent,
    });
    removePendingGenerationJob(pendingId);
  };

  const applyImageSuccess = (
    pendingId: string,
    data: ImageEnhanceResponse,
    outputFormat: ImageOutputFormat
  ) => {
    if (!data.ok) return;
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
    removePendingGenerationJob(pendingId);
  };

  const failPendingAsset = (pendingId: string, message: string) => {
    onUpdateAsset(pendingId, {
      status: "error",
      errorMessage: message,
    });
    removePendingGenerationJob(pendingId);
  };

  useEffect(() => {
    for (const asset of assets) {
      if (asset.status !== "processing") continue;
      if (resumeInFlightRef.current.has(asset.id)) continue;

      const job = getPendingGenerationJob(asset.id);
      if (!job) continue;

      if (isPendingGenerationStale(job.startedAt)) {
        failPendingAsset(asset.id, pa.fileFailed);
        continue;
      }

      resumeInFlightRef.current.add(asset.id);
      void (async () => {
        try {
          const outcome = await resumePendingGeneration(job);
          if (outcome.kind === "success") {
            const payload = outcome.data;
            if (job.kind === "video" && payload.ok && "video" in payload) {
              applyVideoSuccess(
                asset.id,
                payload as VideoGenerateResponse,
                job.body.prompt
              );
            } else if (job.kind === "image" && payload.ok && "imageUrl" in payload) {
              const fmt =
                job.body.outputFormat === "jpg" ? "jpeg" : job.body.outputFormat;
              applyImageSuccess(
                asset.id,
                payload as ImageEnhanceResponse,
                fmt as ImageOutputFormat
              );
            } else {
              failPendingAsset(asset.id, pa.fileFailed);
            }
            return;
          }
          if (outcome.kind === "error") {
            if (outcome.billing && onTokenBillingError) {
              tryApplyTokenBillingError(
                { ok: false, errorCode: "INSUFFICIENT_TOKENS", message: outcome.message },
                onTokenBillingError
              );
            }
            failPendingAsset(asset.id, friendlyPostProcessError(outcome.message, pa));
            setError(friendlyPostProcessError(outcome.message, pa));
          }
        } catch {
          failPendingAsset(asset.id, pa.fileFailed);
          setError(pa.fileFailed);
        } finally {
          resumeInFlightRef.current.delete(asset.id);
        }
      })();
    }
  }, [assets, pa, onTokenBillingError, onUpdateAsset]);

  const handleSaveUploadedSource = () => {
    if (!uploadedSource) return;
    const asset = uploadedSourceToGalleryAsset(uploadedSource);
    onAssetCreated(asset);
    setSelectedAssetId(asset.id);
    handleUploadSourceChange(null);
    setError(null);
  };

  useEffect(() => {
    if (!isMobileLayout) setMobileSheetOpen(false);
  }, [isMobileLayout]);

  useEffect(() => {
    if (isMobileLayout) setDesktopEditorOpen(false);
  }, [isMobileLayout]);

  const handleDownloadAsset = (asset: StudioSessionAsset) => {
    if (!asset.url) return;
    const ext = asset.format ?? (isVideoAsset(asset) ? "mp4" : "png");
    const filename = `${asset.id}.${ext}`;
    if (isVideoAsset(asset)) {
      void downloadVideoFile(asset.url, filename);
      return;
    }
    void downloadImageFile(asset.url, filename);
  };

  const editorAsset = selectedAsset;

  const mobileSheetTitle =
    processingMode === "video" ? pa.createVideo : pa.createImage;

  const settingsBody = (
    <>
          {!canProcessSource && selectedAsset ? (
            <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {pa.selectFileFirst}
            </p>
          ) : null}

          {processingMode === "video" ? (
            <VideoProviderSelect
              value={videoProvider}
              onChange={handleVideoProviderChange}
              disabled={generationLoading}
              motionOnly={motionVideoUpload}
            />
          ) : null}

          {processingMode === "image" ? (
            <ImageEditorSelect
              editors={imageEditors}
              value={imageEditorId}
              onChange={(nextEditor) => {
                if (nextEditor === imageEditorId) return;

                const capability = IMAGE_EDITOR_CAPABILITIES[nextEditor];
                const aspectSupported = (
                  capability.aspectRatios as readonly string[]
                ).includes(imageAspectRatio);
                const schemaFormat: "png" | "jpg" =
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
                useNegativePrompt={imageUseNegativePrompt}
                negativePrompt={imageNegativePrompt}
                onUseNegativePromptChange={setImageUseNegativePrompt}
                onNegativePromptChange={setImageNegativePrompt}
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
              provider={videoProvider}
              variantId={videoVariantId}
              onVariantChange={handleVideoVariantChange}
              quality={saasQuality}
              durationSeconds={durationSeconds}
              aspectRatio={videoAspectRatio}
              motionPreset={motionPreset}
              onQualityChange={setSaasQuality}
              onDurationChange={setDurationSeconds}
              onAspectRatioChange={setVideoAspectRatio}
              onMotionPresetChange={setMotionPreset}
              characterOrientation={characterOrientation}
              onCharacterOrientationChange={setCharacterOrientation}
              generateAudio={videoGenerateAudio}
              soundPrompt={videoSoundPrompt}
              useNegativePrompt={videoUseNegativePrompt}
              negativePrompt={videoNegativePrompt}
              keepReferenceSound={videoKeepReferenceSound}
              onGenerateAudioChange={(on) => {
                setVideoGenerateAudio(on);
                if (!on) setVideoSoundPrompt("");
              }}
              onSoundPromptChange={setVideoSoundPrompt}
              onUseNegativePromptChange={setVideoUseNegativePrompt}
              onNegativePromptChange={setVideoNegativePrompt}
              onKeepReferenceSoundChange={setVideoKeepReferenceSound}
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
              {processingMode === "video" ? (
                <p className="text-xs leading-5 text-slate-500">
                  {pa.videoPromptAiNotice}
                </p>
              ) : processingMode === "image" &&
                promptNormalization.promptType === "ai_prompt" ? (
                <p className="text-xs leading-5 text-slate-500">
                  {pa.promptNoEnhance}
                </p>
              ) : processingMode === "image" ? (
                <p className="text-xs leading-5 text-slate-500">
                  {pa.imagePromptAiNotice}
                </p>
              ) : null}
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
    </>
  );

  const d = copy.postProcessingDesktop;

  return (
    <div className="space-y-4">
      <PostProcessingUploadSection
        source={uploadedSource}
        uploading={uploadBusy}
        onUploadingChange={setUploadBusy}
        onSourceChange={handleUploadSourceChange}
        onSave={handleSaveUploadedSource}
        disabled={generationLoading}
      />

      {!isMobileLayout &&
      desktopEditorOpen &&
      processingMode &&
      editorAsset ? (
        <PostProcessingDesktopEditor
          asset={editorAsset}
          allAssets={assets}
          title={
            processingMode === "video" ? pa.createVideo : pa.createImage
          }
          onBack={closeDesktopEditor}
          settings={settingsBody}
        />
      ) : null}

      {isMobileLayout ? (
        <>
          {assets.length === 0 ? (
            <Card className={postProcessingSectionCardClass}>
              <div className="border-b border-border/60 px-4 py-3">
                <StudioFilesSectionHeader title={d.galleryTitle} />
              </div>
              <CardContent className="p-4">
                <p className="text-sm leading-6 text-slate-600">{pa.emptyHint}</p>
              </CardContent>
            </Card>
          ) : (
          <PostProcessingMobileGallery
            assets={assets}
            onCreateImage={(id) => openMobileWorkflow(id, "image")}
            onCreateVideo={(id) => openMobileWorkflow(id, "video")}
            onDownloadAsset={handleDownloadAsset}
            onDeleteAsset={onDeleteAsset}
            activeAssetId={mobileSheetOpen ? selectedAsset?.id : null}
            activeMode={
              mobileSheetOpen && processingMode ? processingMode : null
            }
          />
          )}
          <PostProcessingMobileSheet
            open={mobileSheetOpen}
            title={mobileSheetTitle}
            closeLabel={copy.studioFiles.mobileSheetHide}
            onClose={closeMobileSheet}
          >
            <div className="space-y-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {settingsBody}
            </div>
          </PostProcessingMobileSheet>
        </>
      ) : assets.length > 0 ? (
        <PostProcessingDesktopGallery
          assets={assets}
          onCreateImage={(id) => openDesktopEditor(id, "image")}
          onCreateVideo={(id) => openDesktopEditor(id, "video")}
          onDownloadAsset={handleDownloadAsset}
          onDeleteAsset={onDeleteAsset}
        />
      ) : (
        <Card className={postProcessingSectionCardClass}>
          <div className="border-b border-border/60 px-4 py-3">
            <StudioFilesSectionHeader title={d.galleryTitle} />
          </div>
          <CardContent className="p-4">
            <p className="text-sm leading-6 text-slate-600">{pa.emptyHint}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
