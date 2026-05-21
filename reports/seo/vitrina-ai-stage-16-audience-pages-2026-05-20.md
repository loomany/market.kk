# Stage 16 — Audience SEO pages (RU / EN / KK)

**Date:** 2026-05-20  
**Scope:** Public marketing / SEO only (no Studio, auth, billing).

## Audit summary

| Item | Choice |
|------|--------|
| Landing block | `components/landing/SaasLanding.tsx` → `#audiences` |
| Data | `data/seo/audiencePages.ts` (generated) |
| Generator | `scripts/seo/build-audience-pages.mjs` |
| Route | `app/[locale]/(marketing)/[hub]/[slug]/page.tsx` |
| UI | `components/seo-pages/AudienceSeoPage.tsx` |
| Hub segments | RU `dlya-kogo`, EN `who-it-is-for`, KK `kimge` |
| Index / hreflang | `lib/seo/audiencePagePaths.ts` + `KK_APPROVED_AUDIENCE_IDS` |
| Sitemap | `app/sitemap.ts` (indexable only) |

Pattern matches existing `use-cases/[slug]` and `platforms/[slug]` pages; separate hub segment avoids collision with `app/[locale]/(marketing)/[slug]/page.tsx` static feature slugs.

## Pages (30)

- **RU:** `/ru/dlya-kogo/{slug}` × 10  
- **EN:** `/en/who-it-is-for/{slug}` × 10  
- **KK:** `/kk/kimge/{slug}` × 10  

All `status: published`. KK index via `KK_APPROVED_AUDIENCE_IDS` (all 10 approved).

## Landing

Chips in «Для кого» are `<Link>` via `getAudienceChips(locale)` — hover/focus, locale-specific URLs.

## Checks

```bash
npm run audience:build          # regenerate content
npm run check:seo:audience-pages
npx tsc --noEmit
npm run build
```

## Regenerate content

After editing `scripts/seo/build-audience-pages.mjs`:

```bash
npm run audience:build
```

Do not hand-edit `data/seo/audiencePages.ts`.
