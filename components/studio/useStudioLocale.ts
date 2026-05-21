"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { assertLocale } from "@/lib/i18n/localeConfig";
import { toStudioLocale, type StudioLocale } from "@/lib/studio/i18n";

const STORAGE_KEY = "vitrina-studio-locale";

function readStoredLocale(): StudioLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? toStudioLocale(raw) : null;
  } catch {
    return null;
  }
}

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
  return readStoredLocale() ?? toStudioLocale("ru");
}
