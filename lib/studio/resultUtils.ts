import { createDefaultChecklist } from "@/lib/ai/qualityChecklist";
import type { StudioResultImage } from "@/components/studio/types";

export function newResultId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function mapApiImagesToStudioResults(
  images: { url: string; width?: number; height?: number }[],
  labelPrefix: string
): StudioResultImage[] {
  return images.map((img, i) => ({
    id: newResultId(),
    url: img.url,
    width: img.width,
    height: img.height,
    label: `${labelPrefix} ${i + 1}`,
    reviewStatus: "pending_review",
    checklist: createDefaultChecklist(),
  }));
}

export function nextGenerationSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}
