"use client";

import { useState } from "react";
import { Check, ImagePlus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, validateImageFileClient } from "@/lib/ai/clientImageValidation";

export type ModelSourceKind = "upload" | "saved" | null;

type ModelSourcePanelProps = {
  label: string;
  hint?: string;
  savedModelUrl: string | null;
  savedModelPersistenceHint?: string;
  modelSource: ModelSourceKind;
  onSelectSaved: () => void;
  onDeleteSaved?: () => void;
  previewUrl?: string | null;
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
  className?: string;
  /** SaaS: compact upload-only layout for «Своя модель» tab */
  uiMode?: "default" | "saas";
};

export function ModelSourcePanel({
  label,
  hint,
  savedModelUrl,
  savedModelPersistenceHint,
  modelSource,
  onSelectSaved,
  onDeleteSaved,
  previewUrl,
  selectedFile,
  onFileSelect,
  onClearFile,
  className,
  uiMode = "default",
}: ModelSourcePanelProps) {
  const isSaas = uiMode === "saas";
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canUploadFile = Boolean(onFileSelect);
  const savedSelected = modelSource === "saved" && Boolean(savedModelUrl);
  const uploadSelected = modelSource === "upload";

  const ingestFiles = (fileList: FileList | null | undefined) => {
    if (!fileList?.length || !onFileSelect) return;
    if (fileList.length > 1) {
      setUploadError("Можно загрузить только одно фото за запуск.");
      return;
    }
    const file = fileList.item(0);
    if (!file) return;
    const validationError = validateImageFileClient(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setUploadError(null);
    onFileSelect(file);
  };

  return (
    <div className={cn(isSaas ? "space-y-3" : "space-y-4", className)}>
      {label || hint ? (
        <div>
          {label ? (
            <label className="text-sm font-semibold text-slate-950">{label}</label>
          ) : null}
          {hint ? (
            <p className={cn("text-xs leading-5 text-slate-600", label && "mt-1")}>
              {hint}
            </p>
          ) : null}
        </div>
      ) : null}

      {savedModelUrl && !isSaas ? (
        <div
          className={cn(
            "overflow-hidden rounded-[16px] border transition",
            savedSelected
              ? "border-teal-500 bg-teal-50/80 ring-2 ring-teal-100"
              : "border-border bg-white"
          )}
        >
          <button
            type="button"
            onClick={onSelectSaved}
            className="flex w-full items-center gap-3 p-2 text-left transition hover:bg-white/60"
          >
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[12px] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={savedModelUrl}
                alt="Сохранённая AI-модель"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-950">
                <Sparkles
                  className="h-4 w-4 shrink-0 text-teal-700"
                  aria-hidden
                />
                Сохранённая AI-модель
              </p>
              <p className="text-xs leading-5 text-slate-500">
                {savedSelected
                  ? "Выбрана для примерки"
                  : "Нажмите, чтобы использовать"}
              </p>
            </div>
            {savedSelected ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Выбрать
              </span>
            )}
          </button>
          {savedModelPersistenceHint ? (
            <p className="border-t border-teal-100/80 px-3 py-2 text-xs leading-5 text-teal-950">
              {savedModelPersistenceHint}
            </p>
          ) : null}
          {onDeleteSaved ? (
            <div className="border-t border-border/70 px-2 py-2">
              <button
                type="button"
                onClick={onDeleteSaved}
                className="flex w-full items-center justify-center gap-1.5 rounded-[12px] px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Удалить сохранённую модель
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {savedModelUrl && canUploadFile && !isSaas ? (
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          или загрузите своё фото
        </p>
      ) : null}

      {uploadError ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {uploadError}
        </p>
      ) : null}

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
            ingestFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-4 py-6 text-center transition-colors",
            isSaas ? "min-h-[120px] py-5" : "min-h-[148px]",
            uploadSelected && selectedFile
              ? "border-teal-500 bg-teal-50/80 ring-2 ring-teal-100"
              : dragActive
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
              ingestFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {selectedFile && uploadSelected ? (
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
          {onClearFile ? (
            <button
              type="button"
              onClick={() => {
                setUploadError(null);
                onClearFile();
              }}
              className="shrink-0 rounded-[12px] p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Очистить выбранный файл"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      {previewUrl && uploadSelected && !savedSelected ? (
        <div className="overflow-hidden rounded-[16px] border border-border bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Предпросмотр загруженной модели"
            className="max-h-[320px] min-h-[180px] w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
