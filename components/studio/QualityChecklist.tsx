"use client";

import {
  isChecklistComplete,
  QUALITY_CHECKLIST_KEYS,
} from "@/lib/ai/qualityChecklist";
import type { QualityChecklistKey, QualityChecklistState } from "./types";
import { Badge } from "@/components/ui/Badge";
import { formatStudioString } from "@/lib/studio/i18n";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type QualityChecklistProps = {
  checklist: QualityChecklistState;
  onChange: (key: QualityChecklistKey, value: boolean) => void;
  compact?: boolean;
};

export function QualityChecklist({
  checklist,
  onChange,
  compact,
}: QualityChecklistProps) {
  const { copy } = useStudioCopy();
  const c = copy.qualityChecklist;
  const completed = QUALITY_CHECKLIST_KEYS.filter((k) => checklist[k]).length;
  const total = QUALITY_CHECKLIST_KEYS.length;
  const complete = isChecklistComplete(checklist);

  return (
    <div className={cn("space-y-2", compact && "text-sm")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">
          {formatStudioString(c.header, { completed, total })}
        </span>
        {complete ? (
          <Badge variant="success">{c.readyBadge}</Badge>
        ) : (
          <Badge variant="outline">{c.reviewBadge}</Badge>
        )}
      </div>

      {!complete && (
        <p className="text-xs leading-5 text-amber-700">{c.hint}</p>
      )}

      <ul className="space-y-1.5">
        {QUALITY_CHECKLIST_KEYS.map((key) => (
          <li key={key}>
            <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700">
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={(e) => onChange(key, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-teal-700"
              />
              <span>{c[key]}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
