export type ProductShotFidelityMode = "exact-card" | "creative-scene";

export const PRODUCT_SHOT_FIDELITY_MODES: {
  id: ProductShotFidelityMode;
  label: string;
  description: string;
}[] = [
  {
    id: "exact-card",
    label: "Точная карточка",
    description:
      "Для маркетплейсов. Сохраняет товар максимально близко к оригиналу: цвет, форму и детали.",
  },
  {
    id: "creative-scene",
    label: "Креативная сцена",
    description:
      "Для Instagram и витрины. Создаёт красивую сцену, но результат нужно проверить вручную.",
  },
];

export const CREATIVE_FIDELITY_SUFFIX =
  "Preserve the exact original product. Do not change the product shape, color, material, flower design, chain length, pendant, number of items, proportions, or details. The product must remain the same item. Only improve the background, lighting, and scene.";

export const CREATIVE_JEWELRY_SUFFIX =
  "Professional jewelry product photography. Keep the exact earrings unchanged. Do not add new flowers, gems, chains, pendants, branches, or extra accessories. Do not transform the jewelry design.";

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
