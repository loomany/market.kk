"use client";

import { Select } from "@/components/ui/Select";
import { GARMENT_PHOTO_TYPES, type GarmentPhotoType } from "./types";

/** Ручной override garmentPhotoType — только в «Дополнительные настройки». */
export function GarmentPhotoTypeAdvancedSelect(props: {
  garmentPhotoType: GarmentPhotoType;
  onGarmentPhotoTypeChange: (v: GarmentPhotoType) => void;
}) {
  return (
    <Select
      label="Тип исходного фото"
      helper="По умолчанию AI определяет автоматически. Меняйте только если примерка ошибается."
      value={props.garmentPhotoType}
      options={GARMENT_PHOTO_TYPES.map((opt) => ({
        value: opt.id,
        label: opt.label,
      }))}
      onChange={props.onGarmentPhotoTypeChange}
    />
  );
}
