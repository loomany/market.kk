"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatStudioString } from "@/lib/studio/i18n";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

type StudioFilesPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function buildPaginationItems(
  page: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const include = new Set<number>();
  for (let i = 1; i <= Math.min(2, totalPages); i += 1) include.add(i);
  for (let i = Math.max(1, totalPages - 1); i <= totalPages; i += 1) {
    include.add(i);
  }
  for (
    let i = Math.max(1, page - 1);
    i <= Math.min(totalPages, page + 1);
    i += 1
  ) {
    include.add(i);
  }

  const sorted = [...include].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push(sorted[i - 1] < page ? "ellipsis-left" : "ellipsis-right");
    }
    items.push(sorted[i]);
  }
  return items;
}

export function StudioFilesPagination({
  page,
  totalPages,
  onPageChange,
}: StudioFilesPaginationProps) {
  const { copy } = useStudioCopy();
  const p = copy.studioFilesPagination;

  if (totalPages <= 1) return null;

  const items = buildPaginationItems(page, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 text-sm"
      aria-label={p.navAria}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label={p.prevPageAria}
        className="min-h-9 px-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
        {p.prev}
      </Button>

      <div className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span
                key={`${item}-${index}`}
                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-slate-400"
                aria-hidden
              >
                …
              </span>
            );
          }

          const active = item === page;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={formatStudioString(p.pageAria, { page: item })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-[12px] border px-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                active
                  ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
                  : "border-border bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/70"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label={p.nextPageAria}
        className="min-h-9 px-2.5"
      >
        {p.next}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
