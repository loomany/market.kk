import type {
  ImageAspectRatio,
  ImageOutputFormat,
  SaasQualityTier,
} from "@/components/studio/ImageSettingsForm";
import type { VideoAspectRatio } from "@/components/studio/VideoSettingsForm";
import type { VideoMotionPresetId } from "@/components/studio/VideoSettingsForm";
import { formatStudioString, getStudioCopy, type StudioLocale } from "./index";

export function getImageFileFormatOptions(locale: StudioLocale) {
  const f = getStudioCopy(locale).form;
  return [
    {
      value: "png" as ImageOutputFormat,
      label: "PNG",
      description: f.fileFormatPngDesc,
    },
    {
      value: "jpeg" as ImageOutputFormat,
      label: "JPG",
      description: f.fileFormatJpegDesc,
    },
  ];
}

export function getSaasQualityOptions(locale: StudioLocale) {
  const s = getStudioCopy(locale).imageSettings;
  return [
    { value: "fast" as const, label: s.qualityFast },
    { value: "balanced" as const, label: s.qualityBalanced },
    { value: "high" as const, label: s.qualityHigh },
    { value: "ultra" as const, label: s.qualityUltra },
  ];
}

export function getImageFrameFormatOptions(locale: StudioLocale) {
  const s = getStudioCopy(locale).imageSettings;
  return [
    { value: "9:16" as ImageAspectRatio, label: s.aspect9x16 },
    { value: "4:5" as ImageAspectRatio, label: s.aspect4x5 },
    { value: "1:1" as ImageAspectRatio, label: s.aspect1x1 },
    { value: "3:4" as ImageAspectRatio, label: s.aspect3x4 },
    { value: "4:3" as ImageAspectRatio, label: s.aspect4x3 },
    { value: "16:9" as ImageAspectRatio, label: s.aspect16x9 },
  ];
}

export function getVideoFrameFormatOptions(locale: StudioLocale) {
  const s = getStudioCopy(locale).videoSettings;
  return [
    { value: "9:16" as VideoAspectRatio, label: s.aspect9x16 },
    { value: "4:5" as VideoAspectRatio, label: s.aspect4x5 },
    { value: "1:1" as VideoAspectRatio, label: s.aspect1x1 },
    { value: "16:9" as VideoAspectRatio, label: s.aspect16x9 },
  ];
}

export function getVideoMotionPresets(locale: StudioLocale): {
  id: VideoMotionPresetId;
  label: string;
}[] {
  const s = getStudioCopy(locale).videoSettings;
  return [
    { id: "subtle-motion", label: s.motionSubtle },
    { id: "model-turn", label: s.motionTurn },
    { id: "camera-push", label: s.motionPush },
    { id: "product-fidelity", label: s.motionFidelity },
  ];
}

export function formatVideoDurationLabel(
  locale: StudioLocale,
  seconds: number
): string {
  return formatStudioString(getStudioCopy(locale).videoSettings.durationSec, {
    n: seconds,
  });
}
