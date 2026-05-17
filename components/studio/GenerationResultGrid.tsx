"use client";

import { Download, Eraser, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
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

const STATUS_STYLES = {
  pending_review: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

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
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Результаты появятся после генерации
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

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((result, index) => {
          const label = result.label ?? `Вариант ${index + 1}`;
          const checklistDone = isChecklistComplete(result.checklist);
          const canAccept =
            result.reviewStatus !== "accepted" && checklistDone;
          const canDownload = result.reviewStatus === "accepted";
          const removedUrl = result.backgroundRemovedUrl;

          return (
            <div
              key={result.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-md",
                result.reviewStatus === "rejected"
                  ? "border-red-200 opacity-90"
                  : "border-slate-200"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
                <Badge variant="violet">{label}</Badge>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_STYLES[result.reviewStatus]
                  )}
                >
                  {STATUS_LABELS[result.reviewStatus]}
                </span>
              </div>

              <div className="space-y-2 p-2">
                <p className="px-1 text-xs font-medium text-slate-500">
                  Original
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt={label}
                  className="aspect-[3/4] w-full rounded-lg object-cover"
                />

                {removedUrl && (
                  <>
                    <p className="px-1 text-xs font-medium text-slate-500">
                      Background removed
                    </p>
                    <div
                      className="rounded-lg bg-[length:12px_12px] bg-[position:0_0,6px_6px]"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={removedUrl}
                        alt={`${label} без фона`}
                        className="aspect-[3/4] w-full rounded-lg object-contain"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3 border-t border-slate-100 p-3">
                <QualityChecklist
                  checklist={result.checklist}
                  onChange={(key, value) =>
                    onChecklistChange(result.id, key, value)
                  }
                  compact
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canAccept}
                    title={
                      !checklistDone
                        ? "Сначала отметьте все проверки"
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
                  <p className="text-xs text-red-600">
                    {result.backgroundRemoveError}
                  </p>
                )}

                {removedUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadPng(removedUrl, `${result.id}-no-bg.png`)
                    }
                  >
                    <Download className="h-4 w-4" />
                    Скачать PNG без фона
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
