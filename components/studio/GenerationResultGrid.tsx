"use client";

import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import {
  Download,
  ExternalLink,
  ImageOff,
  RotateCcw,
} from "lucide-react";
import type { StudioResultImage } from "./types";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "./PreviewImageCarousel";
import {
  PreviewCard,
  ResultCompareSkeleton,
} from "./PreviewCard";
import { Button } from "@/components/ui/Button";
import { downloadImageFile } from "@/lib/studio/downloadImages";
import { TryOnResultActions } from "@/components/studio/TryOnResultActions";
import { cn } from "@/lib/utils";
type GenerationResultGridProps = {
  results: StudioResultImage[];
  loading?: boolean;
  loadingDetail?: string | null;
  isProductShotMode?: boolean;
  isClothingTryOnMode?: boolean;
  /** Side-by-side compare cards in studio (no extra outer frame) */
  embedded?: boolean;
  productPreviewUrl?: string | null;
  productPreviewItems?: PreviewCarouselItem[];
  onStartOver: () => void;
};

function ResultCompareGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2">{children}</div>
  );
}

function ProductCompareColumn({
  productPreviewUrl,
  productPreviewItems = [],
}: {
  productPreviewUrl: string | null | undefined;
  productPreviewItems?: PreviewCarouselItem[];
}) {
  const items =
    productPreviewItems.length > 0
      ? productPreviewItems
      : productPreviewUrl
        ? [
            {
              id: "product-single",
              url: productPreviewUrl,
              label: "Товар",
            },
          ]
        : [];

  return (
    <PreviewCard
      title="Товар"
      url={items.length === 1 ? (items[0]?.url ?? null) : null}
      empty="Загрузите фото товара"
      content={
        items.length > 1 ? (
          <PreviewImageCarousel
            items={items}
            downloadFilenamePrefix="vitrina-product"
            className="min-h-[260px]"
          />
        ) : undefined
      }
    />
  );
}

const checkerboardStyle = {
  backgroundImage:
    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
  backgroundColor: "#f8fafc",
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 6px 6px",
} as const;

