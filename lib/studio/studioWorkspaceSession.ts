import type { ClothingPreviewTabId } from "@/components/studio/ClothingPreviewPanel";
import type { ProductDescriptionAnalysis } from "@/lib/ai/productDescriptionAnalysisSchemas";
import type { ModelOutputSizeSelection } from "@/lib/ai/modelOutputSizes";
import type {
  ModelGenerationSettings,
  ProductShotSettings,
  StudioMode,
} from "@/components/studio/types";
import {
  DEFAULT_MODEL_GENERATION_SETTINGS,
  DEFAULT_PRODUCT_SHOT_SETTINGS,
} from "@/components/studio/types";
import { DEFAULT_MODEL_OUTPUT_SIZE } from "@/lib/ai/modelOutputSizes";
import type { ModelInputMode } from "@/components/studio/ModelInputModeSelector";

export const STUDIO_WORKSPACE_SESSION_KEY = "vitrina-studio-workspace-v1";

export type ClothingWorkspaceDraft = {
  modelSettings: ModelGenerationSettings;
  modelOutputSize: Partial<ModelOutputSizeSelection>;
  modelDescription: string;
  productDescription: string;
  modelInputMode: ModelInputMode;
  clothingPreviewTab: ClothingPreviewTabId;
  userEditedProductDescription: boolean;
  productAnalysis: ProductDescriptionAnalysis | null;
};

export type ProductCardWorkspaceDraft = {
  productShotSettings: ProductShotSettings;
};

export type StudioWorkspaceSnapshot = {
  version: 1;
  savedAt: number;
  activeMode: StudioMode;
  clothing: ClothingWorkspaceDraft;
  productCard: ProductCardWorkspaceDraft;
};

export const DEFAULT_CLOTHING_WORKSPACE_DRAFT: ClothingWorkspaceDraft = {
  modelSettings: DEFAULT_MODEL_GENERATION_SETTINGS,
  modelOutputSize: { ...DEFAULT_MODEL_OUTPUT_SIZE },
  modelDescription: "",
  productDescription: "",
  modelInputMode: "create",
  clothingPreviewTab: "product",
  userEditedProductDescription: false,
  productAnalysis: null,
};

export const DEFAULT_PRODUCT_CARD_WORKSPACE_DRAFT: ProductCardWorkspaceDraft = {
  productShotSettings: DEFAULT_PRODUCT_SHOT_SETTINGS,
};

export function saveStudioWorkspaceSession(
  snapshot: StudioWorkspaceSnapshot
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STUDIO_WORKSPACE_SESSION_KEY,
      JSON.stringify(snapshot)
    );
  } catch {
    /* quota */
  }
}

export function loadStudioWorkspaceSession(): StudioWorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STUDIO_WORKSPACE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudioWorkspaceSnapshot;
    if (parsed?.version !== 1 || !parsed.activeMode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStudioWorkspaceSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STUDIO_WORKSPACE_SESSION_KEY);
}

const STUDIO_MODES = [
  "clothing-tryon",
  "product-shot",
  "post-processing",
] as const satisfies readonly StudioMode[];

/** Read saved tab synchronously on first client render (avoids wrong tab after F5). */
export function readInitialStudioMode(): StudioMode {
  if (typeof window === "undefined") return "clothing-tryon";
  const mode = loadStudioWorkspaceSession()?.activeMode;
  if (mode && (STUDIO_MODES as readonly string[]).includes(mode)) {
    return mode;
  }
  return "clothing-tryon";
}
