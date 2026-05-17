import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "violet" | "success" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  violet: "bg-violet-100 text-violet-700",
  success: "bg-emerald-100 text-emerald-700",
  outline: "border border-slate-200 bg-white text-slate-600",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
