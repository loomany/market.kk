"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Film, ImageIcon } from "lucide-react";
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
}: {
  startedAt: string;
  totalSeconds: number;
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
    <span className="font-mono text-lg font-semibold tabular-nums text-teal-800">
      {formatCountdown(remaining)}
    </span>
  );
}

type StudioAssetPreviewProps = {
  asset: StudioSessionAsset;
  className?: string;
  compact?: boolean;
  /** Render as a small circular avatar (object-cover). */
  circle?: boolean;
};

export function StudioAssetPreview({
  asset,
  className,
  compact = false,
  circle = false,
}: StudioAssetPreviewProps) {
  const { copy } = useStudioCopy();
  const s = copy.studioAssetPreview;
  const previewUrl = assetPreviewUrl(asset);
  const processing = asset.status === "processing";
  const errored = asset.status === "error";
  const isVideo = isVideoAsset(asset) && !processing && Boolean(asset.url);
  const imgFit = circle ? "object-cover" : "object-contain";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-50",
        circle
          ? "rounded-full"
          : "rounded-[16px] border border-border",
        circle ? "" : compact ? "h-36" : "h-40",
        className
      )}
    >
      {processing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-50 to-teal-50/80 px-3 text-center">
          <div
            className="absolute inset-0 animate-pulse bg-slate-200/40"
            aria-hidden
          />
          <p className="relative z-10 text-xs font-medium text-slate-700">
            {s.processing}
          </p>
          {asset.startedAt ? (
            <div className="relative z-10">
              <CompactCountdown
                startedAt={asset.startedAt}
                totalSeconds={POST_PROCESSING_COUNTDOWN_SEC}
              />
            </div>
          ) : null}
        </div>
      ) : errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center text-red-700">
          <AlertCircle className="h-8 w-8" aria-hidden />
          <p className="text-xs font-medium">{s.failed}</p>
        </div>
      ) : isVideo && asset.url ? (
        <video
          src={asset.url}
          className={cn("absolute inset-0 h-full w-full", imgFit)}
          muted
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
