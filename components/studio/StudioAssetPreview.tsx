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
};

export function StudioAssetPreview({
  asset,
  className,
  compact = false,
}: StudioAssetPreviewProps) {
  const previewUrl = assetPreviewUrl(asset);
  const processing = asset.status === "processing";
  const errored = asset.status === "error";
  const isVideo = isVideoAsset(asset) && !processing && Boolean(asset.url);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-border bg-slate-50",
        compact ? "h-36" : "h-40",
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
            AI обрабатывает файл
          </p>
          {asset.startedAt ? (
            <div className="relative z-10">
              <CompactCountdown
                startedAt={asset.startedAt}
                totalSeconds={POST_PROCESSING_COUNTDOWN_SEC}
              />
            </div>
          ) : null}
          <p className="relative z-10 text-[11px] text-slate-500">
            Примерно 3:00
          </p>
        </div>
      ) : errored ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-red-700">
          <AlertCircle className="h-8 w-8" aria-hidden />
          <p className="text-xs font-medium">Не удалось создать</p>
        </div>
      ) : isVideo && asset.url ? (
        <video
          src={asset.url}
          className="h-full w-full object-contain"
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
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          {isVideoAsset(asset) ? (
            <Film className="h-10 w-10" />
          ) : (
            <ImageIcon className="h-10 w-10" />
          )}
        </div>
      )}
    </div>
  );
}
