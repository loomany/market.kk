"use client";

import { Check, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PreviewImageCarousel,
  type PreviewCarouselItem,
} from "@/components/studio/PreviewImageCarousel";
import { downloadImageFile, previewImageFilename } from "@/lib/studio/downloadImages";

type ModelReadyCardProps = {
  previewItems: PreviewCarouselItem[];
  isSaved: boolean;
  onSave: () => void;
  onStartOver: () => void;
};

export function downloadModelImage(url: string, filename = "ai-model.png") {
  void downloadImageFile(url, filename);
}

export function ModelReadyCard({
  previewItems,
  isSaved,
  onSave,
  onStartOver,
}: ModelReadyCardProps) {
  const hasMultiple = previewItems.length > 1;
  const singleItem = previewItems[0];

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200/90 bg-white shadow-sm">
      <p className="px-3 pb-2 pt-3 text-xs font-semibold text-slate-500">
        {hasMultiple
          ? `Готовые ракурсы (${previewItems.length})`
          : "Готовый вариант"}
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
              alt="Сгенерированная AI-модель"
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
              Скачать
            </Button>
          </div>
        ) : null}
      </div>
      <div className="space-y-2 border-t border-border/70 p-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="w-full"
          disabled={isSaved}
          onClick={onSave}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4" />
              Модель сохранена
            </>
          ) : (
            "Сохранить модель"
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
          Заменить модель
        </Button>
      </div>
    </div>
  );
}
