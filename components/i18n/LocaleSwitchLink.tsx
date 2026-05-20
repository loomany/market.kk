"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/localeConfig";
import { resolveLocaleSwitchPath } from "@/lib/i18n/switchLocalePath";

type LocaleSwitchLinkProps = {
  targetLocale: Locale;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
};

export function LocaleSwitchLink({
  targetLocale,
  children,
  className,
  active,
}: LocaleSwitchLinkProps) {
  const pathname = usePathname();
  const href = resolveLocaleSwitchPath(pathname, targetLocale);

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export function localeSwitchHref(pathname: string, targetLocale: Locale): string {
  return resolveLocaleSwitchPath(pathname, targetLocale);
}
