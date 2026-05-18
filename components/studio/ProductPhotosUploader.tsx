"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  formatFileSize,
  validateImageFileClient,
} from "@/lib/ai/clientImageValidation";
import type { StudioProductPhoto } from "@/lib/studio/productPhotos";
import { cn } from "@/lib/utils";

type ProductPhotosUploaderProps = {
  label: string;
  hint?: string;
  photos: StudioProductPhoto[];
  activePhotoId: string | null;
  onAddFiles: (files: File[]) => void;
  onSelectPhoto: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onClearAll: () => void;
  className?: string;
};

export function ProductPhotosUploader({
  label,
  hint,
  photos,
  activePhotoId,
  onAddFiles,
  onRemovePhoto,
  onClearAll,
  className,
}: ProductPhotosUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const activePhoto =
    photos.find((item) => item.id === activePhotoId) ?? photos[0] ?? null;
  const hasPhoto = photos.length > 0;

  const ingestFiles = (fileList: FileList | null | undefined) => {
    if (!fileList?.length) return;
    const file = fileList.item(0);
    if (!file) return;
    const validationError = validateImageFileClient(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError(null);
    onAddFiles([file]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label className="text-sm font-semibold text-slate-950">{label}</label>
        {hint ? (
          <p className="mt-1 text-xs leading-5 text-slate-600">{hint}</p>
        ) : null}
      </div>

      <div className="rounded-[18px] border border-teal-100 bg-teal-50/60 px-3 py-2 text-xs leading-5 text-teal-950">
        Одно фото за запуск (JPEG, PNG, WEBP до 10MB). Для следующего товара
        замените файл и снова нажмите «Создать фото на модели».
      </div>

      {uploadError ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {uploadError}
        </p>
      ) : null}

      {!hasPhoto ? (
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
            ingestFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-4 py-5 text-center transition-colors",
            dragActive
              ? "border-teal-500 bg-teal-50"
              : "border-border bg-slate-50/80 hover:border-teal-300 hover:bg-teal-50/60"
          )}
        >
          <Upload className="mb-2 h-6 w-6 text-teal-700" />
          <span className="text-sm font-semibold text-slate-800">
            Выберите файл или перетащите сюда
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              ingestFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">Фото товара</p>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Удалить
            </button>
          </div>

          {activePhoto ? (
            <div className="relative overflow-hidden rounded-[22px] border border-border bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.previewUrl}
                alt="Предпросмотр товара"
                className="max-h-[280px] min-h-[160px] w-full object-contain"
              />
              <p className="border-t border-border/70 px-3 py-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {activePhoto.file.name}
                </span>
                {" · "}
                {formatFileSize(activePhoto.file.size)}
              </p>
              <button
                type="button"
                aria-label="Удалить фото товара"
                onClick={() => onRemovePhoto(activePhoto.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/95 text-slate-600 shadow-sm hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <label className="flex cursor-pointer items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50">
            Заменить фото
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                ingestFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}