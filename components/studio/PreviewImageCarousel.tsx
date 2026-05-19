"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  downloadAllImages,
  downloadImageFile,
  previewImageFilename,
} from "@/lib/studio/downloadImages";
import { cn } from "@/lib/utils";

export type PreviewCarouselItem = {
  id: string;
  url: string;
  label: string;
};

type PreviewImageCarouselProps = {
  items: PreviewCarouselItem[];
  downloadFilenamePrefix?: string;
  className?: string;
  imageClassName?: string;
  showDownloadActions?: boolean;
};

export function PreviewImageCarousel({
  items,
  downloadFilenamePrefix = "vitrina-ai-model",
  className,
  imageClassName = "max-h-[460px] w-full object-contain",
  showDownloadActions = true,
}: PreviewImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      const slide = track.children.item(clamped) as HTMLElement | null;
      slide?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
      setActiveIndex(clamped);
    },
    [items.length]
  );

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    const index = Math.round(track.scrollLeft / width);
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  if (items.length === 0) return null;

  const activeItem = items[activeIndex] ?? items[0]!;
  const showNav = items.length > 1;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {showNav ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-white px-3 py-2">
          <p className="min-w-0 truncate text-xs font-medium text-slate-600">
            {activeIndex + 1} из {items.length}
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-slate-800">{activeItem.label}</span>
          </p>
          {showDownloadActions ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={downloadingAll}
              onClick={() =>
                void downloadImageFile(
                  activeItem.url,
                  previewImageFilename(
                    downloadFilenamePrefix,
                    activeItem.label,
                    activeIndex
                  )
                )
              }
            >
              <Download className="h-3.5 w-3.5" />
              Скачать
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 text-xs"
              loading={downloadingAll}
              onClick={() => {
                setDownloadingAll(true);
                void downloadAllImages(items, downloadFilenamePrefix).finally(
                  () => setDownloadingAll(false)
                );
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Скачать все
            </Button>
          </div>
          ) : null}
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className={cn(
            "flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth",
            "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
          )}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex w-full shrink-0 snap-start snap-always flex-col"
            >
              <div className="flex flex-1 items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.label}
                  className={imageClassName}
                  draggable={false}
                />
              </div>
              {showNav ? (
                <p className="pb-2 text-center text-xs font-medium text-slate-500">
                  {item.label}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {showNav ? (
          <>
            <button
              type="button"
              aria-label="Предыдущий ракурс"
              disabled={activeIndex === 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
              className={cn(
                "absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md transition hover:bg-white",
                activeIndex === 0 && "pointer-events-none opacity-35"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Следующий ракурс"
              disabled={activeIndex >= items.length - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
              className={cn(
                "absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md transition hover:bg-white",
                activeIndex >= items.length - 1 &&
                  "pointer-events-none opacity-35"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {showNav ? (
        <div className="flex shrink-0 justify-center gap-1.5 border-t border-border/60 bg-white px-3 py-2.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${item.label}, слайд ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-5 bg-teal-600"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
