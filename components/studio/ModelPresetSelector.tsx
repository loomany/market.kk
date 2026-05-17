"use client";

import { CheckCircle2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  MODEL_PRESETS,
  type ModelBackground,
  type ModelBodyType,
  type ModelCategoryContext,
  type ModelCrop,
  type ModelGender,
  type ModelGenerationSettings,
  type ModelPose,
  type ModelPreset,
} from "./types";

type ModelPresetSelectorProps = {
  value: ModelPreset;
  onChange: (value: ModelPreset) => void;
  settings: ModelGenerationSettings;
  onSettingsChange: (settings: ModelGenerationSettings) => void;
  onGenerate: () => void;
  generating?: boolean;
  generateError?: string | null;
  generatedPreviewUrl?: string | null;
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
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {helper && <p className="text-xs leading-5 text-slate-500">{helper}</p>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-[14px] border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
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

const GENDER_OPTIONS: { id: ModelGender; label: string }[] = [
  { id: "female", label: "Женская" },
  { id: "male", label: "Мужская" },
];

const BODY_OPTIONS: { id: ModelBodyType; label: string }[] = [
  { id: "standard", label: "Стандартная" },
  { id: "plus-size", label: "Plus-size" },
  { id: "slim", label: "Стройная" },
];

const POSE_OPTIONS: { id: ModelPose; label: string }[] = [
  { id: "front", label: "Прямо к камере" },
  { id: "slight-angle", label: "Лёгкий поворот" },
];

const CROP_OPTIONS: { id: ModelCrop; label: string }[] = [
  { id: "full-body", label: "В полный рост" },
  { id: "upper-body", label: "По пояс" },
];

const BACKGROUND_OPTIONS: { id: ModelBackground; label: string }[] = [
  { id: "white", label: "Белый" },
  { id: "light-gray", label: "Светло-серый" },
  { id: "studio", label: "Студийный" },
];

const CONTEXT_OPTIONS: { id: ModelCategoryContext; label: string }[] = [
  { id: "clothing", label: "Одежда" },
  { id: "lingerie", label: "Бельё / купальники" },
  { id: "jewelry", label: "Украшения" },
  { id: "general", label: "Универсально" },
];

export function ModelPresetSelector({
  value,
  onChange,
  settings,
  onSettingsChange,
  onGenerate,
  generating,
  generateError,
  generatedPreviewUrl,
}: ModelPresetSelectorProps) {
  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange({ ...settings, ...partial });
  const isLingerieScenario = settings.categoryContext === "lingerie";

  return (
    <div className="space-y-4 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          AI-модель для одежды
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Модель нужна для режима “Одежда на модели”. Используйте взрослую
          модель, нейтральную позу и минимум сложных аксессуаров.
        </p>
      </div>

      <div className="grid gap-2">
        {MODEL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            className={cn(
              "rounded-[16px] border px-3 py-2.5 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
              value === preset.id
                ? "border-teal-500 bg-teal-50"
                : "border-border bg-white hover:border-teal-200 hover:bg-teal-50/50"
            )}
          >
            <span className="font-semibold text-slate-950">{preset.label}</span>
            <span className="mt-0.5 block text-xs leading-5 text-slate-600">
              {preset.description}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          label="Пол модели"
          value={settings.gender}
          options={GENDER_OPTIONS}
          onChange={(gender) => patch({ gender })}
        />
        <SelectField
          label="Тип фигуры"
          value={settings.bodyType}
          options={BODY_OPTIONS}
          onChange={(bodyType) => patch({ bodyType })}
        />
        <SelectField
          label="Поза"
          value={settings.pose}
          options={POSE_OPTIONS}
          onChange={(pose) => patch({ pose })}
        />
        <SelectField
          label="Кадр для примерки"
          helper={
            isLingerieScenario
              ? "Для белья и купальников нужен полный рост или кадр по пояс с видимыми бёдрами. Портрет не подходит."
              : "Для одежды лучше подходит полный рост или кадр по пояс."
          }
          value={settings.crop}
          options={CROP_OPTIONS}
          onChange={(crop) => patch({ crop })}
        />
        <SelectField
          label="Фон"
          value={settings.background}
          options={BACKGROUND_OPTIONS}
          onChange={(background) => patch({ background })}
        />
        <SelectField
          label="Сценарий"
          value={settings.categoryContext}
          options={CONTEXT_OPTIONS}
          onChange={(categoryContext) =>
            patch({
              categoryContext,
              ...(categoryContext === "lingerie" ? { crop: "full-body" } : {}),
            })
          }
        />
      </div>

      {isLingerieScenario ? (
        <p className="rounded-[16px] bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          Для белья используйте взрослую модель, нейтральную позу, чистый фон и
          руки, которые не закрывают грудь, талию и бёдра.
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={generating}
        onClick={onGenerate}
      >
        <UserRound className="h-4 w-4" />
        {generating
          ? "Генерируем модель для примерки…"
          : "Сгенерировать AI-модель"}
      </Button>

      {generateError && (
        <p className="rounded-[16px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generateError}
        </p>
      )}

      {generatedPreviewUrl && !generating && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            AI-модель готова. Теперь можно создать фото товара на модели.
          </p>
          <div className="overflow-hidden rounded-[18px] border border-emerald-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedPreviewUrl}
              alt="Готовая AI-модель"
              className="max-h-[460px] min-h-[260px] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
