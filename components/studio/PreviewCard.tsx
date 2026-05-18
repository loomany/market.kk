import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/** Общая шапка колонки студии (как у шага «Фото товара») */
export const studioColumnHeaderClass =
  "flex min-h-[2.75rem] items-center gap-2.5 border-b border-slate-100 px-4 py-2.5 sm:px-5";

export const studioColumnTitleClass = "text-sm font-semibold text-slate-950";

type PreviewCardProps = {
  title: string;
  url: string | null;
  empty: string;
  badge?: string;
  footer?: ReactNode;
  /** Overrides url / empty when set (e.g. result with error fallback) */
  content?: ReactNode;
};

export function PreviewCard({
  title,
  url,
  empty,
  badge,
  footer,
  content,
}: PreviewCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm"
      )}
    >
      <div className={cn(studioColumnHeaderClass, "shrink-0 justify-between")}>
        <p className={studioColumnTitleClass}>{title}</p>
        {badge ? <Badge variant="violet">{badge}</Badge> : null}
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col border-t border-border bg-slate-50">
        {content ? (
          content
        ) : url ? (
          <div className="flex flex-1 items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Предпросмотр: ${title}`}
              className="max-h-[460px] w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-sm leading-6 text-slate-500">
            {empty}
          </div>
        )}
      </div>
      {footer ? (
        <div className="shrink-0 border-t border-border/70 bg-white p-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function ResultCompareSkeleton({ title = "Результат" }: { title?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm">
      <div className={cn(studioColumnHeaderClass, "shrink-0")}>
        <p className={studioColumnTitleClass}>{title}</p>
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col border-t border-border bg-slate-50 p-4">
        <div className="aspect-[3/4] w-full animate-pulse rounded-[18px] bg-slate-200" />
      </div>
    </div>
  );
}
