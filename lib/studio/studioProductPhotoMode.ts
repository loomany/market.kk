import type { StudioMode } from "@/components/studio/types";

/** Режимы студии с отдельным набором фото товара */
export type StudioProductPhotoMode = "clothing-tryon" | "product-shot";

export function isStudioProductPhotoMode(
  mode: StudioMode
): mode is StudioProductPhotoMode {
  return mode === "clothing-tryon" || mode === "product-shot";
}

export const STUDIO_PRODUCT_PHOTO_MODES: StudioProductPhotoMode[] = [
  "clothing-tryon",
  "product-shot",
];
