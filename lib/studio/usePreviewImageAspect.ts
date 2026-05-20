"use client";

import { useEffect, useState } from "react";
import type { FalModelAspectRatio } from "@/lib/ai/modelOutputSizes";
import {
  DEFAULT_PREVIEW_ASPECT,
  measureImageAspect,
  previewAspectFromFal,
  type PreviewAspectState,
} from "@/lib/studio/previewImageAspect";

export function usePreviewImageAspect(
  url: string | null | undefined,
  fallback: FalModelAspectRatio = DEFAULT_PREVIEW_ASPECT
): PreviewAspectState {
  const [aspect, setAspect] = useState<PreviewAspectState>(() =>
    previewAspectFromFal(fallback)
  );

  useEffect(() => {
    if (!url) {
      setAspect(previewAspectFromFal(fallback));
      return;
    }

    let cancelled = false;
    void measureImageAspect(url).then((measured) => {
      if (!cancelled) setAspect(measured);
    });

    return () => {
      cancelled = true;
    };
  }, [url, fallback]);

  return aspect;
}
