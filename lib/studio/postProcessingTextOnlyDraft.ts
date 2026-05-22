import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import type { StudioSessionAsset } from "@/components/studio/types";

const DRAFT_KEY = "vitrina-post-process-text-only-draft-v1";

export type PostProcessingTextOnlyDraft = {
  mode: PostProcessingMode;
  draftAsset: StudioSessionAsset;
};

export function savePostProcessingTextOnlyDraft(
  draft: PostProcessingTextOnlyDraft
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadPostProcessingTextOnlyDraft(): PostProcessingTextOnlyDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostProcessingTextOnlyDraft;
    if (!parsed?.draftAsset?.id || !parsed.mode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPostProcessingTextOnlyDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
