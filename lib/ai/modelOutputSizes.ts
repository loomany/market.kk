/** Fal `fal-ai/nano-banana-2` — aspect_ratio + resolution */

export const FAL_MODEL_ASPECT_RATIOS = [
  "3:4",
  "4:5",
  "1:1",
  "2:3",
  "9:16",
  "4:3",
  "16:9",
] as const;

export type FalModelAspectRatio = (typeof FAL_MODEL_ASPECT_RATIOS)[number];

export const FAL_MODEL_RESOLUTIONS = ["0.5K", "1K", "2K"] as const;

export type FalModelResolution = (typeof FAL_MODEL_RESOLUTIONS)[number];

export type ModelOutputSizeSelection = {
  aspectRatio: FalModelAspectRatio;
  resolution: FalModelResolution;
};

export const FAL_MODEL_ASPECT_RATIO_OPTIONS: {
  id: FalModelAspectRatio;
  label: string;
  shortHint: string;
  hint: string;
}[] = [
  {
    id: "3:4",
    label: "3:4",
    shortHint: "WB и Ozon",
    hint: "Портрет для Wildberries и Ozon",
  },
  {
    id: "4:5",
    label: "4:5",
    shortHint: "лента",
    hint: "Вертикаль для ленты и витрины",
  },
  {
    id: "1:1",
    label: "1:1",
    shortHint: "квадрат",
    hint: "Квадрат для превью и аватаров",
  },
  {
    id: "2:3",
    label: "2:3",
    shortHint: "полный рост",
    hint: "Узкий портрет, полный рост",
  },
  {
    id: "9:16",
    label: "9:16",
    shortHint: "Stories",
    hint: "Stories и Reels",
  },
  {
    id: "4:3",
    label: "4:3",
    shortHint: "горизонталь",
    hint: "Горизонтальный каталог",
  },
  {
    id: "16:9",
    label: "16:9",
    shortHint: "баннер",
    hint: "Широкий баннер и обложки",
  },
];

export const FAL_MODEL_RESOLUTION_OPTIONS: {
  id: FalModelResolution;
  label: string;
  shortHint: string;
  hint: string;
}[] = [
  {
    id: "0.5K",
    label: "0.5K",
    shortHint: "черновик",
    hint: "Быстрый черновик, ниже стоимость",
  },
  {
    id: "1K",
    label: "1K",
    shortHint: "баланс",
    hint: "Баланс качества и скорости",
  },
  {
    id: "2K",
    label: "2K",
    shortHint: "для зума",
    hint: "Детализация для зума в карточке",
  },
];

export function isModelOutputSizeComplete(
  size: Partial<ModelOutputSizeSelection>
): size is ModelOutputSizeSelection {
  return (
    FAL_MODEL_ASPECT_RATIOS.includes(
      size.aspectRatio as FalModelAspectRatio
    ) && FAL_MODEL_RESOLUTIONS.includes(size.resolution as FalModelResolution)
  );
}

export function formatModelOutputSizeLabel(
  size: ModelOutputSizeSelection
): string {
  return `${size.aspectRatio} · ${size.resolution}`;
}
