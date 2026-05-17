"use client";

import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import {
  Download,
  ExternalLink,
  ImageOff,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import type { StudioResultImage } from "./types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type GenerationResultGridProps = {
  results: StudioResultImage[];
  loading?: boolean;
  showRegenerate?: boolean;
  regenerateLoading?: boolean;
  isProductShotMode?: boolean;
  onStartOver: () => void;
  onRegenerate?: () => void;
};

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
        <ResultColumnActions onDownload={onDownload} onStartOver={onStartOver} />
      </div>
    </article>
  );
}

function ResultColumnActions({
  onDownload,
  onStartOver,
}: {
  onDownload: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onDownload}
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
  );
}

function downloadPng(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

export function GenerationResultGrid({
  results,
  loading,
  showRegenerate = true,
  regenerateLoading,
  isProductShotMode = false,
  onStartOver,
  onRegenerate,
}: GenerationResultGridProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const markImageFailed = (imageKey: string) => {
    setFailedImages((prev) => ({ ...prev, [imageKey]: true }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-[22px] border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-6 text-teal-950">
          Создаём изображение. Обычно это занимает от нескольких секунд до
          минуты — не закрывайте страницу, пока идёт обработка.
        </div>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 1 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-[24px] bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-slate-50 p-6 text-center">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-slate-950">
            Здесь появятся готовые варианты
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Загрузите товар, выберите режим и нажмите кнопку генерации.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showRegenerate && onRegenerate && (
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          loading={regenerateLoading}
          onClick={onRegenerate}
        >
          <RefreshCw className="h-4 w-4" />
          Сгенерировать ещё
        </Button>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {results.map((result, index) => {
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
                  onDownload={() => downloadPng(result.url, `${result.id}.png`)}
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
                    downloadPng(removedUrl!, `${result.id}-no-bg.png`)
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
              {result.provider === "mock" && (
                <div className="border-b border-violet-100 bg-violet-50 px-4 py-3 text-xs leading-5 text-violet-800">
                  Показан тестовый пример. Для финального результата запустите
                  генерацию в студии.
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
                <>
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

                  </>
              </div>

              {!showExactCardRow && (
              <div className="space-y-3 border-t border-border/70 p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => downloadPng(result.url, `${result.id}.png`)}
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
        })}
      </div>
    </div>
  );
}
