"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { assertLocale, indexableLocales, type IndexableLocale } from "@/lib/i18n/localeConfig";
import { formatTokenBalanceDisplay, tokenNavLabel } from "@/lib/tokens/formatTokens";
import { cn } from "@/lib/utils";

type BalanceResponse = {
  ok?: boolean;
  balanceTokens?: number;
  display?: string;
};

export function TokenBalancePill({ className }: { className?: string }) {
  const pathname = usePathname();
  const locale = useMemo((): IndexableLocale => {
    const segment = pathname.split("/").filter(Boolean)[0];
    const raw = assertLocale(segment);
    if (raw && indexableLocales.includes(raw as IndexableLocale)) {
      return raw as IndexableLocale;
    }
    return "ru";
  }, [pathname]);

  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState<string>("—");

  const loadBalance = useCallback(async () => {
    setLoading(true);
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json() as Promise<{ user: unknown }>);
      if (!me.user) {
        setSignedIn(false);
        setDisplay("");
        return;
      }
      setSignedIn(true);
      const balance = await fetch("/api/tokens/balance", {
        headers: { "x-vitrina-locale": locale },
      }).then((r) => r.json() as Promise<BalanceResponse>);
      if (balance.ok && typeof balance.balanceTokens === "number") {
        setDisplay(
          balance.display ?? formatTokenBalanceDisplay(balance.balanceTokens, locale)
        );
      } else {
        setDisplay(formatTokenBalanceDisplay(0, locale));
      }
    } catch {
      setDisplay("—");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadBalance();
    const onAuth = () => void loadBalance();
    const onTokens = () => void loadBalance();
    window.addEventListener("vitrina-auth-changed", onAuth);
    window.addEventListener("vitrina-tokens-changed", onTokens);
    return () => {
      window.removeEventListener("vitrina-auth-changed", onAuth);
      window.removeEventListener("vitrina-tokens-changed", onTokens);
    };
  }, [loadBalance]);

  if (!signedIn) return null;

  const compact = display.replace(/\s+токен.*$/i, "").replace(/\s+token.*$/i, "");

  return (
    <Link
      href={`/${locale}/tokens`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/60",
        className
      )}
      title={tokenNavLabel(locale)}
    >
      <Coins className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
      <span className="hidden sm:inline">
        {loading ? "—" : display}
      </span>
      <span className="sm:hidden">{loading ? "—" : compact || "0"}</span>
    </Link>
  );
}
