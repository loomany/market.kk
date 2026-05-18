export type VideoModelKey = "kling" | "minimax" | "veo";

export type VideoQuality = "fast" | "balanced" | "high";

export type VideoAspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export type VideoMotionPreset =
  | "subtle-motion"
  | "model-turn"
  | "camera-push"
  | "continue-scene"
  | "product-fidelity";

export type VideoModelConfig = {
  id: string;
  label: string;
  shortLabel: string;
  qualityOptions: { id: VideoQuality; label: string; mapperValue: string }[];
  durationOptions: number[];
  aspectRatioOptions: VideoAspectRatio[];
  supportsImageToVideo: boolean;
  supportsPrompt: boolean;
  supportsNegativePrompt: boolean;
  supportsCameraControls: boolean;
  pricingType: "per-second" | "per-video" | "unknown";
  pricePerSecondUsd?: number;
  estimatedFiveSecondCostUsd?: number;
  estimatedTenSecondCostUsd?: number;
  recommendedUse: string;
  realSchemaVerified: boolean;
  inputMapper: (input: {
    sourceImageUrl: string;
    prompt: string;
    quality: VideoQuality;
    durationSeconds: number;
    aspectRatio: VideoAspectRatio;
    motionPreset: VideoMotionPreset;
  }) => Record<string, unknown>;
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

export const VIDEO_MODELS: Record<VideoModelKey, VideoModelConfig> = {
  kling: {
    id: "fal-ai/kling-video/o3/standard/image-to-video",
    label: "Kling O3 Standard",
    shortLabel: "Kling",
    qualityOptions: [
      { id: "balanced", label: "Баланс", mapperValue: "standard" },
      { id: "high", label: "Высокое качество", mapperValue: "standard" },
    ],
    durationOptions: [5, 10, 15],
    aspectRatioOptions: ["1:1", "9:16", "16:9"],
    supportsImageToVideo: true,
    supportsPrompt: true,
    supportsNegativePrompt: false,
    supportsCameraControls: true,
    pricingType: "per-second",
    pricePerSecondUsd: 0.084,
    estimatedFiveSecondCostUsd: 0.42,
    estimatedTenSecondCostUsd: 0.84,
    recommendedUse:
      "Плавное движение модели или товара, когда важна визуальная стабильность.",
    realSchemaVerified: true,
    inputMapper: (input) => ({
      image_url: input.sourceImageUrl,
      prompt: addMotionPreset(input.prompt, input.motionPreset),
      duration: String(input.durationSeconds),
      generate_audio: false,
    }),
  },
  minimax: {
    id: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    label: "MiniMax Hailuo 02 Standard",
    shortLabel: "MiniMax",
    qualityOptions: [
      { id: "fast", label: "Быстро", mapperValue: "512P" },
      { id: "balanced", label: "Баланс", mapperValue: "768P" },
    ],
    durationOptions: [6],
    aspectRatioOptions: ["1:1", "4:5", "9:16", "16:9"],
    supportsImageToVideo: true,
    supportsPrompt: true,
    supportsNegativePrompt: false,
    supportsCameraControls: true,
    pricingType: "per-second",
    pricePerSecondUsd: 0.045,
    estimatedFiveSecondCostUsd: 0.225,
    estimatedTenSecondCostUsd: undefined,
    recommendedUse:
      "Экономичные короткие ролики, где достаточно 512p/768p качества.",
    realSchemaVerified: true,
    inputMapper: (input) => ({
      image_url: input.sourceImageUrl,
      prompt: addMotionPreset(input.prompt, input.motionPreset),
      duration: 6,
      resolution: input.quality === "fast" ? "512P" : "768P",
      prompt_optimizer: true,
    }),
  },
  veo: {
    id: "fal-ai/veo3.1/image-to-video",
    label: "Veo 3.1 Image to Video",
    shortLabel: "Veo",
    qualityOptions: [
      { id: "high", label: "Максимальное качество", mapperValue: "default" },
    ],
    durationOptions: [4, 6, 8],
    aspectRatioOptions: ["16:9", "9:16"],
    supportsImageToVideo: true,
    supportsPrompt: true,
    supportsNegativePrompt: false,
    supportsCameraControls: true,
    pricingType: "per-second",
    pricePerSecondUsd: 0.2,
    estimatedFiveSecondCostUsd: 1,
    estimatedTenSecondCostUsd: 2,
    recommendedUse:
      "Премиальные ролики, но real schema нужно подтвердить перед запуском.",
    realSchemaVerified: true,
    inputMapper: (input) => ({
      image_url: input.sourceImageUrl,
      prompt: addMotionPreset(input.prompt, input.motionPreset),
      duration: `${input.durationSeconds}s`,
      aspect_ratio:
        input.aspectRatio === "16:9" || input.aspectRatio === "9:16"
          ? input.aspectRatio
          : "auto",
      resolution: "720p",
      generate_audio: false,
      negative_prompt:
        "Do not alter product color, shape, lace, pattern, garment edges, jewelry shape, logos, or labels. No text, no watermark.",
    }),
  },
};

export function getVideoModel(modelKey: VideoModelKey) {
  return VIDEO_MODELS[modelKey];
}

export function estimateVideoCostUsd(
  modelKey: VideoModelKey,
  durationSeconds: number
) {
  const model = getVideoModel(modelKey);
  if (model.pricePerSecondUsd) {
    return Number((model.pricePerSecondUsd * durationSeconds).toFixed(4));
  }
  return undefined;
}
