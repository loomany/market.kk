import { cn } from "@/lib/utils";

type VitrinaTokenIconProps = {
  className?: string;
};

/** Branded token mark — «T» in a coin circle (Vitrina tokens). */
export function VitrinaTokenIcon({ className }: VitrinaTokenIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      aria-hidden
    >
      <circle
        cx="7"
        cy="7"
        r="6.25"
        className="fill-violet-50 stroke-violet-500"
        strokeWidth="1"
      />
      <path
        d="M4.25 4.35h5.5v1.05H8.15v4.25H6.85V5.4H4.25V4.35Z"
        className="fill-violet-700"
      />
    </svg>
  );
}
