import type { VideoModelKey } from "@/lib/ai/videoModels";
import type { ImageEditorId as ImageEnhanceEditorId } from "@/lib/ai/imageEnhanceSchemas";

export type PostProcessingMode = "video" | "image";

export type VideoEditorId = VideoModelKey;

export type ImageEditorId = ImageEnhanceEditorId;

export type PostProcessingEditor = {
  id: VideoEditorId | ImageEditorId;
  mode: PostProcessingMode;
  title: string;
  description: string;
  /** Internal model id — only shown to developers in dev mode. */
  technicalModel: string;
  pros: string;
  limitations: string;
  available: boolean;
  comingSoon?: boolean;
};

export const VIDEO_EDITORS: PostProcessingEditor[] = [
  {
    id: "kling",
    mode: "video",
    title: "Kling — плавное видео",
    description: "Лучше для коротких видео из фото.",
    technicalModel: "fal-ai/kling-video/o3/standard/image-to-video",
    pros: "Стабильное движение, до 15 сек.",
    limitations: "Нет формата 4:5.",
    available: true,
  },
  {
    id: "minimax",
    mode: "video",
    title: "MiniMax — быстрое видео",
    description: "Короткий недорогой ролик ~6 сек.",
    technicalModel: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    pros: "Экономично, все основные форматы.",
    limitations: "Фиксированная длительность 6 сек.",
    available: true,
  },
  {
    id: "veo",
    mode: "video",
    title: "Veo — премиум видео",
    description: "Максимальное качество для рекламы.",
    technicalModel: "fal-ai/veo3.1/image-to-video",
    pros: "Топ качество, точная передача движения.",
    limitations: "Только 9:16 и 16:9, дороже.",
    available: true,
  },
];

const NANO_BANANA_PRO_BASE: Omit<
  PostProcessingEditor,
  "available" | "comingSoon" | "description" | "limitations"
> = {
  id: "nano-banana-pro",
  mode: "image",
  title: "Nano Banana Pro",
  technicalModel: "fal-ai/nano-banana-pro/edit",
  pros: "Реалистичная кожа, ткань и свет. Сохраняет товар.",
};

const FLUX_KONTEXT_PRO_BASE: Omit<
  PostProcessingEditor,
  "available" | "comingSoon" | "description" | "limitations"
> = {
  id: "flux-kontext-pro",
  mode: "image",
  title: "FLUX Kontext",
  technicalModel: "fal-ai/flux-pro/kontext",
  pros: "Хорош, когда нужно переместить модель в другую сцену.",
};

export type ImageEditorAvailabilityInput = {
  mockMode: boolean;
  /** Whether real paid Fal calls are enabled on the server (ALLOW_PAID_AI_RUNS). */
  paidAiRunsAllowed?: boolean;
};

/** Visible image editors.
 *
 *  - Demo (`mockMode`): оба редактора активны, результат — mock.
 *  - Production с включёнными paid runs: оба активны (real Fal calls).
 *  - Production без paid runs: показываем «Скоро», нажать нельзя.
 */
export function getImageEditors(
  input: ImageEditorAvailabilityInput | boolean
): PostProcessingEditor[] {
  const normalized: ImageEditorAvailabilityInput =
    typeof input === "boolean"
      ? { mockMode: input }
      : input;

  if (normalized.mockMode) {
    return [
      {
        ...NANO_BANANA_PRO_BASE,
        description:
          "Demo: показывает работу улучшения фото на mock-результатах.",
        limitations:
          "В demo-режиме результат — пример. Включите real-режим для настоящего AI.",
        available: true,
      },
      {
        ...FLUX_KONTEXT_PRO_BASE,
        description:
          "Demo: смена сцены и контекста на mock-результатах.",
        limitations:
          "В demo-режиме результат — пример. Включите real-режим для настоящего AI.",
        available: true,
      },
    ];
  }

  if (normalized.paidAiRunsAllowed) {
    return [
      {
        ...NANO_BANANA_PRO_BASE,
        description: "Реалистичные фото, улучшение света, фона и деталей.",
        limitations:
          "Стоимость зависит от качества (Быстро / Стандарт / Максимум).",
        available: true,
      },
      {
        ...FLUX_KONTEXT_PRO_BASE,
        description:
          "Смена сцены и контекста: пляж, интерьер, улица, lifestyle-кадр.",
        limitations: "Не поддерживает 4:5 и WebP.",
        available: true,
      },
    ];
  }

  return [
    {
      ...NANO_BANANA_PRO_BASE,
      description: "Реалистичные фото, улучшение света, фона и деталей.",
      limitations:
        "Real-режим временно отключён администратором. Скоро будет доступен.",
      available: false,
      comingSoon: true,
    },
    {
      ...FLUX_KONTEXT_PRO_BASE,
      description:
        "Смена сцены и контекста: пляж, интерьер, улица, lifestyle-кадр.",
      limitations:
        "Real-режим временно отключён администратором. Скоро будет доступен.",
      available: false,
      comingSoon: true,
    },
  ];
}
