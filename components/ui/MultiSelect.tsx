"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/Select";

type MultiSelectProps<T extends string> = {
  values: T[];
  options: SelectOption<T>[];
  onChange: (values: T[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md";
  menuMatchTriggerWidth?: boolean;
  menuPlacement?: "auto" | "top" | "bottom";
  maxSelections?: number;
  formatTriggerLabel?: (selected: SelectOption<T>[]) => string;
  menuHeader?: ReactNode;
  menuFooter?: ReactNode;
};

const triggerSizes = {
  sm: "min-h-10 rounded-lg px-2.5 text-sm",
  md: "min-h-[42px] rounded-[16px] px-3 py-2.5 text-sm",
};

const MENU_GAP_PX = 6;
const MENU_MAX_HEIGHT_PX = 280;

function computeMenuStyle(
  trigger: HTMLElement,
  placement: "auto" | "top" | "bottom"
): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
  const spaceAbove = rect.top - MENU_GAP_PX;
  const openUp =
    placement === "top" ||
    (placement === "auto" &&
      spaceBelow < MENU_MAX_HEIGHT_PX &&
      spaceAbove > spaceBelow);

  const width = rect.width;
  const left = rect.left;

  if (openUp) {
    return {
      position: "fixed",
      left,
      width,
      bottom: window.innerHeight - rect.top + MENU_GAP_PX,
      maxHeight: Math.min(MENU_MAX_HEIGHT_PX, spaceAbove),
      zIndex: 9999,
    };
  }

  return {
    position: "fixed",
    left,
    width,
    top: rect.bottom + MENU_GAP_PX,
    maxHeight: Math.min(MENU_MAX_HEIGHT_PX, spaceBelow),
    zIndex: 9999,
  };
}

export function MultiSelect<T extends string>({
  values,
  options,
  onChange,
  placeholder = "Выберите…",
  disabled,
  className,
  triggerClassName,
  menuClassName,
  size = "md",
  menuMatchTriggerWidth = true,
  menuPlacement = "auto",
  maxSelections,
  formatTriggerLabel,
  menuHeader,
  menuFooter,
}: MultiSelectProps<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOptions = options.filter((option) =>
    values.includes(option.value)
  );

  const close = useCallback(() => setOpen(false), []);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setMenuStyle(computeMenuStyle(trigger, menuPlacement));
  }, [menuPlacement]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition, options.length, values.length]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const menu = document.getElementById(listboxId);
      if (menu?.contains(target)) return;
      close();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, close, listboxId, updateMenuPosition]);

  const toggle = (next: T) => {
    const active = values.includes(next);
    if (active) {
      onChange(values.filter((value) => value !== next));
      return;
    }
    if (maxSelections != null && values.length >= maxSelections) return;
    onChange([...values, next]);
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

  const triggerLabel = formatTriggerLabel
    ? formatTriggerLabel(selectedOptions)
    : selectedOptions.length > 0
      ? selectedOptions.map((item) => item.triggerLabel ?? item.label).join(", ")
      : placeholder;
  const isPlaceholder = triggerLabel === placeholder;

  const menu = open ? (
    <ul
      id={listboxId}
      role="listbox"
      aria-multiselectable="true"
      style={menuStyle}
      className={cn(
        "overflow-auto rounded-[16px] border border-border bg-white p-1.5 shadow-xl shadow-slate-200/60",
        "[scrollbar-color:rgb(203_213_225)_transparent] [scrollbar-width:thin]",
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent",
        !menuMatchTriggerWidth && "min-w-[var(--select-menu-min-width,12rem)]",
        menuClassName
      )}
    >
      {menuHeader ? (
        <li role="presentation" className="mb-1 border-b border-slate-100 pb-1">
          {menuHeader}
        </li>
      ) : null}
      {options.map((option) => {
        const active = values.includes(option.value);
        const optionDisabled =
          option.disabled ||
          (!active &&
            maxSelections != null &&
            values.length >= maxSelections);
        return (
          <li key={option.value} role="presentation">
            <button
              id={`${listboxId}-${option.value}`}
              type="button"
              role="option"
              aria-selected={active}
              disabled={optionDisabled}
              onClick={() => !optionDisabled && toggle(option.value)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-[12px] px-3 py-2 text-left text-sm transition-colors",
                active
                  ? "bg-teal-50 font-semibold text-teal-900"
                  : "font-medium text-slate-700 hover:bg-slate-50",
                optionDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.description ? (
                  <span className="block truncate text-xs font-normal text-slate-500">
                    {option.description}
                  </span>
                ) : null}
              </span>
              {active ? (
                <Check className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
      {menuFooter ? (
        <li role="presentation" className="mt-1 border-t border-slate-100 pt-1">
          {menuFooter}
        </li>
      ) : null}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
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
            isPlaceholder && "font-normal text-slate-500"
          )}
        >
          {triggerLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
