import {
  VARIANTS_BY_PROVIDER,
  type VideoProviderId,
  type VideoVariantId,
} from "@/lib/ai/videoCatalog";
import { getStudioCopy, type StudioLocale } from "./index";

export function getVideoProviderOptions(locale: StudioLocale) {
  const p = getStudioCopy(locale).videoProviders;
  return (
    [
      { value: "kling" as const, label: p.kling.label, hint: p.kling.hint },
      {
        value: "kling-motion" as const,
        label: p.klingMotion.label,
        hint: p.klingMotion.hint,
      },
      { value: "minimax" as const, label: p.minimax.label, hint: p.minimax.hint },
      { value: "veo" as const, label: p.veo.label, hint: p.veo.hint },
    ] satisfies { value: VideoProviderId; label: string; hint: string }[]
  );
}

export function getVideoVariantOptions(
  locale: StudioLocale,
  provider: VideoProviderId
) {
  const v = getStudioCopy(locale).videoVariants;
  return VARIANTS_BY_PROVIDER[provider].map((id) => ({
    value: id,
    label: v[id].label,
    hint: v[id].hint,
  }));
}

export function getMotionOrientationOptions(locale: StudioLocale) {
  const s = getStudioCopy(locale).videoSettings;
  return [
    { value: "image" as const, label: s.motionOrientImage },
    { value: "video" as const, label: s.motionOrientVideo },
  ];
}

export type { VideoVariantId, VideoProviderId };
