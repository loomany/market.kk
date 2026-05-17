"use client";

import { cn } from "@/lib/utils";
import type {
  ProductShotScenePreset,
  ProductShotSettings,
  ShotSizePreset,
} from "./types";

const SCENE_PRESETS: {
  id: ProductShotScenePreset;
  label: string;
  hint: string;
}[] = [
  {
    id: "marketplace-clean",
    label: "Маркетплейс",
    hint: "Светлый фон и аккуратная тень.",
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
    hint: "Более премиальная сцена.",
  },
  {
    id: "jewelry-display",
    label: "Бижутерия",
    hint: "Для украшений и маленьких аксессуаров.",
  },
  {
    id: "flat-lay",
    label: "Flat lay",
    hint: "Товар лежит на чистой поверхности.",
  },
  {
    id: "custom",
    label: "Свой сценарий",
    hint: "Коротко опишите фон и свет.",
  },
];

const SHOT_SIZE_PRESETS: { id: ShotSizePreset; label: string; hint: string }[] =
  [
    { id: "square", label: "1:1", hint: "Квадрат" },
    { id: "portrait", label: "4:5", hint: "Вертикально" },
    { id: "vertical", label: "3:4", hint: "Каталог" },
    { id: "wide", label: "Wide", hint: "Шире" },
  ];

type ProductShotSettingsPanelProps = {
  settings: ProductShotSettings;
  onChange: (settings: ProductShotSettings) => void;
};

export function ProductShotSettingsPanel({
  settings,
  onChange,
}: ProductShotSettingsPanelProps) {
  const patch = (partial: Partial<ProductShotSettings>) =>
    onChange({ ...settings, ...partial });

  return (
    <div className="space-y-4 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Настройки Product Shot
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Product Shot — это товарное фото без модели. Для маркетплейсов чаще
          всего подходит белый или светлый фон.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">Пресет</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCENE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ scenePreset: preset.id })}
              className={cn(
                "rounded-[16px] border px-3 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
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
          ))}
        </div>
      </div>

      {settings.scenePreset === "custom" && (
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
            placeholder="Например: светлый фон, мягкая тень, аккуратная витрина"
            className="w-full rounded-[16px] border border-border px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <p className="text-xs leading-5 text-slate-500">
            Для Instagram можно использовать более красивую сцену. Для
            маркетплейсов лучше оставаться ближе к белому или светлому фону.
          </p>
        </div>
      )}

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
          onChange={(event) => patch({ numResults: Number(event.target.value) })}
          className="w-full accent-teal-700"
          aria-label="Количество вариантов Product Shot"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">
          Формат изображения
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SHOT_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ shotSizePreset: preset.id })}
              className={cn(
                "rounded-[16px] border px-3 py-2 text-left text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                settings.shotSizePreset === preset.id
                  ? "border-teal-500 bg-teal-50 text-teal-950"
                  : "border-border bg-white text-slate-600 hover:border-teal-200"
              )}
            >
              {preset.label}
              <span className="mt-0.5 block font-normal text-slate-500">
                {preset.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-[16px] bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        Для бижутерии лучше выбирать пресет “Бижутерия”. Для карточек
        маркетплейсов чаще всего подходит белый или светлый фон.
      </p>
    </div>
  );
}
