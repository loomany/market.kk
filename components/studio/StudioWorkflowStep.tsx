"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StudioWorkflowStepProps = {
  step: number;
  label?: string;
  optional?: boolean;
  isLast?: boolean;
  children: ReactNode;
  className?: string;
};

export function StudioWorkflowStep({
  step,
  label,
  optional,
  isLast = false,
  children,
  className,
}: StudioWorkflowStepProps) {
  return (
    <div
      className={cn("flex gap-3", className)}
      aria-label={label ? `Шаг ${step}: ${label}` : `Шаг ${step}`}
    >
      <div className="flex w-7 shrink-0 flex-col items-center self-stretch">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white shadow-sm">
          {step}
        </span>
        {!isLast ? (
          <span className="mt-2 w-px flex-1 bg-border" aria-hidden />
        ) : null}
      </div>
      <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
        {(label || optional) && (
          <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {label ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
            ) : null}
            {optional ? (
              <span className="text-[11px] text-slate-400">необязательно</span>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
