"use client";

import { Coins } from "lucide-react";
import { VitrinaTokenIcon } from "@/components/tokens/VitrinaTokenIcon";
import type { StudioCostEstimate } from "@/lib/ai/studioGenerationCostEstimate";
import {
  hasEstimateTokenRange,
  maxTokensFromEstimate,
  minTokensFromEstimate,
} from "@/lib/ai/studioCostEstimateUtils";
import type { GenerationOperationType } from "@/lib/tokens/generationCostConfig";
import { getClientGenerationCost } from "@/lib/tokens/generationCostConfig";
import {
  formatExactTokenAmount,
  formatTokenChargeNumber,
} from "@/lib/tokens/formatTokens";
import {
  formatTokenChargeHint,
  formatTokenChargeRangeHint,
  tokenChargePrefix,
} from "@/lib/tokens/tokenChargeLabel";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type TokenChargeHintSize = "sm" | "lg";

type TokenChargeHintProps = {
  /** Full pipeline estimate (min–max when optional steps exist). */
  estimate?: StudioCostEstimate;
  /** Explicit token count (overrides operation). */
  tokens?: number;
  tokensMin?: number;
  tokensMax?: number;
  /** Maps to configured per-operation cost. */
  operation?: GenerationOperationType;
  /** `total` — «Итоговое списание»; `charge` — legacy «К списанию». */
  variant?: "total" | "charge";
  /** `lg` — same height/radius as primary `Button` size="lg". */
  size?: TokenChargeHintSize;
  /** Compact pill for inside primary CTA buttons. */
  inline?: boolean;
  className?: string;
};

export function TokenChargeHint({
  estimate,
  tokens,
  tokensMin,
  tokensMax,
  operation = "default",
  variant = "charge",
  size = "sm",
  inline = false,
  className,
}: TokenChargeHintProps) {
  const { locale } = useStudioCopy();

  const min =
    tokensMin ??
    (estimate ? minTokensFromEstimate(estimate) : undefined) ??
    tokens ??
    getClientGenerationCost(operation);
  const max =
    tokensMax ??
    (estimate ? maxTokensFromEstimate(estimate) : undefined) ??
    tokens ??
    getClientGenerationCost(operation);
  const showRange =
    estimate != null
      ? hasEstimateTokenRange(estimate)
      : tokensMin !== undefined &&
        tokensMax !== undefined &&
        Math.abs(min - max) > 0.005;

  const isTotal = variant === "total";
  const amount = formatTokenChargeNumber(max);
  const compactTotal = inline && isTotal;
  const label = isTotal
    ? compactTotal
      ? showRange
        ? `${formatTokenChargeNumber(min)}–${amount}`
        : amount
      : showRange
        ? `${tokenChargePrefix(locale)} ${formatTokenChargeNumber(min)}–${amount}`
        : `${tokenChargePrefix(locale)} ${amount}`
    : showRange
      ? formatTokenChargeRangeHint(min, max, locale)
      : formatTokenChargeHint(max, locale);
  const title = showRange
    ? `${formatExactTokenAmount(min, locale)} – ${formatExactTokenAmount(max, locale)}`
    : formatExactTokenAmount(max, locale);

  const isLg = size === "lg";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold leading-tight text-violet-700 whitespace-nowrap",
        isLg ? "min-h-12 gap-1.5 rounded-[18px] px-3.5 text-sm" : "gap-1 rounded-full text-[11px]",
        isTotal
          ? "border border-violet-200/90 bg-gradient-to-b from-white via-violet-50/95 to-violet-100/80 shadow-[0_1px_2px_rgba(109,40,217,0.1),0_0_0_1px_rgba(167,139,250,0.2)] ring-1 ring-inset ring-white/80"
          : isLg
            ? "bg-violet-100"
            : "bg-violet-100 px-2 py-0.5",
        !isLg && isTotal && "px-2.5 py-1",
        !isLg &&
          (inline
            ? "max-w-[min(62%,14rem)] text-[10px] sm:text-[11px]"
            : "max-w-[min(56%,13rem)]"),
        className
      )}
      title={title}
    >
      {isTotal ? (
        <>
          <span className="truncate">{label}</span>
          <VitrinaTokenIcon
            className={cn("opacity-95", isLg && "h-4 w-4")}
          />
        </>
      ) : (
        <>
          <Coins className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{label}</span>
        </>
      )}
    </span>
  );
}
