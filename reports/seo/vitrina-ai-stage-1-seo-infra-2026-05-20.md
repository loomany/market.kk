# Vitrina AI — Stage 1 SEO/i18n Infrastructure Report

**Date:** 2026-05-20  
**Scope:** Public SEO/i18n/icons/pricing only. Studio, AI pipeline, auth/billing **not touched**.

---

## Git status at start

Pre-existing dirty files (audit reports only — **not modified by Stage 1 code work except this new report**):

```
M reports/seo/vitrina-ai-*.md (7 audit files from Stage 0)
```

Unrelated product dirty files from prior sessions: **none** at Stage 1 start.

---

## Summary

Stage 1 removes the site-wide indexing block, limits hreflang/sitemap to **ru/en**, adds a **pricing page** at `/ru/cost` and `/en/cost`, fixes **language switcher path preservation**, and adds **icons/manifest/OG** assets.

**Production domain TODO:** `NEXT_PUBLIC_SITE_URL` must be set to the real domain before go-live. Until then, dev uses `http://localhost:3000` and production fallback remains `https://your-domain.com` (not localhost in sitemap when env is set correctly).

---

## Indexing policy (after Stage 1)

| Scope | robots | meta robots | sitemap | hreflang |
|-------|--------|-------------|---------|----------|
| ru published public pages | allow | index,follow | yes | ru + en + x-default→ru |
| en published public pages | allow | index,follow | yes | ru + en + x-default→ru |
| kk/uz/ky/tg + 14 others | allow crawl | **noindex**,follow | no | **not emitted** |
| draft blog | 404 | n/a | no | no |
| `/studio` | disallow in robots.txt | noindex (unchanged) | no | no |

---

## Robots — before / after

| | Before | After |
|---|--------|-------|
| `Disallow` | `/` (entire site) | `/api/`, `/studio` |
| `Allow` | — | `/` |
| `Sitemap` | missing | `{siteUrl}/sitemap.xml` |
| Layout global noindex | yes (both layouts) | **removed** from `[locale]` layout |
| `(default)` layout | noindex | noindex (studio entry only) |

---

## Sitemap — before / after

| | Before | After |
|---|--------|-------|
| Locales | ru/en only | ru/en only (unchanged) |
| Quality gate | yes | yes |
| `/ru/cost`, `/en/cost` | missing (404) | **included** |
| Draft blogs | excluded | excluded |
| `lastmod` | static 2026-05-18 | **dynamic** (build time) |
| hreflang in sitemap | ru/en/x-default | uses `buildLanguageAlternates()` |

---

## hreflang — before / after

| | Before | After |
|---|--------|-------|
| Page `<link rel="alternate">` | 20 locales | **ru + en + x-default only** |
| x-default | ru | ru (unchanged) |
| kk/uz/… | declared but EN duplicate | **not declared** |

Implementation: `buildLanguageAlternates()` in `lib/seo/site.ts` now uses `indexableLocales`.

---

## Pricing route

| Route | Status |
|-------|--------|
| `/ru/cost` | **200** — static SEO page `kind: pricing` |
| `/en/cost` | **200** |
| `/{other}/cost` | exists, **noindex** (needs_review body) |

Content: honest “demo free / starter / premium coming soon” + FAQ + CTA → `/studio`. No billing/Lemon integration.

---

## Language switcher

| | Before | After |
|---|--------|-------|
| Header switcher | `/{locale}` home only | **Preserves path** via `resolveLocaleSwitchPath()` |
| Options shown | 20 locales | **ru + en only** (indexable) |
| Footer language grid | 20 → home | **ru + en** with path preservation |
| Draft blog EN switch | could 404 | falls back to `/en/blog` |

New files: `lib/i18n/switchLocalePath.ts`, `components/i18n/LocaleSwitchLink.tsx`

---

## Icons / manifest / OG

| Asset | Path |
|-------|------|
| App icon | `app/icon.png` → `/icon.png` |
| Apple icon | `app/apple-icon.png` |
| PWA icons | `public/icon-192.png`, `public/icon-512.png` |
| Apple touch | `public/apple-touch-icon.png` |
| OG default | `public/og/vitrina-ai-og.png` |
| Manifest | `app/manifest.ts` → `/manifest.webmanifest` |

Metadata: default OG/Twitter image via `defaultOgImageUrl()` in `createSeoMetadata()` and layout.

---

## Metadata / schema quick fixes

- Removed site-wide noindex from `app/[locale]/layout.tsx`
- Home FAQ schema: replaced artificial “? 1, 2, 3” questions with real trust FAQ
- Pricing page: FAQPage via existing static page pattern
- `websiteJsonLd.inLanguage`: still `["ru","en"]` (correct for Stage 1)

---

## Files changed

### Core SEO/i18n
- `app/robots.ts`
- `app/sitemap.ts`
- `app/manifest.ts`
- `app/(default)/layout.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/page.tsx`
- `lib/seo/site.ts`
- `lib/seo/metadata.ts`
- `lib/i18n/localeConfig.ts`
- `lib/i18n/switchLocalePath.ts` (new)
- `data/seo/staticPages.ts` (pricing)

### UI
- `components/i18n/LanguageSwitcher.tsx`
- `components/i18n/LocaleSwitchLink.tsx` (new)
- `components/landing/SaasFooter.tsx`
- `components/landing/SaasLanding.tsx`

### Assets
- `app/icon.png`, `app/apple-icon.png`
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- `public/og/vitrina-ai-og.png`

### Tooling
- `scripts/seo/smoke-public-routes.ts` (new)
- `package.json` — `smoke:seo:public`
- `.env.example` — production URL comment

### Not touched
- `app/**/studio/**`, `components/studio/**`, `lib/ai/**`, `app/api/**`, auth, Supabase, billing

---

## Commands run

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** (1071 static pages) |
| `npx tsc --noEmit` | **PASS** |
| `npm run lint` | **FAIL** — 53 pre-existing issues (studio/auth/ui); 1 new lint in LanguageSwitcher fixed via `location.assign` |
| `npm run smoke:seo:public` | **PASS** |

---

## Manual verification checklist

After deploy with real `NEXT_PUBLIC_SITE_URL`:

- [ ] `GET /robots.txt` — Allow `/`, Sitemap production URL
- [ ] `GET /sitemap.xml` — no localhost, includes `/ru/cost`
- [ ] `GET /ru`, `/en` — `index,follow`
- [ ] `GET /kk` — `noindex,follow`
- [ ] `GET /ru/cost`, `/en/cost` — 200
- [ ] Blog ru↔en switch on Kaspi article
- [ ] OG image in page source
- [ ] `/icon.png`, `/manifest.webmanifest` — 200

---

## Remaining issues (Stage 2+)

1. **Set `NEXT_PUBLIC_SITE_URL`** to production domain before indexing
2. 92 draft blog articles still 404
3. Thin SEO template pages (60–350 words)
4. kk/uz/ky/tg translations not started
5. Legal pages RU titles still in English
6. Lint debt in studio/auth (pre-existing, out of scope)
7. `favicon.ico` not added separately (Next serves `app/icon.png` as `/icon.png`)

---

## Stage 2 recommendation

1. Expand 8 published articles + 12 P0 drafts in **ru**
2. Semantic **en** translation
3. GSC/Yandex verification env vars
4. Enable IndexNow after domain live

---

## Commit / push

**Not performed** — awaiting approval.
