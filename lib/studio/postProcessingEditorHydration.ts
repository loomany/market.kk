import type { StudioSessionAsset } from "@/components/studio/types";
import type { PostProcessingMode } from "@/lib/studio/postProcessingEditors";
import {
  loadPostProcessingEditorDraft,
  type PostProcessingEditorDraft,
} from "@/lib/studio/postProcessingEditorDraft";
import {
  buildProcessingAssetFromJob,
  resolveEditorInFlightPreview,
} from "@/lib/studio/postProcessingInFlightRestore";
import {
  getPendingGenerationJob,
  isPendingGenerationStale,
  listPendingGenerationJobs,
} from "@/lib/studio/pendingGenerationClient";
import { loadPostProcessingTextOnlyDraft } from "@/lib/studio/postProcessingTextOnlyDraft";
import {
  draftToUploadedSource,
  loadPostProcessingUploadDraft,
} from "@/lib/studio/postProcessingUploadDraft";
import { uploadedSourceToGalleryAsset } from "@/lib/studio/postProcessingUpload";
import { loadStudioSessionAssets } from "@/lib/studio/studioSessionPersistence";

export type PostProcessingEditorHydration = {
  editorDraftOpen: boolean;
  desktopEditorOpen: boolean;
  mobileSheetOpen: boolean;
  processingMode: PostProcessingMode | null;
  selectedAssetId: string | null;
  editorLivePreview: StudioSessionAsset | null;
  restoredEditorAsset: StudioSessionAsset | null;
  textOnlyEditorAsset: StudioSessionAsset | null;
  generationLoading: boolean;
};

export function resolveRestoredEditorAssetForDraft(
  draft: PostProcessingEditorDraft,
  localAssets: StudioSessionAsset[],
  textOnlyEditorAsset: StudioSessionAsset | null
): StudioSessionAsset | null {
  if (textOnlyEditorAsset?.id === draft.selectedAssetId) {
    return textOnlyEditorAsset;
  }
  const fromSession = localAssets.find((a) => a.id === draft.selectedAssetId);
  if (fromSession) return fromSession;
  const uploadDraft = loadPostProcessingUploadDraft();
  if (uploadDraft?.id === draft.selectedAssetId) {
    return uploadedSourceToGalleryAsset(draftToUploadedSource(uploadDraft));
  }
  return null;
}

function resolveInFlightPreview(
  draft: PostProcessingEditorDraft,
  localAssets: StudioSessionAsset[]
): {
  preview: StudioSessionAsset | null;
  generationLoading: boolean;
} {
  const previewId = draft.editorLivePreviewId;
  if (previewId) {
    const preview = resolveEditorInFlightPreview(
      previewId,
      localAssets,
      draft.processingStartedAt
    );
    if (!preview) {
      return { preview: null, generationLoading: false };
    }
    if (!draft.generationInFlight) {
      return { preview, generationLoading: false };
    }
    const job = getPendingGenerationJob(previewId);
    return {
      preview,
      generationLoading: Boolean(
        job && !isPendingGenerationStale(job.startedAt)
      ),
    };
  }

  if (!draft.generationInFlight) {
    return { preview: null, generationLoading: false };
  }

  const job =
    listPendingGenerationJobs().find(
      (j) =>
        j.parentAssetId === draft.selectedAssetId ||
        j.clientAssetId === draft.selectedAssetId
    ) ?? null;
  if (!job) {
    return { preview: null, generationLoading: false };
  }
  return {
    preview: buildProcessingAssetFromJob(job, localAssets),
    generationLoading: !isPendingGenerationStale(job.startedAt),
  };
}

/** Sync restore before first paint so reload does not flash the upload landing. */
export function readInitialPostProcessingEditorHydration(
  fallbackSelectedAssetId: string
): PostProcessingEditorHydration {
  const empty: PostProcessingEditorHydration = {
    editorDraftOpen: false,
    desktopEditorOpen: false,
    mobileSheetOpen: false,
    processingMode: null,
    selectedAssetId: fallbackSelectedAssetId || null,
    editorLivePreview: null,
    restoredEditorAsset: null,
    textOnlyEditorAsset: null,
    generationLoading: false,
  };

  if (typeof window === "undefined") return empty;

  const draft = loadPostProcessingEditorDraft();
  if (!draft?.open) return empty;

  const localAssets = loadStudioSessionAssets();
  const textOnlyEditorAsset = draft.textOnly
    ? (loadPostProcessingTextOnlyDraft()?.draftAsset ?? null)
    : null;
  const { preview, generationLoading } = resolveInFlightPreview(
    draft,
    localAssets
  );
  const restoredEditorAsset = preview
    ? null
    : resolveRestoredEditorAssetForDraft(draft, localAssets, textOnlyEditorAsset);

  return {
    editorDraftOpen: true,
    desktopEditorOpen: draft.surface === "desktop",
    mobileSheetOpen: draft.surface === "mobile",
    processingMode: draft.processingMode,
    selectedAssetId: draft.selectedAssetId,
    editorLivePreview: preview,
    restoredEditorAsset,
    textOnlyEditorAsset,
    generationLoading,
  };
}
