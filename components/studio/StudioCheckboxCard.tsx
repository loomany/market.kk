"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudioCheckboxCardProps = {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

/** SaaS checkbox row — card + custom teal check (studio style). */
export function StudioCheckboxCard({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
  className,
}: StudioCheckboxCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-[18px] border border-border bg-white p-3 transition-colors",
        "focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:ring-offset-2",
        checked && "border-teal-200/90 bg-teal-50/50",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors",
          checked
            ? "border-teal-600 bg-teal-600 text-white shadow-sm"
            : "border-slate-300 bg-white group-hover:border-slate-400"
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-950">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}
