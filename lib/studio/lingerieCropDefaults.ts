import type {
  ModelCrop,
  ModelGenerationSettings,
} from "@/components/studio/types";

/** Default «Кадр для примерки» for lingerie — commercial 3/4 catalog, not full-body. */
export const LINGERIE_DEFAULT_CROP = "upper-thigh" as const satisfies ModelCrop;

export const LINGERIE_CATALOG_FRAMING_EN =
  "Commercial lingerie catalog crop from top of head with generous headroom through upper-mid thighs: entire head, full face, forehead, eyebrows, both eyes, nose, mouth, chin, hair, shoulders, bust, waist, hips, and complete bra and brief fully visible. Crop ends around upper thigh or mid-thigh — not full-length, not waist-only. Never crop above the eyebrows or cut off the top of the head. Do not crop off the bra, briefs, or chin. Do not use distant full-body framing unless the user explicitly selected full-length.";

export function applyDefaultLingerieCrop(
  settings: ModelGenerationSettings
): ModelGenerationSettings {
  if (settings.categoryContext !== "lingerie") return settings;
  return {
    ...settings,
    crop: LINGERIE_DEFAULT_CROP,
    cropCustom: "",
  };
}

export function isDefaultLingerieCropSelection(settings: {
  categoryContext: string;
  crop: ModelCrop;
  cropCustom: string;
}): boolean {
  if (settings.categoryContext !== "lingerie") return false;
  if (settings.crop === LINGERIE_DEFAULT_CROP) return true;
  return false;
}
