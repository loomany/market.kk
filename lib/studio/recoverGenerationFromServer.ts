import { syncGenerationJobStatus } from "@/lib/studio/postProcessingGenerationClient";
import { parseGenerationJobSuccess } from "@/lib/studio/parseGenerationJobResult";

/** One-shot check: Fal finished on server while browser HTTP dropped. */
export async function fetchCompletedGenerationPayload(
  clientAssetId: string
): Promise<Record<string, unknown> | null> {
  const outcome = await syncGenerationJobStatus(clientAssetId);
  if (outcome.kind !== "success") return null;
  const parsed = parseGenerationJobSuccess(outcome.data);
  return parsed ? outcome.data : null;
}
