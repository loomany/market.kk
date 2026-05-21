"use client";

import { StudioCheckboxCard } from "./StudioCheckboxCard";
import { useStudioCopy } from "./StudioLocaleContext";

type ImageAdvancedSettingsProps = {
  useNegativePrompt: boolean;
  negativePrompt: string;
  onUseNegativePromptChange: (value: boolean) => void;
  onNegativePromptChange: (value: string) => void;
  disabled?: boolean;
};

export function ImageAdvancedSettings({
  useNegativePrompt,
  negativePrompt,
  onUseNegativePromptChange,
  onNegativePromptChange,
  disabled,
}: ImageAdvancedSettingsProps) {
  const { copy } = useStudioCopy();
  const s = copy.imageSettings;

  return (
    <div className="space-y-2">
      <StudioCheckboxCard
        id="image-use-negative-prompt"
        label={s.negativePromptToggleLabel}
        hint={s.negativePromptToggleHint || undefined}
        checked={useNegativePrompt}
        disabled={disabled}
        onChange={onUseNegativePromptChange}
      />
      {useNegativePrompt ? (
        <div className="space-y-2 rounded-[18px] border border-border bg-white p-3">
          <p className="text-xs leading-5 text-slate-600">{s.negativePromptIntro}</p>
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
  );
}
