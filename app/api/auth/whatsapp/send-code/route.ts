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
import {
  assertPaidAiAllowed,
  isMockMode,
  isPaidAiGuardError,
  paidAiGuardResponse,
} from "@/lib/ai/paidAiGuard";
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
        message: `Подождите ${rateLimit.retryAfterSeconds} сек. и попробуйте ещё раз.`,
      },
      { status: 429 }
    );
  }

  if (
    !isMockMode() &&
    process.env.GREEN_API_INSTANCE_ID &&
    process.env.GREEN_API_TOKEN
  ) {
    try {
      assertPaidAiAllowed({
        provider: "green-api",
        route: "/api/auth/whatsapp/send-code",
      });
    } catch (error) {
      if (isPaidAiGuardError(error)) {
        return NextResponse.json(paidAiGuardResponse(error), {
          status: error.status,
        });
      }
      throw error;
    }
  }

  const code = createSixDigitCode();
  const admin = createSupabaseAdminClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  if (admin) {
    const { error: insertError } = await admin.from("auth_codes").insert({
      phone,
      code_hash: hashCode(phone, code),
      expires_at: expiresAt,
      attempts: 0,
    });
    if (insertError) {
      console.error("[auth] auth_codes insert failed", insertError);
      return NextResponse.json(
        {
          ok: false,
          errorCode: "AUTH_CODE_STORAGE_FAILED",
          message:
            "Не удалось сохранить код. Проверьте, что миграция Supabase применена.",
        },
        { status: 503 }
      );
    }
  } else {
    saveMemoryCode(phone, code);
  }

  let sent: Awaited<ReturnType<typeof sendWhatsAppCode>>;
  try {
    sent = await sendWhatsAppCode(phone, code);
  } catch (error) {
    if (isPaidAiGuardError(error)) {
      return NextResponse.json(paidAiGuardResponse(error), {
        status: error.status,
      });
    }
    throw error;
  }
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
