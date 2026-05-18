import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { SAVED_MODEL_ASSET_TYPE } from "@/lib/studio/savedModel";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const saveBodySchema = z.object({
  url: z.string().url(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

function serializeRow(row: {
  id: string;
  result_url: string | null;
  created_at: string;
  settings: Record<string, unknown> | null;
}) {
  return {
    id: row.id,
    url: row.result_url ?? "",
    savedAt: row.created_at,
    settings: row.settings ?? undefined,
  };
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ ok: true, model: null, storage: "guest" });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, model: null, storage: "not_configured" });
  }

  const { data, error } = await admin
    .from("studio_assets")
    .select("id,result_url,created_at,settings")
    .eq("user_id", session.userId)
    .eq("type", SAVED_MODEL_ASSET_TYPE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "SAVED_MODEL_READ_FAILED",
        message: "Не удалось загрузить сохранённую модель.",
      },
      { status: 500 }
    );
  }

  if (!data?.result_url) {
    return NextResponse.json({ ok: true, model: null, storage: "supabase" });
  }

  return NextResponse.json({
    ok: true,
    model: serializeRow(data),
    storage: "supabase",
  });
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "AUTH_REQUIRED",
        message: "Войдите, чтобы сохранить модель в аккаунте.",
      },
      { status: 401 }
    );
  }

  const parsed = saveBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Некорректная модель." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "SUPABASE_NOT_CONFIGURED",
        message: "Облако не настроено — модель сохранена только на этом устройстве.",
      },
      { status: 503 }
    );
  }

  const { url, settings } = parsed.data;

  await admin
    .from("studio_assets")
    .delete()
    .eq("user_id", session.userId)
    .eq("type", SAVED_MODEL_ASSET_TYPE);

  const { data, error } = await admin
    .from("studio_assets")
    .insert({
      user_id: session.userId,
      type: SAVED_MODEL_ASSET_TYPE,
      result_url: url,
      settings: { mode: "clothing-tryon", ...settings },
      status: "ready",
    })
    .select("id,result_url,created_at,settings")
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "SAVED_MODEL_SAVE_FAILED",
        message: "Не удалось сохранить модель в аккаунте.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, model: serializeRow(data) });
}

export async function DELETE() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, errorCode: "AUTH_REQUIRED", message: "Войдите, чтобы удалить модель." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, storage: "not_configured" });
  }

  await admin
    .from("studio_assets")
    .delete()
    .eq("user_id", session.userId)
    .eq("type", SAVED_MODEL_ASSET_TYPE);

  return NextResponse.json({ ok: true });
}
