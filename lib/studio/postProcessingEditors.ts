import type { VideoModelKey } from "@/lib/ai/videoModels";

export type PostProcessingMode = "video" | "image";

export type VideoEditorId = VideoModelKey;

export type ImageEditorId = "nano-banana-pro";

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
  technicalModel: "fal-ai/nano-banana-pro",
  pros: "Реалистичная кожа, ткань и свет. Сохраняет товар.",
};

/** Visible image editors.
 *
 *  Real Nano Banana image-enhance endpoint is not wired up yet — it will be a
 *  separate backend stage. In production we show the card as "Скоро" so the
 *  user cannot trigger it; in demo (`mockMode`) we mark it as demo only.
 */
export function getImageEditors(mockMode: boolean): PostProcessingEditor[] {
  if (mockMode) {
    return [
      {
        ...NANO_BANANA_PRO_BASE,
        description:
          "Demo: показывает работу UI улучшения фото на mock-результатах.",
        limitations:
          "Real улучшение фото будет подключено отдельным этапом backend.",
        available: true,
      },
    ];
  }
  return [
    {
      ...NANO_BANANA_PRO_BASE,
      description: "Лучше для реалистичных фото, света, фона и деталей.",
      limitations:
        "Подключение в production будет отдельным этапом — следите за обновлениями.",
      available: false,
      comingSoon: true,
    },
  ];
}
