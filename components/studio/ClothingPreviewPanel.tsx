"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import { SAAS_MODEL_GENERATION_COUNTDOWN_SEC } from "@/lib/studio/clothingTryOnEstimates";
import {
  DEFAULT_PREVIEW_ASPECT,
  previewAspectFromFal,
  type PreviewAspectState,
} from "@/lib/studio/previewImageAspect";
import { usePreviewImageAspect } from "@/lib/studio/usePreviewImageAspect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PreviewCard } from "@/components/studio/PreviewCard";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "@/components/studio/PreviewImageCarousel";
import { TryOnResultActions } from "@/components/studio/TryOnResultActions";

export type ClothingPreviewTabId = "product" | "model" | "result";

const MOBILE_TABS: { id: ClothingPreviewTabId; label: string }[] = [
  { id: "product", label: "Товар" },
  { id: "model", label: "Модель" },
  { id: "result", label: "Итог" },
];

const DESKTOP_SOURCE_TABS: { id: "product" | "model"; label: string }[] = [
  { id: "product", label: "Товар" },
  { id: "model", label: "Модель" },
];

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
  tryOnProgress: string | null;
  onDownloadResult: () => void;
  onStartOver: () => void;
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
          aria-label="Есть превью"
        />
      ) : null}
    </button>
  );
}

function AspectBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50"
      aria-label={`Формат ${label}`}
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
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        fullWidth ? "mb-3 w-full" : "mb-2"
      )}
    >
      <div
        role="tablist"
        aria-label="Превью пайплайна"
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
  tryOnProgress,
  onDownloadResult,
  onStartOver,
}: ClothingPreviewPanelProps) {
  const defaultAspect = previewAspectFromFal(DEFAULT_PREVIEW_ASPECT);
  const outputAspect = previewAspectFromFal(modelOutputAspect);

  const productAspect = usePreviewImageAspect(
    productUrl,
    DEFAULT_PREVIEW_ASPECT
  );
  const modelAspect = usePreviewImageAspect(modelUrl, modelOutputAspect);
  const resultAspect = usePreviewImageAspect(resultUrl, modelOutputAspect);

  const productPreviewAspect = productUrl ? productAspect : defaultAspect;
  const modelPreviewAspect = modelUrl ? modelAspect : outputAspect;
  const resultPreviewAspect = resultUrl ? resultAspect : outputAspect;

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
      title="Товар"
      url={productCarouselItems.length === 1 ? productUrl : null}
      empty="Загрузите фото"
      content={
        productCarouselItems.length > 1 ? (
          <PreviewImageCarousel
            items={productCarouselItems}
            showDownloadActions={false}
            className="h-full min-h-0"
            imageClassName="h-full w-full object-contain"
          />
        ) : undefined
      }
    />
  );

  const modelCard = (
    <PreviewCard
      {...previewPropsFor(modelPreviewAspect)}
      className={mobilePreviewCardClass}
      title="AI-модель"
      url={modelCarouselItems.length === 1 ? modelUrl : null}
      empty="Появится после генерации"
      loading={modelGenerating}
      loadingVariant="countdown"
      countdownSeconds={SAAS_MODEL_GENERATION_COUNTDOWN_SEC}
      countdownLabel="Создаём AI-модель"
      countdownStartedAt={modelCountdownStartedAt}
      loadingSubdetail={modelLoadingSubdetail}
      content={
        modelCarouselItems.length > 1 ? (
          <PreviewImageCarousel
            items={modelCarouselItems}
            showDownloadActions={false}
            className="h-full min-h-0"
            imageClassName="h-full w-full object-contain"
          />
        ) : undefined
      }
      footer={
        modelCarouselItems.length > 0 && !modelGenerating && !pipelineBusy ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={onReplaceModel}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Заменить модель
          </Button>
        ) : undefined
      }
    />
  );

  const resultCard = (
    <PreviewCard
      {...previewPropsFor(resultPreviewAspect)}
      className={mobilePreviewCardClass}
      title="Итоговый результат"
      url={resultUrl}
      empty="Создайте фото на модели"
      loading={pipelineBusy && !resultUrl}
      loadingVariant="countdown"
      countdownLabel="Создаём фото на модели"
      countdownStartedAt={pipelineCountdownStartedAt}
      loadingDetail={tryOnProgress}
      footer={
        resultUrl ? (
          <TryOnResultActions
            onDownload={onDownloadResult}
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

  return (
    <>
      {/* Desktop: source 2-in-1 + result separate */}
      <div className="hidden w-full max-w-[656px] items-start gap-4 lg:flex">
        <div className="w-[320px] shrink-0">
          <PreviewTabBar
            tabs={DESKTOP_SOURCE_TABS}
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
              <span className="text-xs font-semibold text-slate-800">Итог</span>
            </div>
            <AspectBadge label={resultPreviewAspect.badge} />
          </div>
          <div aria-label="Итоговый результат">{resultCard}</div>
        </div>
      </div>

      {/* Mobile: full-width segmented tabs + preview */}
      <div className="flex w-full flex-col max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] lg:hidden">
        <PreviewTabBar
          tabs={MOBILE_TABS}
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
