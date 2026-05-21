"use client";

import type { VideoVariantCapabilities } from "@/lib/ai/videoCatalog";
import { StudioCheckboxCard } from "./StudioCheckboxCard";
import { useStudioCopy } from "./StudioLocaleContext";

type VideoAdvancedSettingsProps = {
  capabilities: VideoVariantCapabilities;
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

export function VideoAdvancedSettings({
  capabilities,
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
}: VideoAdvancedSettingsProps) {
  const { copy } = useStudioCopy();
  const s = copy.videoSettings;

  const showPanel =
    capabilities.supportsNegativePrompt ||
    capabilities.supportsNativeAudio ||
    capabilities.supportsReferenceVideoSound;

  if (!showPanel) return null;

  return (
    <div className="space-y-2">
      {capabilities.supportsNativeAudio ? (
        <div className="space-y-2">
          <StudioCheckboxCard
            id="video-generate-audio"
            label={s.generateAudioLabel}
            hint={s.generateAudioHint || undefined}
            checked={generateAudio}
            disabled={disabled}
            onChange={onGenerateAudioChange}
          />
          {generateAudio ? (
            <div className="space-y-2 rounded-[18px] border border-border bg-white p-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  {s.soundPromptFieldLabel}
                </span>
                <textarea
                  value={soundPrompt}
                  disabled={disabled}
                  rows={2}
                  placeholder={s.soundPromptPlaceholder}
                  onChange={(e) => onSoundPromptChange(e.target.value)}
                  className="w-full resize-y rounded-[14px] border border-border bg-slate-50/80 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : null}

      {capabilities.supportsReferenceVideoSound ? (
        <StudioCheckboxCard
          id="video-keep-reference-sound"
          label={s.keepReferenceSoundLabel}
          hint={s.keepReferenceSoundHint || undefined}
          checked={keepReferenceSound}
          disabled={disabled}
          onChange={onKeepReferenceSoundChange}
        />
      ) : null}

      {capabilities.supportsNegativePrompt ? (
        <div className="space-y-2">
          <StudioCheckboxCard
            id="video-use-negative-prompt"
            label={s.negativePromptToggleLabel}
            hint={s.negativePromptToggleHint || undefined}
            checked={useNegativePrompt}
            disabled={disabled}
            onChange={onUseNegativePromptChange}
          />
          {useNegativePrompt ? (
            <div className="space-y-2 rounded-[18px] border border-border bg-white p-3">
              <p className="text-xs leading-5 text-slate-600">
                {s.negativePromptIntro}
              </p>
              <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {s.negativePromptFieldLabel}
              </span>
              <textarea
                value={negativePrompt}
                disabled={disabled}
                rows={3}
                placeholder={s.negativePromptPlaceholder}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                className="w-full resize-y rounded-[14px] border border-border bg-slate-50/80 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
