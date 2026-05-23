import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type GenerationJobRow = {
  id: string;
  user_id: string;
  asset_id: string | null;
  type: string;
  status: string;
  provider: string | null;
  model: string | null;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown> | null;
  estimated_cost: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

const STALE_PROCESSING_MS = 45 * 60 * 1000;

export async function findGenerationJobByAssetId(
  userId: string,
  clientAssetId: string
): Promise<GenerationJobRow | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("generation_jobs")
    .select(
      "id,user_id,asset_id,type,status,provider,model,request_payload,response_payload,error_code,error_message,estimated_cost,created_at,completed_at"
    )
    .eq("user_id", userId)
    .eq("asset_id", clientAssetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as GenerationJobRow;
}

export async function upsertGenerationJobProcessing(params: {
  userId: string;
  clientAssetId: string;
  type: string;
  provider?: string;
  model?: string;
  requestPayload: Record<string, unknown>;
  estimatedCost?: number;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const existing = await findGenerationJobByAssetId(
    params.userId,
    params.clientAssetId
  );
  if (existing?.status === "processing") {
    const age = Date.now() - new Date(existing.created_at).getTime();
    if (age < STALE_PROCESSING_MS) return;
  }

  const row = {
    user_id: params.userId,
    asset_id: params.clientAssetId,
    type: params.type,
    provider: params.provider ?? null,
    model: params.model ?? null,
    request_payload: params.requestPayload,
    estimated_cost: params.estimatedCost ?? null,
    status: "processing",
    response_payload: null,
    error_code: null,
    error_message: null,
    completed_at: null,
  };

  if (existing?.id) {
    await admin.from("generation_jobs").update(row).eq("id", existing.id);
  } else {
    await admin.from("generation_jobs").insert(row);
  }
}

export async function patchGenerationJobRequestPayload(
  userId: string,
  clientAssetId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const existing = await findGenerationJobByAssetId(userId, clientAssetId);
  if (!existing) return;

  const merged = {
    ...(existing.request_payload as Record<string, unknown>),
    ...patch,
  };

  await admin
    .from("generation_jobs")
    .update({ request_payload: merged })
    .eq("id", existing.id);
}

export async function completeGenerationJob(
  userId: string,
  clientAssetId: string,
  responsePayload: Record<string, unknown>
): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  await admin
    .from("generation_jobs")
    .update({
      status: "completed",
      response_payload: responsePayload,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("asset_id", clientAssetId);
}

export async function failGenerationJob(
  userId: string,
  clientAssetId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  await admin
    .from("generation_jobs")
    .update({
      status: "failed",
      response_payload: null,
      error_code: errorCode,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("asset_id", clientAssetId);
}

export function isGenerationJobStale(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > STALE_PROCESSING_MS;
}
