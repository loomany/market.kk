"use client";

import { Coins } from "lucide-react";
import { VitrinaTokenIcon } from "@/components/tokens/VitrinaTokenIcon";
import type { GenerationOperationType } from "@/lib/tokens/generationCostConfig";
import { getClientGenerationCost } from "@/lib/tokens/generationCostConfig";
import {
  formatExactTokenAmount,
  formatTokenChargeNumber,
} from "@/lib/tokens/formatTokens";
import {
  formatTokenChargeHint,
  tokenChargePrefix,
} from "@/lib/tokens/tokenChargeLabel";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type TokenChargeHintSize = "sm" | "lg";

type TokenChargeHintProps = {
  /** Explicit token count (overrides operation). */
  tokens?: number;
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
  tokens,
  operation = "default",
  variant = "charge",
  size = "sm",
  inline = false,
  className,
}: TokenChargeHintProps) {
  const { locale } = useStudioCopy();
  const count = tokens ?? getClientGenerationCost(operation);
  const isTotal = variant === "total";
  const amount = formatTokenChargeNumber(count);
  const compactTotal = inline && isTotal;
  const label = isTotal
    ? compactTotal
      ? amount
      : `${tokenChargePrefix(locale)} ${amount}`
    : formatTokenChargeHint(count, locale);
  const title = isTotal
    ? formatExactTokenAmount(count, locale)
    : label;

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
