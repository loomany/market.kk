"use client";

import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

export type ModelInputMode = "create" | "upload";

type ModelInputModeSelectorProps = {
  value: ModelInputMode;
  onChange: (mode: ModelInputMode) => void;
  disabled?: boolean;
};

export function ModelInputModeSelector({
  value,
  onChange,
  disabled = false,
}: ModelInputModeSelectorProps) {
  const { copy } = useStudioCopy();
  const m = copy.modelInputMode;
  const modes: { id: ModelInputMode; label: string }[] = [
    { id: "create", label: m.create },
    { id: "upload", label: m.upload },
  ];

  return (
    <div
      role="tablist"
      aria-label={m.ariaLabel}
      className={cn(
        "grid grid-cols-2 gap-1 rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/50",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          disabled={disabled}
          onClick={() => onChange(mode.id)}
          className={cn(
            "rounded-lg px-2 py-2.5 text-sm font-semibold transition",
            value === mode.id
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
