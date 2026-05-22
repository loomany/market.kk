import type { VideoGenerateRequest } from "@/lib/ai/videoSchemas";
import { videoFalCostUsd } from "@/lib/ai/generationCostPricing";

export const VIDEO_PROVIDERS = [
  "kling",
  "kling-motion",
  "minimax",
  "veo",
] as const;
export type VideoProviderId = (typeof VIDEO_PROVIDERS)[number];

export type VideoVariantId =
  | "kling-v3-standard"
  | "kling-v3-pro"
  | "kling-v2.6-pro"
  | "kling-v1.5-pro"
  | "kling-v2.6-motion-control"
  | "kling-v2.6-motion-pro"
  | "kling-v3-motion-standard"
  | "minimax-hailuo-02"
  | "veo-3.1"
  | "veo-3.1-fast"
  | "veo-3-fast";

/** @deprecated Use VideoVariantId */
export type VideoModelKey = VideoVariantId;

export type VideoQuality = "fast" | "balanced" | "high" | "ultra";
export type VideoAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";
export type VideoMotionPreset =
  | "subtle-motion"
  | "model-turn"
  | "camera-push"
  | "continue-scene"
  | "product-fidelity";

export type KlingMotionOrientation = "image" | "video";

export type VideoVariantCapabilities = {
  supportsAspectRatio: boolean;
  supportsDuration: boolean;
  supportsQuality: boolean;
  supportsMotionPreset: boolean;
  requiresReferenceVideo: boolean;
  supportsMotionOrientation: boolean;
  /** Fal `negative_prompt` — Kling i2v, Veo i2v (not MiniMax, not Motion Control). */
  supportsNegativePrompt: boolean;
  /** Fal `generate_audio` — Kling 3 / 2.6 Pro, all Veo (not 1.5, MiniMax, Motion). */
  supportsNativeAudio: boolean;
  /** Fal `keep_original_sound` — Kling Motion Control only. */
  supportsReferenceVideoSound: boolean;
};

export function variantHasAdvancedVideoOptions(
  variantId: VideoVariantId
): boolean {
  const c = getVideoVariant(variantId).capabilities;
  return (
    c.supportsNegativePrompt ||
    c.supportsNativeAudio ||
    c.supportsReferenceVideoSound
  );
}

const KLING_DEFAULT_NEGATIVE = "blur, distort, and low quality";

function resolveKlingNegativePrompt(
  input: VideoGenerateRequest
): string | undefined {
  if (!input.useNegativePrompt) return undefined;
  const custom = input.negativePrompt?.trim();
  if (!custom) {
    return `${KLING_DEFAULT_NEGATIVE}. ${PRODUCT_NEGATIVE}`;
  }
  return `${custom}. ${KLING_DEFAULT_NEGATIVE}. ${PRODUCT_NEGATIVE}`;
}

function resolveVeoNegativePrompt(
  input: VideoGenerateRequest
): string | undefined {
  if (!input.useNegativePrompt) return undefined;
  const custom = input.negativePrompt?.trim();
  if (!custom) return PRODUCT_NEGATIVE;
  return `${custom}. ${PRODUCT_NEGATIVE}`;
}

export type VideoVariantConfig = {
  id: VideoVariantId;
  provider: VideoProviderId;
  falEndpoint: string;
  labelKey: VideoVariantId;
  capabilities: VideoVariantCapabilities;
  durationOptions: number[];
  aspectRatioOptions: VideoAspectRatio[];
  qualityOptions: { id: VideoQuality; label: string; mapperValue: string }[];
  pricePerSecondUsd?: number;
  realSchemaVerified: boolean;
  inputMapper: (input: VideoGenerateRequest) => Record<string, unknown>;
};

function addMotionPreset(prompt: string, motionPreset: VideoMotionPreset) {
  const presets: Record<VideoMotionPreset, string> = {
    "subtle-motion":
      "Subtle natural motion, stable product details, no product deformation.",
    "model-turn":
      "The model turns slowly, camera stays stable, garment details remain accurate.",
    "camera-push":
      "Slow camera push-in, premium catalog lighting, preserve product shape and texture.",
    "continue-scene":
      "Continue the scene naturally with gentle camera movement and no sudden cuts.",
    "product-fidelity":
      "Keep the exact product unchanged: color, shape, pattern, edges, lace, logo-free image.",
  };
  return `${prompt.trim()} ${presets[motionPreset]}`.trim();
}

