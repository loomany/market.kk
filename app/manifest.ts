import type { MetadataRoute } from "next";
import { siteName, siteShortName, siteUrl } from "@/lib/seo/site";
import { manifestIcons } from "@/lib/seo/siteIcons";

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
    icons: [...manifestIcons],
  };
}
