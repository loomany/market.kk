import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Public marketing routes are crawlable. Page-level robots metadata controls
 * index/noindex per locale and content readiness (ru/en published vs others).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/studio"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
