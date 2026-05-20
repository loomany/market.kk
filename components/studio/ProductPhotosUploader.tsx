"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { validateImageFileClient } from "@/lib/ai/clientImageValidation";
import {
  MAX_CLOTHING_PRODUCT_SET,
  type StudioProductPhoto,
} from "@/lib/studio/productPhotos";
import { cn } from "@/lib/utils";

type ProductPhotosUploaderProps = {
  label: string;
  hint?: string;
  photos: StudioProductPhoto[];
  activePhotoId: string | null;
  maxPhotos?: number;
  /** Товарная карточка: одно фото, другие подписи в зоне загрузки */
  singlePhotoMode?: boolean;
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
  maxPhotos = MAX_CLOTHING_PRODUCT_SET,
  singlePhotoMode = false,
  onAddFiles,
  onSelectPhoto,
  onRemovePhoto,
  onClearAll,
  className,
}: ProductPhotosUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
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
      const validationError = validateImageFileClient(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    const slotsLeft = maxPhotos - photos.length;
    if (photos.length === 0) {
      if (valid.length > maxPhotos) {
        setUploadError(`Можно загрузить до ${maxPhotos} фото.`);
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
            {singlePhotoMode
              ? "Выберите одно фото или перетащите сюда"
              : `Выберите до ${maxPhotos} фото или перетащите сюда`}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {singlePhotoMode
              ? "Товар крупно в кадре — на шаге 2 нарисуйте рамку вокруг него"
              : "Фронт, спина, 3/4 — одним комплектом"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={!singlePhotoMode && maxPhotos > 1}
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
            <p className="text-xs font-medium text-slate-600">
              {photos.length === 1
                ? "1 фото товара"
                : `Комплект: ${photos.length} фото`}
            </p>
            <button
              type="button"
              onClick={() => {
                setUploadError(null);
                onClearAll();
              }}
              className="text-xs font-medium text-red-600/90 hover:text-red-800"
              title="Удалить фото, рамку и сбросить карточку"
            >
              Удалить всё
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
                    alt={`Ракурс ${index + 1}`}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.previewUrl}
                alt="Предпросмотр товара"
                className="w-full object-contain"
              />
              <button
                type="button"
                aria-label="Удалить фото товара и сбросить рамку"
                title="Удалить фото и рамку (не то же самое, что «Создать ещё раз»)"
                onClick={() => onRemovePhoto(activePhoto.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/95 text-slate-600 shadow-sm hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {!atLimit ? (
            <label className="flex cursor-pointer items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50">
              Добавить ещё фото ({photos.length}/{maxPhotos})
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  ingestFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          ) : (
            <label className="flex cursor-pointer items-center justify-center rounded-[14px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50">
              {maxPhotos === 1 ? "Заменить фото" : "Заменить комплект"}
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
          )}
        </div>
      )}
    </div>
  );
}
