import { NextResponse } from "next/server";
import { z } from "zod";
import { createMockUserId, setSessionCookie } from "@/lib/auth/session";
import {
  consumeMemoryCode,
  normalizePhone,
  verifyCodeHash,
} from "@/lib/auth/whatsapp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { creditWelcomeTokens } from "@/lib/tokens/tokenLedger";

export const runtime = "nodejs";

const verifyCodeSchema = z.object({
  phone: z.string().min(7).max(24),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const parsed = verifyCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Введите номер и 6-значный код." },
      { status: 400 }
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  const admin = createSupabaseAdminClient();
  let userId = createMockUserId(phone);
  let isNewUser = true;

  if (admin) {
    const { data: codeRows, error } = await admin
      .from("auth_codes")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("phone", phone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !codeRows?.[0]) {
      return NextResponse.json(
        { ok: false, errorCode: "CODE_EXPIRED", message: "Код не найден или истёк." },
        { status: 400 }
      );
    }

    const row = codeRows[0];
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { ok: false, errorCode: "CODE_EXPIRED", message: "Код истёк. Запросите новый." },
        { status: 400 }
      );
    }

    if (row.attempts >= 5 || !verifyCodeHash(phone, parsed.data.code, row.code_hash)) {
      await admin.from("auth_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_CODE", message: "Неверный код." },
        { status: 400 }
      );
    }

    await admin
      .from("auth_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
      isNewUser = false;
    } else {
      isNewUser = true;
      const created = await admin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: { whatsapp_phone: phone },
      });
      userId = created.data.user?.id ?? userId;
    }

    await admin.from("profiles").upsert({
      id: userId,
      phone,
      whatsapp_phone: phone,
      updated_at: new Date().toISOString(),
    });
  } else {
    const verified = consumeMemoryCode(phone, parsed.data.code);
    if (!verified.ok) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_CODE", message: "Неверный или истёкший код." },
        { status: 400 }
      );
    }
  }

  await setSessionCookie({
    userId,
    phone,
    createdAt: new Date().toISOString(),
  });

  if (isNewUser && admin) {
    await creditWelcomeTokens(userId);
  }

  return NextResponse.json({
    ok: true,
    isNewUser,
    user: { id: userId, phone },
  });
}
