"use client";

import type { ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { useStudioCopy } from "./StudioLocaleContext";

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

export function AspectRatioSelectField<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
  placeholder,
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
  const { copy } = useStudioCopy();
  const resolvedLabel = label ?? copy.form.aspectRatio;
  const resolvedPlaceholder = placeholder ?? copy.form.selectFormat;

  return (
    <SettingField label={resolvedLabel} description={description}>
      <Select
        triggerClassName="rounded-[12px] font-medium"
        placeholder={resolvedPlaceholder}
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
