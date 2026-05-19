"use client";

import { Select } from "@/components/ui/Select";
import { VIDEO_MODELS, type VideoModelKey } from "@/lib/ai/videoModels";
import {
  SAAS_QUALITY_OPTIONS,
  type SaasQualityTier,
} from "./ImageSettingsForm";

export const VIDEO_MOTION_PRESETS = [
  { id: "subtle-motion", label: "Мягкое движение камеры" },
  { id: "model-turn", label: "Поворот модели" },
  { id: "camera-push", label: "Приближение" },
  { id: "product-fidelity", label: "Товар без искажений" },
] as const;

export type VideoMotionPresetId = (typeof VIDEO_MOTION_PRESETS)[number]["id"];

export type VideoAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

const VIDEO_FRAME_OPTIONS = [
  { value: "9:16", label: "9:16 — Reels / Stories" },
  { value: "4:5", label: "4:5 — маркетплейсы / соцсети" },
  { value: "1:1", label: "1:1 — квадрат" },
  { value: "16:9", label: "16:9 — горизонтальное видео" },
] as const;

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
  const model = VIDEO_MODELS[modelKey];
  const frameOptions = VIDEO_FRAME_OPTIONS.filter((opt) =>
    model.aspectRatioOptions.includes(opt.value as VideoAspectRatio)
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Формат файла"
          value="mp4"
          disabled
          onChange={() => undefined}
          options={[{ value: "mp4", label: "MP4" }]}
        />
        <Select
          label="Формат кадра"
          value={aspectRatio}
          disabled={disabled}
          onChange={(value) =>
            onAspectRatioChange(value as VideoAspectRatio)
          }
          options={
            frameOptions.length > 0
              ? [...frameOptions]
              : [{ value: "9:16", label: "9:16 — Reels / Stories" }]
          }
        />
        <Select
          label="Качество"
          value={quality}
          disabled={disabled}
          onChange={(value) => onQualityChange(value as SaasQualityTier)}
          options={[...SAAS_QUALITY_OPTIONS]}
        />
        <Select
          label="Длительность"
          value={String(durationSeconds)}
          disabled={disabled}
          onChange={(value) => onDurationChange(Number(value))}
          options={model.durationOptions.map((value) => ({
            value: String(value),
            label: `${value} сек`,
          }))}
        />
        <Select
          label="Движение"
          value={motionPreset}
          disabled={disabled}
          onChange={(value) =>
            onMotionPresetChange(value as VideoMotionPresetId)
          }
          options={VIDEO_MOTION_PRESETS.map((preset) => ({
            value: preset.id,
            label: preset.label,
          }))}
        />
      </div>
    </div>
  );
}
