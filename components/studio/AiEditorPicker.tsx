"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PostProcessingEditor } from "@/lib/studio/postProcessingEditors";

type AiEditorPickerProps = {
  title?: string;
  editors: PostProcessingEditor[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function AiEditorPicker({
  title = "Выберите AI-редактор",
  editors,
  value,
  onChange,
  disabled,
}: AiEditorPickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="grid gap-2">
        {editors.map((editor) => {
          const selected = value === editor.id;
          const unavailable = !editor.available || editor.comingSoon;

          return (
            <button
              key={editor.id}
              type="button"
              disabled={disabled || unavailable}
              onClick={() => onChange(editor.id)}
              className={cn(
                "rounded-[18px] border p-4 text-left transition",
                selected
                  ? "border-teal-500 bg-teal-50"
                  : "border-border bg-white hover:border-teal-200",
                unavailable && "cursor-not-allowed opacity-60"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-950">
                  {editor.title}
                </p>
                {editor.comingSoon ? (
                  <Badge variant="outline">Скоро</Badge>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {editor.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
