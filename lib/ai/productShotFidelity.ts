export type ProductShotFidelityMode = "exact-card";

export const MARKETPLACE_SCENE_PRESETS = [
  "marketplace-clean",
  "white-studio",
  "light-gray-studio",
] as const;

export function isMarketplaceScenePreset(
  preset: string
): preset is (typeof MARKETPLACE_SCENE_PRESETS)[number] {
  return (MARKETPLACE_SCENE_PRESETS as readonly string[]).includes(preset);
}
