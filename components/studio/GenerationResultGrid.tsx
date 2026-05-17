"use client";

import {
  Download,
  Eraser,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { QualityChecklistKey, StudioResultImage } from "./types";
import { isChecklistComplete } from "@/lib/ai/qualityChecklist";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QualityChecklist } from "./QualityChecklist";
import { cn } from "@/lib/utils";

type GenerationResultGridProps = {
  results: StudioResultImage[];
  loading?: boolean;
  showRegenerate?: boolean;
  regenerateLoading?: boolean;
  onChecklistChange: (
    resultId: string,
    key: QualityChecklistKey,
    value: boolean
  ) => void;
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

export function GenerationResultGrid({
  results,
  loading,
  showRegenerate = true,
  regenerateLoading,
  onChecklistChange,
  onAccept,
  onReject,
  onRegenerate,
  onRemoveBackground,
}: GenerationResultGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-[22px] border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-6 text-teal-950">
          Создаём изображение. В демо-режиме это быстро, в реальном AI-режиме
          обработка может занять больше времени.
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
      <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-950">
        Скачивание доступно после ручной проверки. Отметьте все пункты
        чеклиста, если фото выглядит правильно. Если AI исказил товар —
        нажмите “Отклонить” или “Сгенерировать ещё”.
      </div>

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
          const checklistDone = isChecklistComplete(result.checklist);
          const canAccept =
            result.reviewStatus !== "accepted" && checklistDone;
          const canDownload = result.reviewStatus === "accepted";
          const removedUrl = result.backgroundRemovedUrl;

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
                <Badge variant="outline">{label}</Badge>
                <Badge variant={STATUS_VARIANTS[result.reviewStatus]}>
                  {STATUS_LABELS[result.reviewStatus]}
                </Badge>
              </div>

              <div className="space-y-3 p-3">
                <div>
                  <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                    Готовый вариант
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.url}
                    alt={`${label}: готовый вариант`}
                    className="aspect-[3/4] w-full rounded-[18px] object-cover"
                  />
                </div>

                {removedUrl && (
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={removedUrl}
                        alt={`${label}: изображение без фона`}
                        className="aspect-[3/4] w-full rounded-[18px] object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-border/70 p-4">
                <QualityChecklist
                  checklist={result.checklist}
                  onChange={(key, value) =>
                    onChecklistChange(result.id, key, value)
                  }
                  compact
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canAccept}
                    title={
                      !checklistDone
                        ? "Сначала отметьте все пункты чеклиста"
                        : undefined
                    }
                    onClick={() => onAccept(result.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Принять
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
                    !canDownload
                      ? "Сначала примите результат после проверки"
                      : undefined
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

                {!removedUrl && (
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
