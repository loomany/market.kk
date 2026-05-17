"use client";

import {
  GARMENT_PHOTO_TYPES,
  PRODUCT_CATEGORIES,
  QUALITY_MODES,
  type GarmentPhotoType,
  type ProductCategory,
  type QualityMode,
} from "./types";

type GarmentSettingsPanelProps = {
  productCategory: ProductCategory;
  onProductCategoryChange: (v: ProductCategory) => void;
  garmentPhotoType: GarmentPhotoType;
  onGarmentPhotoTypeChange: (v: GarmentPhotoType) => void;
  qualityMode: QualityMode;
  onQualityModeChange: (v: QualityMode) => void;
  numSamples: number;
  onNumSamplesChange: (v: number) => void;
};

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function GarmentSettingsPanel(props: GarmentSettingsPanelProps) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Product type"
        value={props.productCategory}
        options={PRODUCT_CATEGORIES}
        onChange={props.onProductCategoryChange}
      />
      <SelectField
        label="Source photo type"
        value={props.garmentPhotoType}
        options={GARMENT_PHOTO_TYPES}
        onChange={props.onGarmentPhotoTypeChange}
      />
      <SelectField
        label="Quality mode"
        value={props.qualityMode}
        options={QUALITY_MODES}
        onChange={props.onQualityModeChange}
      />
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-900">
          Number of samples: {props.numSamples}
        </label>
        <input
          type="range"
          min={1}
          max={4}
          value={props.numSamples}
          onChange={(e) => props.onNumSamplesChange(Number(e.target.value))}
          className="w-full accent-violet-600"
        />
      </div>
    </div>
  );
}
