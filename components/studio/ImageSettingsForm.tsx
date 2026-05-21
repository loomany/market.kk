"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import {
  IMAGE_EDITOR_CAPABILITIES,
  type ImageEditorId,
} from "@/lib/ai/imageEnhanceSchemas";
import {
  getImageFileFormatOptions,
  getImageFrameFormatOptions,
  getSaasQualityOptions,
} from "@/lib/studio/i18n/studioFormOptions";
import { ImageAdvancedSettings } from "./ImageAdvancedSettings";
import { useStudioCopy } from "./StudioLocaleContext";

export type ImageOutputFormat = "png" | "jpeg";
export type ImageAspectRatio =
  | "1:1"
  | "4:5"
  | "9:16"
  | "3:4"
  | "4:3"
  | "16:9";
export type SaasQualityTier = "fast" | "balanced" | "high" | "ultra";

/** UI ImageOutputFormat (jpeg/png) → schema enum (jpg/png). */
function toSchemaOutputFormat(format: ImageOutputFormat): "png" | "jpg" {
  if (format === "jpeg") return "jpg";
  return format;
}

type ImageSettingsFormProps = {
  /** Which image editor is currently selected. Drives which fields are shown. */
  editorId: ImageEditorId;
  outputFormat: ImageOutputFormat;
  aspectRatio: ImageAspectRatio;
  quality: SaasQualityTier;
  preserveProduct: boolean;
  useNegativePrompt: boolean;
  negativePrompt: string;
  onOutputFormatChange: (format: ImageOutputFormat) => void;
  onAspectRatioChange: (ratio: ImageAspectRatio) => void;
  onQualityChange: (tier: SaasQualityTier) => void;
  onPreserveProductChange: (value: boolean) => void;
  onUseNegativePromptChange: (value: boolean) => void;
  onNegativePromptChange: (value: string) => void;
  disabled?: boolean;
};

export function ImageSettingsForm({
  editorId,
  outputFormat,
  aspectRatio,
  quality,
  preserveProduct,
  useNegativePrompt,
  negativePrompt,
  onOutputFormatChange,
  onAspectRatioChange,
  onQualityChange,
  onPreserveProductChange,
  onUseNegativePromptChange,
  onNegativePromptChange,
  disabled,
}: ImageSettingsFormProps) {
  const { locale, copy } = useStudioCopy();
  const capability = IMAGE_EDITOR_CAPABILITIES[editorId];
  const frameFormatOptionsAll = useMemo(
    () => getImageFrameFormatOptions(locale),
    [locale]
  );
  const qualityOptions = useMemo(
    () => getSaasQualityOptions(locale).filter((o) => o.value !== "ultra"),
    [locale]
  );

  const outputFormatOptions = useMemo(() => {
    const all = getImageFileFormatOptions(locale);
    return all.filter((opt) =>
      (capability.outputFormats as readonly string[]).includes(
        toSchemaOutputFormat(opt.value)
      )
    );
  }, [capability.outputFormats, locale]);

  const aspectRatioOptions = useMemo(
    () =>
      frameFormatOptionsAll.filter((opt) =>
        (capability.aspectRatios as readonly string[]).includes(opt.value)
      ),
    [capability.aspectRatios, frameFormatOptionsAll]
  );

  const s = copy.imageSettings;
  const f = copy.form;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={f.fileFormat}
          value={outputFormat}
          disabled={disabled}
          onChange={(value) =>
            onOutputFormatChange(value as ImageOutputFormat)
          }
          options={outputFormatOptions}
        />
        <Select
          label={f.frameFormat}
          value={aspectRatio}
          disabled={disabled}
          onChange={(value) =>
            onAspectRatioChange(value as ImageAspectRatio)
          }
          options={aspectRatioOptions}
        />
        {capability.supportsQuality ? (
          <Select
            label={f.quality}
            value={quality}
            disabled={disabled}
            onChange={(value) => onQualityChange(value as SaasQualityTier)}
            options={qualityOptions}
          />
        ) : null}
      </div>

      {capability.supportsNegativePrompt ? (
        <ImageAdvancedSettings
          useNegativePrompt={useNegativePrompt}
          negativePrompt={negativePrompt}
          onUseNegativePromptChange={onUseNegativePromptChange}
          onNegativePromptChange={onNegativePromptChange}
          disabled={disabled}
        />
      ) : null}

      <div className="flex items-center gap-3 rounded-[18px] border border-border bg-white p-3">
        <button
          type="button"
          role="switch"
          aria-checked={preserveProduct}
          aria-label={s.preserveProduct}
          disabled={disabled}
          onClick={() => onPreserveProductChange(!preserveProduct)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            preserveProduct ? "bg-teal-600" : "bg-slate-300"
          }`}
        >
          <span
            aria-hidden
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
              preserveProduct ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">
            {s.preserveProduct}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {s.preserveProductHint}
          </p>
        </div>
      </div>
    </div>
  );
}
