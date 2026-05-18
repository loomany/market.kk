"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { MODEL_CUSTOM_SELECT_OPTION } from "@/lib/ai/modelCustomParams";
import { MODEL_CUSTOM_TEXT_MAX } from "@/lib/ai/modelCustomParams";
import {
  countSelectedModelAngles,
  createEmptyCustomAngle,
  FULL_CARD_ANGLE_PRESET_ID,
  MAX_MODEL_ANGLES,
  MODEL_ANGLE_PRESETS,
  normalizeAnglePresetSelection,
  type ModelAnglePresetId,
  type ModelCustomAngle,
  type ResolvedModelAngle,
} from "@/lib/ai/modelAngles";

function CustomAngleRow({
  value,
  disabled,
  onChange,
  onRemove,
  canRemove,
}: {
  value: ModelCustomAngle;
  disabled?: boolean;
  onChange: (next: ModelCustomAngle) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const trimmed = value.text.trim();
  const canConfirm = trimmed.length > 0 && !disabled;
  const isConfirmed = canConfirm && value.saved && trimmed === value.text.trim();

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value.text}
          disabled={disabled}
          maxLength={MODEL_CUSTOM_TEXT_MAX}
          placeholder="Например: со спины по пояс, сидя на диване"
          onChange={(event) =>
            onChange({ ...value, text: event.target.value, saved: false })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && canConfirm) {
              event.preventDefault();
              onChange({ ...value, text: trimmed, saved: true });
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
          aria-label={isConfirmed ? "Сохранено" : "Сохранить ракурс"}
          aria-pressed={isConfirmed}
          onClick={() => onChange({ ...value, text: trimmed, saved: true })}
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
        {canRemove ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="flex h-[44px] shrink-0 items-center px-2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Удалить
          </button>
        ) : null}
      </div>
      {isConfirmed ? (
        <p className="flex items-center gap-1.5 px-0.5 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Сохранено — учтём при генерации
        </p>
      ) : canConfirm ? (
        <p className="px-0.5 text-xs text-slate-500">
          Нажмите галочку или Enter, чтобы добавить ракурс
        </p>
      ) : (
        <p className="px-0.5 text-xs text-slate-500">
          {MODEL_CUSTOM_SELECT_OPTION.hint}
        </p>
      )}
    </div>
  );
}

type ModelAnglesFieldProps = {
  anglePresets: ModelAnglePresetId[];
  customAngles: ModelCustomAngle[];
  disabled?: boolean;
  productPhotoCount?: number;
  useProductSampleAngles?: boolean;
  productSampleAngles?: ResolvedModelAngle[] | null;
  analyzingProductAngles?: boolean;
  onApplyAnglesFromProducts?: () => void;
  onClearProductSampleAngles?: () => void;
  onPresetsChange: (presets: ModelAnglePresetId[]) => void;
  onCustomAnglesChange: (angles: ModelCustomAngle[]) => void;
};

