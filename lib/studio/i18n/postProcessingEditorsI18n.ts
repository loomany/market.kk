import type { ImageEditorId } from "@/lib/ai/imageEnhanceSchemas";
import type { VideoModelKey } from "@/lib/ai/videoModels";
import type { PostProcessingEditor } from "@/lib/studio/postProcessingEditors";
import { getStudioCopy, type StudioLocale } from "./index";

export function getLocalizedVideoEditors(locale: StudioLocale): PostProcessingEditor[] {
  const e = getStudioCopy(locale).postProcessingEditors;
  return [
    {
      id: "kling",
      mode: "video",
      title: e.kling.title,
      description: e.kling.description,
      technicalModel: "fal-ai/kling-video/o3/standard/image-to-video",
      pros: e.kling.pros,
      limitations: e.kling.limitations,
      available: true,
    },
    {
      id: "minimax",
      mode: "video",
      title: e.minimax.title,
      description: e.minimax.description,
      technicalModel: "fal-ai/minimax/hailuo-02/standard/image-to-video",
      pros: e.minimax.pros,
      limitations: e.minimax.limitations,
      available: true,
    },
    {
      id: "veo",
      mode: "video",
      title: e.veo.title,
      description: e.veo.description,
      technicalModel: "fal-ai/veo3.1/image-to-video",
      pros: e.veo.pros,
      limitations: e.veo.limitations,
      available: true,
    },
  ];
}

export function getLocalizedImageEditors(
  locale: StudioLocale,
  input: { mockMode: boolean; paidAiRunsAllowed?: boolean }
): PostProcessingEditor[] {
  const e = getStudioCopy(locale).postProcessingEditors;
  const nanoBase = {
    id: "nano-banana-pro" as const,
    mode: "image" as const,
    title: e.nanoBanana.title,
    technicalModel: "fal-ai/nano-banana-pro/edit",
    pros: e.nanoBanana.pros,
  };
  const fluxBase = {
    id: "flux-kontext-pro" as const,
    mode: "image" as const,
    title: e.flux.title,
    technicalModel: "fal-ai/flux-pro/kontext",
    pros: e.flux.pros,
  };

  if (input.mockMode) {
    return [
      {
        ...nanoBase,
        description: e.nanoBanana.descriptionDemo,
        limitations: e.nanoBanana.limitationsDemo,
        available: true,
      },
      {
        ...fluxBase,
        description: e.flux.descriptionDemo,
        limitations: e.flux.limitationsDemo,
        available: true,
      },
    ];
  }

  if (input.paidAiRunsAllowed) {
    return [
      {
        ...nanoBase,
        description: e.nanoBanana.descriptionReal,
        limitations: e.nanoBanana.limitationsCost,
        available: true,
      },
      {
        ...fluxBase,
        description: e.flux.descriptionReal,
        limitations: e.flux.limitationsReal,
        available: true,
      },
    ];
  }

  return [
    {
      ...nanoBase,
      description: e.nanoBanana.descriptionReal,
      limitations: e.nanoBanana.disabled,
      available: false,
      comingSoon: true,
    },
    {
      ...fluxBase,
      description: e.flux.descriptionReal,
      limitations: e.flux.disabled,
      available: false,
      comingSoon: true,
    },
  ];
}

export type { VideoModelKey, ImageEditorId };
