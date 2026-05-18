"use client";

import { type ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { FAL_MODEL_RESOLUTION_OPTIONS } from "@/lib/ai/modelOutputSizes";
import {
  MODEL_CUSTOM_SELECT_OPTION,
  MODEL_CUSTOM_TEXT_MAX,
  MODEL_PARAM_CUSTOM,
} from "@/lib/ai/modelCustomParams";
import {
  PRODUCT_SHOT_ASPECT_RATIO_OPTIONS,
  aspectRatioForShotSizePreset,
  shotSizePresetFromAspectRatio,
} from "@/lib/ai/productShotSchemas";
import type { ProductShotScenePreset, ProductShotSettings } from "./types";

const SCENE_PRESETS: {
  id: Exclude<ProductShotScenePreset, typeof MODEL_PARAM_CUSTOM>;
  label: string;
  hint: string;
}[] = [
  {
    id: "marketplace-clean",
    label: "Маркетплейс",
    hint: "Чистый фон без изменения товара.",
  },
  {
    id: "white-studio",
    label: "Белый фон",
    hint: "Чаще всего подходит для карточек.",
  },
  {
    id: "light-gray-studio",
    label: "Светло-серый фон",
    hint: "Мягче белого, но всё ещё чисто.",
  },
];

const SCENE_SELECT_OPTIONS: {
  id: ProductShotScenePreset;
  label: string;
  hint: string;
}[] = [
  {
    id: MODEL_PARAM_CUSTOM,
    label: MODEL_CUSTOM_SELECT_OPTION.label,
    hint: MODEL_CUSTOM_SELECT_OPTION.hint,
  },
  ...SCENE_PRESETS,
];

type ProductShotSettingsPanelProps = {
  settings: ProductShotSettings;
  onChange: (settings: ProductShotSettings) => void;
};

function SettingField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5 px-0.5">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  placeholder = "Выберите…",
}: {
  label: string;
  description?: string;
  value?: T;
  options: {
    id: T;
    label: string;
    shortHint?: string;
    disabled?: boolean;
  }[];
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  return (
    <SettingField label={label} description={description}>
      <Select
        triggerClassName="rounded-[12px] font-medium"
        placeholder={placeholder}
        menuMatchTriggerWidth
        value={value}
        options={options.map((opt) => ({
          value: opt.id,
          label: opt.shortHint
            ? `${opt.label} — ${opt.shortHint}`
            : opt.label,
          triggerLabel: opt.label,
          disabled: opt.disabled,
        }))}
        onChange={onChange}
      />
    </SettingField>
  );
}

function hintForOption<T extends string>(
  options: ReadonlyArray<{ id: T; hint: string }>,
  value: T
): string {
  return options.find((item) => item.id === value)?.hint ?? "";
}

export function ProductShotSettingsPanel({
  settings,
  onChange,
}: ProductShotSettingsPanelProps) {
  const patch = (partial: Partial<ProductShotSettings>) =>
    onChange({ ...settings, ...partial });

  const aspectRatio = aspectRatioForShotSizePreset(settings.shotSizePreset);
  const imageQuality = settings.imageQuality;
  const isCustomScene = settings.scenePreset === MODEL_PARAM_CUSTOM;

  const sceneDescription = isCustomScene
    ? settings.sceneCustomDescription.trim()
      ? "Подберём ближайший чистый фон под ваше описание."
      : MODEL_CUSTOM_SELECT_OPTION.hint
    : hintForOption(SCENE_SELECT_OPTIONS, settings.scenePreset);

  const aspectRatioDescription = aspectRatio
    ? hintForOption(PRODUCT_SHOT_ASPECT_RATIO_OPTIONS, aspectRatio)
    : "Формат кадра для карточки.";

  const qualityDescription = imageQuality
    ? hintForOption(FAL_MODEL_RESOLUTION_OPTIONS, imageQuality)
    : "Качество итогового файла.";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки товарной карточки
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Точная карточка для маркетплейсов: фон меняется, товар остаётся как на
          фото.
        </p>
      </div>

      <div className="space-y-2">
        <SettingField
          label="Фон карточки"
          description={sceneDescription}
        >
          <div className="space-y-2">
            <Select
              triggerClassName="rounded-[12px] font-medium"
              placeholder="Выберите фон"
              menuMatchTriggerWidth
              value={settings.scenePreset}
              options={SCENE_SELECT_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.label,
                triggerLabel: opt.label,
              }))}
              onChange={(next) => patch({ scenePreset: next })}
            />
            {isCustomScene ? (
              <textarea
              rows={2}
              value={settings.sceneCustomDescription}
              maxLength={MODEL_CUSTOM_TEXT_MAX}
              placeholder="Например: тёплый бежевый, светло-серый градиент"
              onChange={(event) =>
                patch({ sceneCustomDescription: event.target.value })
              }
              className="min-h-[72px] w-full resize-y rounded-[12px] border border-border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition sm:text-sm hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            ) : null}
          </div>
        </SettingField>
      </div>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Соотношение сторон"
          description={aspectRatioDescription}
          placeholder="Выберите формат"
          value={aspectRatio}
          options={PRODUCT_SHOT_ASPECT_RATIO_OPTIONS.map((item) => ({
            id: item.id,
            label: item.label,
            shortHint: item.shortHint,
          }))}
          onChange={(nextRatio) => {
            const preset = shotSizePresetFromAspectRatio(nextRatio);
            if (preset) patch({ shotSizePreset: preset });
          }}
        />
        <SelectField
          label="Качество"
          description={qualityDescription}
          placeholder="Выберите качество"
          value={imageQuality}
          options={FAL_MODEL_RESOLUTION_OPTIONS.map((item) => ({
            id: item.id,
            label: item.label,
            shortHint: item.shortHint,
          }))}
          onChange={(nextQuality) => patch({ imageQuality: nextQuality })}
        />
      </div>
    </div>
  );
}
