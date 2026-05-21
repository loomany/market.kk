import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { createTokenTopupCheckout } from "@/lib/payments/lemonSqueezy";
import { assertTokensCheckoutConfigured, isValidUserUuid } from "@/lib/tokens/config";
import { assertLocale } from "@/lib/i18n/localeConfig";

export const runtime = "nodejs";

const bodySchema = z.object({
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.userId) {
    return NextResponse.json(
      { ok: false, errorCode: "UNAUTHORIZED", message: "Войдите в аккаунт, чтобы купить токены." },
      { status: 401 }
    );
  }

  if (!isValidUserUuid(session.userId)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "INVALID_USER",
        message: "Аккаунт не привязан к базе. Настройте Supabase и войдите снова.",
      },
      { status: 400 }
    );
  }

  const configCheck = assertTokensCheckoutConfigured();
  if (!configCheck.ok) {
    return NextResponse.json(
      { ok: false, errorCode: "CHECKOUT_NOT_CONFIGURED", message: configCheck.message },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const locale =
    (parsed.success && parsed.data.locale && assertLocale(parsed.data.locale)) ||
    assertLocale(request.headers.get("x-vitrina-locale") ?? "ru") ||
    "ru";

  try {
    const { checkoutUrl } = await createTokenTopupCheckout({
      userId: session.userId,
      locale,
    });
    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { ok: false, errorCode: "CHECKOUT_FAILED", message },
      { status: 502 }
    );
  }
}
