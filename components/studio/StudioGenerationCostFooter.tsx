"use client";

import type { StudioCostEstimate } from "@/lib/ai/studioGenerationCostEstimate";
import { usdToDisplayTokens } from "@/lib/ai/studioGenerationCostEstimate";
import {
  costLineLabel,
  generationCostUiCopy,
} from "@/lib/studio/i18n/generationCostI18n";
import { cn } from "@/lib/utils";
import { TokenChargeHint } from "./TokenChargeHint";
import { useStudioCopy } from "./StudioLocaleContext";

type StudioGenerationCostFooterProps = {
  estimate: StudioCostEstimate | null;
  /** Show compact pill only (inside button). */
  inline?: boolean;
  /** Extra context under breakdown, e.g. audio on/off for video. */
  contextNote?: string;
  className?: string;
};

export function StudioGenerationCostFooter({
  estimate,
  inline = false,
  contextNote,
  className,
}: StudioGenerationCostFooterProps) {
  const { locale } = useStudioCopy();
  const ui = generationCostUiCopy(locale);

  if (!estimate || estimate.tokens <= 0) {
    return null;
  }

  if (inline) {
    return <TokenChargeHint tokens={estimate.tokens} inline className={className} />;
  }

  return (
    <div
      className={cn(
        "rounded-[12px] border border-violet-200/80 bg-violet-50/60 px-3 py-2.5 text-left",
        className
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-violet-800/90">
          {ui.estimateTitle}
        </p>
        <TokenChargeHint tokens={estimate.tokens} />
      </div>
      <p className="mt-1 text-[11px] leading-5 text-violet-900/80">
        {ui.usdHint(estimate.totalUsd.toFixed(2))}
        {contextNote ? ` · ${contextNote}` : null}
      </p>
      <ul className="mt-2 space-y-0.5 border-t border-violet-200/60 pt-2">
        {estimate.lines.map((line) => (
          <li
            key={line.id}
            className="flex justify-between gap-2 text-[10px] leading-4 text-violet-950/75"
          >
            <span className="min-w-0 truncate">{costLineLabel(line.id, locale)}</span>
            <span className="shrink-0 tabular-nums">
              ${line.usd.toFixed(2)}
              {line.usd > 0
                ? ` · ${usdToDisplayTokens(line.usd)}`
                : null}
            </span>
          </li>
        ))}
      </ul>
      {estimate.optionalLines.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          <li className="text-[10px] font-medium text-violet-800/70">
            {ui.optionalPrefix}
          </li>
          {estimate.optionalLines.map((line) => (
            <li
              key={line.id}
              className="flex justify-between gap-2 text-[10px] leading-4 text-violet-900/60"
            >
              <span className="min-w-0 truncate">{costLineLabel(line.id, locale)}</span>
              <span className="shrink-0 tabular-nums">+${line.usd.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