const PRODUCT_NEGATIVE =
  "Do not alter product color, shape, lace, pattern, garment edges, jewelry shape, logos, or labels. No text, no watermark.";

export const DEFAULT_VARIANT_BY_PROVIDER: Record<VideoProviderId, VideoVariantId> =
  {
    kling: "kling-v3-standard",
    "kling-motion": "kling-v2.6-motion-control",
    minimax: "minimax-hailuo-02",
    veo: "veo-3.1",
  };

export const KLING_MOTION_VARIANT_IDS = [
  "kling-v2.6-motion-control",
  "kling-v2.6-motion-pro",
  "kling-v3-motion-standard",
] as const satisfies readonly VideoVariantId[];

export function variantRequiresReferenceVideo(variantId: VideoVariantId): boolean {
  return getVideoVariant(variantId).capabilities.requiresReferenceVideo;
}

export const VARIANTS_BY_PROVIDER: Record<VideoProviderId, VideoVariantId[]> = {
  kling: [
    "kling-v3-standard",
    "kling-v3-pro",
    "kling-v2.6-pro",
    "kling-v1.5-pro",
  ],
  "kling-motion": [...KLING_MOTION_VARIANT_IDS],
  minimax: ["minimax-hailuo-02"],
  veo: ["veo-3.1", "veo-3.1-fast", "veo-3-fast"],
};

function mapVeoAspectRatio(aspectRatio: VideoAspectRatio): "16:9" | "9:16" | "auto" {
  if (aspectRatio === "16:9" || aspectRatio === "9:16") return aspectRatio;
  return "9:16";
}

function mapVeoResolution(
  quality: VideoQuality,
  allow4k: boolean
): "720p" | "1080p" | "4k" {
  if (allow4k && quality === "ultra") return "4k";
  if (quality === "high") return "1080p";
  return "720p";
}

function buildVeoImageToVideoInput(
  input: VideoGenerateRequest,
  allow4k: boolean
): Record<string, unknown> {
  return {
    image_url: input.sourceImageUrl,
    prompt: addMotionPreset(input.prompt, input.motionPreset),
    duration: `${input.durationSeconds}s`,
    aspect_ratio: mapVeoAspectRatio(input.aspectRatio),
    resolution: mapVeoResolution(input.quality, allow4k),
    generate_audio: Boolean(input.generateAudio),
    ...(resolveVeoNegativePrompt(input)
      ? { negative_prompt: resolveVeoNegativePrompt(input) }
      : {}),
  };
}

function buildKlingV3ImageToVideoInput(
  input: VideoGenerateRequest
): Record<string, unknown> {
  const negative = resolveKlingNegativePrompt(input);
  return {
    prompt: addMotionPreset(input.prompt, input.motionPreset),
    start_image_url: input.sourceImageUrl,
    duration: String(input.durationSeconds),
    generate_audio: Boolean(input.generateAudio),
    ...(negative ? { negative_prompt: negative } : {}),
    cfg_scale: 0.5,
  };
}

function buildKlingMotionControlInput(
  input: VideoGenerateRequest
): Record<string, unknown> {
  if (!input.referenceVideoUrl?.trim()) {
    throw new Error("REFERENCE_VIDEO_REQUIRED");
  }
  return {
    prompt: input.prompt.trim() || "Natural motion, preserve product details.",
    image_url: input.sourceImageUrl,
    video_url: input.referenceVideoUrl.trim(),
    character_orientation: input.characterOrientation ?? "image",
    keep_original_sound: Boolean(input.keepReferenceSound),
  };
}

