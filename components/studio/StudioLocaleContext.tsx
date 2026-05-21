"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { assertLocale, type IndexableLocale, type Locale } from "@/lib/i18n/localeConfig";
import { getStudioCopy, toStudioLocale } from "@/lib/studio/i18n";
import type {
  StudioCopyFull,
  StudioLocale,
} from "@/lib/studio/i18n/studioCopyTypes";

const STORAGE_KEY = "vitrina-studio-locale";

export type StudioLocaleContextValue = {
  locale: StudioLocale;
  copy: StudioCopyFull;
  setLocale: (next: StudioLocale) => void;
};

const StudioLocaleContext = createContext<StudioLocaleContextValue | null>(null);

function readStoredLocale(): StudioLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? toStudioLocale(raw) : null;
  } catch {
    return null;
  }
}

function persistLocale(locale: StudioLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function localeFromPathname(pathname: string): StudioLocale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  const loc = assertLocale(segment);
  return loc ? toStudioLocale(loc) : null;
}

export function StudioLocaleProvider({
  children,
  routeLocale,
}: {
  children: ReactNode;
  routeLocale?: IndexableLocale;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = useMemo(() => {
    const queryLang = searchParams.get("lang");
    const queryLocale = queryLang ? toStudioLocale(queryLang) : null;
    const pathLocale = localeFromPathname(pathname);
    return (
      toStudioLocale(routeLocale) ??
      pathLocale ??
      queryLocale ??
      readStoredLocale() ??
      toStudioLocale("ru")
    );
  }, [routeLocale, pathname, searchParams]);

  const copy = useMemo(() => getStudioCopy(locale), [locale]);

  const setLocale = useCallback(
    (next: StudioLocale) => {
      persistLocale(next);
      const pathLocale = localeFromPathname(pathname);
      if (pathLocale) {
        const segments = pathname.split("/").filter(Boolean);
        segments[0] = next;
        router.push(`/${segments.join("/")}`);
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("lang", next);
      const base = pathname.startsWith("/studio") ? pathname : "/studio";
      router.push(`${base}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const value = useMemo(
    () => ({ locale, copy, setLocale }),
    [locale, copy, setLocale]
  );

  return (
    <StudioLocaleContext.Provider value={value}>
      {children}
    </StudioLocaleContext.Provider>
  );
}

export function useStudioLocaleContext(): StudioLocaleContextValue {
  const ctx = useContext(StudioLocaleContext);
  if (!ctx) {
    throw new Error("useStudioLocaleContext must be used within StudioLocaleProvider");
  }
  return ctx;
}

export function useStudioCopy() {
  const { locale, copy, setLocale } = useStudioLocaleContext();
  return { locale, copy, setLocale };
}
