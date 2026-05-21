"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import type { PostProcessingUploadedSource } from "@/lib/studio/postProcessingUpload";
import {
  clearPostProcessingUploadDraft,
  savePostProcessingUploadDraft,
} from "@/lib/studio/postProcessingUploadDraft";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";
import { StudioFilesSectionHeader } from "./StudioFilesSectionHeader";
import { StudioFileUploadDropzone } from "./StudioFileUploadDropzone";
import {
  postProcessingGalleryTileClass,
  postProcessingSectionCardClass,
} from "./StudioSaaSPreviewChrome";

type UploadApiSuccess = {
  ok: true;
  kind: "image" | "video";
  imageUrl: string;
  referenceVideoUrl?: string;
};

type UploadApiError = {
  ok: false;
  message?: string;
};

type PostProcessingUploadSectionProps = {
  source: PostProcessingUploadedSource | null;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onSourceChange: (source: PostProcessingUploadedSource | null) => void;
  onSave: () => void;
  disabled?: boolean;
};

const uploadPreviewWidthClass =
  "mx-auto w-full sm:max-w-[calc((100%-1rem)/2)]";

const uploadActionButtonClass =
  "inline-flex min-h-9 w-full items-center justify-center rounded-[12px] border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition disabled:opacity-60";

function newUploadId(): string {
  return crypto.randomUUID();
}

export function PostProcessingUploadSection({
  source,
  uploading,
  onUploadingChange,
  onSourceChange,
  onSave,
  disabled,
}: PostProcessingUploadSectionProps) {
  const { copy } = useStudioCopy();
  const u = copy.postProcessingUpload;
  const [error, setError] = useState<string | null>(null);
  const previewRevokeRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRevokeRef.current) {
        URL.revokeObjectURL(previewRevokeRef.current);
      }
    };
  }, []);

  const revokePreview = () => {
    if (previewRevokeRef.current) {
      URL.revokeObjectURL(previewRevokeRef.current);
      previewRevokeRef.current = null;
    }
  };

  const clearSource = () => {
    revokePreview();
    onSourceChange(null);
    setError(null);
  };

  const ingestFile = async (file: File) => {
    setError(null);
    const isVideo =
      file.type.startsWith("video/") || /\.(mp4|mov)$/i.test(file.name);
    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isVideo && !isImage) {
      setError(u.dropHint);
      return;
    }

    revokePreview();
    const previewUrl = URL.createObjectURL(file);
    previewRevokeRef.current = previewUrl;

    onUploadingChange(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/studio/post-process/upload", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as UploadApiSuccess | UploadApiError;
      if (!data.ok) {
        revokePreview();
        clearPostProcessingUploadDraft();
        setError(data.message ?? u.uploadFailed);
        return;
      }

      const next: PostProcessingUploadedSource = {
        id: newUploadId(),
        kind: data.kind,
        fileName: file.name,
        imageUrl: data.imageUrl,
        referenceVideoUrl: data.referenceVideoUrl,
        previewUrl,
      };
      const { previewUrl: _revokeLater, ...draftStored } = next;
      savePostProcessingUploadDraft(draftStored);
      onSourceChange(next);
    } catch {
      revokePreview();
      clearPostProcessingUploadDraft();
      setError(u.uploadFailed);
    } finally {
      onUploadingChange(false);
    }
  };

  return (
    <Card className={postProcessingSectionCardClass}>
      <div className="border-b border-border/60 px-4 py-3">
        <StudioFilesSectionHeader title={u.sectionTitle} />
      </div>
      <CardContent className="space-y-4 p-4">
        <p className="text-sm leading-6 text-slate-600">{u.description}</p>

        {error ? (
          <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {!source ? (
          <StudioFileUploadDropzone
            label={u.dropAction}
            hint={u.dropHint}
            loadingLabel={u.uploading}
            uploading={uploading}
            disabled={disabled}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.mp4,.mov"
            onFiles={(fileList) => {
              const file = fileList?.[0];
              if (file) void ingestFile(file);
            }}
          />
        ) : (
          <article
            className={cn(
              "flex min-w-0 flex-col overflow-hidden",
              postProcessingGalleryTileClass,
              uploadPreviewWidthClass
            )}
          >
            <div className="overflow-hidden bg-slate-50 leading-none">
              {source.kind === "video" ? (
                <video
                  src={source.previewUrl}
                  className="block max-h-[min(72dvh,560px)] w-full object-contain"
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  poster={source.imageUrl}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={source.previewUrl}
                  alt=""
                  className="block h-auto w-full"
                />
              )}
            </div>

            {source.kind === "video" ? (
              <p className="border-b border-slate-100/90 px-2.5 py-2 text-xs leading-5 text-teal-900 sm:px-3">
                <Clapperboard className="mr-1 inline h-3.5 w-3.5 shrink-0 text-teal-700" />
                {u.videoMotionOnly}
              </p>
            ) : null}

            <div className="flex flex-col gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={onSave}
                className={cn(
                  uploadActionButtonClass,
                  "hover:border-teal-200 hover:bg-teal-50/70"
                )}
              >
                {u.saveFile}
              </button>
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={clearSource}
                className={cn(
                  uploadActionButtonClass,
                  "hover:border-red-200 hover:bg-red-50/70"
                )}
              >
                {u.cancelUpload}
              </button>
            </div>
          </article>
        )}
      </CardContent>
    </Card>
  );
}
