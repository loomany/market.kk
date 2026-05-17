"use client";

import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/ai/clientImageValidation";

type ImageUploaderProps = {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
  onUrlChange?: (url: string) => void;
  urlValue?: string;
  className?: string;
};

export function ImageUploader({
  label,
  hint,
  previewUrl,
  selectedFile,
  onFileSelect,
  onClearFile,
  onUrlChange,
  urlValue = "",
  className,
}: ImageUploaderProps) {
  const showUrlInput = onUrlChange && !selectedFile;

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-slate-900">{label}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <p className="text-xs text-slate-400">
        Для MVP фото не сохраняются в нашей базе. В real mode файл отправляется
        в Fal только для генерации.
      </p>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition-colors hover:border-violet-300 hover:bg-violet-50/30">
        <Upload className="mb-2 h-6 w-6 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          Выберите файл
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPEG, PNG, WebP · до 10 MB
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect?.(file);
            e.target.value = "";
          }}
        />
      </label>

      {selectedFile && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-800">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {onClearFile && (
            <button
              type="button"
              onClick={onClearFile}
              className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              aria-label="Удалить файл"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {showUrlInput && (
        <div>
          <label className="text-xs font-medium text-slate-600">или URL</label>
          <input
            type="url"
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      )}

      {previewUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="aspect-square w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
