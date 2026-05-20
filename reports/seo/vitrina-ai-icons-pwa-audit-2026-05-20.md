# Vitrina AI — Icons / PWA / Mobile Audit (Stage 0)

**Date:** 2026-05-20

---

## Summary

**Critical gap:** The repository has **no favicon, app icons, web manifest, or Open Graph image assets**. Middleware matcher references `favicon.ico`, but the file does not exist. This affects browser tabs, mobile home-screen, Google/Yandex mobile results, and social sharing.

---

## Inventory

| Asset | Expected location | Status |
|-------|-------------------|--------|
| favicon.ico | `public/favicon.ico` or `app/favicon.ico` | ❌ Missing |
| favicon.svg | optional | ❌ Missing |
| app/icon.png | `app/icon.png` (Next.js App Router) | ❌ Missing |
| app/icon.svg | optional | ❌ Missing |
| app/apple-icon.png | `app/apple-icon.png` | ❌ Missing |
| apple-touch-icon.png | `public/apple-touch-icon.png` | ❌ Missing |
| android-chrome-192x192.png | `public/` | ❌ Missing |
| android-chrome-512x512.png | `public/` | ❌ Missing |
| maskable icon | PWA | ❌ Missing |
| manifest.webmanifest | `public/manifest.webmanifest` or `app/manifest.ts` | ❌ Missing |
| og:image | `public/og/` or similar | ❌ Missing |
| twitter:image | same as OG | ❌ Missing |

### Existing public assets

- `public/demo/*.svg` — product/model demo placeholders only
- `public/vercel.svg`, `file.svg`, `window.svg` — generic, not brand

---

## Layout / head references

- `app/[locale]/layout.tsx` — no `icons` in metadata
- `app/(default)/layout.tsx` — no `icons` in metadata
- `createSeoMetadata()` — accepts `images` but **callers do not pass images**
- No `manifest` link in layout

---

## Brand consistency

- Site name: **Vitrina AI Studio** / **Vitrina AI**
- Teal/slate UI in landing — no icon file reflecting brand
- No old Kaspi brand leakage in icons (N/A — none exist)
- `NEXT_PUBLIC_APP_NAME` can override title — icon should match Vitrina AI

---

## Google / Yandex / mobile compatibility

| Requirement | Status |
|-------------|--------|
| favicon 48×48+ for SERP | ❌ |
| apple-touch-icon 180×180 | ❌ |
| manifest for add-to-homescreen | ❌ |
| theme_color for mobile browser | ❌ |
| OG 1200×630 for social | ❌ |
| maskable safe zone (Android) | ❌ |

---

## Recommended files to create (Stage 5 — after approval)

| File | Size | Purpose |
|------|------|---------|
| `app/icon.png` | 32×32 or multi-size | Next.js auto favicon |
| `app/apple-icon.png` | 180×180 | iOS home screen |
| `public/favicon.ico` | 16+32+48 multi | Legacy browsers |
| `public/icon-192.png` | 192×192 | Android / manifest |
| `public/icon-512.png` | 512×512 | Android splash |
| `public/icon-maskable-512.png` | 512×512 safe zone | PWA install |
| `public/og/vitrina-ai-og.png` | 1200×630 | OG/Twitter default |
| `app/manifest.ts` or `public/manifest.webmanifest` | — | PWA metadata |

### manifest.ts suggested fields

```json
{
  "name": "Vitrina AI Studio",
  "short_name": "Vitrina AI",
  "start_url": "/ru",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f766e",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Wiring (implementation stage)

1. Add icons to `app/` (Next.js 13+ metadata API)
2. Set `metadata.openGraph.images` default in `createSeoMetadata` or locale layout
3. Add `themeColor` in layout metadata
4. Reference manifest in layout
5. Verify with Google Rich Results, Yandex Webmaster, Lighthouse PWA audit

---

## Tests after implementation

- [ ] `/favicon.ico` returns 200
- [ ] Apple touch icon linked in head
- [ ] OG preview on Facebook/Telegram/LinkedIn debugger
- [ ] Google SERP favicon (after indexation)
- [ ] Lighthouse PWA — installable optional
- [ ] No 404 icon requests in server logs

---

## Stage 0 action

**Do not generate icons in this audit.** Plan only — implement in Stage 5 after brand asset approval.
