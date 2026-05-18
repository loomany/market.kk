"use client";

import { Check, CheckCircle2, ChevronDown, UserRound } from "lucide-react";
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
  modelDescription: string;
  onModelDescriptionChange: (value: string) => void;
  onEnhanceModelDescription: () => void;
  enhancingDescription?: boolean;
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
  className,
}: {
  label: string;
  helper?: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none rounded-[12px] border border-border bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
      {helper ? (
        <p className="text-[11px] leading-4 text-slate-500">{helper}</p>
      ) : null}
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
  modelDescription,
  onModelDescriptionChange,
  onEnhanceModelDescription,
  enhancingDescription,
  generating,
  generateError,
  generatedPreviewUrl,
}: ModelPresetSelectorProps) {
  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange({ ...settings, ...partial });
  const isLingerieScenario = settings.categoryContext === "lingerie";

  const cropHelper = isLingerieScenario
    ? "Для белья — полный рост или по пояс с видимыми бёдрами."
    : "Для одежды — полный рост или кадр по пояс.";

  return (
    <section className="space-y-5 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <header>
        <h3 className="text-sm font-semibold text-slate-950">
          AI-модель для одежды
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Взрослая модель, нейтральная поза, чистый фон.
        </p>
      </header>

      <div className="space-y-2">
        <span className="block px-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Шаблон
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODEL_PRESETS.map((preset) => {
            const active = value === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.id)}
                className={cn(
                  "relative rounded-[14px] border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                  active
                    ? "border-teal-500/50 bg-teal-50/80 shadow-sm ring-1 ring-teal-500/15"
                    : "border-border bg-white hover:border-slate-300 hover:bg-slate-50/80"
                )}
              >
                {active && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
                <span className="block pr-6 text-sm font-semibold text-slate-950">
                  {preset.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[16px] border border-border/80 bg-slate-50/70 p-3">
        <span className="mb-3 block px-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Параметры съёмки
        </span>
        <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
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
            label="Фон"
            value={settings.background}
            options={BACKGROUND_OPTIONS}
            onChange={(background) => patch({ background })}
          />
          <SelectField
            label="Кадр для примерки"
            helper={cropHelper}
            value={settings.crop}
            options={CROP_OPTIONS}
            onChange={(crop) => patch({ crop })}
            className="sm:col-span-2"
          />
          <SelectField
            label="Сценарий"
            value={settings.categoryContext}
            options={CONTEXT_OPTIONS}
            onChange={(categoryContext) =>
              patch({
                categoryContext,
                ...(categoryContext === "lingerie"
                  ? { crop: "full-body" }
                  : {}),
              })
            }
            className="sm:col-span-2"
          />
        </div>
      </div>

      {isLingerieScenario ? (
        <p className="rounded-[12px] border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
          Для белья: взрослая модель, нейтральная поза, руки не закрывают грудь,
          талию и бёдра.
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-950">
          Опишите модель
        </label>
        <textarea
          value={modelDescription}
          onChange={(event) => onModelDescriptionChange(event.target.value)}
          rows={3}
          placeholder="Например: взрослая plus-size модель, уверенная поза, смотрит в камеру, светлая студия, руки не закрывают одежду"
          className="w-full rounded-[16px] border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          loading={enhancingDescription}
          onClick={onEnhanceModelDescription}
        >
          Усилить промт
        </Button>
      </div>

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

      {generateError ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generateError}
        </p>
      ) : null}

      {generatedPreviewUrl && !generating ? (
        <div className="space-y-2 rounded-[16px] border border-emerald-200/80 bg-emerald-50/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            AI-модель готова — можно запускать примерку
          </p>
          <div className="overflow-hidden rounded-[14px] border border-white/80 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedPreviewUrl}
              alt="Готовая AI-модель"
              className="max-h-[460px] min-h-[200px] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
