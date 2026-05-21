"use client";

import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStudioCopy } from "./StudioLocaleContext";

export function TryOnResultActions({
  onDownload,
  onDownloadAll,
  onStartOver,
  startOverLabel,
  startOverTitle,
}: {
  onDownload: () => void;
  onDownloadAll?: () => void;
  onStartOver: () => void;
  /** Подпись кнопки сброса результата (не удаления фото). */
  startOverLabel?: string;
  startOverTitle?: string;
}) {
  const { copy } = useStudioCopy();
  const resetLabel = startOverLabel ?? copy.actions.startOver;

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
          {copy.common.downloadAll}
        </Button>
      ) : null}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
        {onDownloadAll
          ? copy.resultActions.downloadThisFrame
          : copy.common.download}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onStartOver}
        title={startOverTitle}
      >
        <RotateCcw className="h-4 w-4" />
        {resetLabel}
      </Button>
    </div>
  );
}
