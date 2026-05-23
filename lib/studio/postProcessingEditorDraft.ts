import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";

const DRAFT_KEY = "vitrina-post-process-editor-draft-v1";

export type PostProcessingEditorDraft = {
  open: boolean;
  selectedAssetId: string;
  processingMode: PostProcessingMode;
  surface: "desktop" | "mobile";
  textOnly: boolean;
  editorLivePreviewId?: string | null;
  /** True while «Создать видео/изображение» request is in flight. */
  generationInFlight?: boolean;
  /** ISO timestamp for countdown when asset row lacks startedAt after API merge. */
  processingStartedAt?: string | null;
};

export function savePostProcessingEditorDraft(
  draft: PostProcessingEditorDraft
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadPostProcessingEditorDraft(): PostProcessingEditorDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PostProcessingEditorDraft;
    if (
      !parsed?.open ||
      !parsed.selectedAssetId ||
      (parsed.processingMode !== "image" && parsed.processingMode !== "video")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPostProcessingEditorDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

/** Hydrate editor UI on first client render (before effects wipe sessionStorage). */
export function readInitialPostProcessingEditorUi(): {
  desktopEditorOpen: boolean;
  mobileSheetOpen: boolean;
  processingMode: PostProcessingMode | null;
  selectedAssetId: string | null;
  editorLivePreviewId: string | null;
} {
  const draft = loadPostProcessingEditorDraft();
  if (!draft?.open) {
    return {
      desktopEditorOpen: false,
      mobileSheetOpen: false,
      processingMode: null,
      selectedAssetId: null,
      editorLivePreviewId: null,
    };
  }
  return {
    desktopEditorOpen: draft.surface === "desktop",
    mobileSheetOpen: draft.surface === "mobile",
    processingMode: draft.processingMode,
    selectedAssetId: draft.selectedAssetId,
    editorLivePreviewId: draft.editorLivePreviewId ?? null,
  };
}
