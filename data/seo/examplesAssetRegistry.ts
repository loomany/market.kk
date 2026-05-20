/**
 * Audit registry of public assets relevant to SEO examples (Stage 12).
 * Studio mock SVGs are NOT approved for marketing before/after.
 */

export type AssetSafety = "safe" | "unknown" | "unsafe";

export type ExamplesAssetRecord = {
  path: string;
  type: string;
  bytes: number;
  usedBy: string;
  source: string;
  safeForPublic: boolean;
  risk: AssetSafety;
  recommendedUse: string;
};

/** Static audit — update when files change. */
export const examplesAssetRegistry: ExamplesAssetRecord[] = [
  {
    path: "/og/vitrina-ai-og.png",
    type: "image/png",
    bytes: 1109981,
    usedBy: "default OG / metadata",
    source: "project branding asset (verify license with owner)",
    safeForPublic: true,
    risk: "unknown",
    recommendedUse: "OG/social only — not before/after examples",
  },
  {
    path: "/icon-192.png",
    type: "image/png",
    bytes: 1126103,
    usedBy: "PWA manifest",
    source: "project icon (verify license with owner)",
    safeForPublic: true,
    risk: "unknown",
    recommendedUse: "icons only",
  },
  {
    path: "/icon-512.png",
    type: "image/png",
    bytes: 1126103,
    usedBy: "PWA manifest",
    source: "project icon (verify license with owner)",
    safeForPublic: true,
    risk: "unknown",
    recommendedUse: "icons only",
  },
  {
    path: "/apple-touch-icon.png",
    type: "image/png",
    bytes: 1126103,
    usedBy: "apple-touch-icon",
    source: "project icon (verify license with owner)",
    safeForPublic: true,
    risk: "unknown",
    recommendedUse: "icons only",
  },
  {
    path: "/demo/product-reference.svg",
    type: "image/svg+xml",
    bytes: 1992,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only — never as SEO before/after",
  },
  {
    path: "/demo/background-removed.svg",
    type: "image/svg+xml",
    bytes: 1116,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/tryon-result-1.svg",
    type: "image/svg+xml",
    bytes: 2399,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/tryon-result-2.svg",
    type: "image/svg+xml",
    bytes: 2167,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/model-full-body.svg",
    type: "image/svg+xml",
    bytes: 1876,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/product-shot-jewelry.svg",
    type: "image/svg+xml",
    bytes: 1106,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/product-shot-accessory.svg",
    type: "image/svg+xml",
    bytes: 1167,
    usedBy: "lib/ai/mockResults.ts (Studio mock)",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "Studio dev/mock only",
  },
  {
    path: "/demo/video-placeholder.svg",
    type: "image/svg+xml",
    bytes: 1381,
    usedBy: "app/api/ai/video/generate mock",
    source: "in-repo placeholder illustration",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "API mock only",
  },
  {
    path: "/file.svg",
    type: "image/svg+xml",
    bytes: 391,
    usedBy: "unused in SEO",
    source: "Next template asset",
    safeForPublic: false,
    risk: "unknown",
    recommendedUse: "do not use for examples",
  },
  {
    path: "/vercel.svg",
    type: "image/svg+xml",
    bytes: 128,
    usedBy: "unused in SEO",
    source: "Vercel brand asset",
    safeForPublic: false,
    risk: "unsafe",
    recommendedUse: "do not use — third-party brand",
  },
];

/** Approved directory for future owned before/after (empty until owner ships files). */
export const EXAMPLES_PUBLIC_ROOT = "/examples";

export function getApprovedExampleAssetPaths(): string[] {
  return examplesAssetRegistry
    .filter((a) => a.path.startsWith(EXAMPLES_PUBLIC_ROOT) && a.safeForPublic)
    .map((a) => a.path);
}
