"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { assertLocale } from "@/lib/i18n/localeConfig";
import { readStoredSiteLocale } from "@/lib/i18n/siteLocalePreference";
import { toStudioLocale, type StudioLocale } from "@/lib/studio/i18n";

/** Locale: route (/ru/studio) → ?lang= → localStorage → ru */
export function useStudioLocale(override?: StudioLocale): StudioLocale {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (override) return override;
  const segment = pathname.split("/").filter(Boolean)[0];
  const routeLocale = assertLocale(segment);
  if (routeLocale) return toStudioLocale(routeLocale);
  const queryLang = searchParams.get("lang");
  if (queryLang) return toStudioLocale(queryLang);
  const stored = readStoredSiteLocale();
  return stored ? toStudioLocale(stored) : toStudioLocale("ru");
}
