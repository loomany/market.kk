"use client";

import { cn } from "@/lib/utils";
import { PRODUCT_SHOT_SIZE_OPTIONS } from "@/lib/ai/productShotSchemas";
import {
  isMarketplaceScenePreset,
  PRODUCT_SHOT_FIDELITY_MODES,
} from "@/lib/ai/productShotFidelity";
import type { ProductShotScenePreset, ProductShotSettings } from "./types";

const SCENE_PRESETS: {
  id: ProductShotScenePreset;
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
  {
    id: "luxury-boutique",
    label: "Luxury",
    hint: "Более премиальная сцена (креатив).",
  },
  {
    id: "jewelry-display",
    label: "Бижутерия",
    hint: "Для украшений (креатив с усиленным контролем).",
  },
  {
    id: "flat-lay",
    label: "Flat lay",
    hint: "Товар на чистой поверхности (креатив).",
  },
  {
    id: "custom",
    label: "Свой сценарий",
    hint: "Только для креативной сцены.",
  },
];

type ProductShotSettingsPanelProps = {
  settings: ProductShotSettings;
  onChange: (settings: ProductShotSettings) => void;
  hasSelectedProduct?: boolean;
  useSelectedForCreative?: boolean;
  onUseSelectedForCreativeChange?: (value: boolean) => void;
};

export function ProductShotSettingsPanel({
  settings,
  onChange,
  hasSelectedProduct = false,
  useSelectedForCreative = false,
  onUseSelectedForCreativeChange,
}: ProductShotSettingsPanelProps) {
  const patch = (partial: Partial<ProductShotSettings>) =>
    onChange({ ...settings, ...partial });

  const marketplaceLocked =
    isMarketplaceScenePreset(settings.scenePreset) ||
    settings.fidelityMode === "exact-card";

  const handlePresetSelect = (preset: ProductShotScenePreset) => {
    if (isMarketplaceScenePreset(preset)) {
      patch({ scenePreset: preset, fidelityMode: "exact-card" });
      return;
    }
    patch({ scenePreset: preset });
  };

  return (
    <div className="space-y-4 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки Product Shot
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Товарное фото без модели. Для маркетплейсов используйте «Точная
          карточка».
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">Режим</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRODUCT_SHOT_FIDELITY_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => patch({ fidelityMode: mode.id })}
              className={cn(
                "rounded-[16px] border px-3 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                settings.fidelityMode === mode.id
                  ? "border-teal-500 bg-teal-50 text-teal-950"
                  : "border-border bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/50"
              )}
            >
              <span className="font-semibold">{mode.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                {mode.description}
              </span>
            </button>
          ))}
        </div>
        {settings.fidelityMode === "exact-card" ? (
          <p className="rounded-[14px] bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-900">
            Лучший выбор для маркетплейсов. Сначала удаляем фон и собираем
            чистую карточку, чтобы не менять сам товар. Если в карточку попала
            ветка, рука или декор — вернитесь и выделите товар вручную.
          </p>
        ) : (
          <p className="rounded-[14px] bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            AI может изменить детали товара. Используйте только после проверки.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">Пресет</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCENE_PRESETS.map((preset) => {
            const disabledCreativeOnly =
              settings.fidelityMode === "exact-card" &&
              !isMarketplaceScenePreset(preset.id);

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabledCreativeOnly}
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  "rounded-[16px] border px-3 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-45",
                  settings.scenePreset === preset.id
                    ? "border-teal-500 bg-teal-50 text-teal-950"
                    : "border-border bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/50"
                )}
              >
                <span className="font-semibold">{preset.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
        {marketplaceLocked && settings.fidelityMode === "creative-scene" && (
          <p className="text-xs leading-5 text-slate-500">
            Пресет «Маркетплейс» переключает на точную карточку автоматически.
          </p>
        )}
      </div>

      {settings.fidelityMode === "creative-scene" &&
        settings.scenePreset === "custom" && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-950">
              Свой сценарий
            </label>
            <textarea
              value={settings.customSceneDescription}
              onChange={(event) =>
                patch({ customSceneDescription: event.target.value })
              }
              rows={3}
              placeholder="Например: светлая витрина, мягкий свет"
              className="w-full rounded-[16px] border border-border px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        )}

      {settings.fidelityMode === "creative-scene" &&
        hasSelectedProduct &&
        onUseSelectedForCreativeChange && (
          <label className="flex cursor-pointer items-start gap-2 rounded-[14px] border border-border bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-700">
            <input
              type="checkbox"
              checked={useSelectedForCreative}
              onChange={(e) => onUseSelectedForCreativeChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-teal-700"
            />
            <span>
              Использовать выделенный товар для креативной сцены
            </span>
          </label>
        )}

      {settings.fidelityMode === "creative-scene" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-950">
              Количество вариантов
            </label>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {settings.numResults}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            value={settings.numResults}
            onChange={(event) =>
              patch({ numResults: Number(event.target.value) })
            }
            className="w-full accent-teal-700"
            aria-label="Количество вариантов Product Shot"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">
          Формат изображения
        </label>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {PRODUCT_SHOT_SIZE_OPTIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ shotSizePreset: preset.id })}
              className={cn(
                "min-w-0 rounded-[16px] border px-3 py-2 text-left text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                preset.id === "reels_9_16" && "col-span-2",
                settings.shotSizePreset === preset.id
                  ? "border-teal-500 bg-teal-50 text-teal-950"
                  : "border-border bg-white text-slate-600 hover:border-teal-200"
              )}
            >
              <span className="block">{preset.ratio}</span>
              <span className="mt-0.5 block font-normal text-slate-500">
                {preset.pixels}
              </span>
              {preset.subtitle ? (
                <span className="mt-0.5 block text-[11px] font-normal text-slate-400">
                  {preset.subtitle}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Для маркетплейсов чаще всего подходит 1:1 или 4:5. Для Reels, Stories
          и TikTok используйте 9:16.
        </p>
      </div>
    </div>
  );
}