export function ModelAnglesField({
  anglePresets,
  customAngles,
  disabled,
  productPhotoCount = 0,
  useProductSampleAngles = false,
  productSampleAngles = null,
  analyzingProductAngles = false,
  onApplyAnglesFromProducts,
  onClearProductSampleAngles,
  onPresetsChange,
  onCustomAnglesChange,
}: ModelAnglesFieldProps) {
  const savedCustomCount = customAngles.filter(
    (item) => item.saved && item.text.trim().length > 0
  ).length;

  const [customPanelOpen, setCustomPanelOpen] = useState(
    () => savedCustomCount > 0 || customAngles.length > 0
  );

  const selectedCount = useMemo(
    () => countSelectedModelAngles({ anglePresets, customAngles }),
    [anglePresets, customAngles]
  );
  const atLimit = selectedCount >= MAX_MODEL_ANGLES;

  const presetOptions = MODEL_ANGLE_PRESETS.filter(
    (preset) => !preset.isBundle
  ).map((preset) => ({
    value: preset.id,
    label: preset.label,
    description: preset.hint,
    triggerLabel: preset.label,
  }));

  const handlePresetsChange = (next: ModelAnglePresetId[]) => {
    const normalized = normalizeAnglePresetSelection(anglePresets, next);
    if (
      countSelectedModelAngles({
        anglePresets: normalized,
        customAngles,
      }) > MAX_MODEL_ANGLES
    ) {
      return;
    }
    onPresetsChange(normalized);
  };

  const formatTriggerLabel = (
    selected: { value: ModelAnglePresetId; triggerLabel?: string; label: string }[]
  ) => {
    if (anglePresets.includes(FULL_CARD_ANGLE_PRESET_ID)) {
      return "Выбрать всё";
    }
    const parts = selected
      .filter((item) => item.value !== FULL_CARD_ANGLE_PRESET_ID)
      .map((item) => item.triggerLabel ?? item.label);
    if (savedCustomCount > 0) {
      parts.push(
        savedCustomCount === 1
          ? "свой ракурс"
          : `свои ракурсы (${savedCustomCount})`
      );
    }
    if (parts.length === 0) return "Выберите ракурсы";
    if (parts.length === 1) return parts[0]!;
    return parts.join(", ");
  };

  const addCustomRow = () => {
    if (disabled || atLimit) return;
    onCustomAnglesChange([...customAngles, createEmptyCustomAngle()]);
  };

  const updateCustom = (index: number, next: ModelCustomAngle) => {
    const wasSaved = customAngles[index]?.saved;
    const willBeSaved = next.saved && next.text.trim().length > 0;
    if (!wasSaved && willBeSaved && atLimit) return;
    onCustomAnglesChange(
      customAngles.map((item, i) => (i === index ? next : item))
    );
  };

  const removeCustom = (index: number) => {
    const next = customAngles.filter((_, i) => i !== index);
    onCustomAnglesChange(next);
    if (next.length === 0) setCustomPanelOpen(false);
  };

  const toggleCustomPanel = () => {
    if (disabled) return;
    if (customPanelOpen) {
      setCustomPanelOpen(false);
      return;
    }
    setCustomPanelOpen(true);
    if (customAngles.length === 0) {
      onCustomAnglesChange([createEmptyCustomAngle()]);
    }
  };

  const presetAnglesDisabled = disabled || useProductSampleAngles;

  return (
    <div className="space-y-3">
      {productPhotoCount > 0 && onApplyAnglesFromProducts ? (
        <div className="space-y-2 rounded-[14px] border border-teal-100 bg-teal-50/50 p-3">
          <p className="text-xs leading-5 text-teal-950">
            AI прочитает позу и кадр с загруженного фото товара — для генерации
            модели в том же ракурсе (плюс ваши настройки: возраст, свет, фигура).
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            loading={analyzingProductAngles}
            disabled={disabled || analyzingProductAngles}
            onClick={onApplyAnglesFromProducts}
          >
            Взять ракурс с фото товара
          </Button>
        </div>
      ) : null}

      {useProductSampleAngles &&
      productSampleAngles &&
      productSampleAngles.length > 0 ? (
        <div className="space-y-2 rounded-[14px] border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold text-emerald-900">
            Ракурс с фото товара
          </p>
          <p className="text-xs text-emerald-950">
            {productSampleAngles[0]?.label ?? "—"}
          </p>
          {onClearProductSampleAngles ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onClearProductSampleAngles}
              className="text-xs font-medium text-emerald-800 underline-offset-2 hover:underline"
            >
              Выбрать ракурсы вручную
            </button>
          ) : null}
        </div>
      ) : null}

      <MultiSelect
        values={anglePresets}
        options={presetOptions}
        disabled={presetAnglesDisabled}
        placeholder="Выберите ракурсы"
        triggerClassName="rounded-[12px] font-medium"
        menuMatchTriggerWidth
        formatTriggerLabel={formatTriggerLabel}
        onChange={handlePresetsChange}
        menuHeader={
          <button
            type="button"
            disabled={presetAnglesDisabled}
            onClick={toggleCustomPanel}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm transition-colors",
              customPanelOpen || savedCustomCount > 0
                ? "bg-teal-50 font-semibold text-teal-900"
                : "font-medium text-slate-700 hover:bg-slate-50"
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate">
                {MODEL_CUSTOM_SELECT_OPTION.label}
              </span>
              <span className="block truncate text-xs font-normal text-slate-500">
                {MODEL_CUSTOM_SELECT_OPTION.hint}
              </span>
            </span>
            {customPanelOpen || savedCustomCount > 0 ? (
              <Check className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
            ) : (
              <span className="h-4 w-4 shrink-0" aria-hidden />
            )}
          </button>
        }
      />

      {customPanelOpen && !useProductSampleAngles ? (
        <div className="space-y-2 rounded-[14px] border border-border bg-slate-50/60 p-3">
          {customAngles.length === 0 ? (
            <CustomAngleRow
              value={createEmptyCustomAngle()}
              disabled={presetAnglesDisabled || atLimit}
              canRemove={false}
              onChange={(next) => {
                if (next.saved && next.text.trim()) {
                  onCustomAnglesChange([next]);
                }
              }}
              onRemove={() => {}}
            />
          ) : (
            customAngles.map((item, index) => (
              <CustomAngleRow
                key={item.id}
                value={item}
                disabled={presetAnglesDisabled}
                canRemove={customAngles.length > 1 || item.text.length > 0}
                onChange={(next) => updateCustom(index, next)}
                onRemove={() => removeCustom(index)}
              />
            ))
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={presetAnglesDisabled || atLimit}
            className="w-full"
            onClick={addCustomRow}
          >
            <Plus className="h-4 w-4" />
            Добавить ещё ракурс
          </Button>
        </div>
      ) : null}

      <p className="px-0.5 text-xs text-slate-500">
        {useProductSampleAngles && productSampleAngles
          ? `Будет ${productSampleAngles.length} AI-моделей под ракурсы образцов. Первый задаёт лицо и образ.`
          : "Один ракурс за запуск: 1 товар, 1 модель, 1 примерка."}
      </p>
    </div>
  );
}
