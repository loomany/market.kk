import {
  FAL_MODEL_ASPECT_RATIOS,
  type FalModelAspectRatio,
} from "@/lib/ai/modelOutputSizes";

export const DEFAULT_PREVIEW_ASPECT: FalModelAspectRatio = "3:4";

export function falAspectToNumber(ratio: FalModelAspectRatio): number {
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h) return 3 / 4;
  return w / h;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function formatAspectBadgeFromDimensions(
  width: number,
  height: number
): string {
  if (width <= 0 || height <= 0) return DEFAULT_PREVIEW_ASPECT;
  const g = gcd(width, height);
  return `${Math.round(width / g)}:${Math.round(height / g)}`;
}

export function nearestFalAspectRatio(ratio: number): FalModelAspectRatio {
  let best: FalModelAspectRatio = DEFAULT_PREVIEW_ASPECT;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const id of FAL_MODEL_ASPECT_RATIOS) {
    const diff = Math.abs(falAspectToNumber(id) - ratio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = id;
    }
  }
  return best;
}

export type PreviewAspectState = {
  /** CSS aspect-ratio value (width / height) */
  ratio: number;
  badge: string;
};

export function previewAspectFromFal(ratio: FalModelAspectRatio): PreviewAspectState {
  return { ratio: falAspectToNumber(ratio), badge: ratio };
}

export function previewAspectFromDimensions(
  width: number,
  height: number
): PreviewAspectState {
  if (width <= 0 || height <= 0) {
    return previewAspectFromFal(DEFAULT_PREVIEW_ASPECT);
  }
  return {
    ratio: width / height,
    badge: formatAspectBadgeFromDimensions(width, height),
  };
}

export function measureImageAspect(url: string): Promise<PreviewAspectState> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(previewAspectFromDimensions(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      resolve(previewAspectFromFal(DEFAULT_PREVIEW_ASPECT));
    };
    img.src = url;
  });
}
