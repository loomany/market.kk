"use client";

import type { ReactNode } from "react";
import {
  studioColumnHeaderClass,
  studioColumnTitleClass,
} from "@/components/studio/PreviewCard";
import { cn } from "@/lib/utils";

type StudioWorkflowStepProps = {
  step: number;
  label?: string;
  optional?: boolean;
  isLast?: boolean;
  softCorner?: "bottom" | "top";
  children: ReactNode;
  className?: string;
};

function StepBadge({ step }: { step: number }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-700 text-xs font-bold leading-none tabular-nums text-white">
      {step}
    </span>
  );
}

export function StudioWorkflowStep({
  step,
  label,
  optional,
  isLast = false,
  softCorner,
  children,
  className,
}: StudioWorkflowStepProps) {
  const hasHeader = Boolean(label || optional);

  return (
    <div
      className={cn("relative", !isLast && "pb-6 sm:pb-7", className)}
      aria-label={label ? `Шаг ${step}: ${label}` : `Шаг ${step}`}
    >
      <div
        className={cn(
          "overflow-hidden bg-white shadow-sm",
          "border border-l-0 border-slate-200/90",
          "rounded-r-[20px] rounded-tr-[20px] rounded-br-[20px]",
          softCorner === "bottom" && "rounded-br-[24px]",
          softCorner === "top" && "rounded-tr-[24px]"
        )}
      >
        {hasHeader ? (
          <div className={studioColumnHeaderClass}>
            <StepBadge step={step} />
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {label ? (
                <p className={studioColumnTitleClass}>{label}</p>
              ) : null}
              {optional ? (
                <span className="text-[11px] text-slate-400">необязательно</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={cn("p-4 sm:p-5", hasHeader && "pt-4")}>{children}</div>
      </div>
    </div>
  );
}
