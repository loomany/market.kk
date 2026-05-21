import type { Metadata } from "next";

/** Stable icon URLs for tabs, mobile home screen, Google/Yandex SERP favicons. */
export const siteIconAssets = {
  favicon: "/favicon.ico",
  icon16: "/icon-16.png",
  icon32: "/icon-32.png",
  icon48: "/icon-48.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  appleTouch: "/apple-touch-icon.png",
} as const;

export const siteLogoUrl = siteIconAssets.icon512;

export function createSiteIconsMetadata(): Pick<Metadata, "icons"> {
  return {
    icons: {
      icon: [
        { url: siteIconAssets.favicon, sizes: "any" },
        { url: siteIconAssets.icon16, sizes: "16x16", type: "image/png" },
        { url: siteIconAssets.icon32, sizes: "32x32", type: "image/png" },
        { url: siteIconAssets.icon48, sizes: "48x48", type: "image/png" },
        { url: siteIconAssets.icon192, sizes: "192x192", type: "image/png" },
        { url: siteIconAssets.icon512, sizes: "512x512", type: "image/png" },
      ],
      shortcut: [siteIconAssets.favicon],
      apple: [
        {
          url: siteIconAssets.appleTouch,
          sizes: "180x180",
          type: "image/png",
        },
      ],
      other: [
        {
          rel: "mask-icon",
          url: siteIconAssets.icon512,
          color: "#0f766e",
        },
      ],
    },
  };
}

export const manifestIcons = [
  {
    src: siteIconAssets.icon192,
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: siteIconAssets.icon512,
    sizes: "512x512",
    type: "image/png",
  },
  {
    src: siteIconAssets.icon512,
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
] as const;
