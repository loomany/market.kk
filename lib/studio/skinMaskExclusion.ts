/** Heuristic skin-tone exclusion inside a garment mask (model-on-body photos). */

function isLikelySkinPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 40 || min > 240) return false;

  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && max - min > 15;
}

/**
 * Zero mask alpha on pixels that look like bare skin (hands, belly, thighs).
 */
export function excludeSkinFromMaskAlpha(
  imageData: ImageData,
  maskAlpha: Uint8ClampedArray
): void {
  const { width, height, data } = imageData;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const o = i * 4;
      if (maskAlpha[i]! < 32) continue;
      if (isLikelySkinPixel(data[o]!, data[o + 1]!, data[o + 2]!)) {
        maskAlpha[i] = 0;
      }
    }
  }
}
