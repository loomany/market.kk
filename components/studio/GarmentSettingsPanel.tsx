"use client";

import { Select } from "@/components/ui/Select";
import {
  GARMENT_PHOTO_TYPES,
  PRODUCT_CATEGORIES,
  type GarmentPhotoType,
  type ProductCategory,
  type QualityMode,
} from "./types";

type GarmentSettingsPanelProps = {
  productCategory: ProductCategory;
  onProductCategoryChange: (v: ProductCategory) => void;
  garmentPhotoType: GarmentPhotoType;
  onGarmentPhotoTypeChange: (v: GarmentPhotoType) => void;
  /** Derived from model output resolution (step «Модель»). */
  tryOnQualityMode: QualityMode;
  modelOutputSizeLabel?: string;
  lingerieMode?: boolean;
};

export function GarmentSettingsPanel(props: GarmentSettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки примерки
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {props.lingerieMode
            ? "Для flat lay на карточке: «Платье / комплект» и «Одежда отдельно». Только трусы — «Низ» и крупный кроп низа."
            : "Обычно можно оставить «Авто». Уточняйте, если результат путает тип товара."}
        </p>
      </div>

      <Select
        label="Тип товара"
        helper={
          props.lingerieMode
            ? "Комплект bra+brief на одном фото — «Платье / комплект». Только низ — «Низ»."
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
            ? "Карточка на белом фоне — «Одежда отдельно». Если товар уже на модели в исходнике — «Одежда на человеке»."
            : "Укажите, сфотографирована одежда отдельно или уже на человеке."
        }
        value={props.garmentPhotoType}
        options={GARMENT_PHOTO_TYPES.map((opt) => ({
          value: opt.id,
          label: opt.label,
        }))}
        onChange={props.onGarmentPhotoTypeChange}
      />
      {props.modelOutputSizeLabel ? (
        <p className="rounded-[14px] border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs leading-5 text-slate-600">
          Качество примерки:{" "}
          <span className="font-medium text-slate-800">
            {props.modelOutputSizeLabel}
          </span>{" "}
          — как в настройках модели выше (соотношение сторон и разрешение).
        </p>
      ) : null}
    </div>
  );
}