function getExportPreviewSize(
  width: number,
  height: number,
  maxWidth = 340,
  maxHeight = 560
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function ExportSizeFrame({
  width,
  height,
  className,
  style,
  children,
}: {
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const preview = getExportPreviewSize(width, height);

  return (
    <div
      className={cn("mx-auto shrink-0 overflow-hidden rounded-[18px]", className)}
      style={{
        width: preview.width,
        height: preview.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ExactCardResultPanel({
  title,
  exportPreviewSize,
  onDownload,
  onStartOver,
  children,
}: {
  title: string;
  exportPreviewSize: { width: number; height: number };
  onDownload: () => void;
  onStartOver: () => void;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] border border-border bg-white p-4 shadow-xl shadow-slate-200/60">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 flex w-full flex-col items-center">{children}</div>
      <div
        className="mt-4 w-full"
        style={{ maxWidth: exportPreviewSize.width }}
      >
        <TryOnResultActions onDownload={onDownload} onStartOver={onStartOver} />
      </div>
    </article>
  );
}

function ResultImage({
  imageKey,
  url,
  alt,
  className,
  failed,
  onFail,
}: {
  imageKey: string;
  url: string;
  alt: string;
  className: string;
  failed: boolean;
  onFail: (imageKey: string) => void;
}) {
  if (failed) {
    return (
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <ImageOff className="h-8 w-8 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Изображение не загрузилось
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Ссылка есть, но браузер не смог показать файл.
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-border bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
        >
          <ExternalLink className="h-4 w-4" />
          Открыть в новой вкладке
        </a>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => onFail(imageKey)}
    />
  );
}

function ResultAlerts({
  result,
  isClothingTryOnMode,
}: {
  result: StudioResultImage;
  isClothingTryOnMode?: boolean;
}) {
  return (
    <>
      {result.provider === "mock" && !isClothingTryOnMode && (
        <div className="rounded-[18px] border border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-800">
          Демо: показан тестовый пример без списаний.
        </div>
      )}
      {result.exactCardWithoutMask &&
        result.productShotFidelity === "exact-card" && (
          <div className="rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            Карточка создана без ручного выделения. Проверьте, не попали ли
            лишние предметы.
          </div>
        )}
    </>
  );
}

export function GenerationResultGrid({
  results,
  loading,
  loadingDetail,
  isProductShotMode = false,
  isClothingTryOnMode = false,
  embedded = false,
  productPreviewUrl = null,
  productPreviewItems = [],
  onStartOver,
}: GenerationResultGridProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const markImageFailed = (imageKey: string) => {
    setFailedImages((prev) => ({ ...prev, [imageKey]: true }));
  };

  const clothingEmbedded = embedded && isClothingTryOnMode;

  if (clothingEmbedded) {
    return null;
  }

  const loadingBanner = (
    <div className="mb-4 rounded-[22px] border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-6 text-teal-950">
      {loadingDetail ? (
        <p className="font-medium text-teal-950">{loadingDetail}</p>
      ) : null}
      <p className={loadingDetail ? "mt-1" : undefined}>
        Создаём изображение. Обычно это занимает от нескольких секунд до минуты —
        не закрывайте страницу, пока идёт обработка.
      </p>
    </div>
  );

  if (loading) {
    if (embedded) {
      return (
        <div>
          {loadingBanner}
          <ResultCompareGrid>
            <ProductCompareColumn
              productPreviewUrl={productPreviewUrl}
              productPreviewItems={productPreviewItems}
            />
            <ResultCompareSkeleton />
          </ResultCompareGrid>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {loadingBanner}
        <div className="grid grid-cols-1 gap-4">
          <div className="aspect-[3/4] animate-pulse rounded-[24px] bg-slate-200" />
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    if (clothingEmbedded) {
      return null;
    }

    if (embedded) {
      return (
        <ResultCompareGrid>
          <ProductCompareColumn
              productPreviewUrl={productPreviewUrl}
              productPreviewItems={productPreviewItems}
            />
          <PreviewCard
            title="Результат"
            url={null}
            empty="Здесь появится результат после генерации"
          />
        </ResultCompareGrid>
      );
    }

    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-border bg-slate-50 p-6 text-center">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-slate-950">
            Здесь появятся готовые варианты
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Загрузите товар, выберите режим и нажмите кнопку генерации.
          </p>
        </div>
      </div>
    );
  }

  const resultItems = results.map((result, index) => {
        const label = result.label ?? `Вариант ${index + 1}`;
        const removedUrl =
          result.cutoutPreviewUrl ?? result.backgroundRemovedUrl;
        const showExactCardRow =
          isProductShotMode &&
          result.productShotFidelity === "exact-card" &&
          Boolean(removedUrl && result.width && result.height);
        const exportPreviewSize =
          result.width && result.height
            ? getExportPreviewSize(result.width, result.height)
            : null;
        const resultTitle =
          label ?? (isProductShotMode ? "Готовая карточка" : "Результат");
        const resultActions = (
          <>
            <TryOnResultActions
              onDownload={() => void downloadImageFile(result.url, `${result.id}.png`)}
              onStartOver={onStartOver}
            />
          </>
        );
        const resultImageContent = (
          <div className="flex flex-1 items-center justify-center p-2">
            <ResultImage
              imageKey={`${result.id}:main`}
              url={result.url}
              alt={`${label}: готовый вариант`}
              className={cn(
                "max-h-[460px] w-full object-contain",
                isProductShotMode && "rounded-[18px]"
              )}
              failed={Boolean(failedImages[`${result.id}:main`])}
              onFail={markImageFailed}
            />
          </div>
        );

        if (embedded && showExactCardRow && result.width && result.height) {
          return (
            <div key={result.id} className="space-y-4">
              <ResultAlerts
                result={result}
                isClothingTryOnMode={isClothingTryOnMode}
              />
              <ResultCompareGrid>
                <ProductCompareColumn
              productPreviewUrl={productPreviewUrl}
              productPreviewItems={productPreviewItems}
            />
                <PreviewCard
                  title="Готовая карточка"
                  url={null}
                  empty=""
                  content={
                    <div className="flex flex-1 items-center justify-center p-4">
                      <ExportSizeFrame
                        width={result.width}
                        height={result.height}
                        className="bg-white ring-1 ring-slate-200"
                      >
                        <ResultImage
                          imageKey={`${result.id}:main`}
                          url={result.url}
                          alt={`${label}: готовая карточка`}
                          className="block h-full w-full"
                          failed={Boolean(failedImages[`${result.id}:main`])}
                          onFail={markImageFailed}
                        />
                      </ExportSizeFrame>
                    </div>
                  }
                  footer={resultActions}
                />
              </ResultCompareGrid>
              <PreviewCard
                title="PNG без фона"
                url={null}
                empty=""
                content={
                  <div className="flex flex-1 items-center justify-center p-4">
                    <ExportSizeFrame
                      width={result.width}
                      height={result.height}
                      style={checkerboardStyle}
                      className="bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                    >
                      <ResultImage
                        imageKey={`${result.id}:removed`}
                        url={removedUrl!}
                        alt={`${label}: PNG без фона`}
                        className="block h-full w-full"
                        failed={Boolean(
                          failedImages[`${result.id}:removed`]
                        )}
                        onFail={markImageFailed}
                      />
                    </ExportSizeFrame>
                  </div>
                }
                footer={
                  <TryOnResultActions
                    onDownload={() =>
                      void downloadImageFile(removedUrl!, `${result.id}-no-bg.png`)
                    }
                    onStartOver={onStartOver}
                  />
                }
              />
            </div>
          );
        }

        if (clothingEmbedded) {
          return (
            <div key={result.id} className="space-y-3">
              <ResultAlerts
                result={result}
                isClothingTryOnMode={isClothingTryOnMode}
              />
              <PreviewCard
                title={resultTitle}
                url={null}
                empty=""
                content={resultImageContent}
                footer={resultActions}
              />
            </div>
          );
        }

        if (embedded) {
          return (
            <div key={result.id} className="space-y-4">
              <ResultAlerts
                result={result}
                isClothingTryOnMode={isClothingTryOnMode}
              />
              <ResultCompareGrid>
                <ProductCompareColumn
              productPreviewUrl={productPreviewUrl}
              productPreviewItems={productPreviewItems}
            />
                <PreviewCard
                  title={resultTitle}
                  url={null}
                  empty=""
                  content={resultImageContent}
                  footer={resultActions}
                />
              </ResultCompareGrid>
            </div>
          );
        }

        if (showExactCardRow && result.width && result.height && exportPreviewSize) {
          return (
            <Fragment key={result.id}>
              {result.provider === "mock" && (
                <div
                  key={`${result.id}-mock`}
                  className="col-span-full rounded-[18px] border border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-800 lg:col-span-2"
                >
                  Показан тестовый пример. Для финального результата запустите
                  генерацию в студии.
                </div>
              )}
              {result.exactCardWithoutMask && (
                <div
                  key={`${result.id}-warn`}
                  className="col-span-full rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 lg:col-span-2"
                >
                  Карточка создана без ручного выделения. Проверьте, не попали
                  ли лишние предметы.
                </div>
              )}
              <ExactCardResultPanel
                key={`${result.id}-card`}
                title="Готовая карточка"
                exportPreviewSize={exportPreviewSize}
                onDownload={() => void downloadImageFile(result.url, `${result.id}.png`)}
                onStartOver={onStartOver}
              >
                <ExportSizeFrame
                  width={result.width}
                  height={result.height}
                  className="bg-white ring-1 ring-slate-200"
                >
                  <ResultImage
                    imageKey={`${result.id}:main`}
                    url={result.url}
                    alt={`${label}: готовая карточка`}
                    className="block h-full w-full"
                    failed={Boolean(failedImages[`${result.id}:main`])}
                    onFail={markImageFailed}
                  />
                </ExportSizeFrame>
              </ExactCardResultPanel>
              <ExactCardResultPanel
                key={`${result.id}-cutout`}
                title="PNG без фона"
                exportPreviewSize={exportPreviewSize}
                onDownload={() =>
                  void downloadImageFile(removedUrl!, `${result.id}-no-bg.png`)
                }
                onStartOver={onStartOver}
              >
                <ExportSizeFrame
                  width={result.width}
                  height={result.height}
                  style={checkerboardStyle}
                  className="bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                >
                  <ResultImage
                    imageKey={`${result.id}:removed`}
                    url={removedUrl!}
                    alt={`${label}: PNG без фона`}
                    className="block h-full w-full"
                    failed={Boolean(failedImages[`${result.id}:removed`])}
                    onFail={markImageFailed}
                  />
                </ExportSizeFrame>
              </ExactCardResultPanel>
            </Fragment>
          );
        }

        return (
          <article
            key={result.id}
            className="overflow-hidden rounded-[24px] border border-border bg-white shadow-xl shadow-slate-200/60"
          >
            {result.provider === "mock" && !isClothingTryOnMode && (
              <div className="border-b border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-800">
                Демо: показан тестовый пример без списаний.
              </div>
            )}

            {result.exactCardWithoutMask &&
              result.productShotFidelity === "exact-card" && (
                <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                  Карточка создана без ручного выделения. Проверьте, не попали
                  ли лишние предметы.
                </div>
              )}

            <div className="space-y-3 p-3">
              <div>
                <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                  {isProductShotMode ? "Готовая карточка" : "Готовый вариант"}
                </p>
                <div
                  className={cn(
                    "rounded-[18px]",
                    isProductShotMode
                      ? "bg-white ring-1 ring-slate-200"
                      : "bg-slate-50"
                  )}
                >
                  <ResultImage
                    imageKey={`${result.id}:main`}
                    url={result.url}
                    alt={`${label}: готовый вариант`}
                    className="max-h-[560px] min-h-[260px] w-full rounded-[18px] object-contain"
                    failed={Boolean(failedImages[`${result.id}:main`])}
                    onFail={markImageFailed}
                  />
                </div>
              </div>
            </div>

            {!showExactCardRow && (
              <div className="space-y-3 border-t border-border/70 p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => void downloadImageFile(result.url, `${result.id}.png`)}
                >
                  <Download className="h-4 w-4" />
                  Скачать
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onStartOver}
                >
                  <RotateCcw className="h-4 w-4" />
                  Начать сначала
                </Button>
              </div>
            )}
          </article>
        );
      });

  return (
    <div className="space-y-4">
      {embedded ? (
        resultItems
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{resultItems}</div>
      )}
    </div>
  );
}
