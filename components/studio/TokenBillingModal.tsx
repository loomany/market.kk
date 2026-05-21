"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Coins, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatStudioString } from "@/lib/studio/i18n";
import { formatTokenBalanceDisplay } from "@/lib/tokens/formatTokens";
import type { TokenBillingErrorPayload } from "@/lib/tokens/billingErrorPayload";
import {
  openVitrinaLoginModal,
  type TokenBillingCta,
} from "@/lib/tokens/billingErrorPayload";
import { useStudioCopy } from "./StudioLocaleContext";

function normalizeCtas(
  cta: TokenBillingErrorPayload["cta"]
): TokenBillingCta[] {
  if (!cta) return [];
  return Array.isArray(cta) ? cta : [cta];
}

type TokenBillingModalProps = {
  open: boolean;
  payload: TokenBillingErrorPayload | null;
  onClose: () => void;
};

export function TokenBillingModal({
  open,
  payload,
  onClose,
}: TokenBillingModalProps) {
  const router = useRouter();
  const { locale, copy } = useStudioCopy();
  const tb = copy.tokenBilling;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ctas = useMemo(
    () => (payload ? normalizeCtas(payload.cta) : []),
    [payload]
  );

  const display = useMemo(() => {
    if (!payload) return null;
    if (payload.errorCode === "INSUFFICIENT_TOKENS") {
      return { title: tb.insufficientTitle, message: tb.insufficientBody };
    }
    if (
      payload.errorCode === "GUEST_GENERATION_LIMIT" ||
      payload.errorCode === "GUEST_LOGIN_REQUIRED"
    ) {
      return { title: tb.guestUsedTitle, message: tb.guestUsedBody };
    }
    return { title: payload.title, message: payload.message };
  }, [payload, tb]);

  const balanceHint = useMemo(() => {
    if (
      !payload ||
      payload.errorCode !== "INSUFFICIENT_TOKENS" ||
      payload.balanceTokens === undefined ||
      payload.requiredTokens === undefined
    ) {
      return null;
    }
    return formatStudioString(tb.balanceHint, {
      balance: formatTokenBalanceDisplay(payload.balanceTokens, locale),
      required: formatTokenBalanceDisplay(payload.requiredTokens, locale),
    });
  }, [payload, locale, tb.balanceHint]);

  const primaryActionLabel = useMemo(() => {
    if (!payload) return tb.buyTokens;
    if (
      payload.errorCode === "GUEST_GENERATION_LIMIT" ||
      payload.errorCode === "GUEST_LOGIN_REQUIRED"
    ) {
      return tb.signIn;
    }
    return tb.topUpBalance;
  }, [payload, tb]);

  if (!open || !payload || !display || !mounted) return null;

  const hrefCtas = ctas.filter(
    (c): c is Extract<TokenBillingCta, { href: string }> => "href" in c
  );
  const loginCta = ctas.find((c) => "action" in c && c.action === "login");

  const primaryHref = hrefCtas[hrefCtas.length - 1];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-billing-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-teal-50 text-teal-700">
              <Coins className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2
                id="token-billing-title"
                className="text-lg font-semibold text-slate-950"
              >
                {display.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {display.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={tb.close}
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {balanceHint ? (
          <p className="mt-4 rounded-[16px] border border-teal-100 bg-teal-50/80 px-3 py-2.5 text-sm font-medium text-teal-950">
            {balanceHint}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2.5">
          {loginCta ? (
            <Button
              variant={primaryHref ? "outline" : "primary"}
              className="w-full"
              onClick={() => {
                onClose();
                openVitrinaLoginModal();
              }}
            >
              {tb.signIn}
            </Button>
          ) : null}

          {primaryHref ? (
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                router.push(primaryHref.href);
              }}
            >
              {primaryActionLabel}
            </Button>
          ) : null}

          {hrefCtas.length > 1 && hrefCtas[0] && hrefCtas[0] !== primaryHref ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                router.push(hrefCtas[0]!.href);
              }}
            >
              {tb.buyTokens}
            </Button>
          ) : null}

          {!primaryHref && !loginCta ? (
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                router.push(`/${locale}/tokens`);
              }}
            >
              {tb.buyTokens}
            </Button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
