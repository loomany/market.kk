"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Film, ImageIcon } from "lucide-react";
import type { StudioSessionAsset } from "./types";
import {
  assetPreviewUrl,
  isVideoAsset,
} from "@/lib/studio/assetDisplayLabels";
import { POST_PROCESSING_COUNTDOWN_SEC } from "@/lib/studio/postProcessingEstimates";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function CompactCountdown({
  startedAt,
  totalSeconds,
  large = false,
}: {
  startedAt: string;
  totalSeconds: number;
  large?: boolean;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );
      setRemaining(Math.max(0, totalSeconds - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, totalSeconds]);

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums text-teal-800",
        large ? "text-5xl tracking-tight sm:text-6xl" : "text-lg"
      )}
    >
      {formatCountdown(remaining)}
    </span>
  );
}

export type StudioAssetMediaVariant = "thumb" | "gallery" | "hero";

type StudioAssetMediaViewProps = {
  asset: StudioSessionAsset;
  variant?: StudioAssetMediaVariant;
  /** Fill parent card edge-to-edge (post-processing desktop editor). */
  fillParent?: boolean;
  className?: string;
  circle?: boolean;
  /** Show prev/next when multiple frames (controlled by parent). */
  carouselIndex?: number;
  carouselTotal?: number;
  onCarouselPrev?: () => void;
  onCarouselNext?: () => void;
};

export function StudioAssetMediaView({
  asset,
  variant = "thumb",
  fillParent = false,
  className,
  circle = false,
  carouselIndex,
  carouselTotal = 1,
  onCarouselPrev,
  onCarouselNext,
}: StudioAssetMediaViewProps) {
  const { copy } = useStudioCopy();
  const s = copy.studioAssetPreview;
  const d = copy.postProcessingDesktop;
  const previewUrl = assetPreviewUrl(asset);
  const processing = asset.status === "processing";
  const errored = asset.status === "error";
  const isVideo = isVideoAsset(asset) && !processing && Boolean(asset.url);
  const imgFit = circle ? "object-cover" : "object-contain";
  const showCarousel = carouselTotal > 1 && onCarouselPrev && onCarouselNext;

  const sizeClass = circle
    ? ""
    : variant === "hero"
      ? fillParent
        ? "h-full min-h-0 flex-1"
        : "h-full min-h-[min(48vh,520px)]"
      : variant === "gallery"
        ? fillParent
          ? "h-full min-h-0 w-full flex-1"
          : "aspect-[9/16] w-full"
        : "h-36";

  const chromeClass = circle
    ? "rounded-full"
    : variant === "gallery"
      ? fillParent
        ? "h-full min-h-0 rounded-[16px] border border-slate-200/90"
        : "rounded-2xl border border-slate-200/90"
      : variant === "hero" && fillParent
        ? "rounded-none border-0 shadow-none"
        : "rounded-[20px] border border-border shadow-sm";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-50",
        chromeClass,
        sizeClass,
        className
      )}
    >
      {showCarousel ? (
        <>
          <button
            type="button"
            aria-label={d.carouselPrev}
            onClick={(e) => {
              e.stopPropagation();
              onCarouselPrev();
            }}
            className={cn(
              "absolute left-1.5 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-md transition hover:bg-white",
              variant === "gallery" ? "left-2 h-8 w-8" : "left-2 h-9 w-9"
            )}
          >
            <ChevronLeft className={variant === "gallery" ? "h-4 w-4" : "h-5 w-5"} />
          </button>
          <button
            type="button"
            aria-label={d.carouselNext}
            onClick={(e) => {
              e.stopPropagation();
              onCarouselNext();
            }}
            className={cn(
              "absolute right-1.5 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-md transition hover:bg-white",
              variant === "gallery" ? "right-2 h-8 w-8" : "right-2 h-9 w-9"
            )}
          >
            <ChevronRight className={variant === "gallery" ? "h-4 w-4" : "h-5 w-5"} />
          </button>
          <span className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {carouselIndex! + 1} / {carouselTotal}
          </span>
        </>
      ) : null}

      {processing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-50 to-teal-50/80 px-4 text-center">
          <div
            className="absolute inset-0 animate-pulse bg-slate-200/40"
            aria-hidden
          />
          <p
            className={cn(
              "relative z-10 font-medium text-slate-700",
              variant === "gallery" || variant === "hero"
                ? "text-sm"
                : "text-xs"
            )}
          >
            {s.processing}
          </p>
          {asset.startedAt ? (
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-slate-500",
                  variant === "gallery" || variant === "hero"
                    ? "text-xs"
                    : "text-[10px]"
                )}
              >
                {s.countdownHint}
              </span>
              <CompactCountdown
                startedAt={asset.startedAt}
                totalSeconds={POST_PROCESSING_COUNTDOWN_SEC}
                large={variant === "gallery" || variant === "hero"}
              />
            </div>
          ) : null}
        </div>
      ) : errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center text-red-700">
          <AlertCircle className="h-8 w-8" aria-hidden />
          <p className="text-xs font-medium">
            {asset.errorMessage?.trim() || s.failed}
          </p>
        </div>
      ) : isVideo && asset.url ? (
        <video
          src={asset.url}
          className={cn("absolute inset-0 h-full w-full", imgFit)}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          preload="metadata"
          poster={asset.sourceImageUrl}
        />
      ) : previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className={cn("absolute inset-0 h-full w-full", imgFit)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          {isVideoAsset(asset) ? (
            <Film className="h-10 w-10" aria-hidden />
          ) : (
            <ImageIcon className="h-10 w-10" aria-hidden />
          )}
        </div>
      )}
    </div>
  );
}
