import type { StudioResultImage } from "@/components/studio/types";

export const PRODUCT_CARD_PIPELINE_SESSION_KEY = "vitrina-product-card-v1";

export type ProductCardPipelineSessionSnapshot = {
  version: 1;
  savedAt: number;
  results: StudioResultImage[];
  previewSlideIndex: number;
};

export function saveProductCardPipelineSession(
  snapshot: ProductCardPipelineSessionSnapshot
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PRODUCT_CARD_PIPELINE_SESSION_KEY,
      JSON.stringify(snapshot)
    );
  } catch {
    /* quota */
  }
}

export function loadProductCardPipelineSession(): ProductCardPipelineSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PRODUCT_CARD_PIPELINE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductCardPipelineSessionSnapshot;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProductCardPipelineSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PRODUCT_CARD_PIPELINE_SESSION_KEY);
}
