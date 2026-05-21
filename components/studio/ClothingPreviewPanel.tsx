"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import {
  DEFAULT_PREVIEW_ASPECT,
  previewAspectFromFal,
  type PreviewAspectState,
} from "@/lib/studio/previewImageAspect";
import { STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC } from "@/lib/studio/clothingTryOnEstimates";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PreviewCard } from "@/components/studio/PreviewCard";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "@/components/studio/PreviewImageCarousel";
import { ProductSetProgressRail } from "@/components/studio/ProductSetProgressRail";
import type { ProductSetSlotProgress } from "@/lib/studio/productSetProgress";
import { TryOnResultActions } from "@/components/studio/TryOnResultActions";
import { formatStudioString } from "@/lib/studio/i18n";
import { useStudioCopy } from "./StudioLocaleContext";

export type ClothingPreviewTabId = "product" | "model" | "result";

type ClothingPreviewPanelProps = {
  modelOutputAspect: FalModelAspectRatio;
  activeTab: ClothingPreviewTabId;
  onTabChange: (tab: ClothingPreviewTabId) => void;
  tabReady: Record<ClothingPreviewTabId, boolean>;
  productUrl: string | null;
  productCarouselItems: PreviewCarouselItem[];
  modelUrl: string | null;
  modelCarouselItems: PreviewCarouselItem[];
  modelGenerating: boolean;
  modelLoadingSubdetail: string | null;
  pipelineBusy: boolean;
  pipelineCountdownStartedAt?: number | null;
  modelCountdownStartedAt?: number | null;
  onReplaceModel: () => void;
  resultUrl: string | null;
  resultCarouselItems?: PreviewCarouselItem[];
  previewSlideIndex?: number;
  onPreviewSlideIndexChange?: (index: number) => void;
  tryOnProgress: string | null;
  onDownloadResult: () => void;
  onDownloadAllResults?: () => void;
  onDownloadAllModels?: () => void;
  onStartOver: () => void;
  /** Комплект 2+ фото: общий прогресс и таймер с первого шага */
  productSetPipelineActive?: boolean;
  productSetCountdownSeconds?: number;
  productSetCountdownStartedAt?: number | null;
  productSetCountdownLabel?: string;
  productSetSlots?: ProductSetSlotProgress[];
  productSetActiveIndex?: number;
};

function TabButton({
  label,
  active,
  ready,
  onClick,
  size = "default",
}: {
  label: string;
  active: boolean;
  ready: boolean;
  onClick: () => void;
  size?: "default" | "mobile";
}) {
  const { copy } = useStudioCopy();
  const isMobile = size === "mobile";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-1 transition",
        isMobile
          ? cn(
              "rounded-[10px] px-2 py-2 text-sm",
              active
                ? "bg-white font-semibold text-slate-950 shadow-sm"
                : "font-medium text-slate-500 hover:text-slate-800"
            )
          : cn(
              "rounded-md px-1 py-1.5 text-xs font-medium",
              active
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )
      )}
    >
      {label}
      {ready ? (
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-teal-500"
          aria-label={copy.common.hasPreview}
        />
      ) : null}
    </button>
  );
}

function AspectBadge({ label }: { label: string }) {
  const { copy } = useStudioCopy();
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50"
      aria-label={formatStudioString(copy.common.formatLabel, { label })}
    >
      <span className="font-mono text-[10px] font-semibold tabular-nums text-slate-700">
        {label}
      </span>
    </span>
  );
}

function PreviewTabBar({
  tabs,
  activeTab,
  tabReady,
  onTabChange,
  aspectLabel,
  fullWidth = false,
}: {
  tabs: { id: ClothingPreviewTabId; label: string }[];
  activeTab: ClothingPreviewTabId;
  tabReady: Record<ClothingPreviewTabId, boolean>;
  onTabChange: (tab: ClothingPreviewTabId) => void;
  aspectLabel?: string;
  fullWidth?: boolean;
}) {
  const { copy } = useStudioCopy();
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        fullWidth ? "mb-3 w-full" : "mb-2"
      )}
    >
      <div
        role="tablist"
        aria-label={copy.clothingPreview.previewPipeline}
        className={cn(
          "flex gap-0.5 bg-slate-100/90 ring-1 ring-slate-200/50",
          fullWidth
            ? "w-full rounded-xl p-1"
            : "min-w-0 flex-1 rounded-lg p-0.5"
        )}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            ready={tabReady[tab.id]}
            onClick={() => onTabChange(tab.id)}
            size={fullWidth ? "mobile" : "default"}
          />
        ))}
      </div>
      {aspectLabel ? <AspectBadge label={aspectLabel} /> : null}
    </div>
  );
}

const previewCardShared = { compact: true, scrollableViewport: false as const };

