"use client";

import { Check, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "@/components/studio/PreviewImageCarousel";
import { downloadImageFile, previewImageFilename } from "@/lib/studio/downloadImages";
import { formatStudioString } from "@/lib/studio/i18n";
import { useStudioCopy } from "./StudioLocaleContext";

type ModelReadyCardProps = {
  previewItems: PreviewCarouselItem[];
  isSaved: boolean;
  identityLocked?: boolean;
  onSave: () => void;
  onLockForAllViews?: () => void;
  onStartOver: () => void;
};

export function downloadModelImage(url: string, filename = "ai-model.png") {
  void downloadImageFile(url, filename);
}

export function ModelReadyCard({
  previewItems,
  isSaved,
  identityLocked = false,
  onSave,
  onLockForAllViews,
  onStartOver,
}: ModelReadyCardProps) {
  const { copy } = useStudioCopy();
  const m = copy.modelReady;
  const hasMultiple = previewItems.length > 1;
  const singleItem = previewItems[0];

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200/90 bg-white shadow-sm">
      <p className="px-3 pb-2 pt-3 text-xs font-semibold text-slate-500">
        {hasMultiple
          ? formatStudioString(m.anglesTitle, { count: previewItems.length })
          : m.singleTitle}
      </p>
      <div className="flex min-h-[220px] flex-col border-t border-border bg-slate-50">
        {hasMultiple ? (
          <PreviewImageCarousel
            items={previewItems}
            className="min-h-[220px]"
          />
        ) : singleItem ? (
          <div className="space-y-2 px-2 pb-2 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={singleItem.url}
              alt={m.alt}
              className="max-h-[460px] min-h-[200px] w-full rounded-[12px] object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() =>
                void downloadImageFile(
                  singleItem.url,
                  previewImageFilename("vitrina-ai-model", singleItem.label, 0)
                )
              }
            >
              <Download className="h-4 w-4" />
              {copy.editorActions.download}
            </Button>
          </div>
        ) : null}
      </div>
      <div className="space-y-2 border-t border-border/70 p-3">
        {onLockForAllViews && !identityLocked ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full"
            onClick={onLockForAllViews}
          >
            {m.lockForAll}
          </Button>
        ) : null}
        {identityLocked ? (
          <p className="rounded-[10px] border border-teal-200 bg-teal-50/80 px-3 py-2 text-xs leading-5 text-teal-950">
            {m.lockedHint}
          </p>
        ) : null}
        <Button
          type="button"
          variant={onLockForAllViews && !identityLocked ? "secondary" : "primary"}
          size="sm"
          className="w-full"
          disabled={isSaved}
          onClick={onSave}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              {m.saved}
            </>
          ) : (
            m.save
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onStartOver}
        >
          <RotateCcw className="h-4 w-4" />
          {m.replace}
        </Button>
      </div>
    </div>
  );
}
