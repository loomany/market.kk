"use client";

import { Select } from "@/components/ui/Select";
import { getGarmentPhotoTypes } from "@/lib/studio/i18n/studioOptionLists";
import type { GarmentPhotoType } from "./types";
import { useStudioCopy } from "./StudioLocaleContext";

/** Ручной override garmentPhotoType — только в «Дополнительные настройки». */
export function GarmentPhotoTypeAdvancedSelect(props: {
  garmentPhotoType: GarmentPhotoType;
  onGarmentPhotoTypeChange: (v: GarmentPhotoType) => void;
}) {
  const { locale, copy } = useStudioCopy();
  const g = copy.garmentSettings;

  return (
    <Select
      label={g.photoTypeLabel}
      helper={g.photoTypeHelper}
      value={props.garmentPhotoType}
      options={getGarmentPhotoTypes(locale).map((opt) => ({
        value: opt.id,
        label: opt.label,
      }))}
      onChange={props.onGarmentPhotoTypeChange}
    />
  );
}
