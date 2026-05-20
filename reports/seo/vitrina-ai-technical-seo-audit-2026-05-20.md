# Vitrina AI — Technical SEO Audit (Stage 0)

**Date:** 2026-05-20

---

## Metadata

| Check | Status | Notes |
|-------|--------|-------|
| Unique titles per page | ⚠️ Partial | Template pages share patterns; suffix “— Vitrina AI Studio” common |
| Unique meta descriptions | ⚠️ Partial | Platform/use-case templates formulaic |
| H1 one per page | ✅ | Single H1 in audited templates |
| H2/H3 hierarchy | ✅ | Logical in blog + landing |
| Empty title/description | ✅ None on live pages | Draft blogs N/A (404) |
| Title too long | ⚠️ Some | Home H1 used as title — long but acceptable |
| Description too short | ⚠️ Thin pages | Static SEO ~55+ chars met; quality low |
| Duplicate titles across locales | ❌ | EN duplicates on 18 locales same title |

---

## Indexing

| Asset | Status | Detail |
|-------|--------|--------|
| robots.txt | ❌ **Blocks all** | `Disallow: /` for `*` |
| robots meta (layout) | ❌ | `index: false, follow: false, nocache: true` |
| robots meta (page-level) | ⚠️ | `createSeoMetadata` can set index true, **overridden by layout** in practice |
| sitemap.xml | ⚠️ Built | ru/en URLs, quality-gated; **not linked in robots** |
| sitemap locales | ru, en only | Correct policy for now |
| sitemap blog | Published only | 16 URLs |
| lastmod | Static `2026-05-18` | Should be dynamic per page on publish |
| localhost URLs | ⚠️ Risk | If `NEXT_PUBLIC_SITE_URL` unset in prod |
| staging URLs | ⚠️ Risk | Same env dependency |
| 404 in sitemap | ✅ None detected | Draft blogs excluded |
| noindex in sitemap | ✅ | qualityGate excludes |

**Critical:** Site is intentionally noindex. Page-level `shouldIndexPage` logic is well-designed for future enablement.

---

## Canonical

| Check | Status |
|-------|--------|
| Per-page canonical path | ✅ `alternates.canonical` |
| Trailing slash policy | Consistent no trailing slash |
| Cross-locale canonical conflicts | None — each locale self-canonical |
| HTTP vs HTTPS | Depends on `NEXT_PUBLIC_SITE_URL` |

---

## hreflang

| Check | Status |
|-------|--------|
| Present on pages | ✅ via `buildLanguageAlternates` |
| x-default | ✅ → ru |
| All locales listed | ⚠️ 20 locales even when content not translated |
| Sitemap hreflang | ru/en only — **mismatch** with page head |
| Reciprocal links | Assumed via symmetric map — verify after trimming locales |

---

## Internal linking

| Check | Status |
|-------|--------|
| Breadcrumbs | ✅ JsonLd on inner pages |
| Blog → landing/use cases | ✅ in published articles |
| Landing → features/platforms/blog | ✅ |
| Footer links | ✅ SaasFooter columns |
| CTA → /studio | ✅ widespread |
| Broken internal links | ⚠️ `/{locale}/cost` if linked anywhere |
| Language switcher | ❌ drops path |

---

## Schema.org

| Type | Present | Quality |
|------|---------|---------|
| Organization | ✅ layout | Minimal; RU description only |
| WebSite | ✅ layout | inLanguage ru/en only |
| SoftwareApplication | ✅ layout | price $0 — OK for demo |
| WebPage | ✅ per page | Good |
| FAQPage | ✅ landing, blog, platforms | Home FAQ questions artificial |
| BreadcrumbList | ✅ inner pages | Good |
| BlogPosting | ✅ blog articles | Good |
| Service | ✅ feature static pages | Good |
| Product | ❌ N/A | SaaS — not needed |
| HowTo | ❌ | Could add for how-to blogs later |
| ImageObject | ❌ | Missing |

---

## Open Graph / Twitter

| Tag | Status |
|-----|--------|
| og:title | ✅ from metadata |
| og:description | ✅ |
| og:url | ✅ |
| og:image | ❌ **Missing** |
| og:locale | ❌ Not set |
| twitter:card | summary_large_image | ⚠️ no image |
| Locale-specific OG | Partial (follows page lang) |

---

## Performance SEO (static review)

| Check | Status | Notes |
|-------|--------|-------|
| Font loading | ✅ | Inter `display: swap` |
| LCP risk | ⚠️ | Hero demo images unoptimized SVG/img |
| Image width/height | ⚠️ | Hero uses aspect ratio class; some img without explicit dims |
| Lazy loading | ⚠️ | Not explicit on below-fold |
| CLS | Low risk | Simple layout |
| Mobile viewport | ✅ | Tailwind responsive |
| Heavy JS | ⚠️ | Studio not in scope; landing moderate |
| HTML size | ✅ Reasonable | Data-driven pages SSG-friendly |

---

## Verification / analytics

| Item | Status |
|------|--------|
| Google Search Console | Env placeholder `NEXT_PUBLIC_GSC_VERIFICATION` |
| Yandex Webmaster | Env placeholder |
| Bing | Env placeholder |
| GA / Yandex Metrika | Empty — disabled |

---

## llms.txt / IndexNow

- `/llms.txt` and `/llms-full.txt` — good for AI discovery
- IndexNow disabled (`INDEXNOW_ENABLED=false`) — enable after indexation go-live

---

## Technical P0/P1 summary

**P0:** robots block, siteUrl placeholder, missing og:image/favicon, hreflang/sitemap mismatch  
**P1:** static lastmod, artificial FAQ schema, EN duplicate titles 18×, language switcher path  
**P2:** HowTo schema, dynamic OG locale alternates, image optimization pass
