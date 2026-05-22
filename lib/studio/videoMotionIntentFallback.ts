import type { VideoMotionPresetId } from "@/components/studio/VideoSettingsForm";

/** Used when the video prompt field is empty — motion preset still defines the shot. */
const MOTION_INTENT_FALLBACK_RU: Record<VideoMotionPresetId, string> = {
  "subtle-motion":
    "Мягкое естественное движение, стабильные детали товара",
  "model-turn": "Модель медленно поворачивается, камера стабильна",
  "camera-push": "Медленный наезд камеры, премиальный свет",
  "product-fidelity": "Точное сохранение товара, без искажений",
};

export function videoMotionIntentFallback(
  motionPreset: VideoMotionPresetId
): string {
  return MOTION_INTENT_FALLBACK_RU[motionPreset] ?? MOTION_INTENT_FALLBACK_RU["subtle-motion"];
}

export function resolveVideoGenerationIntent(
  normalizedUserIntent: string,
  motionPreset: VideoMotionPresetId,
  minLength: number
): string {
  const trimmed = normalizedUserIntent.trim();
  if (trimmed.length >= minLength) return trimmed;
  return videoMotionIntentFallback(motionPreset);
}
