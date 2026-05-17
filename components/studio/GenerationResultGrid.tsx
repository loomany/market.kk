"use client";

import { useState } from "react";
import {
  Download,
  Eraser,
  ExternalLink,
  ImageOff,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { StudioResultImage } from "./types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductShotCreativeReview } from "./ProductShotCreativeReview";
import { cn } from "@/lib/utils";

type GenerationResultGridProps = {
  results: StudioResultImage[];
  loading?: boolean;
  showRegenerate?: boolean;
  regenerateLoading?: boolean;
  isProductShotMode?: boolean;
  onAccept: (resultId: string) => void;
  onReject: (resultId: string) => void;
  onRegenerate?: () => void;
  onRemoveBackground: (resultId: string) => void;
};

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

const STATUS_LABELS = {
  pending_review: "На проверке",
  accepted: "Принято",
  rejected: "Отклонено",
} as const;

const STATUS_VARIANTS = {
  pending_review: "warning",
  accepted: "success",
  rejected: "danger",
} as const;

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
  onAccept,
  onReject,
  onRegenerate,
  onRemoveBackground,
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
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
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

      <div className="grid gap-5 lg:grid-cols-2">
        {results.map((result, index) => {
          const label = result.label ?? `Вариант ${index + 1}`;
          const canAccept = result.reviewStatus !== "accepted";
          const canReject = result.reviewStatus !== "rejected";
          const canDownload = result.reviewStatus === "accepted";
          const removedUrl =
            result.cutoutPreviewUrl ?? result.backgroundRemovedUrl;
          const fidelityBadge =
            result.productShotFidelity === "exact-card"
              ? "Точная карточка"
              : result.productShotFidelity === "creative-scene"
                ? "Креативная сцена — проверьте товар"
                : null;
          const manualMaskBadge = result.manualMaskUsed
            ? "Товар выделен вручную"
            : null;
          const selectedPreview = result.selectedProductPreviewUrl;
          const providerLabel =
            result.provider === "mock"
              ? "Превью"
              : result.provider === "fal"
                ? "AI"
                : result.provider;
          const providerVariant =
            result.provider === "mock"
              ? "violet"
              : result.provider === "fal"
                ? "success"
                : "outline";

          return (
            <article
              key={result.id}
              className={cn(
                "overflow-hidden rounded-[24px] border bg-white shadow-xl shadow-slate-200/60",
                result.reviewStatus === "rejected"
                  ? "border-red-200"
                  : "border-border"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{label}</Badge>
                  {providerLabel && (
                    <Badge variant={providerVariant}>{providerLabel}</Badge>
                  )}
                  {fidelityBadge && (
                    <Badge
                      variant={
                        result.productShotFidelity === "exact-card"
                          ? "success"
                          : "warning"
                      }
                    >
                      {fidelityBadge}
                    </Badge>
                  )}
                  {manualMaskBadge && (
                    <Badge variant="violet">{manualMaskBadge}</Badge>
                  )}
                </div>
                <Badge variant={STATUS_VARIANTS[result.reviewStatus]}>
                  {STATUS_LABELS[result.reviewStatus]}
                </Badge>
              </div>

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
                {selectedPreview && (
                  <div>
                    <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                      Выделенный товар
                    </p>
                    <div
                      className="rounded-[18px] bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <ResultImage
                        imageKey={`${result.id}:selected`}
                        url={selectedPreview}
                        alt={`${label}: выделенный товар`}
                        className="max-h-[360px] min-h-[180px] w-full rounded-[18px] object-contain"
                        failed={Boolean(failedImages[`${result.id}:selected`])}
                        onFail={markImageFailed}
                      />
                    </div>
                  </div>
                )}

                {removedUrl && isProductShotMode && (
                  <div>
                    <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                      Вырезка без фона
                    </p>
                    <div
                      className="rounded-[18px] bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <ResultImage
                        imageKey={`${result.id}:removed`}
                        url={removedUrl}
                        alt={`${label}: вырезка без фона`}
                        className="max-h-[360px] min-h-[180px] w-full rounded-[18px] object-contain"
                        failed={Boolean(failedImages[`${result.id}:removed`])}
                        onFail={markImageFailed}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                    {isProductShotMode &&
                    result.productShotFidelity === "exact-card"
                      ? "Готовая карточка"
                      : "Готовый вариант"}
                  </p>
                  <ResultImage
                    imageKey={`${result.id}:main`}
                    url={result.url}
                    alt={`${label}: готовый вариант`}
                    className="max-h-[560px] min-h-[260px] w-full rounded-[18px] bg-slate-50 object-contain"
                    failed={Boolean(failedImages[`${result.id}:main`])}
                    onFail={markImageFailed}
                  />
                </div>

                {removedUrl && !isProductShotMode && (
                  <div>
                    <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                      PNG без фона
                    </p>
                    <div
                      className="rounded-[18px] bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <ResultImage
                        imageKey={`${result.id}:removed`}
                        url={removedUrl}
                        alt={`${label}: изображение без фона`}
                        className="max-h-[560px] min-h-[260px] w-full rounded-[18px] object-contain"
                        failed={Boolean(failedImages[`${result.id}:removed`])}
                        onFail={markImageFailed}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-border/70 p-4">
                {isProductShotMode &&
                  result.productShotFidelity === "creative-scene" && (
                    <ProductShotCreativeReview />
                  )}

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canAccept}
                    onClick={() => onAccept(result.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Принять
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canReject}
                    onClick={() => onReject(result.id)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Отклонить
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={!canDownload}
                  title={
                    !canDownload ? "Сначала нажмите «Принять»" : undefined
                  }
                  onClick={() =>
                    canDownload
                      ? downloadPng(result.url, `${result.id}.png`)
                      : undefined
                  }
                >
                  <Download className="h-4 w-4" />
                  Скачать
                </Button>

                {!removedUrl && !isProductShotMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    loading={result.backgroundRemoveLoading}
                    onClick={() => onRemoveBackground(result.id)}
                  >
                    <Eraser className="h-4 w-4" />
                    Удалить фон
                  </Button>
                )}

                {result.backgroundRemoveError && (
                  <p className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                    {result.backgroundRemoveError}
                  </p>
                )}

                {removedUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={!canDownload}
                    title={
                      !canDownload
                        ? "Сначала примите результат после проверки"
                        : undefined
                    }
                    onClick={() =>
                      canDownload
                        ? downloadPng(removedUrl, `${result.id}-no-bg.png`)
                        : undefined
                    }
                  >
                    <Download className="h-4 w-4" />
                    Скачать PNG без фона
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
