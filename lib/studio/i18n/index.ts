import {
  defaultLocale,
  type IndexableLocale,
  type Locale,
} from "@/lib/i18n/localeConfig";
import { studioCopyEn } from "./studioCopyEn";
import { studioCopyKk } from "./studioCopyKk";
import { studioCopyRu } from "./studioCopyRu";
import { pass2En, pass2Kk, pass2Ru } from "./studioCopyPass2";
import {
  pass2RemainderEn,
  pass2RemainderKk,
  pass2RemainderRu,
} from "./studioCopyPass2Remainder";
import type {
  StudioCopyFull,
  StudioCopyPass2,
  StudioLocale,
} from "./studioCopyTypes";

export type { StudioCopy, StudioCopyFull, StudioLocale, StudioModeCopy } from "./studioCopyTypes";

function mergeCopy(base: StudioCopyFull, pass2: StudioCopyPass2): StudioCopyFull {
  return { ...base, ...pass2 } as StudioCopyFull;
}

function mergePass2(base: StudioCopyPass2, remainder: StudioCopyPass2): StudioCopyPass2 {
  return { ...base, ...remainder } as StudioCopyPass2;
}

export const studioCopy = {
  ru: mergeCopy(
    studioCopyRu as StudioCopyFull,
    mergePass2(pass2Ru as StudioCopyPass2, pass2RemainderRu as StudioCopyPass2)
  ),
  en: mergeCopy(
    studioCopyEn as StudioCopyFull,
    mergePass2(pass2En as StudioCopyPass2, pass2RemainderEn as StudioCopyPass2)
  ),
  kk: mergeCopy(
    studioCopyKk as StudioCopyFull,
    mergePass2(pass2Kk as StudioCopyPass2, pass2RemainderKk as StudioCopyPass2)
  ),
} as Record<StudioLocale, StudioCopyFull>;

export function toStudioLocale(
  locale: Locale | string | null | undefined
): StudioLocale {
  if (locale === "en") return "en";
  if (locale === "kk") return "kk";
  return "ru";
}

export function getStudioCopy(locale: string | null | undefined): StudioCopyFull {
  return studioCopy[toStudioLocale(locale)];
}

export function assertStudioLocale(value: string | null | undefined): StudioLocale {
  return toStudioLocale(value);
}

export function formatStudioString(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`)
  );
}

/** Deep key parity check helper */
export function studioCopyLeafKeys(
  obj: Record<string, unknown>,
  prefix = ""
): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...studioCopyLeafKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

export function validateStudioCopyParity(): string[] {
  const errors: string[] = [];
  const ruKeys = new Set(studioCopyLeafKeys(studioCopy.ru as unknown as Record<string, unknown>));
  for (const locale of ["en", "kk"] as const) {
    const locKeys = new Set(
      studioCopyLeafKeys(studioCopy[locale] as unknown as Record<string, unknown>)
    );
    for (const key of ruKeys) {
      if (!locKeys.has(key)) errors.push(`${locale} missing key: ${key}`);
    }
    for (const key of locKeys) {
      if (!ruKeys.has(key)) errors.push(`${locale} extra key: ${key}`);
    }
  }
  return errors;
}
