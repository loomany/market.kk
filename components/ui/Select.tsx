"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  /** Closed trigger text; defaults to label */
  triggerLabel?: string;
  disabled?: boolean;
};

type SelectProps<T extends string> = {
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  helper?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md";
  align?: "start" | "end";
  helperPosition?: "above" | "below";
  /** If true, menu width matches trigger only. Default: grow to fit labels. */
  menuMatchTriggerWidth?: boolean;
  /** Override text on closed trigger (dropdown items still use option.label). */
  formatTriggerLabel?: (option: SelectOption<T>) => string;
};

const triggerSizes = {
  sm: "min-h-10 rounded-lg px-2.5 text-sm",
  md: "min-h-[42px] rounded-[16px] px-3 py-2.5 text-sm",
};

export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  helper,
  placeholder = "Выберите…",
  disabled,
  className,
  labelClassName,
  triggerClassName,
  menuClassName,
  size = "md",
  align = "start",
  helperPosition = "above",
  menuMatchTriggerWidth = false,
  formatTriggerLabel,
}: SelectProps<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected =
    value != null
      ? options.find((option) => option.value === value)
      : undefined;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const pick = (next: T) => {
    onChange(next);
    close();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative space-y-1.5", className)}>
      {label ? (
        <span
          className={cn(
            "block text-sm font-semibold text-slate-950",
            labelClassName
          )}
        >
          {label}
        </span>
      ) : null}
      {helper && helperPosition === "above" ? (
        <p className="text-xs leading-5 text-slate-500">{helper}</p>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 border border-border bg-white font-medium text-slate-900 shadow-sm outline-none transition",
          "hover:border-slate-300 focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-100",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          triggerSizes[size],
          open && "border-teal-400 ring-2 ring-teal-100",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !selected && "font-normal text-slate-500"
          )}
        >
          {selected
            ? (formatTriggerLabel?.(selected) ??
              selected.triggerLabel ??
              selected.label)
            : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-activedescendant={
            value != null ? `${listboxId}-${value}` : undefined
          }
          className={cn(
            "absolute z-[60] mt-1.5 max-h-60 overflow-auto rounded-[16px] border border-border bg-white p-1.5 shadow-xl shadow-slate-200/60",
            "[scrollbar-color:rgb(203_213_225)_transparent] [scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent",
            "w-full min-w-full",
            align === "end" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {options.map((option) => {
            const active = value != null && option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  id={`${listboxId}-${option.value}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  onClick={() => !option.disabled && pick(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-teal-50 font-semibold text-teal-900"
                      : "font-medium text-slate-700 hover:bg-slate-50",
                    option.disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {active ? (
                    <Check className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {helper && helperPosition === "below" ? (
        <p className="text-xs leading-5 text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}
