"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { VIDEO_MODELS, type VideoModelKey } from "@/lib/ai/videoModels";
import type { SaasQualityTier } from "./ImageSettingsForm";
import {
  formatVideoDurationLabel,
  getSaasQualityOptions,
  getVideoFrameFormatOptions,
  getVideoMotionPresets,
} from "@/lib/studio/i18n/studioFormOptions";
import { useStudioCopy } from "./StudioLocaleContext";

export type VideoMotionPresetId =
  | "subtle-motion"
  | "model-turn"
  | "camera-push"
  | "product-fidelity";

export type VideoAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

/** Pick closest API quality tier supported by the selected video model. */
export function mapSaasQualityToVideoApi(
  modelKey: VideoModelKey,
  tier: SaasQualityTier
): "fast" | "balanced" | "high" {
  const model = VIDEO_MODELS[modelKey];
  const ids = model.qualityOptions.map((o) => o.id);
  if (ids.includes(tier)) return tier;
  if (tier === "fast" && ids.includes("fast")) return "fast";
  if (tier === "high" && ids.includes("high")) return "high";
  return ids.includes("balanced")
    ? "balanced"
    : (ids[0] ?? "balanced");
}

type VideoSettingsFormProps = {
  modelKey: VideoModelKey;
  quality: SaasQualityTier;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  motionPreset: VideoMotionPresetId;
  onQualityChange: (tier: SaasQualityTier) => void;
  onDurationChange: (seconds: number) => void;
  onAspectRatioChange: (ratio: VideoAspectRatio) => void;
  onMotionPresetChange: (preset: VideoMotionPresetId) => void;
  disabled?: boolean;
};

export function VideoSettingsForm({
  modelKey,
  quality,
  durationSeconds,
  aspectRatio,
  motionPreset,
  onQualityChange,
  onDurationChange,
  onAspectRatioChange,
  onMotionPresetChange,
  disabled,
}: VideoSettingsFormProps) {
  const { locale, copy } = useStudioCopy();
  const model = VIDEO_MODELS[modelKey];
  const frameOptionsAll = useMemo(
    () => getVideoFrameFormatOptions(locale),
    [locale]
  );
  const qualityOptions = useMemo(
    () => getSaasQualityOptions(locale),
    [locale]
  );
  const motionPresets = useMemo(
    () => getVideoMotionPresets(locale),
    [locale]
  );
  const frameOptions = frameOptionsAll.filter((opt) =>
    model.aspectRatioOptions.includes(opt.value as VideoAspectRatio)
  );
  const f = copy.form;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={f.fileFormat}
          value="mp4"
          disabled
          onChange={() => undefined}
          options={[{ value: "mp4", label: "MP4" }]}
        />
        <Select
          label={f.frameFormat}
          value={aspectRatio}
          disabled={disabled}
          onChange={(value) =>
            onAspectRatioChange(value as VideoAspectRatio)
          }
          options={
            frameOptions.length > 0
              ? frameOptions
              : [frameOptionsAll.find((o) => o.value === "9:16")!]
          }
        />
        <Select
          label={f.quality}
          value={quality}
          disabled={disabled}
          onChange={(value) => onQualityChange(value as SaasQualityTier)}
          options={qualityOptions}
        />
        <Select
          label={f.duration}
          value={String(durationSeconds)}
          disabled={disabled}
          onChange={(value) => onDurationChange(Number(value))}
          options={model.durationOptions.map((value) => ({
            value: String(value),
            label: formatVideoDurationLabel(locale, value),
          }))}
        />
        <Select
          label={f.motion}
          value={motionPreset}
          disabled={disabled}
          onChange={(value) =>
            onMotionPresetChange(value as VideoMotionPresetId)
          }
          options={motionPresets.map((preset) => ({
            value: preset.id,
            label: preset.label,
          }))}
        />
      </div>
    </div>
  );
}
