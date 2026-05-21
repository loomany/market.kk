"use client";

import { Select } from "@/components/ui/Select";
import type { VideoProviderId } from "@/lib/ai/videoCatalog";
import { getVideoProviderOptions } from "@/lib/studio/i18n/videoCatalogI18n";
import { useStudioCopy } from "./StudioLocaleContext";

type VideoProviderSelectProps = {
  value: VideoProviderId;
  onChange: (provider: VideoProviderId) => void;
  disabled?: boolean;
};

export function VideoProviderSelect({
  value,
  onChange,
  disabled,
}: VideoProviderSelectProps) {
  const { locale, copy } = useStudioCopy();
  const options = getVideoProviderOptions(locale);
  const selected = options.find((o) => o.value === value);

  return (
    <Select
      label={copy.aiEditorPicker.title}
      value={value}
      disabled={disabled}
      onChange={(v) => onChange(v as VideoProviderId)}
      options={options.map((o) => ({
        value: o.value,
        label: o.label,
        description: o.hint,
        triggerLabel: o.label,
      }))}
      formatTriggerLabel={(option) => option.triggerLabel ?? option.label}
    />
  );
}
