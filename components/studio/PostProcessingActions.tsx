"use client";

import { Clapperboard, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import { useStudioCopy } from "./StudioLocaleContext";

type PostProcessingActionsProps = {
  value: PostProcessingMode | null;
  onChange: (mode: PostProcessingMode) => void;
  disabled?: boolean;
  /** When set, only these modes are shown (e.g. video-only for uploaded MP4). */
  allowedModes?: PostProcessingMode[];
};

export function PostProcessingActions({
  value,
  onChange,
  disabled,
  allowedModes,
}: PostProcessingActionsProps) {
  const { copy } = useStudioCopy();
  const p = copy.postProcessingActions;
  const allActions: {
    id: PostProcessingMode;
    label: string;
    icon: typeof Clapperboard;
  }[] = [
    { id: "image", label: p.image, icon: ImageIcon },
    { id: "video", label: p.video, icon: Clapperboard },
  ];
  const actions = allowedModes
    ? allActions.filter((a) => allowedModes.includes(a.id))
    : allActions;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-950">{p.whatCreate}</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const selected = value === action.id;
          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(action.id)}
              className={cn(
                "flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] border px-3 py-2.5 text-sm font-semibold transition",
                selected
                  ? "border-teal-500 bg-teal-50 text-teal-950"
                  : "border-border bg-white text-slate-700 hover:border-teal-200",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
