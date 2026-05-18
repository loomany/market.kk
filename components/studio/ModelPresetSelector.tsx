"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, CheckCircle2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  clampModelAge,
  isAdultModelAge,
  MODEL_AGE_MAX,
  MODEL_AGE_MIN,
  sanitizeModelSettingsForAge,
} from "@/lib/ai/modelAge";
import {
  FAL_MODEL_ASPECT_RATIO_OPTIONS,
  FAL_MODEL_RESOLUTION_OPTIONS,
  isModelOutputSizeComplete,
  type FalModelAspectRatio,
  type FalModelResolution,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import {
  MODEL_CUSTOM_SELECT_OPTION,
  MODEL_CUSTOM_TEXT_MAX,
  MODEL_PARAM_CUSTOM,
} from "@/lib/ai/modelCustomParams";
import { buildModelSettingsSummaryRu } from "@/lib/ai/modelSettingsSummary";
import {
  MODEL_BODY_TYPES,
  type ModelBackground,
  type ModelBodyType,
  type ModelCategoryContext,
  type ModelCrop,
  type ModelGender,
  type ModelGenerationSettings,
  type ModelPose,
} from "./types";

type ModelPresetSelectorProps = {
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
  outputSize: Partial<ModelOutputSizeSelection>;
  onOutputSizeChange: (patch: Partial<ModelOutputSizeSelection>) => void;
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

function CustomParamInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [lastConfirmed, setLastConfirmed] = useState<string | null>(null);
  const trimmed = value.trim();
  const canConfirm = trimmed.length > 0 && !disabled;
  const isConfirmed = canConfirm && trimmed === lastConfirmed;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setLastConfirmed(trimmed);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          disabled={disabled}
          maxLength={MODEL_CUSTOM_TEXT_MAX}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canConfirm) {
              event.preventDefault();
              handleConfirm();
            }
          }}
          className={cn(
            "min-h-[44px] min-w-0 flex-1 rounded-[12px] border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition sm:text-sm",
            "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600",
            isConfirmed
              ? "border-emerald-400 ring-2 ring-emerald-100"
              : "border-border"
          )}
        />
        <button
          type="button"
          disabled={!canConfirm}
          aria-label={
            isConfirmed ? "Описание сохранено" : "Сохранить описание"
          }
          aria-pressed={isConfirmed}
          onClick={handleConfirm}
          className={cn(
            "flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
            isConfirmed
              ? "border-emerald-500 bg-emerald-600 text-white"
              : canConfirm
                ? "border-teal-400 bg-teal-50 text-teal-800 hover:bg-teal-100 active:scale-[0.98]"
                : "cursor-not-allowed border-border bg-slate-50 text-slate-300"
          )}
        >
          <Check className="h-5 w-5" strokeWidth={isConfirmed ? 3 : 2} aria-hidden />
        </button>
      </div>
      {isConfirmed ? (
        <p className="flex items-center gap-1.5 px-0.5 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Сохранено — учтём при генерации
        </p>
      ) : canConfirm ? (
        <p className="px-0.5 text-xs text-slate-500">
          Нажмите галочку или Enter, чтобы применить
        </p>
      ) : (
        <p className="px-0.5 text-xs text-slate-500">
          Опишите своими словами, затем подтвердите галочкой
        </p>
      )}
    </div>
  );
}