export const VIDEO_VARIANTS: Record<VideoVariantId, VideoVariantConfig> = {
  "kling-v3-standard": {
    id: "kling-v3-standard",
    provider: "kling",
    falEndpoint: "fal-ai/kling-video/v3/standard/image-to-video",
    labelKey: "kling-v3-standard",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: true,
      supportsQuality: false,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [5, 8, 10, 12, 15],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.084,
    realSchemaVerified: true,
    inputMapper: buildKlingV3ImageToVideoInput,
  },
  "kling-v3-pro": {
    id: "kling-v3-pro",
    provider: "kling",
    falEndpoint: "fal-ai/kling-video/v3/pro/image-to-video",
    labelKey: "kling-v3-pro",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: true,
      supportsQuality: false,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [5, 8, 10, 12, 15],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.112,
    realSchemaVerified: true,
    inputMapper: buildKlingV3ImageToVideoInput,
  },
  "kling-v2.6-pro": {
    id: "kling-v2.6-pro",
    provider: "kling",
    falEndpoint: "fal-ai/kling-video/v2.6/pro/image-to-video",
    labelKey: "kling-v2.6-pro",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: true,
      supportsQuality: false,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [5, 10],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.07,
    realSchemaVerified: true,
    inputMapper: (input) => {
      const negative = resolveKlingNegativePrompt(input);
      return {
        prompt: addMotionPreset(input.prompt, input.motionPreset),
        start_image_url: input.sourceImageUrl,
        duration: String(input.durationSeconds),
        generate_audio: Boolean(input.generateAudio),
        ...(negative ? { negative_prompt: negative } : {}),
      };
    },
  },
  "kling-v1.5-pro": {
    id: "kling-v1.5-pro",
    provider: "kling",
    falEndpoint: "fal-ai/kling-video/v1.5/pro/image-to-video",
    labelKey: "kling-v1.5-pro",
    capabilities: {
      supportsAspectRatio: true,
      supportsDuration: true,
      supportsQuality: false,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: false,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [5, 10],
    aspectRatioOptions: ["1:1", "9:16", "16:9"],
    qualityOptions: [],
    pricePerSecondUsd: 0.095,
    realSchemaVerified: true,
    inputMapper: (input) => {
      const negative = resolveKlingNegativePrompt(input);
      return {
        prompt: addMotionPreset(input.prompt, input.motionPreset),
        image_url: input.sourceImageUrl,
        duration: String(input.durationSeconds),
        aspect_ratio: input.aspectRatio,
        ...(negative ? { negative_prompt: negative } : {}),
        cfg_scale: 0.5,
      };
    },
  },
  "kling-v2.6-motion-control": {
    id: "kling-v2.6-motion-control",
    provider: "kling-motion",
    falEndpoint: "fal-ai/kling-video/v2.6/standard/motion-control",
    labelKey: "kling-v2.6-motion-control",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: false,
      supportsQuality: false,
      supportsMotionPreset: false,
      requiresReferenceVideo: true,
      supportsMotionOrientation: true,
      supportsNegativePrompt: false,
      supportsNativeAudio: false,
      supportsReferenceVideoSound: true,
    },
    durationOptions: [],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.07,
    realSchemaVerified: true,
    inputMapper: buildKlingMotionControlInput,
  },
  "kling-v2.6-motion-pro": {
    id: "kling-v2.6-motion-pro",
    provider: "kling-motion",
    falEndpoint: "fal-ai/kling-video/v2.6/pro/motion-control",
    labelKey: "kling-v2.6-motion-pro",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: false,
      supportsQuality: false,
      supportsMotionPreset: false,
      requiresReferenceVideo: true,
      supportsMotionOrientation: true,
      supportsNegativePrompt: false,
      supportsNativeAudio: false,
      supportsReferenceVideoSound: true,
    },
    durationOptions: [],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.112,
    realSchemaVerified: true,
    inputMapper: buildKlingMotionControlInput,
  },
  "kling-v3-motion-standard": {
    id: "kling-v3-motion-standard",
    provider: "kling-motion",
    falEndpoint: "fal-ai/kling-video/v3/standard/motion-control",
    labelKey: "kling-v3-motion-standard",
    capabilities: {
      supportsAspectRatio: false,
      supportsDuration: false,
      supportsQuality: false,
      supportsMotionPreset: false,
      requiresReferenceVideo: true,
      supportsMotionOrientation: true,
      supportsNegativePrompt: false,
      supportsNativeAudio: false,
      supportsReferenceVideoSound: true,
    },
    durationOptions: [],
    aspectRatioOptions: [],
    qualityOptions: [],
    pricePerSecondUsd: 0.126,
    realSchemaVerified: true,
    inputMapper: buildKlingMotionControlInput,
  },
  "minimax-hailuo-02": {
    id: "minimax-hailuo-02",
    provider: "minimax",
    falEndpoint: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    labelKey: "minimax-hailuo-02",
    capabilities: {
      supportsAspectRatio: true,
      supportsDuration: false,
      supportsQuality: true,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: false,
      supportsNativeAudio: false,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [6],
    aspectRatioOptions: ["1:1", "4:5", "9:16", "16:9"],
    qualityOptions: [
      { id: "fast", label: "512P", mapperValue: "512P" },
      { id: "balanced", label: "768P", mapperValue: "768P" },
    ],
    pricePerSecondUsd: 0.045,
    realSchemaVerified: true,
    inputMapper: (input) => {
      const resolution =
        input.quality === "fast" ? "512P" : "768P";
      return {
        image_url: input.sourceImageUrl,
        prompt: addMotionPreset(input.prompt, input.motionPreset),
        duration: 6,
        resolution,
        prompt_optimizer: true,
      };
    },
  },
  "veo-3.1": {
    id: "veo-3.1",
    provider: "veo",
    falEndpoint: "fal-ai/veo3.1/image-to-video",
    labelKey: "veo-3.1",
    capabilities: {
      supportsAspectRatio: true,
      supportsDuration: true,
      supportsQuality: true,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [4, 6, 8],
    aspectRatioOptions: ["9:16", "16:9"],
    qualityOptions: [
      { id: "balanced", label: "720p", mapperValue: "720p" },
      { id: "high", label: "1080p", mapperValue: "1080p" },
      { id: "ultra", label: "4K", mapperValue: "4k" },
    ],
    pricePerSecondUsd: 0.2,
    realSchemaVerified: true,
    inputMapper: (input) => buildVeoImageToVideoInput(input, true),
  },
  "veo-3.1-fast": {
    id: "veo-3.1-fast",
    provider: "veo",
    falEndpoint: "fal-ai/veo3.1/fast/image-to-video",
    labelKey: "veo-3.1-fast",
    capabilities: {
      supportsAspectRatio: true,
      supportsDuration: true,
      supportsQuality: true,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [4, 6, 8],
    aspectRatioOptions: ["9:16", "16:9"],
    qualityOptions: [
      { id: "balanced", label: "720p", mapperValue: "720p" },
      { id: "high", label: "1080p", mapperValue: "1080p" },
      { id: "ultra", label: "4K", mapperValue: "4k" },
    ],
    pricePerSecondUsd: 0.1,
    realSchemaVerified: true,
    inputMapper: (input) => buildVeoImageToVideoInput(input, true),
  },
  "veo-3-fast": {
    id: "veo-3-fast",
    provider: "veo",
    falEndpoint: "fal-ai/veo3/fast/image-to-video",
    labelKey: "veo-3-fast",
    capabilities: {
      supportsAspectRatio: true,
      supportsDuration: true,
      supportsQuality: true,
      supportsMotionPreset: true,
      requiresReferenceVideo: false,
      supportsMotionOrientation: false,
      supportsNegativePrompt: true,
      supportsNativeAudio: true,
      supportsReferenceVideoSound: false,
    },
    durationOptions: [4, 6, 8],
    aspectRatioOptions: ["9:16", "16:9"],
    qualityOptions: [
      { id: "balanced", label: "720p", mapperValue: "720p" },
      { id: "high", label: "1080p", mapperValue: "1080p" },
    ],
    pricePerSecondUsd: 0.1,
    realSchemaVerified: true,
    inputMapper: (input) => buildVeoImageToVideoInput(input, false),
  },
};

export function getVideoVariant(variantId: VideoVariantId): VideoVariantConfig {
  return VIDEO_VARIANTS[variantId];
}

export function getProviderForVariant(variantId: VideoVariantId): VideoProviderId {
  return VIDEO_VARIANTS[variantId].provider;
}

export function clampVideoSettingsToVariant(
  variantId: VideoVariantId,
  settings: {
    durationSeconds: number;
    aspectRatio: VideoAspectRatio;
    quality: VideoQuality;
  }
): { durationSeconds: number; aspectRatio: VideoAspectRatio; quality: VideoQuality } {
  const v = getVideoVariant(variantId);
  let durationSeconds = settings.durationSeconds;
  let aspectRatio = settings.aspectRatio;
  let quality = settings.quality;

  if (v.capabilities.supportsDuration && v.durationOptions.length > 0) {
    if (!v.durationOptions.includes(durationSeconds)) {
      durationSeconds = v.durationOptions[0]!;
    }
  } else if (v.durationOptions.length > 0) {
    durationSeconds = v.durationOptions[0]!;
  }

  if (v.capabilities.supportsAspectRatio && v.aspectRatioOptions.length > 0) {
    if (!v.aspectRatioOptions.includes(aspectRatio)) {
      aspectRatio = v.aspectRatioOptions.includes("9:16")
        ? "9:16"
        : v.aspectRatioOptions[0]!;
    }
  }

  if (v.capabilities.supportsQuality && v.qualityOptions.length > 0) {
    const ids = v.qualityOptions.map((o) => o.id);
    if (!ids.includes(quality)) {
      quality = ids.includes("balanced")
        ? "balanced"
        : (ids[0] ?? "balanced");
    }
  } else if (v.qualityOptions.length > 0) {
    quality = v.qualityOptions[0]!.id;
  }

  return { durationSeconds, aspectRatio, quality };
}

export function mapSaasQualityToVideoApi(
  variantId: VideoVariantId,
  tier: VideoQuality
): VideoQuality {
  const v = getVideoVariant(variantId);
  const ids = v.qualityOptions.map((o) => o.id);
  if (ids.includes(tier)) return tier;
  if (tier === "fast" && ids.includes("fast")) return "fast";
  if (tier === "high" && ids.includes("high")) return "high";
  if (tier === "ultra" && ids.includes("ultra")) return "ultra";
  return ids.includes("balanced") ? "balanced" : (ids[0] ?? "balanced");
}

export function estimateVideoCostUsd(
  variantId: VideoVariantId,
  durationSeconds: number,
  options?: {
    quality?: VideoQuality;
    generateAudio?: boolean;
    referenceVideoDurationSeconds?: number;
  }
) {
  const v = getVideoVariant(variantId);
  const quality = options?.quality ?? "balanced";
  const generateAudio = Boolean(options?.generateAudio);
  let seconds = durationSeconds;
  if (v.capabilities.supportsDuration && durationSeconds > 0) {
    seconds = durationSeconds;
  } else if (v.durationOptions.length > 0) {
    seconds = v.durationOptions[0] ?? 6;
  } else {
    seconds = options?.referenceVideoDurationSeconds ?? 5;
  }
  return videoFalCostUsd({
    variantId,
    durationSeconds: seconds,
    quality,
    generateAudio,
    referenceVideoDurationSeconds: options?.referenceVideoDurationSeconds,
  });
}

/** Legacy alias */
export const VIDEO_MODELS = VIDEO_VARIANTS;
export function getVideoModel(variantId: VideoVariantId) {
  const v = getVideoVariant(variantId);
  return {
    id: v.falEndpoint,
    label: v.labelKey,
    shortLabel: v.provider,
    qualityOptions: v.qualityOptions,
    durationOptions: v.durationOptions,
    aspectRatioOptions: v.aspectRatioOptions,
    supportsImageToVideo: true,
    supportsPrompt: true,
    supportsNegativePrompt: false,
    supportsCameraControls: false,
    pricingType: "per-second" as const,
    pricePerSecondUsd: v.pricePerSecondUsd,
    recommendedUse: "",
    realSchemaVerified: v.realSchemaVerified,
    inputMapper: v.inputMapper,
  };
}
