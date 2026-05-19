import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  SaasPipelineCountdown,
  SAAS_PIPELINE_COUNTDOWN_SEC,
} from "@/components/studio/SaasPipelineCountdown";
import { cn } from "@/lib/utils";

/** Общая шапка колонки студии (как у шага «Фото товара») */
export const studioColumnHeaderClass =
  "flex min-h-[2.75rem] items-center gap-2.5 border-b border-slate-100 px-4 py-2.5 sm:px-5";

export const studioColumnTitleClass = "text-sm font-semibold text-slate-950";

type PreviewCardProps = {
  title: string;
  url: string | null;
  empty: string;
  badge?: string;
  footer?: ReactNode;
  /** Overrides url / empty when set (e.g. result with error fallback) */
  content?: ReactNode;
  loading?: boolean;
  loadingDetail?: string | null;
  /** Shown under loadingDetail when preview already has image(s) */
  loadingSubdetail?: string | null;
  loadingVariant?: "spinner" | "countdown";
  countdownSeconds?: number;
  countdownLabel?: string;
  /** Fixed 3:4 viewport so paired studio cards align in a row */
  catalogViewport?: boolean;
  className?: string;
};

function PreviewLoadingOverlay({
  detail,
  subdetail,
  fullBleed,
  variant = "spinner",
  countdownSeconds = SAAS_PIPELINE_COUNTDOWN_SEC,
  countdownLabel,
}: {
  detail: string;
  subdetail?: string | null;
  fullBleed?: boolean;
  variant?: "spinner" | "countdown";
  countdownSeconds?: number;
  countdownLabel?: string;
}) {
  if (variant === "countdown" && !fullBleed) {
    return (
      <SaasPipelineCountdown
        totalSeconds={countdownSeconds}
        label={countdownLabel ?? detail}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-6 text-center",
        fullBleed
          ? "absolute inset-x-0 bottom-0 z-10 border-t border-teal-100/90 bg-white/95 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          : "flex-1"
      )}
    >
      <Loader2
        className="h-8 w-8 animate-spin text-teal-600"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-800">{detail}</p>
      {subdetail ? (
        <p className="max-w-xs text-xs leading-5 text-slate-500">{subdetail}</p>
      ) : null}
    </div>
  );
}

export function PreviewCard({
  title,
  url,
  empty,
  badge,
  footer,
  content,
  loading = false,
  loadingDetail = null,
  loadingSubdetail = null,
  loadingVariant = "spinner",
  countdownSeconds = SAAS_PIPELINE_COUNTDOWN_SEC,
  countdownLabel,
  catalogViewport = false,
  className,
}: PreviewCardProps) {
  const hasPreview = Boolean(content || url);
  const loadingText = loadingDetail?.trim() || "Генерируем…";
  const subdetail =
    loadingSubdetail?.trim() ||
    (loading && hasPreview ? "Остальные ракурсы ещё генерируются…" : null);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm",
        className
      )}
    >
      <div className={cn(studioColumnHeaderClass, "shrink-0 justify-between")}>
        <p className={studioColumnTitleClass}>{title}</p>
        {badge ? <Badge variant="violet">{badge}</Badge> : null}
      </div>
      <div
        className={cn(
          "relative border-t border-border bg-slate-50",
          catalogViewport
            ? "aspect-[3/4] w-full"
            : "flex min-h-[260px] flex-1 flex-col"
        )}
      >
        {catalogViewport ? (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            {content ? (
              <div className="flex min-h-0 flex-1 flex-col">{content}</div>
            ) : url ? (
              <div className="flex flex-1 items-center justify-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Предпросмотр: ${title}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : loading ? (
              <PreviewLoadingOverlay
                detail={loadingText}
                subdetail={subdetail}
                variant={loadingVariant}
                countdownSeconds={countdownSeconds}
                countdownLabel={countdownLabel}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-4">
                <p className="text-center text-sm leading-6 text-slate-500">
                  {empty}
                </p>
              </div>
            )}
          </div>
        ) : content ? (
          content
        ) : url ? (
          <div className="flex flex-1 items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Предпросмотр: ${title}`}
              className="max-h-[460px] w-full object-contain"
            />
          </div>
        ) : loading ? (
          <PreviewLoadingOverlay
            detail={loadingText}
            subdetail={subdetail}
            variant={loadingVariant}
            countdownSeconds={countdownSeconds}
            countdownLabel={countdownLabel}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-sm leading-6 text-slate-500">
            {empty}
          </div>
        )}
        {loading && hasPreview && loadingVariant === "spinner" ? (
          <PreviewLoadingOverlay
            detail={loadingText}
            subdetail={subdetail}
            fullBleed
            variant="spinner"
          />
        ) : null}
      </div>
      {footer ? (
        <div className="shrink-0 border-t border-border/70 bg-white p-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function ResultCompareSkeleton({ title = "Результат" }: { title?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm">
      <div className={cn(studioColumnHeaderClass, "shrink-0")}>
        <p className={studioColumnTitleClass}>{title}</p>
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col border-t border-border bg-slate-50 p-4">
        <div className="aspect-[3/4] w-full animate-pulse rounded-[18px] bg-slate-200" />
      </div>
    </div>
  );
}
