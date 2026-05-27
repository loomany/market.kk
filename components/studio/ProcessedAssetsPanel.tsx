"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { TextToImageGenerateSuccessResponse } from "@/lib/ai/textToImageSchemas";
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
import { resolveVideoGenerationIntent } from "@/lib/studio/videoMotionIntentFallback";
import { PostProcessingMobileSheet } from "./PostProcessingMobileSheet";
import { useStudioMobileLayout } from "./useStudioMobileLayout";
import { PostProcessingMobileGallery } from "./PostProcessingMobileGallery";
import { PostProcessingDesktopGallery } from "./PostProcessingDesktopGallery";
import { PostProcessingDesktopEditor } from "./PostProcessingDesktopEditor";
import { StudioAssetMediaView } from "./StudioAssetMediaView";
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
import {
  estimatePostProcessImageCost,
  estimatePostProcessTextToImageCost,
  estimatePostProcessVideoCost,
} from "@/lib/ai/studioGenerationCostEstimate";
import { preflightTokenGeneration } from "@/lib/tokens/clientGenerationPreflight";
import {
  preflightTokensFromEstimate,
  sumStudioCostEstimates,
} from "@/lib/ai/studioCostEstimateUtils";
import { tryApplyTokenBillingError } from "@/lib/tokens/billingErrorPayload";
import { cn } from "@/lib/utils";
import { TokenChargeHint } from "./TokenChargeHint";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";
import { isStuckProcessingAsset } from "@/lib/studio/postProcessingGalleryAssets";
import {
  getPendingGenerationJob,
  isPendingGenerationStale,
  listPendingGenerationJobs,
  patchPendingGenerationJob,
  removePendingGenerationJob,
  savePendingGenerationJob,
  type PendingTextOnlyVideoGenerationJob,
  type PendingTextToImageGenerationJob,
} from "@/lib/studio/pendingGenerationClient";
import {
  clearPostProcessingTextOnlyDraft,
  loadPostProcessingTextOnlyDraft,
  savePostProcessingTextOnlyDraft,
} from "@/lib/studio/postProcessingTextOnlyDraft";
import {
  clearPostProcessingEditorDraft,
  loadPostProcessingEditorDraft,
  savePostProcessingEditorDraft,
} from "@/lib/studio/postProcessingEditorDraft";
import {
  readInitialPostProcessingEditorHydration,
  resolveRestoredEditorAssetForDraft,
} from "@/lib/studio/postProcessingEditorHydration";
import {
  buildProcessingAssetFromJob,
  resolveEditorInFlightPreview,
} from "@/lib/studio/postProcessingInFlightRestore";
import { fetchCompletedGenerationPayload } from "@/lib/studio/recoverGenerationFromServer";
import { getFalMetaFromPendingJob } from "@/lib/studio/pendingJobFalMeta";
import {
  createTextOnlyDraftAsset,
  isTextOnlyPostProcessAsset,
} from "@/lib/studio/postProcessingTextOnly";
import {
  fetchGenerationJobViaGet,
  syncGenerationJobStatus,
  resumePendingGeneration,
  runImageGenerationRequest,
  runTextToImageGenerationRequest,
  runVideoGenerationRequest,
} from "@/lib/studio/postProcessingGenerationClient";
import {
  parseGenerationJobSuccess,
  type ParsedGenerationJobSuccess,
} from "@/lib/studio/parseGenerationJobResult";
import { settleGenerationBillingClient } from "@/lib/studio/settleGenerationBillingClient";
import type { PendingGenerationJob } from "@/lib/studio/pendingGenerationClient";

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
  const initialEditorHydrationRef =
    useRef<ReturnType<typeof readInitialPostProcessingEditorHydration>>(null);
  if (!initialEditorHydrationRef.current) {
    initialEditorHydrationRef.current =
      readInitialPostProcessingEditorHydration("");
  }
  const initialEditorHydration = initialEditorHydrationRef.current;
  const pendingEditorSelectionRef = useRef<string | null>(
    initialEditorHydration.selectedAssetId
  );
  const [selectedAssetId, setSelectedAssetId] = useState(
    () =>
      initialEditorHydration.selectedAssetId ??
      firstSelectableId
  );
  const [processingMode, setProcessingMode] = useState<PostProcessingMode | null>(
    () => initialEditorHydration.processingMode
  );
  const [desktopEditorOpen, setDesktopEditorOpen] = useState(
    () => initialEditorHydration.desktopEditorOpen
  );
  const [restoredEditorAsset, setRestoredEditorAsset] =
    useState<StudioSessionAsset | null>(
      () => initialEditorHydration.restoredEditorAsset
    );
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
  const [generationLoading, setGenerationLoading] = useState(
    () => initialEditorHydration.generationLoading
  );
  const [statusRefreshBusy, setStatusRefreshBusy] = useState(false);
  const [statusRefreshHint, setStatusRefreshHint] = useState<string | null>(null);

  const resumeInFlightRef = useRef<Set<string>>(new Set());
  const recoverInFlightRef = useRef<Set<string>>(new Set());
  /** Client-side POST still running (blocks duplicate resume). */
  const activeGenerationRef = useRef<Set<string>>(new Set());
  /** Left editor preview: countdown while generating, then result (replaces source). */
  const [editorLivePreview, setEditorLivePreview] =
    useState<StudioSessionAsset | null>(
      () => initialEditorHydration.editorLivePreview
    );
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(
    () => initialEditorHydration.mobileSheetOpen
  );
  const [videoGenerateAudio, setVideoGenerateAudio] = useState(false);
  const [videoSoundPrompt, setVideoSoundPrompt] = useState("");
  const [videoUseNegativePrompt, setVideoUseNegativePrompt] = useState(false);
  const [videoNegativePrompt, setVideoNegativePrompt] = useState("");
  const [videoKeepReferenceSound, setVideoKeepReferenceSound] = useState(false);
  const [imageUseNegativePrompt, setImageUseNegativePrompt] = useState(false);
  const [imageNegativePrompt, setImageNegativePrompt] = useState("");
  const [referenceVideoDurationSec, setReferenceVideoDurationSec] = useState<
    number | undefined
  >();
  /** Editor session without uploaded reference (text-to-image / text-to-video). */
  const [textOnlyEditorAsset, setTextOnlyEditorAsset] =
    useState<StudioSessionAsset | null>(
      () => initialEditorHydration.textOnlyEditorAsset
    );

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
    const pending = pendingEditorSelectionRef.current;
    if (pending) {
      if (assets.some((a) => a.id === pending)) {
        setSelectedAssetId(pending);
        pendingEditorSelectionRef.current = null;
      }
      return;
    }
    if (
      (desktopEditorOpen || mobileSheetOpen) &&
      assets.some((a) => a.id === selectedAssetId)
    ) {
      return;
    }
    if (!selectedAssetId || !assets.some((a) => a.id === selectedAssetId)) {
      if (firstSelectableId) setSelectedAssetId(firstSelectableId);
    }
  }, [
    assets,
    selectedAssetId,
    firstSelectableId,
    desktopEditorOpen,
    mobileSheetOpen,
  ]);

  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId) ??
    selectableAssets[0] ??
    assets[0];

  const editorAsset =
    textOnlyEditorAsset ?? restoredEditorAsset ?? selectedAsset;
  const editorDisplayAsset = editorLivePreview ?? editorAsset;

  const gallerySourceImageUrl = editorAsset
    ? assetProcessingSourceUrl(editorAsset)
    : null;

  const effectiveSourceImageUrl = gallerySourceImageUrl;

  const isTextOnlySession = isTextOnlyPostProcessAsset(editorAsset);

  const postProcessEditorTitle =
    processingMode === "video"
      ? isTextOnlySession
        ? copy.postProcessingUpload.createVideoFromText
        : pa.createVideo
      : isTextOnlySession
        ? copy.postProcessingUpload.createImageFromText
        : pa.createImage;

  const motionVideoUpload =
    !isTextOnlySession && Boolean(editorAsset?.referenceVideoUrl?.trim());

  /** Active analysis for the currently selected asset (dev debug). */
  const activePreservation =
    !isTextOnlySession && editorAsset
      ? (preservationCacheRef.current.get(editorAsset.id) ??
          editorAsset.productPreservation ??
          null)
      : null;

  const canProcessSource = Boolean(effectiveSourceImageUrl) || isTextOnlySession;

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
  const resolvedVideoIntent = useMemo(
    () =>
      processingMode === "video"
        ? resolveVideoGenerationIntent(
            promptNormalization.normalizedUserIntent,
            motionPreset,
            minVideoPromptLength
          )
        : promptNormalization.normalizedUserIntent,
    [
      processingMode,
      promptNormalization.normalizedUserIntent,
      motionPreset,
      minVideoPromptLength,
    ]
  );
  const videoGenerationReady =
    processingMode === "video" &&
    resolvedVideoIntent.trim().length >= minVideoPromptLength;

  const workflowReady = Boolean(editorAsset && processingMode);

  const textOnlyImageReady =
    isTextOnlySession &&
    processingMode === "image" &&
    promptNormalization.normalizedUserIntent.trim().length >= 8 &&
    imageEditorReady;

  const processingPreviewId =
    editorLivePreview?.status === "processing" ? editorLivePreview.id : null;

  const isPostProcessGenerating = Boolean(
    generationLoading || editorLivePreview?.status === "processing"
  );

  const showGenerationReset = Boolean(processingPreviewId);

  const canGenerate = Boolean(
    workflowReady &&
      !isPostProcessGenerating &&
      (isTextOnlySession
        ? processingMode === "video"
          ? videoGenerationReady
          : textOnlyImageReady
        : effectiveSourceImageUrl &&
          (processingMode === "video" ? videoGenerationReady : imageEditorReady))
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
  }, [editorAsset?.id, editorAsset?.referenceVideoUrl, isTextOnlySession]);

  useEffect(() => {
    const url = editorAsset?.referenceVideoUrl?.trim();
    if (!url) {
      setReferenceVideoDurationSec(undefined);
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setReferenceVideoDurationSec(Math.min(30, Math.ceil(video.duration)));
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.src = url;
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.src = "";
    };
  }, [editorAsset?.referenceVideoUrl]);

  const generationCostEstimate = useMemo(() => {
    if (!processingMode || !workflowReady) return null;
    if (processingMode === "video") {
      const apiQuality = mapSaasQualityToVideoApi(videoVariantId, saasQuality);
      const audioOn =
        videoGenerateAudio &&
        activeVideoVariant.capabilities.supportsNativeAudio;
      const videoEst = estimatePostProcessVideoCost({
        variantId: videoVariantId,
        durationSeconds,
        quality: apiQuality,
        generateAudio: audioOn,
        referenceVideoDurationSeconds: referenceVideoDurationSec,
        mockMode,
      });
      if (isTextOnlySession) {
        const frameEst = estimatePostProcessTextToImageCost({
          runOpenAiPromptPackage: promptNormalization.shouldRunEnhancer,
          mockMode,
        });
        return sumStudioCostEstimates(frameEst, videoEst);
      }
      return videoEst;
    }
    if (isTextOnlySession) {
      return estimatePostProcessTextToImageCost({
        runOpenAiPromptPackage: promptNormalization.shouldRunEnhancer,
        mockMode,
      });
    }
    const enhanceQuality =
      saasQuality === "ultra" || saasQuality === "fast" || saasQuality === "balanced"
        ? saasQuality === "ultra"
          ? "high"
          : saasQuality
        : "high";
    return estimatePostProcessImageCost({
      editor: imageEditorId,
      quality: enhanceQuality,
      preserveProduct,
      hasPreservationCached: Boolean(activePreservation),
      runOpenAiPromptPackage: promptNormalization.shouldRunEnhancer,
      mockMode,
    });
  }, [
    processingMode,
    workflowReady,
    videoVariantId,
    saasQuality,
    durationSeconds,
    videoGenerateAudio,
    activeVideoVariant.capabilities.supportsNativeAudio,
    referenceVideoDurationSec,
    mockMode,
    imageEditorId,
    preserveProduct,
    activePreservation,
    promptNormalization.shouldRunEnhancer,
    isTextOnlySession,
  ]);

  const handleVideoProviderChange = (provider: VideoProviderId) => {
    if (motionVideoUpload && provider !== "kling-motion") return;
    setVideoProvider(provider);
    applyVideoVariant(DEFAULT_VARIANT_BY_PROVIDER[provider]);
  };

  const handleVideoVariantChange = (nextVariantId: VideoVariantId) => {
    setVideoProvider(getVideoVariant(nextVariantId).provider);
    applyVideoVariant(nextVariantId);
  };

  const persistOpenEditorDraft = (
    assetId: string,
    mode: PostProcessingMode,
    surface: "desktop" | "mobile",
    textOnly: boolean,
    inFlight?: {
      editorLivePreviewId: string;
      processingStartedAt: string;
    } | null
  ) => {
    pendingEditorSelectionRef.current = assetId;
    savePostProcessingEditorDraft({
      open: true,
      selectedAssetId: assetId,
      processingMode: mode,
      surface,
      textOnly,
      editorLivePreviewId: inFlight?.editorLivePreviewId ?? null,
      generationInFlight: Boolean(inFlight),
      processingStartedAt: inFlight?.processingStartedAt ?? null,
    });
  };

  const startTextOnlyWorkflow = (mode: PostProcessingMode) => {
    setEditorLivePreview(null);
    const u = copy.postProcessingUpload;
    const draft = createTextOnlyDraftAsset({
      mode,
      label:
        mode === "video"
          ? u.textOnlyVideoDraftLabel
          : u.textOnlyImageDraftLabel,
    });
    setTextOnlyEditorAsset(draft);
    savePostProcessingTextOnlyDraft({ mode, draftAsset: draft });
    setProcessingMode(mode);
    setError(null);
    setEditorSwitchHint(null);
    setPrompt("");
    setPreserveProduct(false);
    if (mode === "image") {
      setImageEditorId("nano-banana-pro");
    }
    if (mode === "video") {
      setVideoProvider("kling");
      applyVideoVariant(DEFAULT_VARIANT_BY_PROVIDER.kling);
    }
    if (isMobileLayout) {
      persistOpenEditorDraft(draft.id, mode, "mobile", true);
      setMobileSheetOpen(true);
    } else {
      persistOpenEditorDraft(draft.id, mode, "desktop", true);
      setDesktopEditorOpen(true);
    }
  };

  const handleGenerate = async () => {
    const parentId = editorAsset?.id;
    if (!parentId || !processingMode) {
      setError(pa.selectFileFirst);
      return;
    }
    if (!isTextOnlySession && !effectiveSourceImageUrl?.trim()) {
      setError(pa.selectFileFirst);
      return;
    }
    if (
      !isTextOnlySession &&
      processingMode === "video" &&
      !/^https?:\/\//i.test((effectiveSourceImageUrl ?? "").trim())
    ) {
      setError(pa.selectFileFirst);
      return;
    }
    if (requireAuthForGeneration && !requireAuthForGeneration()) {
      return;
    }
    if (!canGenerate) {
      setError(
        isTextOnlySession ? pa.needPromptTextOnly : pa.needPromptAndEditor
      );
      return;
    }

    const requiredTokens = generationCostEstimate
      ? preflightTokensFromEstimate(generationCostEstimate)
      : 0;
    const billingBlocked = await preflightTokenGeneration({
      requiredTokens,
      locale,
      mockMode,
      copy: copy.tokenBilling,
    });
    if (billingBlocked) {
      setError(null);
      onTokenBillingError?.(billingBlocked);
      return;
    }

    const pendingId = newAssetId();
    const startedAt = new Date().toISOString();
    const isVideo = processingMode === "video";
    const userIntent =
      processingMode === "video"
        ? resolvedVideoIntent
        : promptNormalization.normalizedUserIntent;

    setGenerationLoading(true);
    setError(null);
    activeGenerationRef.current.add(pendingId);

    try {
      if (isTextOnlySession && processingMode === "image") {
        const apiOutputFormatEarly: ImageEnhanceRequest["outputFormat"] =
          outputFormat === "jpeg" ? "jpg" : outputFormat;
        const textBodyEarly = {
          clientAssetId: pendingId,
          userPrompt: userIntent,
          aspectRatio: imageAspectRatio,
          outputFormat: apiOutputFormatEarly,
          quality: saasQuality === "ultra" ? "high" : saasQuality,
          locale: promptLocale,
          skipPromptPackage: !promptNormalization.shouldRunEnhancer,
          useNegativePrompt: imageUseNegativePrompt,
          negativePrompt: imageNegativePrompt.trim() || undefined,
        };
        savePendingGenerationJob({
          kind: "text-to-image",
          clientAssetId: pendingId,
          parentAssetId: parentId,
          startedAt,
          body: textBodyEarly,
          outputFormatUi: outputFormat,
        });
      }

      const pendingGalleryAsset: StudioSessionAsset = {
        id: pendingId,
        type: isVideo ? "video" : "scene",
        url: "",
        sourceImageUrl: effectiveSourceImageUrl ?? undefined,
        parentAssetId: isTextOnlySession ? undefined : parentId,
        mode: isVideo ? "video" : "scene",
        createdAt: startedAt,
        startedAt,
        status: "processing",
        label: isVideo ? pa.modeVideo : pa.modeImage,
        postProcessOrigin: isTextOnlySession
          ? isVideo
            ? "text-only-video"
            : "text-only-image"
          : undefined,
      };
      onAssetCreated(pendingGalleryAsset);
      setEditorLivePreview(pendingGalleryAsset);
      countdownAutoRefreshRef.current = new Set();
      setStatusRefreshHint(copy.studioAssetPreview.refreshGenerationRunning);
      persistOpenEditorDraft(parentId, processingMode, isMobileLayout ? "mobile" : "desktop", isTextOnlySession, {
        editorLivePreviewId: pendingId,
        processingStartedAt: startedAt,
      });
      if (isVideo) {
        const apiQuality = mapSaasQualityToVideoApi(videoVariantId, saasQuality);
        let sourceImageUrlForVideo = effectiveSourceImageUrl ?? "";

        const videoBody = {
          clientAssetId: pendingId,
          sourceImageUrl: sourceImageUrlForVideo,
          prompt: userIntent,
          variantId: videoVariantId,
          quality: apiQuality,
          durationSeconds,
          aspectRatio: videoAspectRatio,
          motionPreset,
          referenceVideoUrl: isTextOnlySession
            ? undefined
            : selectedAsset?.referenceVideoUrl,
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
          referenceVideoDurationSeconds:
            referenceVideoDurationSec ?? undefined,
        };

        if (!isTextOnlySession) {
          savePendingGenerationJob({
            kind: "video",
            clientAssetId: pendingId,
            parentAssetId: parentId,
            startedAt,
            body: videoBody,
          });
        }

        if (isTextOnlySession) {
          const frameClientAssetId = newAssetId();
          const frameBody = {
            clientAssetId: frameClientAssetId,
            userPrompt: userIntent,
            aspectRatio: videoAspectRatio,
            outputFormat: "png" as const,
            quality: saasQuality === "ultra" ? "high" : saasQuality,
            locale: promptLocale,
            skipPromptPackage: !promptNormalization.shouldRunEnhancer,
            useNegativePrompt: imageUseNegativePrompt,
            negativePrompt: imageNegativePrompt.trim() || undefined,
          };
          const textOnlyVideoJob: PendingTextOnlyVideoGenerationJob = {
            kind: "text-only-video",
            clientAssetId: pendingId,
            parentAssetId: parentId,
            startedAt,
            frameClientAssetId,
            frameBody,
            videoBody: { ...videoBody, sourceImageUrl: "" },
            userPrompt: userIntent,
          };
          savePendingGenerationJob(textOnlyVideoJob);

          const frameOutcome = await runTextToImageGenerationRequest(frameBody);
          if (frameOutcome.kind === "success") {
            sourceImageUrlForVideo = frameOutcome.data.imageUrl;
            patchPendingGenerationJob(pendingId, (j) => {
              if (j.kind !== "text-only-video") return j;
              return {
                ...j,
                frameImageUrl: sourceImageUrlForVideo,
                videoBody: {
                  ...j.videoBody,
                  sourceImageUrl: sourceImageUrlForVideo,
                },
              };
            });
          } else if (frameOutcome.kind === "error") {
            if (
              frameOutcome.billing &&
              handleGenerationBillingBlock(
                frameOutcome.billingResponse ?? frameOutcome,
                pendingId
              )
            ) {
              return;
            }
            const msg = friendlyPostProcessError(frameOutcome.message, pa);
            failPendingAsset(pendingId, msg);
            setError(msg);
            return;
          } else if (frameOutcome.kind === "in_progress") {
            const framePolled = await resumePendingGeneration({
              kind: "text-to-image",
              clientAssetId: frameClientAssetId,
              parentAssetId: parentId,
              startedAt,
              body: frameBody,
              outputFormatUi: "png",
            });
            if (
              framePolled.kind === "success" &&
              framePolled.data.ok &&
              "imageUrl" in framePolled.data
            ) {
              sourceImageUrlForVideo = (
                framePolled.data as TextToImageGenerateSuccessResponse
              ).imageUrl;
              patchPendingGenerationJob(pendingId, (j) => {
                if (j.kind !== "text-only-video") return j;
                return {
                  ...j,
                  frameImageUrl: sourceImageUrlForVideo,
                  videoBody: {
                    ...j.videoBody,
                    sourceImageUrl: sourceImageUrlForVideo,
                  },
                };
              });
            } else if (framePolled.kind === "error") {
              if (
                framePolled.billing &&
                handleGenerationBillingBlock(
                  framePolled.billingResponse ?? framePolled,
                  pendingId
                )
              ) {
                return;
              }
              const msg = friendlyPostProcessError(framePolled.message, pa);
              failPendingAsset(pendingId, msg);
              setError(msg);
              return;
            } else {
              return;
            }
          }
          videoBody.sourceImageUrl = sourceImageUrlForVideo;
        }

        const outcome = await runVideoGenerationRequest(videoBody);
        if (outcome.kind === "in_progress") {
          if (outcome.falRequestId) {
            patchPendingGenerationJob(pendingId, (j) => {
              if (j.kind !== "video") return j;
              return {
                ...j,
                falRequestId: outcome.falRequestId,
                falEndpoint:
                  outcome.falEndpoint ??
                  getVideoVariant(videoVariantId).falEndpoint,
              };
            });
          }
          setStatusRefreshHint(
            copy.studioAssetPreview.refreshGenerationRunning
          );
        }
        if (outcome.kind === "success") {
          applyVideoSuccess(pendingId, outcome.data, userIntent);
          clearPostProcessingTextOnlyDraft();
          setTextOnlyEditorAsset(null);
          return;
        }
        if (outcome.kind === "error") {
          if (
            outcome.billing &&
            handleGenerationBillingBlock(outcome.billingResponse ?? outcome, pendingId)
          ) {
            return;
          }
          if (await tryRecoverAndApplyGeneration(pendingId, userIntent)) {
            clearPostProcessingTextOnlyDraft();
            setTextOnlyEditorAsset(null);
            return;
          }
          if (await resumeOrRecoverAfterDisconnect(pendingId, userIntent)) {
            return;
          }
          const msg = friendlyPostProcessError(outcome.message, pa);
          failPendingAsset(pendingId, msg);
          setError(msg);
          return;
        }
        if (outcome.kind === "in_progress") {
          setGenerationLoading(true);
          return;
        }
        return;
      }

      if (isTextOnlySession) {
        const apiOutputFormat: ImageEnhanceRequest["outputFormat"] =
          outputFormat === "jpeg" ? "jpg" : outputFormat;
        const textBody = {
          clientAssetId: pendingId,
          userPrompt: userIntent,
          aspectRatio: imageAspectRatio,
          outputFormat: apiOutputFormat,
          quality: saasQuality === "ultra" ? "high" : saasQuality,
          locale: promptLocale,
          skipPromptPackage: !promptNormalization.shouldRunEnhancer,
          useNegativePrompt: imageUseNegativePrompt,
          negativePrompt: imageNegativePrompt.trim() || undefined,
        };
        const textOnlyImageJob: PendingTextToImageGenerationJob = {
          kind: "text-to-image",
          clientAssetId: pendingId,
          parentAssetId: parentId,
          startedAt,
          body: textBody,
          outputFormatUi: outputFormat,
        };

        const outcome = await runTextToImageGenerationRequest(textBody);
        if (outcome.kind === "success") {
          applyTextToImageSuccess(pendingId, outcome.data, outputFormat);
          clearPostProcessingTextOnlyDraft();
          setTextOnlyEditorAsset(null);
          return;
        }
        if (outcome.kind === "error") {
          if (
            outcome.billing &&
            handleGenerationBillingBlock(outcome.billingResponse ?? outcome, pendingId)
          ) {
            return;
          }
          const msg = friendlyPostProcessError(outcome.message, pa);
          failPendingAsset(pendingId, msg);
          setError(msg);
          return;
        }
        const polled = await resumePendingGeneration(textOnlyImageJob);
        if (
          polled.kind === "success" &&
          polled.data.ok &&
          "imageUrl" in polled.data
        ) {
          applyTextToImageSuccess(
            pendingId,
            polled.data as TextToImageGenerateSuccessResponse,
            outputFormat
          );
          clearPostProcessingTextOnlyDraft();
          setTextOnlyEditorAsset(null);
        } else if (polled.kind === "error") {
          failPendingAsset(pendingId, friendlyPostProcessError(polled.message, pa));
          setError(friendlyPostProcessError(polled.message, pa));
        }
        return;
      }

      // Vision-based product preservation snapshot (cached per asset).
      const preservation = preserveProduct && editorAsset
        ? await resolveProductPreservation(
            editorAsset,
            effectiveSourceImageUrl!,
            userIntent
          )
        : null;

      const apiOutputFormat: ImageEnhanceRequest["outputFormat"] =
        outputFormat === "jpeg" ? "jpg" : outputFormat;

      const enhanceRequest: ImageEnhanceRequest & { clientAssetId: string } = {
        clientAssetId: pendingId,
        sourceImageUrl: effectiveSourceImageUrl!,
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
        hasPreservationCached: Boolean(preservation),
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
        if (
          outcome.billing &&
          handleGenerationBillingBlock(outcome.billingResponse ?? outcome, pendingId)
        ) {
          return;
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
      const fallbackPrompt =
        processingMode === "video"
          ? resolvedVideoIntent
          : promptNormalization.normalizedUserIntent;
      const recovered = await resumeOrRecoverAfterDisconnect(
        pendingId,
        fallbackPrompt
      );
      if (!recovered) {
        failPendingAsset(pendingId, pa.fileFailed);
        setError(pa.fileFailed);
      }
    } finally {
      activeGenerationRef.current.delete(pendingId);
      setMobileSheetOpen(false);
    }
  };

  const openMobileWorkflow = (assetId: string, mode: PostProcessingMode) => {
    setEditorLivePreview(null);
    setSelectedAssetId(assetId);
    setProcessingMode(mode);
    setError(null);
    setEditorSwitchHint(null);
    persistOpenEditorDraft(assetId, mode, "mobile", false);
    setMobileSheetOpen(true);
  };

  const openDesktopEditor = (assetId: string, mode: PostProcessingMode) => {
    setEditorLivePreview(null);
    setSelectedAssetId(assetId);
    setProcessingMode(mode);
    setError(null);
    setEditorSwitchHint(null);
    persistOpenEditorDraft(assetId, mode, "desktop", false);
    setDesktopEditorOpen(true);
  };

  const closeDesktopEditor = () => {
    setDesktopEditorOpen(false);
    setProcessingMode(null);
    setTextOnlyEditorAsset(null);
    setRestoredEditorAsset(null);
    setEditorLivePreview(null);
    pendingEditorSelectionRef.current = null;
    clearPostProcessingTextOnlyDraft();
    clearPostProcessingEditorDraft();
    setEditorSwitchHint(null);
    setError(null);
  };

  const closeMobileSheet = () => {
    setMobileSheetOpen(false);
    setProcessingMode(null);
    setTextOnlyEditorAsset(null);
    setRestoredEditorAsset(null);
    setEditorLivePreview(null);
    pendingEditorSelectionRef.current = null;
    clearPostProcessingTextOnlyDraft();
    clearPostProcessingEditorDraft();
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

  useEffect(() => {
    const previewId = editorLivePreview?.id;
    if (!previewId) return;
    const synced = assets.find((a) => a.id === previewId);
    if (!synced) return;
    setEditorLivePreview((prev) => (prev?.id === previewId ? synced : prev));
  }, [assets, editorLivePreview?.id]);

  const uploadDraftRestoredRef = useRef(false);
  useEffect(() => {
    if (uploadDraftRestoredRef.current) return;
    const draft = loadPostProcessingUploadDraft();
    if (!draft) return;
    uploadDraftRestoredRef.current = true;
    setUploadedSource(draftToUploadedSource(draft));
  }, []);

  const textOnlyDraftRestoredRef = useRef(false);
  useEffect(() => {
    if (textOnlyDraftRestoredRef.current) return;
    const draft = loadPostProcessingTextOnlyDraft();
    if (!draft) return;
    textOnlyDraftRestoredRef.current = true;
    setTextOnlyEditorAsset(draft.draftAsset);
    setProcessingMode(draft.mode);
    if (draft.mode === "image") {
      setImageEditorId("nano-banana-pro");
    }
    if (draft.mode === "video") {
      setVideoProvider("kling");
      setVideoVariantId(DEFAULT_VARIANT_BY_PROVIDER.kling);
    }
  }, []);

  const editorUiRestoredRef = useRef(initialEditorHydration.editorDraftOpen);
  const inFlightAssetEnsuredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initialEditorHydration.editorDraftOpen) return;
    if (isMobileLayout) {
      setMobileSheetOpen(true);
      setDesktopEditorOpen(false);
    } else {
      setDesktopEditorOpen(true);
      setMobileSheetOpen(false);
    }
  }, [initialEditorHydration.editorDraftOpen, isMobileLayout]);

  useEffect(() => {
    if (!restoredEditorAsset) return;
    if (assets.some((a) => a.id === restoredEditorAsset.id)) {
      setRestoredEditorAsset(null);
    }
  }, [assets, restoredEditorAsset]);

  useEffect(() => {
    if (editorUiRestoredRef.current) return;
    const draft = loadPostProcessingEditorDraft();
    editorUiRestoredRef.current = true;
    if (!draft?.open) return;

    pendingEditorSelectionRef.current = draft.selectedAssetId;
    setSelectedAssetId(draft.selectedAssetId);
    setProcessingMode(draft.processingMode);

    if (draft.textOnly) {
      const textDraft = loadPostProcessingTextOnlyDraft();
      if (textDraft) setTextOnlyEditorAsset(textDraft.draftAsset);
    }

    const previewId = draft.editorLivePreviewId;
    if (previewId) {
      const preview = resolveEditorInFlightPreview(
        previewId,
        assets,
        draft.processingStartedAt
      );
      if (preview) {
        setEditorLivePreview(preview);
        if (draft.generationInFlight) {
          const resumeJob = getPendingGenerationJob(previewId);
          if (resumeJob && !isPendingGenerationStale(resumeJob.startedAt)) {
            setGenerationLoading(true);
          } else {
            savePostProcessingEditorDraft({
              ...draft,
              generationInFlight: false,
            });
          }
        }
      }
    } else if (draft.generationInFlight) {
      const job =
        listPendingGenerationJobs().find(
          (j) =>
            j.parentAssetId === draft.selectedAssetId ||
            j.clientAssetId === draft.selectedAssetId
        ) ?? null;
      if (job) {
        const preview = buildProcessingAssetFromJob(job, assets);
        setEditorLivePreview(preview);
        setGenerationLoading(true);
      }
    }

    if (!editorLivePreview && !restoredEditorAsset) {
      const textOnly = draft.textOnly
        ? (loadPostProcessingTextOnlyDraft()?.draftAsset ?? null)
        : null;
      const placeholder = resolveRestoredEditorAssetForDraft(
        draft,
        assets,
        textOnly
      );
      if (placeholder) setRestoredEditorAsset(placeholder);
    }
  }, [assets, editorLivePreview, restoredEditorAsset]);

  useEffect(() => {
    const draft = loadPostProcessingEditorDraft();
    if (!draft?.open || !draft.editorLivePreviewId) return;
    if (editorLivePreview?.id === draft.editorLivePreviewId) return;

    const preview = resolveEditorInFlightPreview(
      draft.editorLivePreviewId,
      assets,
      draft.processingStartedAt
    );
    if (!preview) return;

    setEditorLivePreview(preview);
    if (draft.generationInFlight) {
      setGenerationLoading(true);
    }
  }, [assets, editorLivePreview?.id]);

  useEffect(() => {
    const draft = loadPostProcessingEditorDraft();
    const previewId = draft?.editorLivePreviewId;
    if (!draft?.open || !previewId) return;
    if (assets.some((a) => a.id === previewId)) return;
    if (inFlightAssetEnsuredRef.current === previewId) return;

    const job = getPendingGenerationJob(previewId);
    if (!job) return;

    inFlightAssetEnsuredRef.current = previewId;
    onAssetCreated(buildProcessingAssetFromJob(job, assets));
  }, [assets, onAssetCreated]);

  useEffect(() => {
    const editorOpen = desktopEditorOpen || mobileSheetOpen;
    if (!editorOpen || !processingMode) return;
    const assetId = editorAsset?.id;
    if (!assetId) return;

    const inFlightId = editorLivePreview?.id;
    const job = inFlightId ? getPendingGenerationJob(inFlightId) : null;
    const clientRequestActive = inFlightId
      ? activeGenerationRef.current.has(inFlightId)
      : false;
    const generationInFlight = Boolean(
      job && !isPendingGenerationStale(job.startedAt)
    ) || clientRequestActive;

    savePostProcessingEditorDraft({
      open: true,
      selectedAssetId: assetId,
      processingMode,
      surface: mobileSheetOpen ? "mobile" : "desktop",
      textOnly: isTextOnlyPostProcessAsset(editorAsset),
      editorLivePreviewId: inFlightId ?? null,
      generationInFlight,
      processingStartedAt:
        editorLivePreview?.startedAt ??
        job?.startedAt ??
        loadPostProcessingEditorDraft()?.processingStartedAt ??
        null,
    });
  }, [
    desktopEditorOpen,
    mobileSheetOpen,
    processingMode,
    editorAsset,
    editorLivePreview,
    generationLoading,
    isTextOnlySession,
  ]);

  const applyVideoSuccess = (
    pendingId: string,
    data: VideoGenerateResponse,
    userIntent: string
  ) => {
    if (!data.ok) return;
    setGenerationLoading(false);
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
    void settleGenerationBillingClient(pendingId);
  };

  const applyTextToImageSuccess = (
    pendingId: string,
    data: TextToImageGenerateSuccessResponse,
    outputFormat: ImageOutputFormat
  ) => {
    applyImageSuccess(
      pendingId,
      {
        ok: true,
        imageUrl: data.imageUrl,
        provider: data.provider,
        model: data.model,
        editor: "nano-banana-pro",
        promptUsed: data.promptUsed,
        requestId: data.requestId,
        estimatedCostUsd: data.estimatedCostUsd,
        meta: {
          aspectRatio: imageAspectRatio,
          outputFormat: outputFormat === "jpeg" ? "jpg" : outputFormat,
          quality: saasQuality === "ultra" ? "high" : saasQuality,
          preserveProduct: false,
        },
      },
      outputFormat
    );
  };

  const applyImageSuccess = (
    pendingId: string,
    data: ImageEnhanceResponse,
    outputFormat: ImageOutputFormat
  ) => {
    if (!data.ok) return;
    setGenerationLoading(false);
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
    void settleGenerationBillingClient(pendingId);
  };

  const failPendingAsset = (pendingId: string, message: string) => {
    setGenerationLoading(false);
    onUpdateAsset(pendingId, {
      status: "error",
      errorMessage: message,
    });
    removePendingGenerationJob(pendingId);
  };

  const applyParsedGenerationSuccess = (
    assetId: string,
    parsed: ParsedGenerationJobSuccess,
    job: PendingGenerationJob | null,
    promptFallback: string
  ) => {
    if (parsed.kind === "video") {
      const prompt =
        job?.kind === "text-only-video"
          ? job.userPrompt
          : job?.kind === "video"
            ? job.body.prompt
            : promptFallback;
      applyVideoSuccess(assetId, parsed.data as VideoGenerateResponse, prompt);
      if (job?.kind === "text-only-video") {
        clearPostProcessingTextOnlyDraft();
        setTextOnlyEditorAsset(null);
      }
      return;
    }

    const outputFmt: ImageOutputFormat =
      job?.kind === "text-to-image"
        ? job.outputFormatUi
        : job?.kind === "image"
          ? job.body.outputFormat === "jpg"
            ? "jpeg"
            : job.body.outputFormat
          : outputFormat;

    if (job?.kind === "text-to-image") {
      applyTextToImageSuccess(
        assetId,
        parsed.data as TextToImageGenerateSuccessResponse,
        outputFmt
      );
      clearPostProcessingTextOnlyDraft();
      setTextOnlyEditorAsset(null);
      return;
    }

    applyImageSuccess(assetId, parsed.data as ImageEnhanceResponse, outputFmt);
  };

  const tryRecoverAndApplyGeneration = async (
    pendingId: string,
    promptFallback: string
  ): Promise<boolean> => {
    const payload = await fetchCompletedGenerationPayload(pendingId);
    if (!payload) return false;
    const parsed = parseGenerationJobSuccess(payload);
    if (!parsed) return false;
    const job = getPendingGenerationJob(pendingId);
    applyParsedGenerationSuccess(pendingId, parsed, job, promptFallback);
    setError(null);
    return true;
  };

  const resumeOrRecoverAfterDisconnect = async (
    pendingId: string,
    promptFallback: string
  ): Promise<boolean> => {
    if (await tryRecoverAndApplyGeneration(pendingId, promptFallback)) {
      return true;
    }
    const job = getPendingGenerationJob(pendingId);
    if (!job) return false;
    const polled = await resumePendingGeneration(job);
    if (polled.kind === "success") {
      const parsed = parseGenerationJobSuccess(
        polled.data as Record<string, unknown>
      );
      if (parsed) {
        applyParsedGenerationSuccess(pendingId, parsed, job, promptFallback);
        setError(null);
        return true;
      }
    }
    if (polled.kind === "in_progress") {
      setGenerationLoading(true);
      setStatusRefreshHint(copy.studioAssetPreview.refreshStillProcessing);
      return true;
    }
    if (polled.kind === "error") {
      if (
        polled.billing &&
        handleGenerationBillingBlock(
          polled.billingResponse ?? polled,
          pendingId
        )
      ) {
        return true;
      }
      failPendingAsset(pendingId, friendlyPostProcessError(polled.message, pa));
      setError(friendlyPostProcessError(polled.message, pa));
      return true;
    }
    return false;
  };

  const handleGenerationBillingBlock = useCallback(
    (billingResponse: unknown, pendingId: string): boolean => {
      if (!onTokenBillingError) return false;
      if (!tryApplyTokenBillingError(billingResponse, onTokenBillingError)) {
        return false;
      }
      removePendingGenerationJob(pendingId);
      onDeleteAsset(pendingId);
      setError(null);
      return true;
    },
    [onTokenBillingError, onDeleteAsset]
  );

  const statusRefreshInFlightRef = useRef(false);
  const countdownAutoRefreshRef = useRef<Set<string>>(new Set());

  const releaseStuckGeneration = useCallback(
    (assetId: string) => {
      activeGenerationRef.current.delete(assetId);
      setGenerationLoading(false);
      removePendingGenerationJob(assetId);
      resumeInFlightRef.current.delete(assetId);
      recoverInFlightRef.current.delete(assetId);

      const draft = loadPostProcessingEditorDraft();
      if (draft) {
        savePostProcessingEditorDraft({
          ...draft,
          generationInFlight: false,
          editorLivePreviewId: null,
          processingStartedAt: null,
        });
      }

      onDeleteAsset(assetId);
      setEditorLivePreview(null);
      setStatusRefreshHint(null);
    },
    [
      editorAsset?.id,
      isTextOnlySession,
      mobileSheetOpen,
      onDeleteAsset,
      processingMode,
    ]
  );

  useEffect(() => {
    if (editorLivePreview?.status === "processing") {
      setGenerationLoading(true);
    }
  }, [editorLivePreview?.id, editorLivePreview?.status]);

  const patchFalMetaFromSyncOutcome = useCallback(
    (
      assetId: string,
      outcome: { falRequestId?: string; falEndpoint?: string }
    ) => {
      if (!outcome.falRequestId) return;
      patchPendingGenerationJob(assetId, (j) => {
        if (j.kind === "video") {
          return {
            ...j,
            falRequestId: outcome.falRequestId,
            falEndpoint:
              outcome.falEndpoint ??
              j.falEndpoint ??
              getVideoVariant(videoVariantId).falEndpoint,
          };
        }
        if (j.kind === "text-only-video") {
          return {
            ...j,
            falRequestId: outcome.falRequestId,
            falEndpoint: outcome.falEndpoint ?? j.falEndpoint,
          };
        }
        return j;
      });
    },
    [videoVariantId]
  );

  const handleRefreshGenerationStatus = useCallback(
    async (assetId: string) => {
      if (statusRefreshInFlightRef.current) return;
      statusRefreshInFlightRef.current = true;
      setStatusRefreshBusy(true);
      const spa = copy.studioAssetPreview;

      try {
        const asset = assets.find((a) => a.id === assetId);
        const job = getPendingGenerationJob(assetId);
        const falMeta = getFalMetaFromPendingJob(job);
        const outcome = await syncGenerationJobStatus(assetId, {
          falRequestId: falMeta.falRequestId,
          falEndpoint: falMeta.falEndpoint,
          requestPayload: falMeta.requestPayload,
        });

        if (outcome.kind === "in_progress") {
          patchFalMetaFromSyncOutcome(assetId, outcome);
        }

        if (outcome.kind === "success") {
          const parsed = parseGenerationJobSuccess(
            outcome.data as Record<string, unknown>
          );
          if (parsed) {
            applyParsedGenerationSuccess(
              assetId,
              parsed,
              job,
              asset?.prompt ?? ""
            );
            setGenerationLoading(false);
            setStatusRefreshHint(null);
            countdownAutoRefreshRef.current.delete(assetId);
            return;
          }
          if (await tryRecoverAndApplyGeneration(assetId, asset?.prompt ?? "")) {
            setGenerationLoading(false);
            setStatusRefreshHint(null);
            countdownAutoRefreshRef.current.delete(assetId);
            return;
          }
          setGenerationLoading(true);
          setStatusRefreshHint(spa.refreshStillProcessing);
          return;
        }

        if (outcome.kind === "error") {
          if (
            outcome.errorCode === "SYNC_SERVER_ERROR" ||
            outcome.errorCode === "SERVER_ERROR"
          ) {
            const viaGet = await fetchGenerationJobViaGet(assetId);
            if (viaGet.kind === "success") {
              const parsed = parseGenerationJobSuccess(
                viaGet.data as Record<string, unknown>
              );
              if (parsed) {
                applyParsedGenerationSuccess(
                  assetId,
                  parsed,
                  job,
                  asset?.prompt ?? ""
                );
                setGenerationLoading(false);
                setStatusRefreshHint(null);
                countdownAutoRefreshRef.current.delete(assetId);
                return;
              }
            }
          }
          if (outcome.errorCode === "AUTH_REQUIRED") {
            setStatusRefreshHint(spa.refreshAuthRequired);
            setGenerationLoading(true);
            return;
          }
          if (outcome.errorCode === "NOT_FOUND") {
            setStatusRefreshHint(
              asset?.status === "processing"
                ? spa.refreshGenerationRunning
                : spa.refreshLostSession
            );
            setGenerationLoading(true);
            return;
          }
          if (
            outcome.billing &&
            handleGenerationBillingBlock(
              outcome.billingResponse ?? outcome,
              assetId
            )
          ) {
            setGenerationLoading(false);
            return;
          }
          const msg = friendlyPostProcessError(outcome.message, pa);
          failPendingAsset(assetId, msg);
          setError(msg);
          setGenerationLoading(false);
          return;
        }

        if (asset && isStuckProcessingAsset(asset)) {
          releaseStuckGeneration(assetId);
          setStatusRefreshHint(spa.refreshLostSession);
          return;
        }

        setGenerationLoading(true);
        if (asset?.status === "processing") {
          const restored = resolveEditorInFlightPreview(
            assetId,
            assets,
            asset.startedAt
          );
          if (restored) setEditorLivePreview(restored);
          setStatusRefreshHint(spa.refreshGenerationRunning);
          return;
        }

        const orphaned =
          !activeGenerationRef.current.has(assetId) &&
          !getPendingGenerationJob(assetId);
        setStatusRefreshHint(
          orphaned ? spa.refreshLostSession : spa.refreshStillProcessing
        );
      } catch {
        setGenerationLoading(true);
        setStatusRefreshHint(spa.refreshStillProcessing);
      } finally {
        setStatusRefreshBusy(false);
        statusRefreshInFlightRef.current = false;
      }
    },
    [
      assets,
      copy.studioAssetPreview,
      handleGenerationBillingBlock,
      onDeleteAsset,
      pa,
      patchFalMetaFromSyncOutcome,
      releaseStuckGeneration,
    ]
  );

  const handleGenerationCountdownZero = useCallback(
    (assetId: string) => {
      if (countdownAutoRefreshRef.current.has(assetId)) return;
      countdownAutoRefreshRef.current.add(assetId);
      void handleRefreshGenerationStatus(assetId);
    },
    [handleRefreshGenerationStatus]
  );

  useEffect(() => {
    const previewId = editorLivePreview?.id;
    if (editorLivePreview?.status !== "processing" || !previewId) {
      return;
    }

    const poll = () => {
      const job = getPendingGenerationJob(previewId);
      const falMeta = getFalMetaFromPendingJob(job);
      const hasFalLink = Boolean(falMeta.falRequestId);
      if (activeGenerationRef.current.has(previewId) && !hasFalLink) {
        const startedMs = job?.startedAt
          ? Date.now() - new Date(job.startedAt).getTime()
          : 0;
        if (startedMs < 4_000) return;
      }
      void handleRefreshGenerationStatus(previewId);
    };

    const job = getPendingGenerationJob(previewId);
    const firstPollMs = getFalMetaFromPendingJob(job).falRequestId ? 2_000 : 4_000;
    const initialDelayId = window.setTimeout(poll, firstPollMs);
    const intervalId = window.setInterval(poll, 4_000);
    return () => {
      window.clearTimeout(initialDelayId);
      window.clearInterval(intervalId);
    };
  }, [
    editorLivePreview?.id,
    editorLivePreview?.status,
    handleRefreshGenerationStatus,
  ]);

  useEffect(() => {
    for (const asset of assets) {
      if (asset.status !== "processing") continue;
      if (activeGenerationRef.current.has(asset.id)) continue;

      if (isStuckProcessingAsset(asset)) {
        removePendingGenerationJob(asset.id);
        onDeleteAsset(asset.id);
        continue;
      }

      if (resumeInFlightRef.current.has(asset.id)) continue;

      const job = getPendingGenerationJob(asset.id);
      if (!job) continue;

      if (isPendingGenerationStale(job.startedAt)) {
        removePendingGenerationJob(asset.id);
        onDeleteAsset(asset.id);
        continue;
      }

      resumeInFlightRef.current.add(asset.id);
      void (async () => {
        try {
          const outcome = await resumePendingGeneration(job);
          if (outcome.kind === "success") {
            const parsed = parseGenerationJobSuccess(
              outcome.data as Record<string, unknown>
            );
            if (parsed) {
              applyParsedGenerationSuccess(
                asset.id,
                parsed,
                job,
                asset.prompt ?? ""
              );
            } else {
              failPendingAsset(asset.id, pa.fileFailed);
            }
            return;
          }
          if (outcome.kind === "in_progress") {
            return;
          }
          if (outcome.kind === "error") {
            if (
              outcome.billing &&
              handleGenerationBillingBlock(outcome.billingResponse ?? outcome, asset.id)
            ) {
              return;
            }
            const msg = friendlyPostProcessError(outcome.message, pa);
            failPendingAsset(asset.id, msg);
            if (editorLivePreview?.id === asset.id) {
              setError(msg);
            }
          }
        } catch {
          failPendingAsset(asset.id, pa.fileFailed);
          if (editorLivePreview?.id === asset.id) {
            setError(pa.fileFailed);
          }
        } finally {
          resumeInFlightRef.current.delete(asset.id);
        }
      })();
    }
  }, [
    assets,
    editorLivePreview?.id,
    handleGenerationBillingBlock,
    onDeleteAsset,
    onUpdateAsset,
    pa,
  ]);

  /** Recover gallery tiles when Fal finished but HTTP timed out or billing raced. */
  useEffect(() => {
    for (const asset of assets) {
      if (asset.status !== "error" && asset.status !== "processing") continue;
      if (activeGenerationRef.current.has(asset.id)) continue;
      if (resumeInFlightRef.current.has(asset.id)) continue;
      if (recoverInFlightRef.current.has(asset.id)) continue;
      if (asset.status === "processing" && getPendingGenerationJob(asset.id)) {
        continue;
      }

      recoverInFlightRef.current.add(asset.id);
      void (async () => {
        try {
          const res = await fetch(
            `/api/studio/generation-jobs/${encodeURIComponent(asset.id)}`,
            { cache: "no-store" }
          );
          if (!res.ok) return;
          const data = (await res.json()) as {
            status?: string;
            result?: Record<string, unknown>;
          };
          if (data.status !== "completed" || !data.result) return;
          const parsed = parseGenerationJobSuccess(data.result);
          if (!parsed) return;
          const job = getPendingGenerationJob(asset.id);
          applyParsedGenerationSuccess(
            asset.id,
            parsed,
            job,
            asset.prompt ?? ""
          );
          setError(null);
        } catch {
          /* keep current tile state */
        } finally {
          recoverInFlightRef.current.delete(asset.id);
        }
      })();
    }
  }, [assets]);

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

  const showDesktopEditor =
    !isMobileLayout &&
    desktopEditorOpen &&
    Boolean(processingMode && editorDisplayAsset);

  const keepEditorChromeOnReload =
    initialEditorHydration.editorDraftOpen &&
    Boolean(processingMode) &&
    (desktopEditorOpen || mobileSheetOpen);

  const mobileSheetTitle = processingMode ? postProcessEditorTitle : "";

  const settingsBody = (
    <div className="relative">
      {isPostProcessGenerating ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-[16px] bg-white/80 px-4 backdrop-blur-[1px]"
          aria-live="polite"
        >
          <p className="max-w-xs text-center text-sm font-medium leading-6 text-slate-700">
            {pa.generationSettingsLocked}
          </p>
        </div>
      ) : null}
      <div
        className={cn(
          "space-y-6",
          isPostProcessGenerating &&
            "pointer-events-none select-none opacity-45"
        )}
      >
          {!isTextOnlySession && !canProcessSource && editorAsset ? (
            <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {pa.selectFileFirst}
            </p>
          ) : null}

          {processingMode === "video" ? (
            <VideoProviderSelect
              value={videoProvider}
              onChange={handleVideoProviderChange}
              disabled={isPostProcessGenerating}
              motionOnly={motionVideoUpload}
            />
          ) : null}

          {processingMode === "image" && !isTextOnlySession ? (
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
              disabled={isPostProcessGenerating}
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
                preserveProduct={isTextOnlySession ? false : preserveProduct}
                onOutputFormatChange={setOutputFormat}
                onAspectRatioChange={setImageAspectRatio}
                onQualityChange={setSaasQuality}
                showPreserveProduct={!isTextOnlySession}
                onPreserveProductChange={setPreserveProduct}
                useNegativePrompt={imageUseNegativePrompt}
                negativePrompt={imageNegativePrompt}
                onUseNegativePromptChange={setImageUseNegativePrompt}
                onNegativePromptChange={setImageNegativePrompt}
                disabled={isPostProcessGenerating}
              />
              {!isTextOnlySession && mockMode ? (
                <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {ppe.nanoBanana.descriptionDemo} {ppe.nanoBanana.limitationsDemo}
                </p>
              ) : !isTextOnlySession && !paidAiRunsAllowed ? (
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
              disabled={isPostProcessGenerating}
            />
          ) : null}

          {processingMode ? (
            <section className="space-y-2">
              <label className="text-sm font-semibold text-slate-950">
                {processingMode === "video" ? pa.whatToDoVideo : pa.whatToDo}
              </label>
              {isTextOnlySession ? (
                <p className="text-sm leading-6 text-slate-600">
                  {pa.textOnlyWorkflowHint}
                </p>
              ) : null}
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                disabled={isPostProcessGenerating}
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
            <div className="flex w-full items-stretch gap-2 sm:gap-3">
              <Button
                className="min-w-0 flex-1 gap-2 px-4 sm:gap-3 sm:px-5"
                size="lg"
                loading={isPostProcessGenerating}
                disabled={!canGenerate}
                onClick={handleGenerate}
              >
                {processingMode === "video" ? (
                  <Clapperboard className="h-5 w-5 shrink-0" />
                ) : (
                  <Sparkles className="h-5 w-5 shrink-0" />
                )}
                <span className="truncate">{postProcessEditorTitle}</span>
              </Button>
              {generationCostEstimate &&
              preflightTokensFromEstimate(generationCostEstimate) > 0 ? (
                <TokenChargeHint
                  estimate={generationCostEstimate}
                  variant="total"
                  size="lg"
                  className="shrink-0 self-stretch"
                />
              ) : null}
            </div>
          ) : null}

      </div>
    </div>
  );

  const d = copy.postProcessingDesktop;

  return (
    <div className="space-y-4">
      {showDesktopEditor && editorDisplayAsset && processingMode ? (
        <PostProcessingDesktopEditor
          asset={editorDisplayAsset}
          allAssets={assets}
          title={postProcessEditorTitle}
          onBack={closeDesktopEditor}
          settings={settingsBody}
          onRefreshGenerationStatus={
            processingPreviewId
              ? () => void handleRefreshGenerationStatus(processingPreviewId)
              : undefined
          }
          onResetGeneration={
            showGenerationReset && processingPreviewId
              ? () => releaseStuckGeneration(processingPreviewId)
              : undefined
          }
          refreshGenerationBusy={statusRefreshBusy}
          refreshGenerationHint={statusRefreshHint}
          onGenerationCountdownZero={
            processingPreviewId
              ? () => handleGenerationCountdownZero(processingPreviewId)
              : undefined
          }
        />
      ) : keepEditorChromeOnReload ? (
        <div
          className="flex min-h-[min(70vh,640px)] items-center justify-center rounded-[20px] border border-border/60 bg-white"
          aria-busy="true"
        >
          <p className="text-sm font-medium text-slate-600">{pa.restoringEditor}</p>
        </div>
      ) : (
        <>
          <PostProcessingUploadSection
            source={uploadedSource}
            uploading={uploadBusy}
            onUploadingChange={setUploadBusy}
            onSourceChange={handleUploadSourceChange}
            onSave={handleSaveUploadedSource}
            onStartTextOnlyImage={() => startTextOnlyWorkflow("image")}
            onStartTextOnlyVideo={() => startTextOnlyWorkflow("video")}
            disabled={isPostProcessGenerating}
          />

          {isMobileLayout ? (
            <>
              {assets.length === 0 ? (
                <Card className={postProcessingSectionCardClass}>
                  <div className="border-b border-border/60 px-4 py-3">
                    <StudioFilesSectionHeader title={d.galleryTitle} />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm leading-6 text-slate-600">
                      {pa.emptyHint}
                    </p>
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
                  {editorLivePreview ? (
                    <StudioAssetMediaView
                      asset={editorLivePreview}
                      variant="gallery"
                      className="aspect-[9/16] w-full"
                      onRefreshStatus={
                        processingPreviewId
                          ? () =>
                              void handleRefreshGenerationStatus(
                                processingPreviewId
                              )
                          : undefined
                      }
                      onResetGeneration={
                        showGenerationReset && processingPreviewId
                          ? () => releaseStuckGeneration(processingPreviewId)
                          : undefined
                      }
                      refreshStatusBusy={statusRefreshBusy}
                      refreshStatusHint={statusRefreshHint}
                      onCountdownReachedZero={
                        processingPreviewId
                          ? () =>
                              handleGenerationCountdownZero(processingPreviewId)
                          : undefined
                      }
                    />
                  ) : null}
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
        </>
      )}
    </div>
  );
}
