import type { PostProcessingUploadedSource } from "@/lib/studio/postProcessingUpload";

const DRAFT_KEY = "vitrina-post-processing-upload-draft-v1";

/** Serializable after Fal upload (no blob URL). */
export type PostProcessingUploadDraftStored = Omit<
  PostProcessingUploadedSource,
  "previewUrl"
>;

export function savePostProcessingUploadDraft(
  draft: PostProcessingUploadDraftStored
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadPostProcessingUploadDraft(): PostProcessingUploadDraftStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostProcessingUploadDraftStored;
    if (!parsed?.id || !parsed.imageUrl || !parsed.kind) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPostProcessingUploadDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

export function draftToUploadedSource(
  draft: PostProcessingUploadDraftStored
): PostProcessingUploadedSource {
  return {
    ...draft,
    previewUrl:
      draft.kind === "video"
        ? (draft.referenceVideoUrl ?? draft.imageUrl)
        : draft.imageUrl,
  };
}
