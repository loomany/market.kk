import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const assetSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum([
    "tryon",
    "exact-card",
    "creative-card",
    "background-removed",
    "video",
    "scene",
  ]),
  url: z.string().min(1),
  sourceImageUrl: z.string().optional(),
  mode: z.string().min(1).max(80),
  provider: z.string().optional(),
  model: z.string().optional(),
  requestId: z.string().optional(),
  createdAt: z.string().optional(),
  prompt: z.string().optional(),
  enhancedPrompt: z.string().optional(),
  estimatedCost: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  format: z.string().optional(),
  label: z.string().optional(),
  reviewStatus: z.string().optional(),
  referenceVideoUrl: z.string().url().optional(),
  parentAssetId: z.string().optional(),
  postProcessOrigin: z
    .enum(["upload", "text-only-image", "text-only-video"])
    .optional(),
  status: z.enum(["ready", "processing", "error"]).optional(),
  startedAt: z.string().optional(),
  errorMessage: z.string().optional(),
});

function serializeAsset(row: {
  id: string;
  type: string;
  source_url: string | null;
  result_url: string | null;
  provider: string | null;
  model: string | null;
  request_id: string | null;
  prompt: string | null;
  enhanced_prompt: string | null;
  estimated_cost: number | null;
  status: string | null;
  created_at: string;
  settings: Record<string, unknown> | null;
}) {
  return {
    id: row.id,
    type: row.type,
    url: row.result_url ?? row.source_url ?? "",
    sourceImageUrl: row.source_url ?? undefined,
    mode: String(row.settings?.mode ?? row.type),
    provider: row.provider ?? undefined,
    model: row.model ?? undefined,
    requestId: row.request_id ?? undefined,
    createdAt: row.created_at,
    prompt: row.prompt ?? undefined,
    enhancedPrompt: row.enhanced_prompt ?? undefined,
    estimatedCost: row.estimated_cost ?? undefined,
    reviewStatus: row.status ?? undefined,
    width: typeof row.settings?.width === "number" ? row.settings.width : undefined,
    height: typeof row.settings?.height === "number" ? row.settings.height : undefined,
    duration:
      typeof row.settings?.duration === "number" ? row.settings.duration : undefined,
    format: typeof row.settings?.format === "string" ? row.settings.format : undefined,
    label: typeof row.settings?.label === "string" ? row.settings.label : undefined,
    referenceVideoUrl: (() => {
      if (typeof row.settings?.referenceVideoUrl === "string") {
        return row.settings.referenceVideoUrl;
      }
      const mode = String(row.settings?.mode ?? "");
      if (
        row.type === "video" &&
        mode === "post-processing" &&
        row.result_url &&
        row.source_url &&
        row.result_url !== row.source_url
      ) {
        return row.result_url;
      }
      return undefined;
    })(),
    parentAssetId:
      typeof row.settings?.parentAssetId === "string"
        ? row.settings.parentAssetId
        : undefined,
    postProcessOrigin:
      row.settings?.postProcessOrigin === "upload" ||
      row.settings?.postProcessOrigin === "text-only-image" ||
      row.settings?.postProcessOrigin === "text-only-video"
        ? (row.settings.postProcessOrigin as
            | "upload"
            | "text-only-image"
            | "text-only-video")
        : undefined,
    status:
      row.settings?.status === "ready" ||
      row.settings?.status === "processing" ||
      row.settings?.status === "error"
        ? (row.settings.status as "ready" | "processing" | "error")
        : undefined,
    startedAt:
      typeof row.settings?.startedAt === "string"
        ? row.settings.startedAt
        : undefined,
    errorMessage:
      typeof row.settings?.errorMessage === "string"
        ? row.settings.errorMessage
        : undefined,
  };
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ ok: true, assets: [] });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, assets: [], storage: "not_configured" });
  }

  const { data, error } = await admin
    .from("studio_assets")
    .select(
      "id,type,source_url,result_url,provider,model,request_id,prompt,enhanced_prompt,estimated_cost,status,created_at,settings"
    )
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(48);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "STUDIO_ASSETS_READ_FAILED",
        message: "Не удалось загрузить историю файлов.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    assets: (data ?? []).map((row) => serializeAsset(row)),
  });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, errorCode: "AUTH_REQUIRED", message: "Войдите, чтобы сохранить файл." },
      { status: 401 }
    );
  }

  const parsed = assetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Некорректный файл истории." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "SUPABASE_NOT_CONFIGURED",
        message: "Supabase не настроен, файл сохранён только в этой сессии.",
      },
      { status: 503 }
    );
  }

  const asset = parsed.data;
  const settings: Record<string, unknown> = {
    mode: asset.mode,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    format: asset.format,
    label: asset.label,
  };
  if (asset.referenceVideoUrl) {
    settings.referenceVideoUrl = asset.referenceVideoUrl;
  }
  if (asset.parentAssetId) {
    settings.parentAssetId = asset.parentAssetId;
  }
  if (asset.postProcessOrigin) {
    settings.postProcessOrigin = asset.postProcessOrigin;
  }
  if (asset.status) {
    settings.status = asset.status;
  }
  if (asset.startedAt) {
    settings.startedAt = asset.startedAt;
  }
  if (asset.errorMessage) {
    settings.errorMessage = asset.errorMessage;
  }

  const { error: assetError } = await admin.from("studio_assets").upsert({
    id: asset.id,
    user_id: session.userId,
    type: asset.type,
    source_url: asset.sourceImageUrl,
    result_url: asset.url,
    provider: asset.provider,
    model: asset.model,
    request_id: asset.requestId,
    prompt: asset.prompt,
    enhanced_prompt: asset.enhancedPrompt,
    settings,
    estimated_cost: asset.estimatedCost,
    status: asset.reviewStatus ?? "created",
  });

  if (assetError) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "STUDIO_ASSET_SAVE_FAILED",
        message: "Не удалось сохранить файл в историю.",
      },
      { status: 500 }
    );
  }

  await admin.from("generation_jobs").insert({
    user_id: session.userId,
    asset_id: asset.id,
    type: asset.type,
    provider: asset.provider,
    model: asset.model,
    request_payload: {
      sourceImageUrl: asset.sourceImageUrl,
      referenceVideoUrl: asset.referenceVideoUrl,
      prompt: asset.prompt,
      settings,
    },
    response_payload: {
      resultUrl: asset.url,
      requestId: asset.requestId,
    },
    estimated_cost: asset.estimatedCost,
    status: "completed",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, errorCode: "AUTH_REQUIRED", message: "Войдите, чтобы удалить файл." },
      { status: 401 }
    );
  }

  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) {
    return NextResponse.json(
      { ok: false, errorCode: "VALIDATION_ERROR", message: "Не передан id файла." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, storage: "not_configured" });
  }

  await admin.from("studio_assets").delete().eq("id", id).eq("user_id", session.userId);

  return NextResponse.json({ ok: true });
}
