"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

export type StudioFileUploadDropzoneProps = {
  /** Primary line when idle (e.g. «Выберите фото…»). */
  label: string;
  /** Secondary hint (formats, size). Shown in idle and loading states. */
  hint?: string;
  /** Override loading line; defaults to `copy.upload.uploading`. */
  loadingLabel?: string;
  uploading?: boolean;
  disabled?: boolean;
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList | null | undefined) => void;
  className?: string;
  minHeightClass?: string;
};

export function StudioFileUploadDropzone({
  label,
  hint,
  loadingLabel,
  uploading = false,
  disabled = false,
  accept,
  multiple = false,
  onFiles,
  className,
  minHeightClass = "min-h-[120px]",
}: StudioFileUploadDropzoneProps) {
  const { copy } = useStudioCopy();
  const [dragActive, setDragActive] = useState(false);
  const busy = uploading || disabled;
  const statusText = uploading
    ? (loadingLabel ?? copy.upload.uploading)
    : label;

  return (
    <label
      aria-busy={uploading}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!busy) setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (busy) return;
        onFiles(event.dataTransfer.files);
      }}
      className={cn(
        "relative flex w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-4 py-5 text-center transition-colors",
        minHeightClass,
        uploading
          ? "cursor-wait border-teal-400/90 bg-teal-50/90"
          : dragActive
            ? "cursor-pointer border-teal-500 bg-teal-50"
            : "cursor-pointer border-border bg-slate-50/80 hover:border-teal-300 hover:bg-teal-50/60",
        busy && !uploading && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {uploading ? (
        <span
          className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-b from-teal-50/40 to-white/30 animate-pulse"
          aria-hidden
        />
      ) : null}

      <span className="relative z-10 mb-2 flex h-7 w-7 items-center justify-center">
        {uploading ? (
          <Loader2
            className="h-7 w-7 animate-spin text-teal-600"
            aria-hidden
          />
        ) : (
          <Upload className="h-6 w-6 text-teal-700" aria-hidden />
        )}
      </span>

      <span
        className={cn(
          "relative z-10 text-sm font-semibold",
          uploading ? "text-teal-900" : "text-slate-800"
        )}
      >
        {statusText}
      </span>

      {hint ? (
        <span className="relative z-10 mt-1 text-xs text-slate-500">{hint}</span>
      ) : null}

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
