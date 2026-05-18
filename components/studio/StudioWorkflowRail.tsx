"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Непрерывная teal-линия слева; блоки шагов примыкают к ней без зазора */
export function StudioWorkflowRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative border-l-4 border-l-teal-700",
        className
      )}
    >
      {children}
    </div>
  );
}
