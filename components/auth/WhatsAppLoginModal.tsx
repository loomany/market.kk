"use client";

import { useEffect, useState } from "react";
import { LogOut, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type User = { id: string; phone: string } | null;

export function WhatsAppLoginModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [user, setUser] = useState<User>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user: User }) => setUser(data.user))
      .catch(() => undefined);
  }, []);

  const sendCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/whatsapp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) {
        setMessage(data.message ?? "Не удалось отправить код.");
        return;
      }
      setMessage(data.message ?? "Код отправлен.");
      setStep("code");
    } catch {
      setMessage("Не удалось отправить код.");
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
    window.dispatchEvent(new Event("vitrina-auth-changed"));
  };

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">
            {user.phone}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <MessageCircle className="h-4 w-4" />
          Войти
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-3 sm:items-center sm:justify-center">
          <div className="w-full rounded-[24px] bg-white p-5 shadow-2xl sm:max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
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
              <label className="space-y-1.5 text-sm font-semibold text-slate-950">
                <span>WhatsApp номер</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+7 700 000 00 00"
                  className="w-full rounded-[16px] border border-border px-3 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              {step === "code" && (
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
        </div>
      )}
    </>
  );
}
