import type { ClothingPreviewTabId } from "@/components/studio/ClothingPreviewPanel";
import type { ResolvedModelAngle } from "@/lib/ai/modelAngles";
import type { ProductSetSlotProgress } from "@/lib/studio/productSetProgress";
import type { StudioResultImage } from "@/components/studio/types";

export const CLOTHING_PIPELINE_SESSION_KEY = "vitrina-clothing-pipeline-v1";

export type ClothingPipelineResumeCheckpoint = {
  nextModelIndex: number;
  nextTryOnIndex: number;
  completedModelUrls: { photoId: string; url: string; label: string }[];
  completedResultUrls: { id: string; url: string; label: string }[];
};

export type ClothingPipelineSessionSnapshot = {
  version: 1;
  savedAt: number;
  status: "running" | "completed" | "interrupted";
  productPhotoCount: number;
  previewSlideIndex: number;
  clothingPreviewTab: ClothingPreviewTabId;
  productSetSlots: ProductSetSlotProgress[];
  productSetActiveIndex: number;
  generatedModelPreviews: { id: string; url: string; label: string }[];
  results: StudioResultImage[];
  tryOnProgress: string | null;
  pipelineStartedAt: number | null;
  useProductSampleAngles: boolean;
  productSampleAngles: ResolvedModelAngle[] | null;
  resume?: ClothingPipelineResumeCheckpoint;
};

export function saveClothingPipelineSession(
  snapshot: ClothingPipelineSessionSnapshot
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      CLOTHING_PIPELINE_SESSION_KEY,
      JSON.stringify(snapshot)
    );
  } catch {
    /* quota */
  }
}

export function loadClothingPipelineSession(): ClothingPipelineSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CLOTHING_PIPELINE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClothingPipelineSessionSnapshot;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearClothingPipelineSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CLOTHING_PIPELINE_SESSION_KEY);
}

/** Собрать чекпоинт из сохранённого UI, если пайплайн оборвался до записи ref. */
export function resumeCheckpointFromSnapshot(
  snapshot: ClothingPipelineSessionSnapshot
): ClothingPipelineResumeCheckpoint {
  if (snapshot.resume) return snapshot.resume;

  return {
    nextModelIndex: snapshot.generatedModelPreviews.length,
    nextTryOnIndex: snapshot.results.length,
    completedModelUrls: snapshot.generatedModelPreviews.map((row) => ({
      photoId: row.id,
      url: row.url,
      label: row.label,
    })),
    completedResultUrls: snapshot.results.map((row) => ({
      id: row.id,
      url: row.url,
      label: row.label ?? "Итог",
    })),
  };
}

export function shouldAutoResumePipeline(
  snapshot: ClothingPipelineSessionSnapshot
): boolean {
  if (snapshot.status === "running") return true;
  if (snapshot.status !== "interrupted") return false;

  const total = snapshot.productPhotoCount;
  const modelsDone = snapshot.generatedModelPreviews.length;
  const resultsDone = snapshot.results.length;
  return modelsDone < total || resultsDone < total;
}

export function isPipelineWorkComplete(
  snapshot: ClothingPipelineSessionSnapshot
): boolean {
  const total = snapshot.productPhotoCount;
  return (
    snapshot.generatedModelPreviews.length >= total &&
    snapshot.results.length >= total
  );
}
