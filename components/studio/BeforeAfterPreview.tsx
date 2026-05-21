"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { useStudioCopy } from "./StudioLocaleContext";

type BeforeAfterPreviewProps = {
  beforeUrl?: string | null;
  afterUrl?: string | null;
};

export function BeforeAfterPreview({
  beforeUrl,
  afterUrl,
}: BeforeAfterPreviewProps) {
  const { copy } = useStudioCopy();

  if (!beforeUrl && !afterUrl) {
    return null;
  }

  const b = copy.beforeAfter;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{b.title}</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PreviewSlot label={b.before} url={beforeUrl} />
        <ArrowDown className="mx-auto h-5 w-5 shrink-0 text-slate-400 sm:hidden" />
        <ArrowRight className="hidden h-5 w-5 shrink-0 text-slate-400 sm:block" />
        <PreviewSlot label={b.after} url={afterUrl} />
      </div>
    </div>
  );
}

function PreviewSlot({
  label,
  url,
}: {
  label: string;
  url?: string | null;
}) {
  return (
    <div className="flex-1 space-y-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="overflow-hidden rounded-[18px] border border-border bg-slate-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="max-h-[420px] min-h-[220px] w-full object-contain"
          />
        ) : (
          <div className="flex min-h-[220px] items-center justify-center text-xs text-slate-400">
            —
          </div>
        )}
      </div>
    </div>
  );
}
