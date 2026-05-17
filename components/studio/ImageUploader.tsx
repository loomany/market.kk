"use client";

import { useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/ai/clientImageValidation";

type ImageUploaderProps = {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
  className?: string;
};

export function ImageUploader({
  label,
  hint,
  previewUrl,
  selectedFile,
  onFileSelect,
  onClearFile,
  className,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const canUploadFile = Boolean(onFileSelect);

  const selectFile = (file: File | undefined) => {
    if (!file || !onFileSelect) return;
    onFileSelect(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label className="text-sm font-semibold text-slate-950">{label}</label>
        {hint && <p className="mt-1 text-xs leading-5 text-slate-600">{hint}</p>}
      </div>

      <div className="rounded-[18px] border border-teal-100 bg-teal-50/60 px-3 py-2 text-xs leading-5 text-teal-950">
        JPEG, PNG или WEBP до 10MB. Файл не сохраняется у нас и временно
        передаётся в облачный AI-сервис только для обработки.
      </div>

      {canUploadFile && (
        <label
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragActive
              ? "border-teal-500 bg-teal-50"
              : "border-border bg-slate-50/80 hover:border-teal-300 hover:bg-teal-50/60"
          )}
        >
          <Upload className="mb-3 h-7 w-7 text-teal-700" />
          <span className="text-sm font-semibold text-slate-800">
            Выберите файл или перетащите его сюда
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-white px-3 py-2 text-sm shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-teal-50 text-teal-700">
              <ImagePlus className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          {onClearFile && (
            <button
              type="button"
              onClick={onClearFile}
              className="shrink-0 rounded-[12px] p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Очистить выбранный файл"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="overflow-hidden rounded-[22px] border border-border bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`Предпросмотр: ${label}`}
            className="max-h-[320px] min-h-[180px] w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
