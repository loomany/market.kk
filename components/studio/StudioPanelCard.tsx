import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type StudioPanelCardProps = {
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  frameClassName?: string;
};

export function StudioPanelCard({
  title,
  badge,
  children,
  className,
  frameClassName,
}: StudioPanelCardProps) {
  return (
    <Card className={cn("shadow-lg", className)}>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          {badge ? <Badge variant="violet">{badge}</Badge> : null}
        </div>
        <div
          className={cn(
            "overflow-hidden rounded-[18px] border border-border bg-slate-50",
            frameClassName
          )}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
