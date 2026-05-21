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
    () => getPostProcessingCarouselAssets(asset, allAssets),
    [asset, allAssets]
  );
  const [frameIndex, setFrameIndex] = useState(0);
  const safeIndex = Math.min(frameIndex, Math.max(0, group.length - 1));
  const displayAsset = group[safeIndex] ?? asset;

  const cycle = (delta: number) => {
    setFrameIndex((i) => (i + delta + group.length) % group.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {d.backToFiles}
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">
          {title}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden border-teal-100/80 shadow-md shadow-slate-200/40">
          <CardContent className="p-4">
            <StudioAssetMediaView
              asset={displayAsset}
              variant="hero"
              carouselIndex={safeIndex}
              carouselTotal={group.length}
              onCarouselPrev={group.length > 1 ? () => cycle(-1) : undefined}
              onCarouselNext={group.length > 1 ? () => cycle(1) : undefined}
            />
          </CardContent>
        </Card>

        <Card className="h-fit xl:sticky xl:top-4">
          <CardContent className="space-y-6 p-5">{settings}</CardContent>
        </Card>
      </div>
    </div>
  );
}
