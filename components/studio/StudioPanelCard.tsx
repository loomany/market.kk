import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  studioColumnHeaderClass,
  studioColumnTitleClass,
} from "./PreviewCard";

type StudioPanelCardProps = {
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
};

export function StudioPanelCard({
  title,
  badge,
  children,
  className,
}: StudioPanelCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-sm",
        className
      )}
    >
      <div className={cn(studioColumnHeaderClass, "shrink-0 justify-between")}>
        <p className={studioColumnTitleClass}>{title}</p>
        {badge ? <Badge variant="violet">{badge}</Badge> : null}
      </div>
      <div className="flex min-h-[260px] flex-1 flex-col border-t border-border bg-slate-50">
        {children}
      </div>
    </div>
  );
}
