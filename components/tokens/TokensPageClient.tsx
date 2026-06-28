"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { IndexableLocale } from "@/lib/i18n/localeConfig";
import { studioEntryPath } from "@/lib/i18n/siteLocalePreference";
import { formatTokenBalanceDisplay } from "@/lib/tokens/formatTokens";
import { Button } from "@/components/ui/Button";
import { trackTelegramEvent } from "@/lib/telegram/clientEvents";

const COPY = {
  ru: {
    title: "Пополнить баланс токенов",
    subtitle: "1 токен = $1. Сейчас одна AI-задача стоит 1 токен.",
    packageLabel: "10 токенов",
    price: "$10",
    minNote: "Минимальное пополнение",
    buy: "Купить 10 токенов",
    note: "После оплаты баланс обновится автоматически после подтверждения платежа Lemon Squeezy. Обычно это занимает несколько секунд.",
    success: "Оплата принята. Баланс обновится после подтверждения платежа.",
    cancelled: "Оплата отменена. Деньги не списаны.",
    balance: "Текущий баланс",
    loginRequired: "Войдите в аккаунт, чтобы купить токены.",
    login: "Войти",
    studio: "Открыть студию",
    pricing: "Тарифы",
  },
  en: {
    title: "Top up token balance",
    subtitle: "1 token = $1. Each AI task currently costs 1 token.",
    packageLabel: "10 tokens",
    price: "$10",
    minNote: "Minimum top-up",
    buy: "Buy 10 tokens",
    note: "After payment, your balance updates automatically once Lemon Squeezy confirms the order — usually within a few seconds.",
    success: "Payment received. Your balance will update after confirmation.",
    cancelled: "Payment cancelled. You were not charged.",
    balance: "Current balance",
    loginRequired: "Sign in to purchase tokens.",
    login: "Sign in",
    studio: "Open studio",
    pricing: "Pricing",
  },
  kk: {
    title: "Токен балансын толтыру",
    subtitle: "1 токен = $1. Қазір бір AI тапсырмасы 1 токен тұрады.",
    packageLabel: "10 токен",
    price: "$10",
    minNote: "Ең төмен толтыру",
    buy: "10 токен сатып алу",
    note: "Төлемнен кейін Lemon Squeezy растағанда баланс автоматты жаңарады — әдетте бірнеше секунд.",
    success: "Төлем қабылданды. Растаудан кейін баланс жаңартылады.",
    cancelled: "Төлем тоқтатылды. Ақша алынбады.",
    balance: "Ағымдағы баланс",
    loginRequired: "Токен сатып алу үшін аккаунтқа кіріңіз.",
    login: "Кіру",
    studio: "Студияны ашу",
    pricing: "Тарифтер",
  },
} as const;

export function TokensPageClient({ locale }: { locale: IndexableLocale }) {
  const copy = COPY[locale];
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [balanceDisplay, setBalanceDisplay] = useState("—");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const paymentReported = useRef(false);

  const refresh = useCallback(async () => {
    const me = await fetch("/api/auth/me").then((r) => r.json() as Promise<{ user: unknown }>);
    setSignedIn(Boolean(me.user));
    if (!me.user) return;
    const balance = await fetch("/api/tokens/balance", {
      headers: { "x-vitrina-locale": locale },
    }).then(
      (r) =>
        r.json() as Promise<{
          ok?: boolean;
          balanceTokens?: number;
          display?: string;
        }>
    );
    if (balance.ok && typeof balance.balanceTokens === "number") {
      setBalanceDisplay(
        balance.display ?? formatTokenBalanceDisplay(balance.balanceTokens, locale)
      );
    }
  }, [locale]);

  useEffect(() => {
    void refresh();
    if (checkout !== "success") return;
    if (!paymentReported.current) {
      paymentReported.current = true;
      trackTelegramEvent("payment_success", { locale });
    }
    const id = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(id);
  }, [refresh, checkout, locale]);

  const startCheckout = async () => {
    trackTelegramEvent("checkout_click", { locale, label: "tokens_buy_10" });
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tokens/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await res.json()) as { ok?: boolean; checkoutUrl?: string; message?: string };
      if (!res.ok || !data.ok || !data.checkoutUrl) {
        setMessage(data.message ?? "Не удалось открыть оплату.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setMessage("Не удалось открыть оплату. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  };

  const statusBanner =
    checkout === "success" ? copy.success : checkout === "cancelled" ? copy.cancelled : null;

  return (
    <div className="mx-auto mt-6 w-full max-w-lg">
      {statusBanner ? (
        <p className="mt-4 rounded-[16px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
          {statusBanner}
        </p>
      ) : null}

      {signedIn === false ? (
        <p className="mt-6 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {copy.loginRequired}
        </p>
      ) : (
        <p className="mt-6 text-sm font-semibold text-slate-700">
          {copy.balance}: <span className="text-slate-950">{balanceDisplay}</span>
        </p>
      )}

      <div className="mt-8 rounded-[24px] border border-border bg-white p-6 shadow-sm">
        <p className="text-lg font-bold text-slate-950">{copy.packageLabel}</p>
        <p className="mt-1 text-3xl font-bold text-teal-700">{copy.price}</p>
        <p className="mt-2 text-sm text-slate-500">{copy.minNote}</p>
        <Button
          className="mt-6 w-full"
          loading={loading}
          disabled={signedIn === false}
          data-telegram-event="checkout_click"
          data-telegram-label="tokens_buy_button"
          onClick={() => void startCheckout()}
        >
          {copy.buy}
        </Button>
        {message ? (
          <p className="mt-3 text-sm text-amber-800">{message}</p>
        ) : null}
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-500">{copy.note}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={studioEntryPath(locale)}
          prefetch={false}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {copy.studio}
        </Link>
        <Link
          href={`/${locale}/cost`}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          {copy.pricing}
        </Link>
      </div>
    </div>
  );
}
