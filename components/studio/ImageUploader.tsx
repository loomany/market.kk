"use client";

import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/ai/clientImageValidation";
import { formatStudioString } from "@/lib/studio/i18n";
import { StudioFileUploadDropzone } from "./StudioFileUploadDropzone";
import { useStudioCopy } from "./StudioLocaleContext";

type ImageUploaderProps = {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
  uploading?: boolean;
  className?: string;
};

export function ImageUploader({
  label,
  hint,
  previewUrl,
  selectedFile,
  onFileSelect,
  onClearFile,
  uploading = false,
  className,
}: ImageUploaderProps) {
  const { copy } = useStudioCopy();
  const u = copy.imageUploader;
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
        {u.formatsHint}
      </div>

      {canUploadFile && (
        <StudioFileUploadDropzone
          label={u.dropzone}
          uploading={uploading}
          accept="image/jpeg,image/png,image/webp"
          minHeightClass="min-h-[148px]"
          onFiles={(fileList) => selectFile(fileList?.[0])}
        />
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
              aria-label={u.clearFileAria}
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
            alt={formatStudioString(u.previewAlt, { label })}
            className="max-h-[320px] min-h-[180px] w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
