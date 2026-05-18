import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkCodeSendRateLimit,
  createSixDigitCode,
  hashCode,
  normalizePhone,
  saveMemoryCode,
  sendWhatsAppCode,
} from "@/lib/auth/whatsapp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const sendCodeSchema = z.object({
  phone: z.string().min(7).max(24),
});

export async function POST(request: Request) {
  const parsed = sendCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Введите WhatsApp номер." },
      { status: 400 }
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const rateLimit = checkCodeSendRateLimit(phone, ip);
  if (!rateLimit.ok) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "RATE_LIMITED",
        message: `РџРѕРґРѕР¶РґРёС‚Рµ ${rateLimit.retryAfterSeconds} СЃРµРє. Рё РїРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.`,
      },
      { status: 429 }
    );
  }

  const code = createSixDigitCode();
  const admin = createSupabaseAdminClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  if (admin) {
    await admin.from("auth_codes").insert({
      phone,
      code_hash: hashCode(phone, code),
      expires_at: expiresAt,
      attempts: 0,
    });
  } else {
    saveMemoryCode(phone, code);
  }

  const sent = await sendWhatsAppCode(phone, code);
  if (!sent.ok) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "GREEN_API_SEND_FAILED",
        message: "Не удалось отправить код в WhatsApp. Попробуйте позже.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    delivery: sent.delivery,
    message:
      sent.delivery === "mock"
        ? "Демо-код: 111111"
        : "Код отправлен в WhatsApp.",
  });
}
