import type { MetadataRoute } from "next";
import { siteName, siteShortName, siteUrl } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteShortName,
    description:
      "AI product photo and video studio for marketplaces, catalogs, and social commerce.",
    start_url: `${siteUrl.replace(/\/$/, "")}/ru`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
