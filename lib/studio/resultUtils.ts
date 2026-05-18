import { createDefaultChecklist } from "@/lib/ai/qualityChecklist";
import { createDefaultProductShotChecklist } from "@/lib/ai/productShotChecklist";
import type {
  ProductShotFidelityMode,
  StudioResultImage,
} from "@/components/studio/types";

export function newResultId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type TryOnResultMeta = {
  provider?: string;
  model?: string;
  requestId?: string;
  seed?: number;
  estimatedCost?: number;
  promptPreview?: string;
};

export function mapApiImagesToStudioResults(
  images: { url: string; width?: number; height?: number }[],
  labelPrefix: string,
  meta?: TryOnResultMeta
): StudioResultImage[] {
  return images.map((img, i) => ({
    id: newResultId(),
    url: img.url,
    width: img.width,
    height: img.height,
    label: images.length === 1 ? labelPrefix : `${labelPrefix} ${i + 1}`,
    provider: meta?.provider,
    model: meta?.model,
    requestId: meta?.requestId,
    seed: meta?.seed,
    estimatedCost: meta?.estimatedCost,
    promptPreview: meta?.promptPreview,
    reviewStatus: "pending_review",
    checklist: createDefaultChecklist(),
  }));
}

export function nextGenerationSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function mapProductShotStudioResults(
  images: { url: string; width?: number; height?: number }[],
  fidelityMode: ProductShotFidelityMode,
  options?: {
    cutoutPreviewUrl?: string;
    selectedProductPreviewUrl?: string;
    manualMaskUsed?: boolean;
    exactCardWithoutMask?: boolean;
    provider?: string;
  }
): StudioResultImage[] {
  return images.map((img, i) => ({
    id: newResultId(),
    url: img.url,
    width: img.width,
    height: img.height,
    label: `Товарное фото ${i + 1}`,
    provider: options?.provider ?? (fidelityMode === "exact-card" ? "exact-card" : "fal"),
    reviewStatus: "pending_review",
    checklist: createDefaultChecklist(),
    productShotFidelity: fidelityMode,
    productShotChecklist: createDefaultProductShotChecklist(),
    cutoutPreviewUrl: options?.cutoutPreviewUrl,
    backgroundRemovedUrl: options?.cutoutPreviewUrl,
    selectedProductPreviewUrl: options?.selectedProductPreviewUrl,
    manualMaskUsed: options?.manualMaskUsed,
    exactCardWithoutMask: options?.exactCardWithoutMask,
  }));
}
