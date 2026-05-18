"use client";

import { AlertTriangle } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { isLingerieTryOnSettingsWeakened } from "@/lib/studio/lingerieTryOnDefaults";
import {
  GARMENT_PHOTO_TYPES,
  PRODUCT_CATEGORIES,
  TRY_ON_QUALITY_OPTIONS,
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

export function GarmentSettingsPanel(props: GarmentSettingsPanelProps) {
  const qualityDescription =
    TRY_ON_QUALITY_OPTIONS.find((item) => item.id === props.qualityMode)?.hint ??
    "Баланс качества и скорости";

  const showLingerieWeakWarning =
    props.lingerieMode &&
    isLingerieTryOnSettingsWeakened(
      props.garmentPhotoType,
      props.qualityMode
    );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки примерки
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Обычно можно оставить «Авто». Уточняйте, если результат путает тип
          товара.
        </p>
      </div>

      {props.lingerieMode ? (
        <div className="rounded-[16px] border border-teal-100 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-950">
          Для белья мы включили точную примерку: фото на человеке, высокое
          качество и разрешённый режим для каталожной съёмки.
        </div>
      ) : null}

      {showLingerieWeakWarning ? (
        <div
          role="status"
          className="flex gap-2 rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Для белья лучше использовать «Одежда на человеке» и максимальное
            качество.
          </span>
        </div>
      ) : null}

      <Select
        label="Тип товара"
        helper={
          props.lingerieMode
            ? "Для комплекта белья начните с «Авто». Если низ или верх теряется, попробуйте «Платье / комплект»."
            : "Помогает AI понять, какую часть одежды переносить на модель."
        }
        value={props.productCategory}
        options={PRODUCT_CATEGORIES.map((opt) => ({
          value: opt.id,
          label: opt.label,
        }))}
        onChange={props.onProductCategoryChange}
      />
      <Select
        label="Тип исходного фото"
        helper={
          props.lingerieMode
            ? "Для исходника, где бельё уже надето на модели, выберите «Одежда на человеке»."
            : "Укажите, сфотографирована одежда отдельно или уже на человеке."
        }
        value={props.garmentPhotoType}
        options={GARMENT_PHOTO_TYPES.map((opt) => ({
          value: opt.id,
          label: opt.label,
        }))}
        onChange={props.onGarmentPhotoTypeChange}
      />
      <Select
        label="Качество"
        helper={qualityDescription}
        value={props.qualityMode}
        options={TRY_ON_QUALITY_OPTIONS.map((opt) => ({
          value: opt.id,
          label: `${opt.label} — ${opt.shortHint}`,
          triggerLabel: opt.label,
        }))}
        onChange={props.onQualityModeChange}
      />
    </div>
  );
}
