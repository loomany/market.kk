"use client";

import { Clapperboard, Gem, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudioModes } from "@/lib/studio/i18n/studioOptionLists";
import { useStudioCopy } from "./StudioLocaleContext";
import type { StudioMode } from "./types";

type StudioModeSelectorProps = {
  value: StudioMode;
  onChange: (mode: StudioMode) => void;
};

const modeIcons = {
  "clothing-tryon": Shirt,
  "product-shot": Gem,
  "post-processing": Clapperboard,
} satisfies Record<StudioMode, typeof Shirt>;

export function StudioModeSelector({
  value,
  onChange,
}: StudioModeSelectorProps) {
  const { locale } = useStudioCopy();
  const modes = getStudioModes(locale);

  return (
      <div className="grid gap-3 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const selected = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                "min-h-0 rounded-[24px] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 md:min-h-[150px]",
                selected
                  ? "border-teal-500 bg-teal-50 shadow-xl shadow-teal-900/10"
                  : "border-border bg-white shadow-md shadow-slate-200/60 hover:border-teal-200 hover:bg-teal-50/40"
              )}
              aria-pressed={selected}
            >
              <span className="flex items-center gap-3 md:hidden">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-teal-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold text-slate-950">
                  {mode.label}
                </span>
              </span>
              <span className="hidden items-start justify-between gap-3 md:flex">
                <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-teal-700 shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    selected
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {mode.recommendedFor}
                </span>
              </span>
              <span className="mt-4 hidden text-base font-semibold text-slate-950 md:block">
                {mode.label}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                {mode.description}
              </span>
            </button>
          );
        })}
      </div>
  );
}
