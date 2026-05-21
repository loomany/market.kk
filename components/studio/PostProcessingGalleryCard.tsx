"use client";

import { useMemo, useState } from "react";
import {
  Clapperboard,
  Download,
  ImageIcon,
  Trash2,
} from "lucide-react";
import type { StudioSessionAsset } from "./types";
import { StudioAssetMediaView } from "./StudioAssetMediaView";
import { isVideoAsset } from "@/lib/studio/assetDisplayLabels";
import { getPostProcessingCarouselAssets } from "@/lib/studio/postProcessingAssetGroup";
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import { saasPreviewCardClass } from "./StudioSaaSPreviewChrome";
import { useStudioCopy } from "./StudioLocaleContext";
import { cn } from "@/lib/utils";

type PostProcessingGalleryCardProps = {
  asset: StudioSessionAsset;
  allAssets: StudioSessionAsset[];
  layout?: "desktop" | "mobile";
  activeMode?: PostProcessingMode | null;
  onCreateImage: () => void;
  onCreateVideo: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

export function PostProcessingGalleryCard({
  asset,
  allAssets,
  layout = "desktop",
  activeMode = null,
  onCreateImage,
  onCreateVideo,
  onDownload,
  onDelete,
}: PostProcessingGalleryCardProps) {
  const { copy } = useStudioCopy();
  const pa = copy.processedAssets;
  const sf = copy.studioFiles;
  const d = copy.postProcessingDesktop;

  const group = useMemo(
    () => getPostProcessingCarouselAssets(asset, allAssets),
    [asset, allAssets]
  );
  const [frameIndex, setFrameIndex] = useState(0);
  const safeIndex = Math.min(frameIndex, Math.max(0, group.length - 1));
  const displayAsset = group[safeIndex] ?? asset;
  const isVideo = isVideoAsset(asset);
  const downloadable = Boolean(asset.url) && asset.status !== "processing";

  const cycle = (delta: number) => {
    setFrameIndex((i) => (i + delta + group.length) % group.length);
  };

  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white",
        saasPreviewCardClass
      )}
    >
      <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-100/80 p-2 pb-0 sm:p-3">
        <StudioAssetMediaView
          asset={displayAsset}
          variant="gallery"
          className={
            layout === "mobile" ? "max-h-[min(72dvh,560px)]" : undefined
          }
          carouselIndex={safeIndex}
          carouselTotal={group.length}
          onCarouselPrev={group.length > 1 ? () => cycle(-1) : undefined}
          onCarouselNext={group.length > 1 ? () => cycle(1) : undefined}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-b border-slate-100/90 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <button
          type="button"
          disabled={!downloadable}
          onClick={onDownload}
          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-[12px] border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/70 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {sf.download}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-[12px] border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50/70"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {sf.delete}
        </button>
      </div>

      <div className="flex flex-col gap-2 p-2.5 sm:p-3">
        {!isVideo ? (
          <>
            <ActionButton
              icon={ImageIcon}
              label={pa.createImage}
              onClick={onCreateImage}
              disabled={asset.status === "processing"}
              active={activeMode === "image"}
            />
            <ActionButton
              icon={Clapperboard}
              label={pa.createVideo}
              onClick={onCreateVideo}
              disabled={asset.status === "processing"}
              active={activeMode === "video"}
            />
          </>
        ) : null}
        {isVideo ? (
          <button
            type="button"
            disabled
            title={d.continueSceneSoon}
            className="flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400"
          >
            {d.continueScene}
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {d.continueSceneSoon}
            </span>
          </button>
        ) : null}
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active = false,
}: {
  icon: typeof ImageIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[14px] border px-3 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-teal-500 bg-teal-50 text-teal-950"
          : "border-border bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50/80"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}
