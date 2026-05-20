"use client";

import { useEffect, type ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { MODEL_PARAM_CUSTOM } from "@/lib/ai/modelCustomParams";
import {
  PRODUCT_SHOT_ASPECT_RATIO_OPTIONS,
  aspectRatioForShotSizePreset,
  shotSizePresetFromAspectRatio,
} from "@/lib/ai/productShotSchemas";
import {
  AspectRatioSelectField,
  hintForAspectRatioOption,
} from "@/components/studio/AspectRatioSelectField";
import type { ProductShotScenePreset, ProductShotSettings } from "./types";

const MARKETPLACE_SCENE_HELP =
  "Стандартная карточка для Kaspi, Wildberries и Ozon: ровный нейтральный фон, товар остаётся как на вашем фото — меняется только подложка, без декора и без перекраски изделия.";

const SCENE_PRESETS: {
  id: Exclude<ProductShotScenePreset, typeof MODEL_PARAM_CUSTOM>;
  label: string;
  hint: string;
}[] = [
  {
    id: "marketplace-clean",
    label: "Маркетплейс",
    hint: MARKETPLACE_SCENE_HELP,
  },
  {
    id: "white-studio",
    label: "Белый фон",
    hint: "Чистый белый фон — универсальный вариант для карточки.",
  },
  {
    id: "light-gray-studio",
    label: "Светло-серый фон",
    hint: "Мягкий серый фон — чуть мягче белого, всё ещё нейтрально.",
  },
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
  const scenePreset =
    settings.scenePreset === MODEL_PARAM_CUSTOM
      ? "marketplace-clean"
      : settings.scenePreset;

  useEffect(() => {
    if (settings.scenePreset !== MODEL_PARAM_CUSTOM) return;
    onChange({
      ...settings,
      scenePreset: "marketplace-clean",
      sceneCustomDescription: "",
    });
  }, [settings.scenePreset]);

  const sceneDescription =
    scenePreset === "marketplace-clean"
      ? MARKETPLACE_SCENE_HELP
      : hintForOption(SCENE_PRESETS, scenePreset);

  const aspectRatioDescription = aspectRatio
    ? hintForAspectRatioOption(PRODUCT_SHOT_ASPECT_RATIO_OPTIONS, aspectRatio)
    : "Формат кадра для карточки.";

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
              value={scenePreset}
              options={SCENE_PRESETS.map((opt) => ({
                value: opt.id,
                label: opt.label,
                triggerLabel: opt.label,
              }))}
              onChange={(next) =>
                patch({
                  scenePreset: next,
                  sceneCustomDescription: "",
                })
              }
            />
          </div>
        </SettingField>
      </div>

      <div className="flex flex-col gap-4">
        <AspectRatioSelectField
          description={aspectRatioDescription}
          value={aspectRatio}
          options={PRODUCT_SHOT_ASPECT_RATIO_OPTIONS}
          onChange={(nextRatio) => {
            const preset = shotSizePresetFromAspectRatio(nextRatio);
            if (preset) patch({ shotSizePreset: preset });
          }}
        />
      </div>
    </div>
  );
}
