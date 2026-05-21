"use client";

import { Sparkles } from "lucide-react";

type StudioFilesSectionHeaderProps = {
  title: string;
};

/** «Мои файлы» — по центру, Sparkles слева от текста (как Vitrina AI Studio). */
export function StudioFilesSectionHeader({ title }: StudioFilesSectionHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Sparkles
        className="h-5 w-5 shrink-0 text-violet-600"
        strokeWidth={2}
        aria-hidden
      />
      <h2 className="text-lg font-bold tracking-tight text-violet-700 sm:text-xl">
        {title}
      </h2>
    </div>
  );
}
