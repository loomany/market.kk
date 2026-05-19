"use client";

import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TryOnResultActions({
  onDownload,
  onStartOver,
}: {
  onDownload: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onDownload}
      >
        <Download className="h-4 w-4" />
        Скачать
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onStartOver}
      >
        <RotateCcw className="h-4 w-4" />
        Начать сначала
      </Button>
    </div>
  );
}
