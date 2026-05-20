"use client";

import { useMemo, type ReactNode } from "react";
import { UserRound } from "lucide-react";
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
import { withLingerieModelDefaults } from "@/lib/studio/lingerieTryOnDefaults";
import {
  getLingerieCropDescription,
  getLingerieCropSelectLabel,
} from "@/lib/studio/lingerieCropUiCopy";
import {
  FAL_MODEL_ASPECT_RATIO_OPTIONS,
  FAL_MODEL_RESOLUTION_OPTIONS,
  isModelOutputSizeComplete,
  type FalModelAspectRatio,
  type FalModelResolution,
  type ModelOutputSizeSelection,
} from "@/lib/ai/modelOutputSizes";
import {
  AspectRatioSelectField,
  hintForAspectRatioOption,
} from "@/components/studio/AspectRatioSelectField";
import {
  MODEL_CUSTOM_SELECT_OPTION,
  MODEL_CUSTOM_TEXT_MAX,
  MODEL_PARAM_CUSTOM,
} from "@/lib/ai/modelCustomParams";
import { buildModelBaseSettingsSummaryRu } from "@/lib/ai/modelSettingsSummary";
import { ModelAnglesField } from "@/components/studio/ModelAnglesField";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import { productPoseLabelForUi } from "@/lib/ai/productPoseSummary";
import { ModelPromptComposer } from "@/components/studio/ModelPromptComposer";
import { ModelReadyCard } from "@/components/studio/ModelReadyCard";
import type { Locale } from "@/lib/i18n/locales";
import {
  MODEL_BODY_TYPES,
  type ModelCrop,
  type ModelGender,
  type ModelGenerationSettings,
} from "./types";

type ModelPresetSelectorProps = {
  settings: ModelGenerationSettings;
  onSettingsChange: (settings: ModelGenerationSettings) => void;
  outputSize: Partial<ModelOutputSizeSelection>;
  onOutputSizeChange: (patch: Partial<ModelOutputSizeSelection>) => void;
  /**
   * Same string that the advanced "Ваше дополнение" textarea edits — surfaced
   * here as the SaaS "Сцена и стиль фото" textarea so users don't need to
   * open advanced settings to describe the scene/lighting/atmosphere.
   * Empty string = no scene direction (= identical to previous behaviour).
   */
  modelDescription?: string;
  onModelDescriptionChange?: (value: string) => void;
  /** Locks gender/body/crop while SaaS pipeline generates a model */
  settingsLocked?: boolean;
  /** Shown over parameters while locked (e.g. product vision analysis) */
  settingsLockMessage?: string;
  /** Server will adapt framing to the uploaded on-model product photo */
  sourceProductZoneFramingActive?: boolean;
  /** SaaS clothing: hide manual params; AI + product analysis keep state */
  uiMode?: "full" | "saas";
};

export type ModelAdvancedControlsProps = {
  settings: ModelGenerationSettings;
  onSettingsChange: (settings: ModelGenerationSettings) => void;
  onGenerate: () => void;
  modelDescription: string;
  onModelDescriptionChange: (value: string) => void;
  outputSize: Partial<ModelOutputSizeSelection>;
  generating?: boolean;
  generateError?: string | null;
  generateNotice?: string | null;
  generateProgress?: string | null;
  generatedPreviewItems?: { id: string; url: string; label: string }[];
  isModelSaved?: boolean;
  onSaveModel?: () => void;
  onStartOverModel?: () => void;
  productPhotoCount?: number;
  useProductSampleAngles?: boolean;
  productSampleAngles?: ResolvedModelAngle[] | null;
  analyzingProductAngles?: boolean;
  onApplyAnglesFromProducts?: () => void;
  onClearProductSampleAngles?: () => void;
  dictationLocale?: Locale;
  showDevControls?: boolean;
  modelGenerationSeed?: number;
  tryOnSeed?: number;
  onOutputSizeChange?: (patch: Partial<ModelOutputSizeSelection>) => void;
  /** SaaS clothing: only age in advanced block (resolution fixed 2K) */
  uiMode?: "full" | "saas";
};

