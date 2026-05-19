"use client";

import { Button } from "@/components/ui/Button";

type StudioFilesPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function StudioFilesPagination({
  page,
  totalPages,
  onPageChange,
}: StudioFilesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 text-sm"
      role="navigation"
      aria-label="Пагинация файлов"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </Button>
      <span className="text-center text-slate-600">
        Страница {page} из {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Вперёд
      </Button>
    </div>
  );
}
