import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkCodeSendRateLimit,
  createSixDigitCode,
  hashCode,
  isWhatsAppSendConfigured,
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

  if (!isMockMode() && isWhatsAppSendConfigured()) {
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
    const message = error instanceof Error ? error.message : "";
    if (message === "EVOLUTION_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "EVOLUTION_NOT_CONFIGURED",
          message: "Отправка WhatsApp не настроена на сервере.",
        },
        { status: 503 }
      );
    }
    if (message === "WHATSAPP_PROVIDER_INVALID") {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "WHATSAPP_PROVIDER_INVALID",
          message: "Некорректная настройка провайдера WhatsApp.",
        },
        { status: 503 }
      );
    }
    throw error;
  }
  if (!sent.ok) {
    const errorCode =
      sent.delivery === "evolution"
        ? "WHATSAPP_SEND_FAILED"
        : "GREEN_API_SEND_FAILED";
    return NextResponse.json(
      {
        ok: false,
        errorCode,
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
