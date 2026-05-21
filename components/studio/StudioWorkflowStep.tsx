"use client";

import type { ReactNode } from "react";
import {
  studioColumnHeaderClass,
  studioColumnTitleClass,
} from "@/components/studio/PreviewCard";
import { formatStudioString } from "@/lib/studio/i18n";
import { cn } from "@/lib/utils";
import type { GenerationOperationType } from "@/lib/tokens/generationCostConfig";
import { TokenChargeHint } from "./TokenChargeHint";
import { useStudioCopy } from "./StudioLocaleContext";

type StudioWorkflowStepProps = {
  step: number;
  label?: string;
  optional?: boolean;
  isLast?: boolean;
  softCorner?: "bottom" | "top";
  /** Shown on the right of the step title (violet SaaS pill). */
  tokenOperation?: GenerationOperationType;
  tokenCharge?: number;
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
  tokenOperation,
  tokenCharge,
  children,
  className,
}: StudioWorkflowStepProps) {
  const { copy } = useStudioCopy();
  const wf = copy.studioWorkflow;
  const wfs = copy.studioWorkflowStep;
  const hasHeader = Boolean(label || optional);

  const ariaLabel = label
    ? formatStudioString(wfs.stepAria, { step, label })
    : formatStudioString(wfs.stepAriaNoLabel, { step });

  return (
    <div
      className={cn("relative", !isLast && "pb-6 sm:pb-7", className)}
      aria-label={ariaLabel}
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
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 items-baseline gap-x-2 gap-y-0.5">
                {label ? (
                  <p className={cn(studioColumnTitleClass, "truncate")}>
                    {label}
                  </p>
                ) : null}
                {optional ? (
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {wf.optionalBadge}
                  </span>
                ) : null}
              </div>
              {tokenOperation || tokenCharge !== undefined ? (
                <TokenChargeHint
                  operation={tokenOperation}
                  tokens={tokenCharge}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={cn("p-4 sm:p-5", hasHeader && "pt-4")}>{children}</div>
      </div>
    </div>
  );
}
