"use client";

import {
  isChecklistComplete,
  QUALITY_CHECKLIST_KEYS,
  QUALITY_CHECKLIST_LABELS_RU,
} from "@/lib/ai/qualityChecklist";
import type { QualityChecklistKey, QualityChecklistState } from "./types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

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
  const completed = QUALITY_CHECKLIST_KEYS.filter((k) => checklist[k]).length;
  const total = QUALITY_CHECKLIST_KEYS.length;
  const complete = isChecklistComplete(checklist);

  return (
    <div className={cn("space-y-2", compact && "text-sm")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">
          Проверка качества · {completed}/{total}
        </span>
        {complete ? (
          <Badge variant="success">Готово к скачиванию</Badge>
        ) : (
          <Badge variant="outline">Проверьте перед публикацией</Badge>
        )}
      </div>

      {!complete && (
        <p className="text-xs leading-5 text-amber-700">
          Отметьте все пункты только если товар выглядит правильно.
        </p>
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
              <span>{QUALITY_CHECKLIST_LABELS_RU[key]}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