const mobilePreviewCardClass =
  "w-full ring-2 ring-slate-100/90 shadow-lg shadow-slate-200/50 lg:w-full lg:ring-1 lg:shadow-sm lg:shadow-slate-200/50";

export function ClothingPreviewPanel({
  modelOutputAspect,
  activeTab,
  onTabChange,
  tabReady,
  productUrl,
  productCarouselItems,
  modelUrl,
  modelCarouselItems,
  modelGenerating,
  modelLoadingSubdetail,
  pipelineBusy,
  pipelineCountdownStartedAt,
  modelCountdownStartedAt,
  onReplaceModel,
  resultUrl,
  resultCarouselItems = [],
  previewSlideIndex = 0,
  onPreviewSlideIndexChange,
  tryOnProgress,
  onDownloadResult,
  onDownloadAllResults,
  onDownloadAllModels,
  onStartOver,
  productSetPipelineActive = false,
  productSetCountdownSeconds,
  productSetCountdownStartedAt,
  productSetCountdownLabel,
  productSetSlots = [],
  productSetActiveIndex = 0,
}: ClothingPreviewPanelProps) {
  const { copy } = useStudioCopy();
  const cp = copy.clothingPreview;
  const common = copy.common;

  const mobileTabs: { id: ClothingPreviewTabId; label: string }[] = [
    { id: "product", label: common.product },
    { id: "model", label: common.model },
    { id: "result", label: common.result },
  ];

  const desktopSourceTabs: { id: "product" | "model"; label: string }[] = [
    { id: "product", label: common.product },
    { id: "model", label: common.model },
  ];

  const syncCarousel =
    productCarouselItems.length > 1 ||
    modelCarouselItems.length > 1 ||
    resultCarouselItems.length > 1;
  const slideIndex = previewSlideIndex;
  const setSlideIndex = onPreviewSlideIndexChange ?? (() => {});
  const defaultAspect = previewAspectFromFal(DEFAULT_PREVIEW_ASPECT);
  /** Бейдж и viewport — всегда выбранный пользователем формат, не пиксели файла. */
  const outputAspect = previewAspectFromFal(modelOutputAspect);
  const productPreviewAspect = outputAspect;
  const modelPreviewAspect = outputAspect;
  const resultPreviewAspect = outputAspect;

  const desktopSourceTab: "product" | "model" =
    activeTab === "product" ? "product" : "model";

  const previewPropsFor = (aspect: PreviewAspectState) => ({
    ...previewCardShared,
    viewportAspect: DEFAULT_PREVIEW_ASPECT,
    viewportAspectRatio: aspect.ratio,
    aspectBadge: aspect.badge,
  });

  const productCard = (
    <PreviewCard
      {...previewPropsFor(productPreviewAspect)}
      className={mobilePreviewCardClass}
      title={common.product}
      url={productCarouselItems.length === 1 ? productUrl : null}
      empty={copy.generationResults.uploadPhoto}
      content={
        productCarouselItems.length > 1 ? (
          <PreviewImageCarousel
            items={productCarouselItems}
            showDownloadActions={false}
            activeIndex={syncCarousel ? slideIndex : undefined}
            onActiveIndexChange={syncCarousel ? setSlideIndex : undefined}
            className="h-full min-h-0"
            imageClassName="h-full w-full object-contain"
          />
        ) : undefined
      }
    />
  );

  const hasFirstModelPreview = modelCarouselItems.length > 0;
  const modelPipelineLoading =
    hasFirstModelPreview
      ? false
      : productSetPipelineActive && pipelineBusy
        ? true
        : modelGenerating;
  const modelShowCountdown =
    !hasFirstModelPreview &&
    (modelPipelineLoading || (productSetPipelineActive && pipelineBusy));
  const modelCountdownSec = STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC;
  const modelCountdownStart =
    productSetCountdownStartedAt ?? modelCountdownStartedAt;
  const modelCountdownText =
    productSetCountdownLabel ??
    (productSetPipelineActive ? cp.creatingSet : cp.creatingAiModel);

  const modelCard = (
    <PreviewCard
      {...previewPropsFor(modelPreviewAspect)}
      className={mobilePreviewCardClass}
      title={common.model}
      url={modelCarouselItems.length === 1 ? modelUrl : null}
      empty={
        productSetPipelineActive && pipelineBusy
          ? cp.startingSet
          : cp.afterGeneration
      }
      loading={modelPipelineLoading}
      loadingVariant={modelShowCountdown ? "countdown" : "spinner"}
      countdownSeconds={modelShowCountdown ? modelCountdownSec : undefined}
      countdownLabel={modelShowCountdown ? modelCountdownText : undefined}
      countdownStartedAt={modelShowCountdown ? modelCountdownStart : undefined}
      loadingSubdetail={modelLoadingSubdetail ?? tryOnProgress}
      content={
        modelCarouselItems.length > 0 ? (
          <PreviewImageCarousel
            items={modelCarouselItems}
            showDownloadActions={modelCarouselItems.length > 1}
            downloadFilenamePrefix="vitrina-ai-model"
            activeIndex={syncCarousel ? slideIndex : undefined}
            onActiveIndexChange={syncCarousel ? setSlideIndex : undefined}
            className="h-full min-h-0"
            imageClassName="h-full w-full object-contain"
          />
        ) : undefined
      }
      footer={
        modelCarouselItems.length > 0 && !modelGenerating && !pipelineBusy ? (
          <div className="flex w-full flex-col gap-2">
            {onDownloadAllModels && modelCarouselItems.length > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 w-full text-xs"
                onClick={onDownloadAllModels}
              >
                {common.downloadAll}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={onReplaceModel}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {cp.changeModel}
            </Button>
          </div>
        ) : undefined
      }
    />
  );

  const activeResultUrl =
    resultCarouselItems.length > 1
      ? (resultCarouselItems[slideIndex]?.url ?? resultUrl)
      : resultUrl;

  const resultCard = (
    <PreviewCard
      {...previewPropsFor(resultPreviewAspect)}
      className={mobilePreviewCardClass}
      title={cp.finalResult}
      url={resultCarouselItems.length === 1 ? resultUrl : null}
      empty={cp.createOnModel}
      loading={pipelineBusy && !activeResultUrl}
      loadingVariant="countdown"
      countdownSeconds={
        productSetCountdownSeconds ?? STUDIO_PIPELINE_COUNTDOWN_15_MIN_SEC
      }
      countdownLabel={
        productSetPipelineActive
          ? (tryOnProgress ?? cp.creatingSetProgress)
          : copy.actions.createOnModel
      }
      countdownStartedAt={
        productSetCountdownStartedAt ?? pipelineCountdownStartedAt
      }
      loadingDetail={tryOnProgress}
      content={
        resultCarouselItems.length > 1 ? (
          <PreviewImageCarousel
            items={resultCarouselItems}
            downloadFilenamePrefix="vitrina-ai-tryon"
            showDownloadActions={false}
            activeIndex={syncCarousel ? slideIndex : undefined}
            onActiveIndexChange={syncCarousel ? setSlideIndex : undefined}
            className="h-full min-h-0"
            imageClassName="h-full w-full object-contain"
          />
        ) : undefined
      }
      footer={
        activeResultUrl ? (
          <TryOnResultActions
            onDownload={onDownloadResult}
            onDownloadAll={onDownloadAllResults}
            onStartOver={onStartOver}
          />
        ) : undefined
      }
    />
  );

  let mobileCard: ReactNode = null;
  if (activeTab === "product") mobileCard = productCard;
  else if (activeTab === "model") mobileCard = modelCard;
  else mobileCard = resultCard;

  const progressRail =
    productSetSlots.length > 1 ? (
      <ProductSetProgressRail
        slots={productSetSlots}
        activeIndex={productSetActiveIndex}
        detail={tryOnProgress}
      />
    ) : null;

  return (
    <>
      {progressRail ? (
        <div className="mb-4 w-full max-w-[656px]">{progressRail}</div>
      ) : null}
      {/* Desktop: source 2-in-1 + result separate */}
      <div className="hidden w-full max-w-[656px] items-start gap-4 lg:flex">
        <div className="w-[320px] shrink-0">
          <PreviewTabBar
            tabs={desktopSourceTabs}
            activeTab={desktopSourceTab}
            tabReady={tabReady}
            aspectLabel={
              desktopSourceTab === "product"
                ? productPreviewAspect.badge
                : modelPreviewAspect.badge
            }
            onTabChange={onTabChange}
          />
          <div role="tabpanel">
            {desktopSourceTab === "product" ? productCard : modelCard}
          </div>
        </div>

        <div className="w-[320px] shrink-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center justify-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50">
              <span className="text-xs font-semibold text-slate-800">
                {common.result}
              </span>
            </div>
            <AspectBadge label={resultPreviewAspect.badge} />
          </div>
          <div aria-label={cp.finalResultAria}>{resultCard}</div>
        </div>
      </div>

      {/* Mobile: full-width segmented tabs + preview */}
      <div className="flex w-full flex-col max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] lg:hidden">
        <PreviewTabBar
          tabs={mobileTabs}
          activeTab={activeTab}
          tabReady={tabReady}
          onTabChange={onTabChange}
          fullWidth
        />
        <div role="tabpanel" className="w-full min-w-0">
          {mobileCard}
        </div>
      </div>
    </>
  );
}
