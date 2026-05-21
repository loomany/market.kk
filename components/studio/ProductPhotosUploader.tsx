"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { formatStudioString } from "@/lib/studio/i18n";
import { validateStudioImageFile } from "@/lib/studio/i18n/validateStudioImageFile";
import {
  MAX_CLOTHING_PRODUCT_SET,
  type StudioProductPhoto,
} from "@/lib/studio/productPhotos";
import { cn } from "@/lib/utils";
import { StudioFileUploadDropzone } from "./StudioFileUploadDropzone";
import { StudioFileUploadLoadingOverlay } from "./StudioFileUploadLoadingOverlay";
import { useStudioCopy } from "./StudioLocaleContext";

type ProductPhotosUploaderProps = {
  label: string;
  hint?: string;
  photos: StudioProductPhoto[];
  activePhotoId: string | null;
  maxPhotos?: number;
  singlePhotoMode?: boolean;
  onAddFiles: (files: File[]) => void;
  onSelectPhoto: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onClearAll: () => void;
  /** Server / AI processing after pick (e.g. product analysis). */
  uploading?: boolean;
  className?: string;
};

export function ProductPhotosUploader({
  label,
  hint,
  photos,
  activePhotoId,
  maxPhotos = MAX_CLOTHING_PRODUCT_SET,
  singlePhotoMode = false,
  onAddFiles,
  onSelectPhoto,
  onRemovePhoto,
  onClearAll,
  uploading = false,
  className,
}: ProductPhotosUploaderProps) {
  const { locale, copy } = useStudioCopy();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const activePhoto =
    photos.find((item) => item.id === activePhotoId) ?? photos[0] ?? null;
  const hasPhoto = photos.length > 0;
  const atLimit = photos.length >= maxPhotos;

  const ingestFiles = (fileList: FileList | null | undefined) => {
    if (!fileList?.length) return;
    const valid: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (!file) continue;
      const validationError = validateStudioImageFile(file, locale);
      if (validationError) {
        setUploadError(validationError);
        return;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    if (photos.length === 0) {
      if (valid.length > maxPhotos) {
        setUploadError(
          formatStudioString(copy.upload.maxPhotos, { max: maxPhotos })
        );
        onAddFiles(valid.slice(0, maxPhotos));
        return;
      }
      setUploadError(null);
      onAddFiles(valid);
      return;
    }

    setUploadError(null);
    onAddFiles(valid);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label className="text-sm font-semibold text-slate-950">{label}</label>
        {hint ? (
          <p className="mt-1 text-xs leading-5 text-slate-600">{hint}</p>
        ) : null}
      </div>

      {uploadError ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {uploadError}
        </p>
      ) : null}

      {!hasPhoto ? (
        <StudioFileUploadDropzone
          label={
            singlePhotoMode
              ? copy.upload.dropzoneSingle
              : formatStudioString(copy.upload.dropzoneMulti, { max: maxPhotos })
          }
          hint={
            singlePhotoMode
              ? copy.upload.dropzoneHintSingle
              : copy.upload.dropzoneHintMulti
          }
          uploading={uploading}
          accept="image/jpeg,image/png,image/webp"
          multiple={!singlePhotoMode && maxPhotos > 1}
          onFiles={ingestFiles}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">
              {photos.length === 1
                ? copy.upload.oneProductPhoto
                : formatStudioString(copy.upload.setCount, {
                    count: photos.length,
                  })}
            </p>
            <button
              type="button"
              onClick={() => {
                setUploadError(null);
                onClearAll();
              }}
              className="text-xs font-medium text-red-600/90 hover:text-red-800"
              title={copy.upload.clearAllTitle}
            >
              {copy.upload.clearAll}
            </button>
          </div>

          {photos.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelectPhoto(photo.id)}
                  className={cn(
                    "relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition",
                    photo.id === activePhoto?.id
                      ? "border-teal-500 ring-2 ring-teal-100"
                      : "border-border opacity-80 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={formatStudioString(copy.upload.angleAlt, {
                      n: index + 1,
                    })}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] font-medium text-white">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {activePhoto ? (
            <div className="relative overflow-hidden rounded-[22px] border border-border bg-slate-50">
              {uploading ? (
                <StudioFileUploadLoadingOverlay
                  label={copy.productCheck.analyzingShort}
                />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.previewUrl}
                alt={copy.upload.previewAlt}
                className="w-full object-contain"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(activePhoto.id)}
                className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/70"
                aria-label={copy.common.delete}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {!atLimit && !singlePhotoMode ? (
            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-dashed border-border bg-white px-3 py-2.5 text-xs font-medium text-teal-800 hover:bg-teal-50/50",
                uploading && "pointer-events-none opacity-70"
              )}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? copy.upload.uploading : copy.upload.dropzoneSelect}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  ingestFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          ) : singlePhotoMode ? (
            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-border bg-white px-3 py-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-50/50",
                uploading && "pointer-events-none opacity-70"
              )}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              ) : null}
              {uploading ? copy.upload.uploading : copy.upload.replacePhoto}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  ingestFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>
      )}
    </div>
  );
}
