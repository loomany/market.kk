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
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
    label: "Вариант 1",
  },
  {
    id: "mock-2",
    url: "https://images.unsplash.com/photo-1483985988350-763728e3685b?w=600&h=800&fit=crop",
    label: "Вариант 2",
  },
  {
    id: "mock-3",
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop",
    label: "Вариант 3",
  },
  {
    id: "mock-4",
    url: "https://images.unsplash.com/photo-1496747611176-843222e1e205?w=600&h=800&fit=crop",
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
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=900&fit=crop";

export const MOCK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop";

/** Demo PNG for mock background removal (public, no user data). */
export const MOCK_BACKGROUND_REMOVED_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&bg=00000000";

export const MOCK_PRODUCT_SHOT_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1611652022418-f29a9c7ae320?w=800&h=800&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
  },
  {
    url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4af0?w=800&h=1000&fit=crop",
  },
];
