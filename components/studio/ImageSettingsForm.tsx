"use client";

import { Select } from "@/components/ui/Select";

export type ImageOutputFormat = "png" | "jpeg" | "webp";
export type ImageAspectRatio =
  | "1:1"
  | "4:5"
  | "9:16"
  | "3:4"
  | "16:9";
export type SaasQualityTier = "fast" | "balanced" | "high";

export const IMAGE_FILE_FORMAT_OPTIONS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
  { value: "webp", label: "WEBP" },
] as const;

export const IMAGE_FRAME_FORMAT_OPTIONS = [
  {
    value: "9:16",
    label: "9:16 — Stories / Reels",
  },
  {
    value: "4:5",
    label: "4:5 — маркетплейсы / соцсети",
  },
  { value: "1:1", label: "1:1 — квадрат" },
  { value: "3:4", label: "3:4 — карточка товара" },
  { value: "16:9", label: "16:9 — баннер" },
] as const;

export const SAAS_QUALITY_OPTIONS = [
  { value: "fast", label: "Быстро" },
  { value: "balanced", label: "Стандарт" },
  { value: "high", label: "Максимум" },
] as const;

/** Map UI frame format to API-supported aspect ratio. */
export function imageAspectRatioForApi(
  ratio: ImageAspectRatio
): "1:1" | "4:5" | "9:16" | "16:9" {
  if (ratio === "3:4") return "4:5";
  return ratio;
}

type ImageSettingsFormProps = {
  outputFormat: ImageOutputFormat;
  aspectRatio: ImageAspectRatio;
  quality: SaasQualityTier;
  preserveProduct: boolean;
  onOutputFormatChange: (format: ImageOutputFormat) => void;
  onAspectRatioChange: (ratio: ImageAspectRatio) => void;
  onQualityChange: (tier: SaasQualityTier) => void;
  onPreserveProductChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ImageSettingsForm({
  outputFormat,
  aspectRatio,
  quality,
  preserveProduct,
  onOutputFormatChange,
  onAspectRatioChange,
  onQualityChange,
  onPreserveProductChange,
  disabled,
}: ImageSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Формат файла"
          value={outputFormat}
          disabled={disabled}
          onChange={(value) =>
            onOutputFormatChange(value as ImageOutputFormat)
          }
          options={[...IMAGE_FILE_FORMAT_OPTIONS]}
        />
        <div className="space-y-1">
          <Select
            label="Формат кадра"
            value={aspectRatio}
            disabled={disabled}
            onChange={(value) =>
              onAspectRatioChange(value as ImageAspectRatio)
            }
            options={[...IMAGE_FRAME_FORMAT_OPTIONS]}
          />
          {aspectRatio === "3:4" ? (
            <p className="px-1 text-[11px] leading-4 text-slate-500">
              Для этого редактора будет использован ближайший формат 4:5.
            </p>
          ) : null}
        </div>
        <Select
          label="Качество"
          value={quality}
          disabled={disabled}
          onChange={(value) => onQualityChange(value as SaasQualityTier)}
          options={[...SAAS_QUALITY_OPTIONS]}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-border bg-white p-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          checked={preserveProduct}
          disabled={disabled}
          onChange={(e) => onPreserveProductChange(e.target.checked)}
        />
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            Сохранять товар точно
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Цвет, форма и узор товара не должны меняться.
          </span>
        </span>
      </label>
    </div>
  );
}
