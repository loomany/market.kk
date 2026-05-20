"use client";

import type { ReactNode } from "react";
import { Select } from "@/components/ui/Select";

export type AspectRatioSelectOption<T extends string = string> = {
  id: T;
  label: string;
  shortHint: string;
  hint: string;
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

export function hintForAspectRatioOption<T extends string>(
  options: ReadonlyArray<AspectRatioSelectOption<T>>,
  value: T
): string {
  return options.find((item) => item.id === value)?.hint ?? "";
}

/** Единый селектор «3:4 — WB и Ozon» для студии (Fal nano-banana и точная карточка). */
export function AspectRatioSelectField<T extends string>({
  label = "Соотношение сторон",
  description,
  value,
  options,
  onChange,
  placeholder = "Выберите формат",
  disabled = false,
}: {
  label?: string;
  description?: string;
  value?: T;
  options: ReadonlyArray<AspectRatioSelectOption<T>>;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <SettingField label={label} description={description}>
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
        }))}
        onChange={onChange}
      />
    </SettingField>
  );
}