function SettingField({
  label,
  description,
  notice,
  children,
}: {
  label: string;
  description?: string;
  notice?: ReactNode;
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
        {notice}
      </div>
      {children}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  description,
  notice,
  value,
  options,
  onChange,
  placeholder = "Выберите…",
  disabled = false,
}: {
  label: string;
  description?: string;
  notice?: ReactNode;
  value?: T;
  options: {
    id: T;
    label: string;
    shortHint?: string;
    disabled?: boolean;
  }[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <SettingField label={label} description={description} notice={notice}>
      <Select
        triggerClassName="rounded-[12px] font-medium"
        placeholder={placeholder}
        menuMatchTriggerWidth
        disabled={disabled}
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
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      maxLength={MODEL_CUSTOM_TEXT_MAX}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "min-h-[44px] w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition sm:text-sm",
        "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
      )}
    />
  );
}

function SelectWithCustomField<T extends string>({
  label,
  description,
  descriptionNotice,
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
  descriptionNotice?: ReactNode;
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
        notice={descriptionNotice}
        placeholder={placeholder}
        value={value}
        options={options}
        disabled={disabled}
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
    hint: "",
  },
  {
    id: "male",
    label: "Мужская",
    hint: "Футболки, рубашки, костюмы и мужская верхняя одежда",
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

const LINGERIE_CROP_OPTIONS: { id: ModelCrop; label: string; hint: string }[] = [
  {
    id: "upper-thigh",
    label: "До верхней части бедра",
    hint: "Каталожный кадр белья: голова, весь комплект, верх бёдер — рекомендуемый формат",
  },
  {
    id: "upper-body",
    label: "По пояс",
    hint: "Только верх тела — если низ комплекта не нужен в кадре",
  },
  {
    id: "full-body",
    label: "В полный рост",
    hint: "Весь силуэт с ногами — только если нужен полный рост",
  },
  {
    id: MODEL_PARAM_CUSTOM,
    label: MODEL_CUSTOM_SELECT_OPTION.label,
    hint: MODEL_CUSTOM_SELECT_OPTION.hint,
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
  outputSize,
  onOutputSizeChange,
  modelDescription,
  onModelDescriptionChange,
  settingsLocked = false,
  settingsLockMessage,
  sourceProductZoneFramingActive = false,
  uiMode = "full",
}: ModelPresetSelectorProps) {
  if (uiMode === "saas") {
    return (
      <p className="text-xs leading-5 text-slate-600">
        AI подберёт пол, фигуру, кадр и формат по фото товара. Ниже можно
        указать свою модель.
      </p>
    );
  }

  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange(
      withLingerieModelDefaults(
        sanitizeModelSettingsForAge({ ...settings, ...partial })
      )
    );
  const isMinor = !isAdultModelAge(settings.modelAge);
  const isLingerieScenario = settings.categoryContext === "lingerie";

  const bodyTypeDescription =
    settings.bodyType === MODEL_PARAM_CUSTOM
      ? settings.bodyTypeCustom.trim() || MODEL_CUSTOM_SELECT_OPTION.hint
      : (MODEL_BODY_TYPES.find((item) => item.id === settings.bodyType)?.hint ??
        "Влияет на силуэт в генерации");

  const cropDescription =
    settings.crop === MODEL_PARAM_CUSTOM
      ? settings.cropCustom.trim() || MODEL_CUSTOM_SELECT_OPTION.hint
      : isLingerieScenario
        ? getLingerieCropDescription({
            crop: settings.crop,
            cropCustom: settings.cropCustom,
            sourceProductZoneFramingActive,
            customEmptyHint: MODEL_CUSTOM_SELECT_OPTION.hint,
          })
        : hintForOption(CROP_OPTIONS, settings.crop);

  const lingerieCropSelectOptions = useMemo(() => {
    if (!isLingerieScenario) return null;
    return LINGERIE_CROP_OPTIONS.map((item) => ({
      id: item.id,
      label: getLingerieCropSelectLabel({
        crop: item.id,
        defaultLabel: item.label,
        sourceProductZoneFramingActive,
      }),
      shortHint:
        item.id === MODEL_PARAM_CUSTOM
          ? MODEL_CUSTOM_SELECT_OPTION.shortHint
          : undefined,
    }));
  }, [isLingerieScenario, sourceProductZoneFramingActive]);

  const isPromptLocked = settingsLocked;

  const aspectRatioDescription = outputSize.aspectRatio
    ? hintForAspectRatioOption(
        FAL_MODEL_ASPECT_RATIO_OPTIONS,
        outputSize.aspectRatio
      )
    : "Формат кадра для карточки.";

  return (
    <section className="relative space-y-6">
      {isPromptLocked && settingsLockMessage ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-white/80 px-4 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <p className="text-center text-sm font-medium leading-5 text-teal-950">
            {settingsLockMessage}
          </p>
        </div>
      ) : null}

      <header
        className={isPromptLocked ? "pointer-events-none opacity-50" : undefined}
      >
        <h3 className="text-sm font-semibold text-slate-950">
          AI-модель для одежды
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          AI создаст модель автоматически.
        </p>
      </header>

      <div
        className={cn(
          "space-y-4",
          isPromptLocked && "pointer-events-none select-none opacity-50"
        )}
      >
        <div className="flex flex-col gap-4">
          {onModelDescriptionChange ? (
            <SettingField label="Сцена и стиль фото">
              <textarea
                value={modelDescription ?? ""}
                onChange={(event) =>
                  onModelDescriptionChange(event.target.value.slice(0, 500))
                }
                rows={4}
                maxLength={500}
                disabled={isPromptLocked}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Например: у большого окна, мягкий дневной свет, чистый студийный фон. Или: модель 30 лет, дорогой интерьер"
                className={cn(
                  "min-h-[96px] w-full resize-y rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition",
                  "hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100",
                  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600"
                )}
              />
            </SettingField>
          ) : null}
          {!isLingerieScenario ? (
            <SelectField
              label="Пол модели"
              description={hintForOption(GENDER_OPTIONS, settings.gender)}
              value={settings.gender}
              options={GENDER_OPTIONS}
              disabled={isPromptLocked}
              onChange={(gender) => patch({ gender })}
            />
          ) : null}
          <SettingField
            label="Национальность модели"
            description="Например: казахская, славянская, азиатская. Если не указано — AI подберёт нейтральную коммерческую внешность."
          >
            <CustomParamInput
              value={settings.modelNationality}
              disabled={isPromptLocked}
              placeholder="Например: казахская, славянская, азиатская"
              onChange={(modelNationality) => patch({ modelNationality })}
            />
          </SettingField>
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
            label="Кадр для примерки"
            description={cropDescription}
            placeholder="Выберите кадр"
            value={settings.crop}
            customText={settings.cropCustom}
            options={
              lingerieCropSelectOptions ??
              CROP_OPTIONS.map((item) => ({
                id: item.id,
                label: item.label,
                shortHint:
                  item.id === MODEL_PARAM_CUSTOM
                    ? MODEL_CUSTOM_SELECT_OPTION.shortHint
                    : undefined,
              }))
            }
            customPlaceholder="Например: по колено, модель на стуле"
            disabled={isPromptLocked}
            onChange={(crop) => patch({ crop, cropCustom: "" })}
            onCustomTextChange={(cropCustom) => patch({ cropCustom })}
          />
        </div>
      </div>

      <div
        className={cn(
          "space-y-4 border-t border-border/50 pt-5",
          isPromptLocked && "pointer-events-none select-none opacity-50"
        )}
      >
        <AspectRatioSelectField
          description={aspectRatioDescription}
          value={outputSize.aspectRatio}
          options={FAL_MODEL_ASPECT_RATIO_OPTIONS}
          disabled={isPromptLocked}
          onChange={(aspectRatio) =>
            onOutputSizeChange({ aspectRatio: aspectRatio as FalModelAspectRatio })
          }
        />
      </div>

    </section>
  );
}

export function ModelAdvancedControls({
  settings,
  onSettingsChange,
  onGenerate,
  modelDescription,
  onModelDescriptionChange,
  outputSize,
  onOutputSizeChange,
  generating,
  generateError,
  generateNotice,
  generateProgress,
  generatedPreviewItems = [],
  isModelSaved = false,
  onSaveModel,
  onStartOverModel,
  productPhotoCount = 0,
  useProductSampleAngles = false,
  productSampleAngles = null,
  analyzingProductAngles = false,
  onApplyAnglesFromProducts,
  onClearProductSampleAngles,
  dictationLocale = "ru",
  showDevControls = false,
  modelGenerationSeed,
  tryOnSeed,
  uiMode = "full",
}: ModelAdvancedControlsProps) {
  const patch = (partial: Partial<ModelGenerationSettings>) =>
    onSettingsChange(
      sanitizeModelSettingsForAge({ ...settings, ...partial })
    );
  const isMinor = !isAdultModelAge(settings.modelAge);
  const isPromptLocked = Boolean(generating);

  const ageDescription = isMinor
    ? "До 18 лет недоступны сценарий «Бельё / купальники» и тип «Бикини / купальники»."
    : undefined;

  if (uiMode === "saas") {
    return (
      <div className="space-y-4">
        <SettingField label="Возраст модели" description={ageDescription}>
          <input
            id="model-age-saas"
            type="number"
            min={MODEL_AGE_MIN}
            max={MODEL_AGE_MAX}
            inputMode="numeric"
            value={settings.modelAge}
            disabled={isPromptLocked}
            onChange={(event) => {
              const next = parseInt(event.target.value, 10);
              if (!Number.isFinite(next)) return;
              patch({ modelAge: clampModelAge(next) });
            }}
            className="min-h-[42px] w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </SettingField>
      </div>
    );
  }

  const outputSizeReady = isModelOutputSizeComplete(outputSize);

  const basePrompt = useMemo(
    () =>
      buildModelBaseSettingsSummaryRu(settings, outputSize, {
        productPoseLabel:
          useProductSampleAngles && productSampleAngles?.[0]
            ? productPoseLabelForUi(productSampleAngles[0])
            : undefined,
      }),
    [settings, outputSize, useProductSampleAngles, productSampleAngles]
  );

  const resolutionDescription = outputSize.resolution
    ? hintForOption(FAL_MODEL_RESOLUTION_OPTIONS, outputSize.resolution)
    : "Качество изображения.";

  return (
    <div className="space-y-4">
      <SettingField label="Возраст модели" description={ageDescription}>
        <input
          id="model-age-advanced"
          type="number"
          min={MODEL_AGE_MIN}
          max={MODEL_AGE_MAX}
          inputMode="numeric"
          value={settings.modelAge}
          disabled={isPromptLocked}
          onChange={(event) => {
            const next = parseInt(event.target.value, 10);
            if (!Number.isFinite(next)) return;
            patch({ modelAge: clampModelAge(next) });
          }}
          className="min-h-[42px] w-full rounded-[12px] border border-border bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </SettingField>

      <SettingField
        label="Поза модели"
        description={
          useProductSampleAngles && productSampleAngles
            ? "Поза подобрана по фото товара — учтём в итоговом промте."
            : "Подберите позу с фото товара или опишите вручную — необязательно."
        }
      >
        <ModelAnglesField
          customAngles={settings.customAngles}
          disabled={isPromptLocked}
          productPhotoCount={productPhotoCount}
          useProductSampleAngles={useProductSampleAngles}
          productSampleAngles={productSampleAngles}
          analyzingProductAngles={analyzingProductAngles}
          onApplyFromProduct={onApplyAnglesFromProducts}
          onClearProductPose={onClearProductSampleAngles}
          onCustomAnglesChange={(customAngles) => patch({ customAngles })}
        />
      </SettingField>

      <ModelPromptComposer
        basePrompt={basePrompt}
        description={modelDescription}
        onDescriptionChange={onModelDescriptionChange}
        disabled={isPromptLocked}
        dictationLocale={dictationLocale}
      />

      {showDevControls && onOutputSizeChange ? (
        <SelectField
          label="Разрешение (dev)"
          description={
            outputSize.resolution === "1K"
              ? "1K быстрее, 2K лучше для кружева и мелких деталей"
              : resolutionDescription
          }
          placeholder="Выберите качество"
          value={outputSize.resolution}
          options={FAL_MODEL_RESOLUTION_OPTIONS}
          onChange={(resolution) =>
            onOutputSizeChange({ resolution: resolution as FalModelResolution })
          }
        />
      ) : null}

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

      {generating ? (
        <p className="rounded-[12px] border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          {generateProgress ?? "Генерируем AI-модель…"}
        </p>
      ) : null}

      {generateError ? (
        <p className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generateError}
        </p>
      ) : null}

      {generateNotice && !generateError ? (
        <p className="rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {generateNotice}
        </p>
      ) : null}

      {generatedPreviewItems.length > 0 && !generating ? (
        <ModelReadyCard
          previewItems={generatedPreviewItems}
          isSaved={isModelSaved}
          onSave={() => onSaveModel?.()}
          onStartOver={() => onStartOverModel?.()}
        />
      ) : null}

      {showDevControls &&
      typeof modelGenerationSeed === "number" &&
      typeof tryOnSeed === "number" ? (
        <p className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-600">
          seed model: {modelGenerationSeed} · seed try-on: {tryOnSeed}
        </p>
      ) : null}
    </div>
  );
}
