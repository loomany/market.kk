"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import type { ProductSetSlotProgress } from "@/lib/studio/productSetProgress";
import { cn } from "@/lib/utils";

function phaseLabel(phase: ProductSetSlotProgress["phase"]): string {
  switch (phase) {
    case "analyzing":
      return "Анализ";
    case "model":
      return "Модель";
    case "tryon":
      return "Примерка";
    case "done":
      return "Готово";
    case "error":
      return "Ошибка";
    default:
      return "Ожидание";
  }
}

export function ProductSetProgressRail({
  slots,
  activeIndex,
  detail,
}: {
  slots: ProductSetSlotProgress[];
  activeIndex: number;
  detail?: string | null;
}) {
  if (slots.length < 2) return null;

  const done = slots.filter((s) => s.phase === "done").length;

  return (
    <div className="rounded-[14px] border border-slate-200 bg-slate-50/90 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-900">
          Комплект: {done} из {slots.length} готово
        </p>
        <p className="text-[11px] tabular-nums text-slate-500">
          {activeIndex + 1} / {slots.length}
        </p>
      </div>
      {detail ? (
        <p className="mb-2 text-xs leading-5 text-slate-600">{detail}</p>
      ) : null}
      <ul className="space-y-1.5">
        {slots.map((slot, index) => {
          const isActive =
            index === activeIndex &&
            slot.phase !== "done" &&
            slot.phase !== "pending";
          const isDone = slot.phase === "done";
          return (
            <li
              key={slot.photoId}
              className={cn(
                "flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-xs",
                isActive && "bg-white ring-1 ring-teal-200",
                isDone && "text-teal-900"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-teal-600" />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-teal-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              )}
              <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                {slot.label}
              </span>
              <span className="shrink-0 text-slate-500">
                {phaseLabel(slot.phase)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        Ракурсы обрабатываются по очереди (не параллельно) — так сохраняется
        одно лицо модели.
      </p>
    </div>
  );
}
