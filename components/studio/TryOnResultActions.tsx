"use client";

import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TryOnResultActions({
  onDownload,
  onDownloadAll,
  onStartOver,
  startOverLabel = "Начать сначала",
  startOverTitle,
}: {
  onDownload: () => void;
  onDownloadAll?: () => void;
  onStartOver: () => void;
  /** Подпись кнопки сброса результата (не удаления фото). */
  startOverLabel?: string;
  startOverTitle?: string;
}) {
  return (
    <div className="space-y-2">
      {onDownloadAll ? (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onDownloadAll}
        >
          <Download className="h-4 w-4" />
          Скачать все
        </Button>
      ) : null}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
        {onDownloadAll ? "Скачать этот кадр" : "Скачать"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onStartOver}
        title={startOverTitle}
      >
        <RotateCcw className="h-4 w-4" />
        {startOverLabel}
      </Button>
    </div>
  );
}
