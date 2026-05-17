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
}[] = [
  { id: "marketplace-clean", label: "Маркетплейс" },
  { id: "white-studio", label: "Белый фон" },
  { id: "light-gray-studio", label: "Серый фон" },
  { id: "luxury-boutique", label: "Luxury" },
  { id: "jewelry-display", label: "Jewelry" },
  { id: "flat-lay", label: "Flat lay" },
  { id: "custom", label: "Custom" },
];

const SHOT_SIZE_PRESETS: { id: ShotSizePreset; label: string }[] = [
  { id: "square", label: "1:1" },
  { id: "portrait", label: "4:5" },
  { id: "vertical", label: "3:4" },
  { id: "wide", label: "Wide" },
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
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Сцена</label>
        <div className="flex flex-wrap gap-2">
          {SCENE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ scenePreset: preset.id })}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                settings.scenePreset === preset.id
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {settings.scenePreset === "custom" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Custom scene (English)
          </label>
          <textarea
            value={settings.customSceneDescription}
            onChange={(e) =>
              patch({ customSceneDescription: e.target.value })
            }
            rows={3}
            placeholder="Describe the studio scene in English..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-900">
          Вариантов: {settings.numResults}
        </label>
        <input
          type="range"
          min={1}
          max={4}
          value={settings.numResults}
          onChange={(e) => patch({ numResults: Number(e.target.value) })}
          className="w-full accent-violet-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900">Формат</label>
        <div className="flex flex-wrap gap-2">
          {SHOT_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ shotSizePreset: preset.id })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                settings.shotSizePreset === preset.id
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Лучше всего работает с фото товара на чистом фоне или после удаления
        фона.
      </p>
    </div>
  );
}
