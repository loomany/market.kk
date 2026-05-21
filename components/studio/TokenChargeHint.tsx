"use client";

import { Coins } from "lucide-react";
import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import type { GenerationOperationType } from "@/lib/tokens/generationCostConfig";
import { getClientGenerationCost } from "@/lib/tokens/generationCostConfig";
import { formatTokenChargeHint } from "@/lib/tokens/tokenChargeLabel";
import { cn } from "@/lib/utils";

type TokenChargeHintProps = {
  /** Explicit token count (overrides operation). */
  tokens?: number;
  /** Maps to configured per-operation cost. */
  operation?: GenerationOperationType;
  /** Compact pill for inside primary CTA buttons. */
  inline?: boolean;
  locale?: IndexableLocale;
  className?: string;
};

export function TokenChargeHint({
  tokens,
  operation = "default",
  inline = false,
  locale = "ru",
  className,
}: TokenChargeHintProps) {
  const count = tokens ?? getClientGenerationCost(operation);
  const label = formatTokenChargeHint(count, locale);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 font-semibold leading-tight text-violet-700 whitespace-nowrap",
        inline
          ? "max-w-[min(52%,11rem)] text-[10px] sm:text-[11px]"
          : "max-w-[48%] text-[11px]",
        className
      )}
      title={label}
    >
      <Coins className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}
