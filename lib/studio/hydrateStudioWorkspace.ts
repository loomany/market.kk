import type { ClothingWorkspaceDraft, StudioWorkspaceSnapshot } from "@/lib/studio/studioWorkspaceSession";
import {
  DEFAULT_CLOTHING_WORKSPACE_DRAFT,
  DEFAULT_PRODUCT_CARD_WORKSPACE_DRAFT,
} from "@/lib/studio/studioWorkspaceSession";
import {
  createStudioProductPhoto,
  type StudioProductPhoto,
} from "@/lib/studio/productPhotos";
import {
  PRODUCT_SHOT_MASK_BLOB_ID,
  type PersistedProductPhotoBlob,
} from "@/lib/studio/productPhotoPersistence";

export function mergeClothingWorkspaceDraft(
  draft?: Partial<ClothingWorkspaceDraft> | null
): ClothingWorkspaceDraft {
  if (!draft) return { ...DEFAULT_CLOTHING_WORKSPACE_DRAFT };
  return {
    ...DEFAULT_CLOTHING_WORKSPACE_DRAFT,
    ...draft,
    modelSettings: {
      ...DEFAULT_CLOTHING_WORKSPACE_DRAFT.modelSettings,
      ...(draft.modelSettings ?? {}),
    },
    modelOutputSize: {
      ...DEFAULT_CLOTHING_WORKSPACE_DRAFT.modelOutputSize,
      ...(draft.modelOutputSize ?? {}),
    },
  };
}

export function mergeWorkspaceSnapshot(
  snapshot: StudioWorkspaceSnapshot | null
): StudioWorkspaceSnapshot | null {
  if (!snapshot) return null;
  return {
    ...snapshot,
    clothing: mergeClothingWorkspaceDraft(snapshot.clothing),
    productCard: {
      ...DEFAULT_PRODUCT_CARD_WORKSPACE_DRAFT,
      ...snapshot.productCard,
      productShotSettings: {
        ...DEFAULT_PRODUCT_CARD_WORKSPACE_DRAFT.productShotSettings,
        ...snapshot.productCard?.productShotSettings,
      },
    },
  };
}

export function studioPhotosFromPersistedBlobs(
  rows: PersistedProductPhotoBlob[]
): StudioProductPhoto[] {
  return rows
    .filter((row) => row.id !== PRODUCT_SHOT_MASK_BLOB_ID)
    .map((row) =>
      createStudioProductPhoto(
        new File([row.blob], row.name, { type: row.type || "image/png" }),
        row.id
      )
    );
}
