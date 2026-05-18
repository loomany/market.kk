"use client";

import { Check, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
type ModelReadyCardProps = {
  imageUrl: string;
  isSaved: boolean;
  onSave: () => void;
  onDownload: () => void;
  onStartOver: () => void;
};

export function downloadModelImage(url: string, filename = "ai-model.png") {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ModelReadyCard({
  imageUrl,
  isSaved,
  onSave,
  onDownload,
  onStartOver,
}: ModelReadyCardProps) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200/90 bg-white shadow-sm">
      <p className="px-3 pb-2 pt-3 text-xs font-semibold text-slate-500">
        Готовый вариант
      </p>
      <div className="border-t border-border bg-slate-50 px-2 pb-2 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Сгенерированная AI-модель"
          className="max-h-[460px] min-h-[200px] w-full rounded-[12px] object-contain"
        />
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
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Скачать
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onStartOver}
        >
          <RotateCcw className="h-4 w-4" />
          Начать сначала
        </Button>
      </div>
    </div>
  );
}
