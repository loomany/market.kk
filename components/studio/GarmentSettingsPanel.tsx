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
  lingerieMode?: boolean;
};

function SelectField<T extends string>({
  label,
  helper,
  value,
  options,
  onChange,
}: {
  label: string;
  helper?: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-950">{label}</label>
      {helper && <p className="text-xs leading-5 text-slate-500">{helper}</p>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-[16px] border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
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
    <div className="space-y-4 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки одежды
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Обычно можно оставить “Авто”. Уточняйте настройки, если результат
          путает тип товара.
        </p>
      </div>

      {props.lingerieMode && (
        <div className="rounded-[16px] border border-teal-100 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-950">
          Для белья на человеке используется тип исходного фото “Одежда на
          человеке”, режим “Максимальное качество” и разрешение для
          коммерческого белья/купальников.
        </div>
      )}

      <SelectField
        label="Тип товара"
        helper={
          props.lingerieMode
            ? "Для комплекта белья начните с “Авто”. Если низ или верх теряется, попробуйте “Платье / комплект”."
            : "Помогает AI понять, какую часть одежды переносить на модель."
        }
        value={props.productCategory}
        options={PRODUCT_CATEGORIES}
        onChange={props.onProductCategoryChange}
      />
      <SelectField
        label="Тип исходного фото"
        helper={
          props.lingerieMode
            ? "Для исходника, где бельё уже надето на модели, выберите “Одежда на человеке”."
            : "Укажите, сфотографирована одежда отдельно или уже на человеке."
        }
        value={props.garmentPhotoType}
        options={GARMENT_PHOTO_TYPES}
        onChange={props.onGarmentPhotoTypeChange}
      />
      <SelectField
        label="Качество"
        helper="Максимальное качество может ждать дольше."
        value={props.qualityMode}
        options={QUALITY_MODES.filter((mode) => mode.id !== "performance")}
        onChange={props.onQualityModeChange}
      />
    </div>
  );
}
