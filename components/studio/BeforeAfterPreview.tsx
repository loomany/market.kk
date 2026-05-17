"use client";

import { ArrowRight } from "lucide-react";

type BeforeAfterPreviewProps = {
  beforeUrl?: string | null;
  afterUrl?: string | null;
};

export function BeforeAfterPreview({
  beforeUrl,
  afterUrl,
}: BeforeAfterPreviewProps) {
  if (!beforeUrl && !afterUrl) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">Before / After</h3>
      <div className="flex items-center gap-3">
        <PreviewSlot label="До" url={beforeUrl} />
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
        <PreviewSlot label="После" url={afterUrl} />
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="aspect-[3/4] w-full object-cover" />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-xs text-slate-400">
            —
          </div>
        )}
      </div>
    </div>
  );
}
