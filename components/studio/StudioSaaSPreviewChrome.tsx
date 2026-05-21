"use client";

import { cn } from "@/lib/utils";
import { formatStudioString } from "@/lib/studio/i18n";
import { useStudioCopy } from "./StudioLocaleContext";

export const previewCardShared = {
  compact: true,
  scrollableViewport: false as const,
};

export const saasPreviewCardClass =
  "w-full ring-2 ring-slate-100/90 shadow-lg shadow-slate-200/50 lg:w-full lg:ring-1 lg:shadow-sm lg:shadow-slate-200/50";

/** «Свой файл» / «Мои файлы» — одна ширина и тонкая обводка Card. */
export const postProcessingSectionCardClass =
  "mx-auto w-full max-w-[656px] overflow-hidden";

/** Плитка файла в галерее — без ring, как секции выше. */
export const postProcessingGalleryTileClass =
  "w-full rounded-2xl border border-border/80 bg-white shadow-sm shadow-slate-200/40";

export function StudioPreviewTabButton({
  label,
  active,
  ready,
  onClick,
  size = "default",
}: {
  label: string;
  active: boolean;
  ready: boolean;
  onClick: () => void;
  size?: "default" | "mobile";
}) {
  const { copy } = useStudioCopy();
  const isMobile = size === "mobile";
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "relative flex flex-1 items-center justify-center gap-1 transition",
        isMobile
          ? cn(
              "rounded-[10px] px-2 py-2 text-sm",
              active
                ? "bg-white font-semibold text-slate-950 shadow-sm"
                : "font-medium text-slate-500 hover:text-slate-800"
            )
          : cn(
              "rounded-md px-1 py-1.5 text-xs font-medium",
              active
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )
      )}
    >
      {label}
      {ready ? (
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-teal-500"
          aria-label={copy.common.hasPreview}
        />
      ) : null}
    </button>
  );
}

export function StudioPreviewAspectBadge({ label }: { label: string }) {
  const { copy } = useStudioCopy();
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50"
      aria-label={formatStudioString(copy.common.formatLabel, { label })}
    >
      <span className="font-mono text-[10px] font-semibold tabular-nums text-slate-700">
        {label}
      </span>
    </span>
  );
}

/** Шапка правой колонки до появления результата (как «Итог» + 1:1 в примерке). */
export function StudioPreviewResultColumnHeader({
  label,
  aspectLabel,
}: {
  label?: string;
  aspectLabel: string;
}) {
  const { copy } = useStudioCopy();
  const resultLabel = label ?? copy.common.result;
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center justify-center rounded-lg bg-slate-100/90 px-2.5 py-1.5 ring-1 ring-slate-200/50">
        <span className="text-xs font-semibold text-slate-800">{resultLabel}</span>
      </div>
      <StudioPreviewAspectBadge label={aspectLabel} />
    </div>
  );
}

export function StudioPreviewTabBar<T extends string>({
  tabs,
  activeTab,
  tabReady,
  onTabChange,
  aspectLabel,
  fullWidth = false,
  ariaLabel,
}: {
  tabs: { id: T; label: string }[];
  activeTab: T;
  tabReady: Record<T, boolean>;
  onTabChange: (tab: T) => void;
  aspectLabel?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
}) {
  const { copy } = useStudioCopy();
  const tablistLabel = ariaLabel ?? copy.clothingPreview.previewPipeline;
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        fullWidth ? "mb-3 w-full" : "mb-2"
      )}
    >
      <div
        role="tablist"
        aria-label={tablistLabel}
        className={cn(
          "flex gap-0.5 bg-slate-100/90 ring-1 ring-slate-200/50",
          fullWidth
            ? "w-full rounded-xl p-1"
            : "min-w-0 flex-1 rounded-lg p-0.5"
        )}
      >
        {tabs.map((tab) => (
          <StudioPreviewTabButton
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            ready={tabReady[tab.id]}
            onClick={() => onTabChange(tab.id)}
            size={fullWidth ? "mobile" : "default"}
          />
        ))}
      </div>
      {aspectLabel ? <StudioPreviewAspectBadge label={aspectLabel} /> : null}
    </div>
  );
}
