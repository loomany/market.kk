export type MockResultImage = {
  id: string;
  url: string;
  label: string;
};

export type MockGenerationResult = {
  images: MockResultImage[];
  seed: number;
  provider: "mock";
};

const MOCK_IMAGES: MockResultImage[] = [
  {
    id: "mock-1",
    url: "/demo/tryon-result-1.svg",
    label: "Вариант 1",
  },
  {
    id: "mock-2",
    url: "/demo/tryon-result-2.svg",
    label: "Вариант 2",
  },
  {
    id: "mock-3",
    url: "/demo/tryon-result-1.svg",
    label: "Вариант 3",
  },
  {
    id: "mock-4",
    url: "/demo/tryon-result-2.svg",
    label: "Вариант 4",
  },
];

export function getMockTryOnResults(
  numSamples: number,
  seed = 42
): MockGenerationResult {
  const count = Math.min(Math.max(numSamples, 1), 4);
  const offset = seed % MOCK_IMAGES.length;
  const images = Array.from({ length: count }, (_, i) => {
    const src = MOCK_IMAGES[(offset + i) % MOCK_IMAGES.length];
    return { ...src, id: `${src.id}-s${seed}-${i}` };
  });
  return { images, seed, provider: "mock" };
}

export const MOCK_MODEL_IMAGE =
  "/demo/model-full-body.svg";

export const MOCK_PRODUCT_IMAGE =
  "/demo/product-reference.svg";

/** Demo PNG for mock background removal (public, no user data). */
export const MOCK_BACKGROUND_REMOVED_IMAGE =
  "/demo/background-removed.svg";

export const MOCK_PRODUCT_SHOT_IMAGES = [
  {
    url: "/demo/product-shot-jewelry.svg",
  },
  {
    url: "/demo/product-shot-accessory.svg",
  },
  {
    url: "/demo/product-shot-jewelry.svg",
  },
  {
    url: "/demo/product-shot-accessory.svg",
  },
];
