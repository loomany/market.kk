"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import {
  getVideoVariant,
  mapSaasQualityToVideoApi,
  type KlingMotionOrientation,
  type VideoProviderId,
  type VideoVariantId,
} from "@/lib/ai/videoCatalog";
import type { SaasQualityTier } from "./ImageSettingsForm";
import {
  formatVideoDurationLabel,
  getSaasQualityOptions,
  getVideoFrameFormatOptions,
  getVideoMotionPresets,
} from "@/lib/studio/i18n/studioFormOptions";
import {
  getMotionOrientationOptions as getOrientOptions,
  getVideoVariantOptions,
} from "@/lib/studio/i18n/videoCatalogI18n";
import { useStudioCopy } from "./StudioLocaleContext";
import { VideoAdvancedSettings } from "./VideoAdvancedSettings";

export type VideoMotionPresetId =
  | "subtle-motion"
  | "model-turn"
  | "camera-push"
  | "product-fidelity";

export type VideoAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export { mapSaasQualityToVideoApi };

type VideoSettingsFormProps = {
  provider: VideoProviderId;
  variantId: VideoVariantId;
  onVariantChange: (variantId: VideoVariantId) => void;
  quality: SaasQualityTier;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  motionPreset: VideoMotionPresetId;
  referenceVideoUrl: string;
  characterOrientation: KlingMotionOrientation;
  onQualityChange: (tier: SaasQualityTier) => void;
  onDurationChange: (seconds: number) => void;
  onAspectRatioChange: (ratio: VideoAspectRatio) => void;
  onMotionPresetChange: (preset: VideoMotionPresetId) => void;
  onReferenceVideoUrlChange: (url: string) => void;
  onCharacterOrientationChange: (orientation: KlingMotionOrientation) => void;
  generateAudio: boolean;
  soundPrompt: string;
  useNegativePrompt: boolean;
  negativePrompt: string;
  keepReferenceSound: boolean;
  onGenerateAudioChange: (value: boolean) => void;
  onSoundPromptChange: (value: string) => void;
  onUseNegativePromptChange: (value: boolean) => void;
  onNegativePromptChange: (value: string) => void;
  onKeepReferenceSoundChange: (value: boolean) => void;
  disabled?: boolean;
};

export function VideoSettingsForm({
  provider,
  variantId,
  onVariantChange,
  quality,
  durationSeconds,
  aspectRatio,
  motionPreset,
  referenceVideoUrl,
  characterOrientation,
  onQualityChange,
  onDurationChange,
  onAspectRatioChange,
  onMotionPresetChange,
  onReferenceVideoUrlChange,
  onCharacterOrientationChange,
  generateAudio,
  soundPrompt,
  useNegativePrompt,
  negativePrompt,
  keepReferenceSound,
  onGenerateAudioChange,
  onSoundPromptChange,
  onUseNegativePromptChange,
  onNegativePromptChange,
  onKeepReferenceSoundChange,
  disabled,
}: VideoSettingsFormProps) {
  const { locale, copy } = useStudioCopy();
  const variant = getVideoVariant(variantId);
  const caps = variant.capabilities;
  const vs = copy.videoSettings;

  const variantOptions = useMemo(
    () => getVideoVariantOptions(locale, provider),
    [locale, provider]
  );

  const frameOptionsAll = useMemo(
    () => getVideoFrameFormatOptions(locale),
    [locale]
  );
  const qualityOptionsAll = useMemo(
    () => getSaasQualityOptions(locale),
    [locale]
  );
  const motionPresets = useMemo(
    () => getVideoMotionPresets(locale),
    [locale]
  );
  const orientOptions = useMemo(
    () => getOrientOptions(locale),
    [locale]
  );

  const frameOptions = frameOptionsAll.filter((opt) =>
    variant.aspectRatioOptions.includes(opt.value as VideoAspectRatio)
  );

  const qualityOptions = qualityOptionsAll.filter((opt) =>
    variant.qualityOptions.some((q) => q.id === opt.value)
  );

  const selectedVariantHint =
    variantOptions.find((o) => o.value === variantId)?.hint ?? "";

  const f = copy.form;

  return (
    <div className="space-y-3">
      <Select
        label={vs.modelLabel}
        value={variantId}
        disabled={disabled}
        onChange={(value) => onVariantChange(value as VideoVariantId)}
        options={variantOptions.map((o) => ({
          value: o.value,
          label: o.label,
          description: o.hint,
          triggerLabel: o.label,
        }))}
      />

      {selectedVariantHint ? (
        <p className="text-xs leading-5 text-slate-500">{selectedVariantHint}</p>
      ) : null}

      {caps.requiresReferenceVideo ? (
        <div className="space-y-2">
          <label className="block space-y-1.5 text-sm font-semibold text-slate-950">
            <span>{vs.referenceVideo}</span>
            <input
              type="url"
              value={referenceVideoUrl}
              disabled={disabled}
              placeholder="https://…/motion.mp4"
              onChange={(e) => onReferenceVideoUrlChange(e.target.value)}
              className="w-full rounded-[16px] border border-border px-3 py-3 text-sm font-normal outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
          </label>
          <p className="text-xs leading-5 text-slate-500">{vs.referenceVideoHint}</p>
          {caps.supportsMotionOrientation ? (
            <Select
              label={vs.motionOrientationLabel}
              value={characterOrientation}
              disabled={disabled}
              onChange={(value) =>
                onCharacterOrientationChange(value as KlingMotionOrientation)
              }
              options={orientOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {caps.supportsAspectRatio && frameOptions.length > 0 ? (
          <Select
            label={f.frameFormat}
            value={aspectRatio}
            disabled={disabled}
            onChange={(value) =>
              onAspectRatioChange(value as VideoAspectRatio)
            }
            options={frameOptions}
          />
        ) : null}

        {caps.supportsQuality && qualityOptions.length > 0 ? (
          <Select
            label={f.quality}
            value={quality}
            disabled={disabled}
            onChange={(value) => onQualityChange(value as SaasQualityTier)}
            options={qualityOptions}
          />
        ) : null}

        {caps.supportsDuration && variant.durationOptions.length > 0 ? (
          <Select
            label={f.duration}
            value={String(durationSeconds)}
            disabled={disabled}
            onChange={(value) => onDurationChange(Number(value))}
            options={variant.durationOptions.map((value) => ({
              value: String(value),
              label: formatVideoDurationLabel(locale, value),
            }))}
          />
        ) : null}

        {caps.supportsMotionPreset ? (
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
        ) : null}
      </div>

      <VideoAdvancedSettings
        capabilities={caps}
        generateAudio={generateAudio}
        soundPrompt={soundPrompt}
        useNegativePrompt={useNegativePrompt}
        negativePrompt={negativePrompt}
        keepReferenceSound={keepReferenceSound}
        onGenerateAudioChange={onGenerateAudioChange}
        onSoundPromptChange={onSoundPromptChange}
        onUseNegativePromptChange={onUseNegativePromptChange}
        onNegativePromptChange={onNegativePromptChange}
        onKeepReferenceSoundChange={onKeepReferenceSoundChange}
        disabled={disabled}
      />
    </div>
  );
}
