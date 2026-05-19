import type { MetadataRoute } from "next";

/**
 * Site-wide noindex.
 *
 * Disallows the whole site for every user agent. Pair this with the
 * `metadata.robots = { index: false, follow: false, ... }` set on both
 * root layouts (`app/(default)/layout.tsx`, `app/[locale]/layout.tsx`) so
 * even agents that ignore robots.txt still see the meta-robots negative.
 *
 * To re-enable indexing in the future: restore the previous allow/disallow
 * rules and add back the `sitemap` + `host` properties.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
