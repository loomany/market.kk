"use client";

import { useMemo, type ReactNode } from "react";
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
}: {
  label: string;
  active: boolean;
  ready: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-xs font-medium transition",
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-600 hover:text-slate-900"
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
}: {
  tabs: { id: ClothingPreviewTabId; label: string }[];
  activeTab: ClothingPreviewTabId;
  tabReady: Record<ClothingPreviewTabId, boolean>;
  onTabChange: (tab: ClothingPreviewTabId) => void;
  aspectLabel: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div
        role="tablist"
        aria-label="Превью пайплайна"
        className="flex min-w-0 flex-1 gap-0.5 rounded-lg bg-slate-100/90 p-0.5 ring-1 ring-slate-200/50"
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            ready={tabReady[tab.id]}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
      <AspectBadge label={aspectLabel} />
    </div>
  );
}

const previewCardShared = { compact: true, scrollableViewport: true as const };

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

  const mobileActiveAspect = useMemo((): PreviewAspectState => {
    switch (activeTab) {
      case "product":
        return productPreviewAspect;
      case "model":
        return modelPreviewAspect;
      case "result":
        return resultPreviewAspect;
    }
  }, [activeTab, modelPreviewAspect, productPreviewAspect, resultPreviewAspect]);

  const previewPropsFor = (aspect: PreviewAspectState) => ({
    ...previewCardShared,
    viewportAspect: DEFAULT_PREVIEW_ASPECT,
    viewportAspectRatio: aspect.ratio,
    aspectBadge: aspect.badge,
  });

  const productCard = (
    <PreviewCard
      {...previewPropsFor(productPreviewAspect)}
      className="w-full"
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
      className="w-full"
      title="AI-модель"
      url={modelCarouselItems.length === 1 ? modelUrl : null}
      empty="Появится после генерации"
      loading={modelGenerating}
      loadingVariant="countdown"
      countdownSeconds={SAAS_MODEL_GENERATION_COUNTDOWN_SEC}
      countdownLabel="Создаём AI-модель"
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
      className="w-full"
      title="Итоговый результат"
      url={resultUrl}
      empty="Создайте фото на модели"
      loading={pipelineBusy && !resultUrl}
      loadingVariant="countdown"
      countdownLabel="Создаём фото на модели"
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

      {/* Mobile: 3 tabs in one column */}
      <div className="w-full max-w-[320px] lg:hidden">
        <PreviewTabBar
          tabs={MOBILE_TABS}
          activeTab={activeTab}
          tabReady={tabReady}
          aspectLabel={mobileActiveAspect.badge}
          onTabChange={onTabChange}
        />
        <div role="tabpanel">{mobileCard}</div>
      </div>
    </>
  );
}
