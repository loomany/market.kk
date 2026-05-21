"use client";

import { Select } from "@/components/ui/Select";
import { supportedLocales } from "@/lib/i18n/localeConfig";
import type { StudioLocale } from "@/lib/studio/i18n/studioCopyTypes";
import { cn } from "@/lib/utils";
import { useStudioCopy } from "./StudioLocaleContext";

const STUDIO_LOCALES: StudioLocale[] = ["ru", "en", "kk"];

function localeAbbrev(code: StudioLocale) {
  return code.toUpperCase();
}

export function StudioLanguageSwitcher({ className }: { className?: string }) {
  const { locale, copy, setLocale } = useStudioCopy();

  const options = STUDIO_LOCALES.map((code) => {
    const meta = supportedLocales.find((l) => l.code === code);
    return {
      value: code,
      label: `${localeAbbrev(code)} · ${meta?.nativeLabel ?? code}`,
    };
  });

  return (
    <div className={cn("inline-flex", className)} aria-label={copy.language.label}>
      <Select
        className="w-auto"
        value={locale}
        size="sm"
        align="end"
        triggerClassName="min-w-[4.75rem] font-semibold uppercase tracking-wide text-slate-700"
        menuClassName="z-[60] min-w-[11rem]"
        options={options}
        formatTriggerLabel={(option) => localeAbbrev(option.value as StudioLocale)}
        onChange={(code) => setLocale(code as StudioLocale)}
      />
    </div>
  );
}
