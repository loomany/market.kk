"use client";

import { Select } from "@/components/ui/Select";
import {
  GARMENT_PHOTO_TYPES,
  PRODUCT_CATEGORIES,
  type GarmentPhotoType,
  type ProductCategory,
} from "./types";

type GarmentSettingsPanelProps = {
  productCategory: ProductCategory;
  onProductCategoryChange: (v: ProductCategory) => void;
  garmentPhotoType: GarmentPhotoType;
  onGarmentPhotoTypeChange: (v: GarmentPhotoType) => void;
  lingerieMode?: boolean;
  /** Без заголовка — блок под загрузкой товара */
  embedded?: boolean;
};

export function GarmentSettingsPanel(props: GarmentSettingsPanelProps) {
  return (
    <div className="space-y-4">
      {!props.embedded ? (
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
      ) : null}

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
            ? "Если товар уже надет на человеке, выберите «На модели / на человеке». Даже если лицо не видно. «Товар отдельно» — только flat lay без тела."
            : "Если товар уже надет на человеке, выберите «На модели / на человеке». Даже если лицо не видно."
        }
        value={props.garmentPhotoType}
        options={GARMENT_PHOTO_TYPES.map((opt) => ({
          value: opt.id,
          label: opt.label,
        }))}
        onChange={props.onGarmentPhotoTypeChange}
      />
    </div>
  );
}
