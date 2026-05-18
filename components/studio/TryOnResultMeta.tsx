"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioResultImage } from "./types";

function providerBadgeLabel(provider?: string): string {
  if (provider === "mock") return "Демо";
  if (provider === "fal") return "Fal AI";
  return provider ?? "AI";
}

type TryOnResultMetaProps = {
  result: StudioResultImage;
};

export function TryOnResultMeta({ result }: TryOnResultMetaProps) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    Boolean(result.provider) ||
    Boolean(result.model) ||
    Boolean(result.requestId) ||
    typeof result.seed === "number" ||
    typeof result.estimatedCost === "number" ||
    Boolean(result.promptPreview);

  return (
    <div className="space-y-2 border-t border-border/70 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            result.provider === "mock"
              ? "bg-violet-100 text-violet-800"
              : "bg-teal-100 text-teal-900"
          )}
        >
          {providerBadgeLabel(result.provider)}
        </span>
        {result.label ? (
          <span className="text-xs text-slate-500">{result.label}</span>
        ) : null}
      </div>

      {hasDetails ? (
        <details
          open={open}
          onToggle={(event) =>
            setOpen((event.currentTarget as HTMLDetailsElement).open)
          }
          className="group rounded-[12px] border border-slate-200/80 bg-slate-50/60"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
            Технические детали
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400 transition",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </summary>
          <dl className="space-y-1.5 border-t border-slate-200/60 px-3 py-2 text-[11px] leading-5 text-slate-600">
            {result.provider ? (
              <DetailRow label="Провайдер" value={result.provider} />
            ) : null}
            {result.model ? (
              <DetailRow label="Модель" value={result.model} />
            ) : null}
            {result.requestId ? (
              <DetailRow label="Request ID" value={result.requestId} mono />
            ) : null}
            {typeof result.seed === "number" ? (
              <DetailRow label="Seed" value={String(result.seed)} mono />
            ) : null}
            {typeof result.estimatedCost === "number" ? (
              <DetailRow
                label="Оценка стоимости"
                value={`~$${result.estimatedCost.toFixed(2)}`}
              />
            ) : null}
            {result.promptPreview ? (
              <div>
                <dt className="font-medium text-slate-500">Промпт</dt>
                <dd className="mt-0.5 max-h-24 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[10px] text-slate-700">
                  {result.promptPreview}
                </dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd
        className={cn(
          "min-w-0 flex-1 break-all text-slate-800",
          mono && "font-mono text-[10px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
