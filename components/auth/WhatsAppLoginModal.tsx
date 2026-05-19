"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { LogOut, MessageCircle, User, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  PhoneCountryInput,
  validatePhoneCountryInput,
} from "@/components/auth/PhoneCountryInput";
import { assertLocale } from "@/lib/i18n/localeConfig";
import { resolveDefaultCountryId } from "@/lib/auth/phoneCountries";

type User = { id: string; phone: string } | null;

export function WhatsAppLoginModal() {
  const pathname = usePathname();
  const defaultCountryId = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0];
    return resolveDefaultCountryId(assertLocale(segment) ?? null);
  }, [pathname]);

  useEffect(() => {
    setPhoneCountryId(defaultCountryId);
  }, [defaultCountryId]);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [phoneCountryId, setPhoneCountryId] = useState(defaultCountryId);
  const [code, setCode] = useState("");
  const [user, setUser] = useState<User>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: User }) => setUser(data.user))
      .catch(() => undefined);
  }, []);

  const sendCode = async () => {
    const validation = validatePhoneCountryInput(phone, phoneCountryId);
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/whatsapp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setMessage(
          data?.message ??
            (res.status === 404
              ? "Сервис отправки кода недоступен. Перезапустите dev-сервер."
              : "Не удалось отправить код.")
        );
        return;
      }
      setMessage(data.message ?? "Код отправлен.");
      setStep("code");
    } catch {
      setMessage("Не удалось отправить код. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/whatsapp/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        user?: User;
        message?: string;
      };
      if (!data.ok || !data.user) {
        setMessage(data.message ?? "Неверный код.");
        return;
      }
      setUser(data.user);
      window.dispatchEvent(new Event("vitrina-auth-changed"));
      setOpen(false);
      setCode("");
      setMessage(null);
    } catch {
      setMessage("Не удалось проверить код.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event("vitrina-auth-changed"));
  };

  const modal =
    open &&
    mounted &&
    createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-login-title"
        onClick={() => setOpen(false)}
      >
        <div
          className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="whatsapp-login-title"
                className="text-lg font-semibold text-slate-950"
              >
                Вход через WhatsApp
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Введите WhatsApp номер, мы отправим код подтверждения.
              </p>
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {step === "phone" ? (
              <PhoneCountryInput
                value={phone}
                onChange={setPhone}
                defaultCountryId={defaultCountryId}
                countryId={phoneCountryId}
                onCountryChange={setPhoneCountryId}
                disabled={loading}
              />
            ) : (
              <label className="space-y-1.5 text-sm font-semibold text-slate-950">
                <span>Код из WhatsApp</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  inputMode="numeric"
                  placeholder="111111"
                  className="w-full rounded-[16px] border border-border px-3 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            )}

            {message && (
              <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
                {message}
              </p>
            )}

            {step === "phone" ? (
              <Button className="w-full" loading={loading} onClick={sendCode}>
                Отправить код
              </Button>
            ) : (
              <Button className="w-full" loading={loading} onClick={verifyCode}>
                Подтвердить код
              </Button>
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  const profileModal =
    profileOpen &&
    mounted &&
    user &&
    createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onClick={() => setProfileOpen(false)}
      >
        <div
          className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="profile-title"
                className="text-lg font-semibold text-slate-950"
              >
                Аккаунт
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {user.phone}
              </p>
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setProfileOpen(false)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void logout()}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {user ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setProfileOpen(true)}
        >
          <User className="h-4 w-4" />
          Аккаунт
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <MessageCircle className="h-4 w-4" />
          Войти
        </Button>
      )}

      {modal}
      {profileModal}
    </>
  );
}