function SelectWithCustomField<T extends string>({
  label,
  description,
  value,
  customText,
  options,
  onChange,
  onCustomTextChange,
  customPlaceholder,
  disabled,
  placeholder = "Выберите…",
}: {
  label: string;
  description?: string;
  value?: T;
  customText: string;
  options: {
    id: T;
    label: string;
    shortHint?: string;
    disabled?: boolean;
  }[];
  onChange: (value: T) => void;
  onCustomTextChange: (value: string) => void;
  customPlaceholder: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const isCustom = value === MODEL_PARAM_CUSTOM;

  return (
    <div className="space-y-2">
      <SelectField
        label={label}
        description={description}
        placeholder={placeholder}
        value={value}
        options={options}
        onChange={onChange}
      />
      {isCustom ? (
        <CustomParamInput
          value={customText}
          disabled={disabled}
          placeholder={customPlaceholder}
          onChange={onCustomTextChange}
        />
      ) : null}
    </div>
  );
}

const GENDER_OPTIONS: {
  id: ModelGender;
  label: string;
  hint: string;
}[] = [
  {
    id: "female",
    label: "Женская",
    hint: "Платья, блузы, женские комплекты и нижнее бельё для взрослых",
  },
  {
    id: "male",
    label: "Мужская",
    hint: "Футболки, рубашки, костюмы и мужская верхняя одежда",
  },
];

const POSE_OPTIONS: { id: ModelPose; label: string; hint: string }[] = [
  {
    id: MODEL_PARAM_CUSTOM,
    label: MODEL_CUSTOM_SELECT_OPTION.label,
    hint: MODEL_CUSTOM_SELECT_OPTION.hint,
  },
  {
    id: "front",
    label: "Прямо к камере",
    hint: "Классическая каталожная поза, одежду видно целиком",
  },
  {
    id: "slight-angle",
    label: "Лёгкий поворот",
    hint: "Чуть в сторону — объём фигуры и посадка рукавов",
  },
];

const CROP_OPTIONS: { id: ModelCrop; label: string; hint: string }[] = [
  {
    id: MODEL_PARAM_CUSTOM,
    label: MODEL_CUSTOM_SELECT_OPTION.label,
    hint: MODEL_CUSTOM_SELECT_OPTION.hint,
  },
  {
    id: "full-body",
    label: "В полный рост",
    hint: "Платья, брюки, костюмы и комплекты",
  },
  {
    id: "upper-body",
    label: "По пояс",
    hint: "Топы, свитшоты, куртки — когда низ не в кадре",
  },
];

const BACKGROUND_OPTIONS: {
  id: ModelBackground;
  label: string;
  hint: string;
}[] = [
  {
    id: "white",
    label: "Белый",
    hint: "Стандарт Wildberries и Ozon, максимально нейтрально",
  },
  {
    id: "light-gray",
    label: "Светло-серый",
    hint: "Мягче белого, меньше бликов на светлой одежде",
  },
  {
    id: "studio",
    label: "Студийный",
    hint: "Лёгкая глубина и тени, чуть «дороже» каталог",
  },
];

const CONTEXT_OPTIONS: {
  id: ModelCategoryContext;
  label: string;
  hint: string;
}[] = [
  {
    id: "clothing",
    label: "Одежда",
    hint: "Повседневная и деловая одежда, детская и взрослая",
  },
  {
    id: "lingerie",
    label: "Бельё / купальники",
    hint: "Только 18+, нейтральная взрослая каталожная подача",
  },
  {
    id: "jewelry",
    label: "Украшения",
    hint: "Видны шея, уши и зона украшения без лишних аксессуаров",
  },
  {
    id: "general",
    label: "Универсально",
    hint: "Когда категория неочевидна или смешанный ассортимент",
  },
];

function hintForOption<T extends string>(
  options: { id: T; hint: string }[],
  value: T
): string {
  return options.find((item) => item.id === value)?.hint ?? "";
}

export function ModelPresetSelector({
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
  outputSize,
  onOutputSizeChange,
}: ModelPresetSelectorProps) {
  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange(
      sanitizeModelSettingsForAge({ ...settings, ...partial })
    );
  const isMinor = !isAdultModelAge(settings.modelAge);
  const isLingerieScenario = settings.categoryContext === "lingerie";

  const bodyTypeDescription =
    settings.bodyType === MODEL_PARAM_CUSTOM
      ? settings.bodyTypeCustom.trim() || MODEL_CUSTOM_SELECT_OPTION.hint
      : (MODEL_BODY_TYPES.find((item) => item.id === settings.bodyType)?.hint ??
        "Влияет на силуэт в генерации");

  const poseDescription =
    settings.pose === MODEL_PARAM_CUSTOM
      ? settings.poseCustom.trim() || MODEL_CUSTOM_SELECT_OPTION.hint
      : hintForOption(POSE_OPTIONS, settings.pose);

  const cropDescription =
    settings.crop === MODEL_PARAM_CUSTOM
      ? settings.cropCustom.trim() || MODEL_CUSTOM_SELECT_OPTION.hint
      : isLingerieScenario
        ? "Для белья — полный рост или по пояс с видимыми бёдрами."
        : hintForOption(CROP_OPTIONS, settings.crop);

  const ageDescription = isMinor
    ? "До 18 лет недоступны сценарий «Бельё / купальники» и тип «Бикини / купальники»."
    : "Для взрослой одежды обычно 18–35 лет. Для детского платья — укажите возраст ребёнка.";

  const isPromptLocked = Boolean(generating || enhancingDescription);
  const outputSizeReady = isModelOutputSizeComplete(outputSize);

  const aspectRatioDescription = outputSize.aspectRatio
    ? hintForOption(FAL_MODEL_ASPECT_RATIO_OPTIONS, outputSize.aspectRatio)
    : "Формат кадра для карточки — параметр aspect_ratio в Fal.";

  const resolutionDescription = outputSize.resolution
    ? hintForOption(FAL_MODEL_RESOLUTION_OPTIONS, outputSize.resolution)
    : "Качество изображения — параметр resolution в Fal.";

  const settingsSummary = useMemo(
    () =>
      buildModelSettingsSummaryRu(settings, outputSize, modelDescription),
    [settings, outputSize, modelDescription]
  );

  return (
    <section className="space-y-5 rounded-[22px] border border-border bg-white p-4 shadow-sm">
      <header>
        <h3 className="text-sm font-semibold text-slate-950">
          AI-модель для одежды
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Укажите возраст и параметры съёмки. Для детской одежды — возраст до 18
          лет.
        </p>
      </header>

      <div className="rounded-[16px] border border-border/80 bg-slate-50/70 p-3">
        <span className="mb-3 block px-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Параметры съёмки
        </span>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Пол модели"
            description={hintForOption(GENDER_OPTIONS, settings.gender)}
            value={settings.gender}
            options={GENDER_OPTIONS}
            onChange={(gender) => patch({ gender })}
          />
          <SelectWithCustomField
            label="Тип фигуры"
            description={bodyTypeDescription}
            placeholder="Выберите тип"
            value={settings.bodyType}
            customText={settings.bodyTypeCustom}
            options={MODEL_BODY_TYPES.map((item) => ({
              id: item.id,
              label: item.label,
              shortHint:
                item.id === MODEL_PARAM_CUSTOM
                  ? MODEL_CUSTOM_SELECT_OPTION.shortHint
                  : undefined,
              disabled: isMinor && item.id === "swimwear",
            }))}
            customPlaceholder="Например: plus-size, широкие плечи"
            disabled={isPromptLocked}
            onChange={(bodyType) => patch({ bodyType })}
            onCustomTextChange={(bodyTypeCustom) => patch({ bodyTypeCustom })}
          />
          <SelectWithCustomField
            label="Поза"
            description={poseDescription}
            placeholder="Выберите позу"
            value={settings.pose}
            customText={settings.poseCustom}
            options={POSE_OPTIONS.map((item) => ({
              id: item.id,
              label: item.label,
              shortHint:
                item.id === MODEL_PARAM_CUSTOM
                  ? MODEL_CUSTOM_SELECT_OPTION.shortHint
                  : undefined,
            }))}
            customPlaceholder="Например: сидит на стуле, смотрит в камеру"
            disabled={isPromptLocked}
            onChange={(pose) => patch({ pose })}
            onCustomTextChange={(poseCustom) => patch({ poseCustom })}
          />
          <SelectField
            label="Фон"
            description={hintForOption(BACKGROUND_OPTIONS, settings.background)}
            value={settings.background}
            options={BACKGROUND_OPTIONS}
            onChange={(background) => patch({ background })}
          />
          <SelectWithCustomField
            label="Кадр для примерки"
            description={cropDescription}
            placeholder="Выберите кадр"
            value={settings.crop}
            customText={settings.cropCustom}
            options={CROP_OPTIONS.map((item) => ({
              id: item.id,
              label: item.label,
              shortHint:
                item.id === MODEL_PARAM_CUSTOM
                  ? MODEL_CUSTOM_SELECT_OPTION.shortHint
                  : undefined,
            }))}
            customPlaceholder="Например: по колено, модель на стуле"
            disabled={isPromptLocked}
            onChange={(crop) => patch({ crop })}
            onCustomTextChange={(cropCustom) => patch({ cropCustom })}
          />
          <SettingField label="Возраст модели" description={ageDescription}>
            <input
              id="model-age"
              type="number"
              min={MODEL_AGE_MIN}
              max={MODEL_AGE_MAX}
              inputMode="numeric"
              value={settings.modelAge}
              onChange={(event) => {
                const next = parseInt(event.target.value, 10);
                if (!Number.isFinite(next)) return;
                patch({ modelAge: clampModelAge(next) });
              }}
              className="min-h-[42px] w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </SettingField>
          <SelectField
            label="Сценарий"
            description={hintForOption(
              CONTEXT_OPTIONS,
              settings.categoryContext
            )}
            value={settings.categoryContext}
            options={CONTEXT_OPTIONS.map((item) => ({
              ...item,
              disabled: isMinor && item.id === "lingerie",
            }))}
            onChange={(categoryContext) =>
              patch({
                categoryContext,
                ...(categoryContext === "lingerie"
                  ? { crop: "full-body" }
                  : {}),
              })
            }
          />
        </div>
      </div>

      {isLingerieScenario ? (
        <p className="rounded-[12px] border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
          Для белья: взрослая модель, нейтральная поза, руки не закрывают грудь,
          талию и бёдра.
        </p>
      ) : null}

      <div className="space-y-2 rounded-[16px] border border-border/80 bg-slate-50/60 p-3">
        <div className="space-y-0.5 px-0.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Итоговый промт
          </span>
          <p className="text-xs leading-5 text-slate-500">
            Собирается из параметров выше. Так же уходит в генерацию (на английском
            для AI) вместе с дополнением ниже.
          </p>
        </div>
        <textarea
          readOnly
          value={settingsSummary}
          rows={4}
          aria-readonly="true"
          className="w-full resize-none rounded-[12px] border border-border bg-white px-3 py-3 text-sm leading-6 text-slate-800 outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="space-y-0.5 px-0.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Опишите модель
          </label>
          <p className="text-xs leading-5 text-slate-500">
            Дополняет итоговый промт, не заменяет тип фигуры и возраст.
          </p>
        </div>
        <textarea
          value={modelDescription}
          onChange={(event) => onModelDescriptionChange(event.target.value)}
          rows={3}
          disabled={isPromptLocked}
          placeholder="Например: взрослая plus-size модель, уверенная поза, смотрит в камеру, светлая студия, руки не закрывают одежду"
          className="w-full rounded-[16px] border border-border bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          loading={enhancingDescription}
          disabled={isPromptLocked}
          onClick={onEnhanceModelDescription}
        >
          Усилить промт
        </Button>
      </div>

      <div className="space-y-4">
        <SelectField
          label="Соотношение сторон"
          description={aspectRatioDescription}
          placeholder="Выберите формат"
          value={outputSize.aspectRatio}
          options={FAL_MODEL_ASPECT_RATIO_OPTIONS}
          onChange={(aspectRatio) =>
            onOutputSizeChange({ aspectRatio: aspectRatio as FalModelAspectRatio })
          }
        />
        <SelectField
          label="Разрешение"
          description={resolutionDescription}
          placeholder="Выберите качество"
          value={outputSize.resolution}
          options={FAL_MODEL_RESOLUTION_OPTIONS}
          onChange={(resolution) =>
            onOutputSizeChange({ resolution: resolution as FalModelResolution })
          }
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        loading={generating}
        disabled={!outputSizeReady || isPromptLocked}
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
