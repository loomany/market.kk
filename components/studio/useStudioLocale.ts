"use client";

import { usePathname } from "next/navigation";
import {
  assertLocale,
  defaultLocale,
  type Locale,
} from "@/lib/i18n/localeConfig";

/** Locale from URL (/ru/studio) or explicit override from the server page */
export function useStudioLocale(override?: Locale): Locale {
  const pathname = usePathname();
  if (override) return override;
  const segment = pathname.split("/").filter(Boolean)[0];
  return assertLocale(segment) ?? defaultLocale;
}
