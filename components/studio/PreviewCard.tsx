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
};

export function PreviewCard({ title, url, empty, badge }: PreviewCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm"
      )}
    >
      <div className={cn(studioColumnHeaderClass, "justify-between")}>
        <p className={studioColumnTitleClass}>{title}</p>
        {badge ? <Badge variant="violet">{badge}</Badge> : null}
      </div>
      <div className="border-t border-border bg-slate-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Предпросмотр: ${title}`}
            className="max-h-[460px] min-h-[220px] w-full object-contain"
          />
        ) : (
          <div className="flex min-h-[260px] items-center justify-center p-4 text-center text-sm leading-6 text-slate-500">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}
