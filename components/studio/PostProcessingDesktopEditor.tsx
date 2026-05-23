"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { StudioSessionAsset } from "./types";
import { StudioAssetMediaView } from "./StudioAssetMediaView";
import { getPostProcessingCarouselAssets } from "@/lib/studio/postProcessingAssetGroup";
import { useStudioCopy } from "./StudioLocaleContext";

type PostProcessingDesktopEditorProps = {
  asset: StudioSessionAsset;
  allAssets: StudioSessionAsset[];
  title: string;
  onBack: () => void;
  settings: React.ReactNode;
};

export function PostProcessingDesktopEditor({
  asset,
  allAssets,
  title,
  onBack,
  settings,
}: PostProcessingDesktopEditorProps) {
  const { copy } = useStudioCopy();
  const d = copy.postProcessingDesktop;

  const group = useMemo(
    () => getPostProcessingCarouselAssets(asset),
    [asset]
  );
  const [frameIndex, setFrameIndex] = useState(0);
  const safeIndex = Math.min(frameIndex, Math.max(0, group.length - 1));
  const displayAsset = group[safeIndex] ?? asset;

  const cycle = (delta: number) => {
    setFrameIndex((i) => (i + delta + group.length) % group.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative min-h-11 w-full">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 top-1/2 z-10 inline-flex max-w-[min(100%,14rem)] -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:max-w-none"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{d.backToFiles}</span>
        </button>
        <p className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full max-w-[calc(100%-11rem)] -translate-x-1/2 -translate-y-1/2 truncate px-2 text-center text-sm font-semibold text-slate-950 sm:max-w-[calc(100%-15rem)]">
          {title}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
        <Card className="flex min-h-[min(48vh,520px)] flex-col overflow-hidden border-teal-100/80 shadow-md shadow-slate-200/40 xl:min-h-0 xl:h-full">
          <CardContent className="flex min-h-0 flex-1 flex-col p-4">
            <StudioAssetMediaView
              asset={displayAsset}
              variant="gallery"
              fillParent
              className="min-h-0 w-full flex-1"
              carouselIndex={safeIndex}
              carouselTotal={group.length}
              onCarouselPrev={group.length > 1 ? () => cycle(-1) : undefined}
              onCarouselNext={group.length > 1 ? () => cycle(1) : undefined}
            />
          </CardContent>
        </Card>

        <Card className="h-fit min-w-0 xl:sticky xl:top-4">
          <CardContent className="space-y-6 p-5">{settings}</CardContent>
        </Card>
      </div>
    </div>
  );
}
