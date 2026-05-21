"use client";

import { usePathname } from "next/navigation";
import { Select } from "@/components/ui/Select";
import {
  indexableLocales,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { persistSiteLocale } from "@/lib/i18n/siteLocalePreference";
import { resolveLocaleSwitchPath } from "@/lib/i18n/switchLocalePath";
import { cn } from "@/lib/utils";

function localeAbbrev(code: Locale) {
  return code.toUpperCase();
}

type LanguageSwitcherProps = {
  locale: Locale;
  variant?: "select" | "pills";
  abbreviated?: boolean;
  className?: string;
};

export function LanguageSwitcher({
  locale,
  variant = "select",
  abbreviated = variant === "select",
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const switcherLocales = supportedLocales.filter((item) =>
    (indexableLocales as readonly Locale[]).includes(item.code)
  );

  const navigate = (code: Locale) => {
    persistSiteLocale(code);
    const targetPath = resolveLocaleSwitchPath(pathname, code);
    window.location.assign(targetPath);
  };

  const optionLabel = (code: Locale) =>
    abbreviated
      ? localeAbbrev(code)
      : supportedLocales.find((l) => l.code === code)!.nativeLabel;

  if (variant === "pills") {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {switcherLocales.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => navigate(item.code)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                item.code === locale
                  ? "border-teal-300 bg-teal-50 text-teal-900"
                  : "border-border text-slate-600 hover:border-teal-200 hover:text-teal-800"
              }`}
            >
              {optionLabel(item.code)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center", className)}>
      <span className="sr-only">Language</span>
      <Select
        className="w-auto"
        value={locale}
        size="sm"
        align="end"
        triggerClassName="min-w-[4.75rem] font-semibold uppercase tracking-wide text-slate-700"
        menuClassName="z-[60] min-w-[11rem]"
        options={switcherLocales.map((item) => ({
          value: item.code,
          label: `${localeAbbrev(item.code)} · ${item.nativeLabel}`,
        }))}
        formatTriggerLabel={(option) => localeAbbrev(option.value as Locale)}
        onChange={(code) => navigate(code as Locale)}
      />
    </div>
  );
}
