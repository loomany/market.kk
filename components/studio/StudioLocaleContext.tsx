"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { assertLocale, type IndexableLocale } from "@/lib/i18n/localeConfig";
import {
  persistSiteLocale,
  readStoredSiteLocale,
  studioEntryPath,
} from "@/lib/i18n/siteLocalePreference";
import { getStudioCopy, toStudioLocale } from "@/lib/studio/i18n";
import type {
  StudioCopyFull,
  StudioLocale,
} from "@/lib/studio/i18n/studioCopyTypes";

export type StudioLocaleContextValue = {
  locale: StudioLocale;
  copy: StudioCopyFull;
  setLocale: (next: StudioLocale) => void;
};

const StudioLocaleContext = createContext<StudioLocaleContextValue | null>(null);

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

  const searchKey = searchParams.toString();

  const locale = useMemo(() => {
    const queryLang = searchParams.get("lang");
    const queryLocale = queryLang ? toStudioLocale(queryLang) : null;
    const pathLocale = localeFromPathname(pathname);
    return (
      toStudioLocale(routeLocale) ??
      pathLocale ??
      queryLocale ??
      (() => {
        const stored = readStoredSiteLocale();
        return stored ? toStudioLocale(stored) : null;
      })() ??
      toStudioLocale("ru")
    );
  }, [routeLocale, pathname, searchKey]);

  const copy = useMemo(() => getStudioCopy(locale), [locale]);

  /** Canonical URLs: /studio (ru) and /en/studio, /kk/studio — ?lang= kept for old links. */
  useEffect(() => {
    if (pathname !== "/studio") return;
    const queryLang = searchParams.get("lang");
    if (queryLang) {
      const target = toStudioLocale(queryLang);
      if (target !== "ru") router.replace(studioEntryPath(target));
      return;
    }
    const stored = readStoredSiteLocale();
    if (stored && stored !== "ru") {
      router.replace(studioEntryPath(stored));
    }
  }, [pathname, searchKey, router, searchParams]);

  const setLocale = useCallback(
    (next: StudioLocale) => {
      persistSiteLocale(next);
      const pathLocale = localeFromPathname(pathname);
      if (pathLocale) {
        const segments = pathname.split("/").filter(Boolean);
        segments[0] = next;
        router.replace(`/${segments.join("/")}`);
        return;
      }
      router.replace(studioEntryPath(next));
    },
    [pathname, router]
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
