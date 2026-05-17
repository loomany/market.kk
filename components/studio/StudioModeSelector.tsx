"use client";

import { cn } from "@/lib/utils";
import { STUDIO_MODES, type StudioMode } from "./types";

type StudioModeSelectorProps = {
  value: StudioMode;
  onChange: (mode: StudioMode) => void;
};

export function StudioModeSelector({
  value,
  onChange,
}: StudioModeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900">Режим студии</label>
      <div className="grid gap-2">
        {STUDIO_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
              value === mode.id
                ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <span className="font-medium text-slate-900">{mode.label}</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
