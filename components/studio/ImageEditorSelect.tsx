"use client";

import { Select } from "@/components/ui/Select";
import type { ImageEditorId } from "@/lib/ai/imageEnhanceSchemas";
import type { PostProcessingEditor } from "@/lib/studio/postProcessingEditors";
import { useStudioCopy } from "./StudioLocaleContext";

type ImageEditorSelectProps = {
  editors: PostProcessingEditor[];
  value: ImageEditorId;
  onChange: (id: ImageEditorId) => void;
  disabled?: boolean;
};

export function ImageEditorSelect({
  editors,
  value,
  onChange,
  disabled,
}: ImageEditorSelectProps) {
  const { copy } = useStudioCopy();

  return (
    <Select
      label={copy.aiEditorPicker.title}
      value={value}
      disabled={disabled}
      onChange={(v) => onChange(v as ImageEditorId)}
      options={editors.map((editor) => ({
        value: editor.id as ImageEditorId,
        label: editor.title,
        description: editor.description,
        triggerLabel: editor.title,
        disabled: !editor.available || editor.comingSoon,
      }))}
      formatTriggerLabel={(option) => option.triggerLabel ?? option.label}
    />
  );
}
