"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type StudioFileUploadLoadingOverlayProps = {
  /** Defaults to `copy.upload.uploading`. */
  label?: string;
  className?: string;
};

/** Overlay on preview / card while file is processing after pick. */
export function StudioFileUploadLoadingOverlay({
  label,
  className,
}: StudioFileUploadLoadingOverlayProps) {
  const { copy } = useStudioCopy();
  const text = label ?? copy.upload.uploading;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-white/80 px-4 text-center backdrop-blur-[2px]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-7 w-7 animate-spin text-teal-600" aria-hidden />
      <p className="text-sm font-semibold text-slate-800">{text}</p>
    </div>
  );
}
