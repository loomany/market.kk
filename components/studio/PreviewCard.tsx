import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import { falAspectToNumber } from "@/lib/studio/previewImageAspect";
import { previewViewportAspectClass } from "@/lib/studio/previewViewportAspect";
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
  /** Format label in header (e.g. 9:16) */
  aspectBadge?: string;
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
  countdownStartedAt?: number | null;
  /**
   * Fixed aspect viewport — height follows column width (SaaS catalog preview).
   * Matches pipeline output (9:16, 3:4, …) so images are not cropped.
   */
  viewportAspect?: FalModelAspectRatio;
  /** Tall viewport scrolls inside the card; page stays fixed (clothing SaaS grid). */
  scrollableViewport?: boolean;
  /** @deprecated use viewportAspect */
  catalogViewport?: boolean;
  /** Tabbed sidebar: no card header, shorter viewport */
  compact?: boolean;
  /** Exact CSS aspect-ratio (width/height); overrides viewportAspect tailwind class */
  viewportAspectRatio?: number;
  className?: string;
};

function PreviewLoadingOverlay({
  detail,
  subdetail,
  fullBleed,
  variant = "spinner",
  countdownSeconds = SAAS_PIPELINE_COUNTDOWN_SEC,
  countdownLabel,
  countdownStartedAt,
}: {
  detail: string;
  subdetail?: string | null;
  fullBleed?: boolean;
  variant?: "spinner" | "countdown";
  countdownSeconds?: number;
  countdownLabel?: string;
  countdownStartedAt?: number | null;
}) {
  if (variant === "countdown" && !fullBleed) {
    return (
      <SaasPipelineCountdown
        totalSeconds={countdownSeconds}
        label={countdownLabel ?? detail}
        startedAt={countdownStartedAt}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-6 text-center",
        fullBleed
          ? "absolute inset-x-0 bottom-0 z-10 border-t border-teal-100/90 bg-white/95 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          : "h-full min-h-0 flex-1"
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

function AspectBox({
  aspectClass,
  aspectRatio,
  children,
}: {
  aspectClass: string;
  aspectRatio?: number;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("relative w-full shrink-0", !aspectRatio && aspectClass)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function PreviewViewportFrame({
  children,
  aspectClass,
  aspectRatio,
  scrollable,
  compact,
  compactPlaceholder,
}: {
  children: ReactNode;
  aspectClass: string;
  aspectRatio?: number;
  /** Internal scroll only when preview is taller than the cap (image loaded). */
  scrollable?: boolean;
  compact?: boolean;
  /** Empty / loading — use target aspect ratio at compact width */
  compactPlaceholder?: boolean;
}) {
  const scrollMaxClass = compact
    ? "max-h-[min(46dvh,360px)]"
    : "max-h-[min(72dvh,560px)]";

  const frameChrome =
    "border-t border-slate-100/90 bg-gradient-to-b from-slate-50 via-white to-slate-100/80";

  if (compact && compactPlaceholder) {
    return (
      <div className={cn("relative w-full overflow-hidden", frameChrome)}>
        <AspectBox aspectClass={aspectClass} aspectRatio={aspectRatio}>
          {children}
        </AspectBox>
      </div>
    );
  }

  if (scrollable) {
    return (
      <div
        className={cn(
          "relative overflow-y-auto",
          scrollMaxClass,
          frameChrome,
          "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80"
        )}
      >
        <AspectBox aspectClass={aspectClass} aspectRatio={aspectRatio}>
          {children}
        </AspectBox>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full shrink-0 overflow-hidden", frameChrome)}>
      <AspectBox aspectClass={aspectClass} aspectRatio={aspectRatio}>
        {children}
      </AspectBox>
    </div>
  );
}

export function PreviewCard({
  title,
  url,
  empty,
  badge,
  aspectBadge,
  footer,
  content,
  loading = false,
  loadingDetail = null,
  loadingSubdetail = null,
  loadingVariant = "spinner",
  countdownSeconds = SAAS_PIPELINE_COUNTDOWN_SEC,
  countdownLabel,
  countdownStartedAt,
  viewportAspect,
  scrollableViewport = false,
  catalogViewport = false,
  compact = false,
  viewportAspectRatio,
  className,
}: PreviewCardProps) {
  const resolvedAspect =
    viewportAspect ?? (catalogViewport ? ("3:4" as FalModelAspectRatio) : undefined);
  const useFixedViewport = Boolean(resolvedAspect || viewportAspectRatio);
  const aspectClass = resolvedAspect
    ? previewViewportAspectClass(resolvedAspect)
    : "aspect-[3/4]";
  const resolvedAspectRatio =
    viewportAspectRatio ??
    (resolvedAspect ? undefined : 3 / 4);

  const hasPreview = Boolean(content || url);
  const loadingText = loadingDetail?.trim() || "Генерируем…";
  const subdetail =
    loadingSubdetail?.trim() ||
    (loading && hasPreview ? "Остальные ракурсы ещё генерируются…" : null);

  const previewBody = content ? (
    <div className="flex h-full min-h-0 flex-1 flex-col">{content}</div>
  ) : url ? (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center p-2 sm:p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Предпросмотр: ${title}`}
        className="h-full w-full object-contain"
      />
    </div>
  ) : loading ? (
    <PreviewLoadingOverlay
      detail={loadingText}
      subdetail={subdetail}
      variant={loadingVariant}
      countdownSeconds={countdownSeconds}
      countdownLabel={countdownLabel}
      countdownStartedAt={countdownStartedAt}
    />
  ) : (
    <div className="flex h-full min-h-0 flex-1 items-center justify-center p-3">
      <p
        className={cn(
          "text-center text-slate-500",
          compact ? "text-xs leading-5" : "text-sm leading-6"
        )}
      >
        {empty}
      </p>
    </div>
  );

  const hideHeader = compact;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden",
        compact ? "rounded-2xl" : "rounded-[20px]",
        "border border-slate-200/90 bg-white shadow-sm shadow-slate-200/50 ring-1 ring-slate-100/80",
        className
      )}
    >
      {!hideHeader ? (
        <div className={cn(studioColumnHeaderClass, "shrink-0 justify-between gap-3")}>
          <p className={studioColumnTitleClass}>{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            {aspectBadge ? (
              <Badge variant="outline" className="font-mono text-[11px] tabular-nums">
                {aspectBadge}
              </Badge>
            ) : null}
            {badge ? <Badge variant="violet">{badge}</Badge> : null}
          </div>
        </div>
      ) : null}

      {useFixedViewport ? (
        <PreviewViewportFrame
          aspectClass={aspectClass}
          aspectRatio={
            viewportAspectRatio ??
            (resolvedAspect ? falAspectToNumber(resolvedAspect) : resolvedAspectRatio)
          }
          scrollable={scrollableViewport && hasPreview}
          compact={compact}
          compactPlaceholder={compact && !hasPreview}
        >
          {previewBody}
          {loading && hasPreview && loadingVariant === "spinner" ? (
            <PreviewLoadingOverlay
              detail={loadingText}
              subdetail={subdetail}
              fullBleed
              variant="spinner"
            />
          ) : null}
        </PreviewViewportFrame>
      ) : (
        <div className="relative flex min-h-[280px] flex-1 flex-col border-t border-slate-100/90 bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
          {previewBody}
          {loading && hasPreview && loadingVariant === "spinner" ? (
            <PreviewLoadingOverlay
              detail={loadingText}
              subdetail={subdetail}
              fullBleed
              variant="spinner"
            />
          ) : null}
        </div>
      )}

      {footer ? (
        <div
          className={cn(
            "shrink-0 border-t border-border/70 bg-white",
            compact ? "p-2" : "p-3"
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function ResultCompareSkeleton({ title = "Результат" }: { title?: string }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
      <div className={cn(studioColumnHeaderClass, "shrink-0")}>
        <p className={studioColumnTitleClass}>{title}</p>
      </div>
      <div className="border-t border-slate-100/90 bg-slate-50 p-4">
        <div className="aspect-[3/4] w-full animate-pulse rounded-[18px] bg-slate-200" />
      </div>
    </div>
  );
}
