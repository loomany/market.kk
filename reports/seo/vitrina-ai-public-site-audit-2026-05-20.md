# Vitrina AI — Public Site Audit (Stage 0)

**Date:** 2026-05-20  
**Scope:** Public marketing site only (landing, SEO pages, blog, legal, metadata). Studio flow **not audited internally**.  
**Code changes:** None (audit only).

---

## Executive summary

The public site has a **solid SEO architecture skeleton** (App Router, 20 locales, structured data helpers, quality gate, sitemap builder, 100-topic content plan), but it is **not ready for SEO traffic** today because:

1. **The entire site is blocked from indexing** (`robots.txt` Disallow `/` + layout-level `robots: noindex,nofollow`).
2. **Only 8/100 blog articles are published** (16 URLs across ru/en); the rest return 404.
3. **18 of 20 locales** use English fallback with `needs_review` — hreflang advertises pages that are not truly localized.
4. **No favicon, manifest, or OG image** — weak SERP/social/mobile presentation.
5. **Many SEO landings are thin templates** (~60–350 words vs 500–1200 target).
6. **No public pricing/tariffs page**; `/cost` slug exists in routing map but has no page (404).

**Verdict:** Infrastructure is ahead of content and indexing policy. Fastest wins after approval: re-enable indexing for ru/en, fix canonical URL, add icons/OG, publish P0 articles in ru, then translate CIS locales.

---

## Route inventory summary

| Metric | Count |
|--------|------:|
| Total route×locale rows inventoried | **3,003** |
| Supported locales | **20** |
| Marketing page templates per locale | **49** (+ blog articles) |
| Published blog article URLs (ru+en) | **16** |
| Blog URLs returning 404 | **1,984** |
| Missing routes (404) | **20** (`/{locale}/cost`) |
| Thin content pages (template) | **~430** (static SEO + use cases) |
| Indexable per quality gate (ru/en only, if noindex removed) | **~120–140 URLs** |

Full CSV: `vitrina-ai-route-inventory-2026-05-20.csv`

### Page types

| Type | Count (per locale) | ru/en status | Other locales |
|------|-------------------:|--------------|---------------|
| Home | 1 | published | EN fallback / partial headline (kk, ar, zh) |
| Section indexes | 5 | published | needs_review |
| Feature SEO `[slug]` | 6 | published | needs_review EN duplicate |
| Legal `[slug]` | 4 | published | needs_review; RU legal titles in English |
| Platform pages | 13 | published | needs_review EN duplicate |
| Use-case pages | 20 | published | needs_review EN duplicate |
| Blog index | 1 | published | needs_review |
| Blog articles | 8 published | published | 404 (no translation) |
| AI summary | 1 | published | needs_review |
| **Missing:** cost/pricing | 1 slug, no page | 404 | 404 |

### System routes (non-marketing)

| Route | Status | Notes |
|-------|--------|-------|
| `/` | redirect → `/ru` | OK |
| `/robots.txt` | exists | **Disallow: /** — blocks all crawlers |
| `/sitemap.xml` | exists | ru/en only, quality-gated; no `sitemap` in robots |
| `/llms.txt`, `/llms-full.txt` | exists | AI discovery |
| IndexNow key routes | exists | disabled by default |
| `/studio`, `/{locale}/studio` | exists | **Out of scope** — noindex by design |

### Auth / login

No dedicated public `/login` or `/signup` pages. WhatsApp auth is modal inside Studio (out of scope). This is acceptable for MVP but limits SEO for “sign up” queries.

---

## P0 — Critical indexing / infrastructure

| ID | Issue | Impact |
|----|-------|--------|
| P0-1 | `app/robots.ts` + both layouts set **site-wide noindex/nofollow** | Zero organic traffic possible |
| P0-2 | `NEXT_PUBLIC_SITE_URL` defaults to `https://your-domain.com` or `http://localhost:3000` | Wrong canonical/sitemap/OG in prod if unset |
| P0-3 | **No favicon, apple-touch-icon, manifest, OG image** | Poor SERP snippet, broken browser tab, no PWA |
| P0-4 | hreflang emits **20 locales** via `buildLanguageAlternates`, but 18 locales are `needs_review` EN duplicates | Misleading hreflang; Google may ignore or penalize |
| P0-5 | Language switcher navigates to `/{locale}` **homepage only** — loses current page | Broken locale UX; bad hreflang signals |
| P0-6 | `/{locale}/cost` defined in `routeSlugs.ts` but **no page/data** → 404 | Broken internal SEO expectation |
| P0-7 | **92/100 blog topics** are draft → **404** when slug accessed | Content plan exists but not shipped |
| P0-8 | Sitemap lists ru/en alternates only, but page metadata hreflang lists 20 | Inconsistent international SEO signals |

---

## P1 — Important SEO / content

| ID | Issue | Impact |
|----|-------|--------|
| P1-1 | Static feature SEO pages **~60–80 words** (3 template sections) | Thin content risk when indexed |
| P1-2 | Use-case / platform pages **~250–400 words** | Below landing target (500–900) |
| P1-3 | Published blog articles **~400–650 words** | Below guide target (1000–1800) |
| P1-4 | Legal pages on `/ru` use **English titles** (Privacy Policy, Terms…) | Poor ru-KZ trust/localization |
| P1-5 | Blog topic seed FAQ mixes **RU question + EN answer** | Language quality / trust issue |
| P1-6 | Inner pages CTA hardcoded **ru/en only** (`locale === "ru" ? … : …`) | kk/uz/ky/tg get English CTA |
| P1-7 | `websiteJsonLd.inLanguage` only `["ru","en"]` while 20 locales exposed | Schema mismatch |
| P1-8 | No **og:image** in metadata | Weak social sharing |
| P1-9 | No public **pricing / tariffs** page | Commercial intent gap for “стоимость”, “pricing” |
| P1-10 | `components/landing/Hero.tsx` is **unused dead code** (hardcoded RU) | Confusion for future edits |
| P1-11 | Home FAQ schema uses artificial questions (“…? 1, 2, 3”) | Low-quality rich result signal |
| P1-12 | CIS locales (kk, ky, uz, tg) priority markets but **no real translation** | Missed KZ/Central Asia SEO |

---

## P2 — Improvements

| ID | Issue |
|----|-------|
| P2-1 | `platformNames` array includes hardcoded Russian “локальные каталоги” on all locales |
| P2-2 | Duplicate title patterns: many pages share suffix “— Vitrina AI Studio” (acceptable but monitor) |
| P2-3 | IndexNow disabled — fine pre-launch |
| P2-4 | Analytics env placeholders empty — no conversion tracking on CTA |
| P2-5 | No dedicated FAQ hub page (FAQ only embedded per page) |
| P2-6 | No before/after gallery page (demo SVGs exist in `/public/demo/` only) |
| P2-7 | `product-video-generator` correctly noindex — keep until feature ships |

---

## CTA “Открыть студию” audit

| Check | Result |
|-------|--------|
| CTA route | `/studio` (correct, locale-agnostic) |
| CTA broken? | No — route exists (Studio entry, not audited inside) |
| Landing header + hero + footer | Localized via `getLandingCopy` for ru/en; EN fallback elsewhere |
| Blog articles | All 8 published articles include CTA internal link |
| Platform / use-case / static SEO pages | CTA present (ru/en text hardcoded on some templates) |
| Mobile visibility | Header shows shortened “Студия” / “Studio” on small screens |
| CTA naming consistency | Mostly “Открыть студию” / “Open studio”; blog also uses “Студия” / “Studio” |

**Recommended standard labels (for implementation stage):**

| Locale | Primary | Secondary | Tertiary |
|--------|---------|-----------|----------|
| ru | Открыть студию | Создать фото товара | Попробовать бесплатно |
| kk | Студияны ашу | Тауар фотосын жасау | Тегін көру |
| en | Open Studio | Create product photo | Try for free |
| uz | Studiyani ochish | Mahsulot fotosini yaratish | Bepul sinab ko‘rish |
| ky | Studiyany achuu | Tovar fotosun jasau | Akysyz sinoo |
| tg | Studio-ро кушоед кунед | Акси молро эҷод кунед | Ройгон санҷед |

---

## Commercial packaging (5-second test)

| Criterion | ru/en | Other locales |
|-----------|-------|---------------|
| Clear what product does | ✅ Hero explains AI product photo/video for marketplaces | ⚠️ Mostly EN body |
| Kaspi / marketplace focus | ✅ Kaspi named in platforms, blog, landing | ⚠️ Partial |
| Upload → result flow | ✅ “How it works” 4 steps | ⚠️ EN fallback |
| Before/after | ✅ Demo images on landing (SVG placeholders) | Same |
| Feature blocks | ✅ | EN fallback |
| Trust / AI limitations | ✅ Explicit disclaimers | EN fallback |
| Pricing explanation | ❌ No public pricing page | ❌ |
| FAQ on quality/rights | ✅ Trust section + per-page FAQ | Partial |

---

## Local SEO (RU / KZ / CIS)

| Target | Landing | Platform page | Use case | Blog | Locales |
|--------|---------|---------------|----------|------|---------|
| Kaspi | ✅ mentioned | ✅ `/platforms/kaspi-foto-tovarov` | ✅ exact-product-card | ✅ blog #31 | ru, en |
| Wildberries | ✅ | ✅ | ✅ clothing, white bg | draft #32 | ru, en |
| Ozon | ✅ | ✅ | ✅ | draft #33 | ru, en |
| Instagram | ✅ | ✅ instagram-shop | ✅ | drafts | ru, en |
| AI примерка / одежда на модели | ✅ feature + use case | — | ✅ | ✅ #11, #16 | ru, en |
| Белый фон / удалить фон | ✅ | — | ✅ | ✅ #3 | ru, en |
| Видео из фото | ✅ (noindex feature page) | — | ✅ product-video | draft #48 | ru, en |
| kk (казахский) | partial headline only | EN slug body | EN body | 404 | **needs full translation** |
| uz, ky, tg | EN fallback | EN fallback | EN fallback | 404 | **needs translation** |

**Recommendation:** Do not index kk/uz/ky/tg until human-reviewed translations exist. Ship ru first, then en, then CIS batch.

---

## Anti-regression rules (for implementation)

- Do not remove indexable ru/en pages without approval
- Do not mass-change canonical or hreflang without diff review
- Do not enable indexing for 18 locales until translations pass QA
- Do not touch Studio, auth, billing, AI pipeline
- Do not publish machine translations without QA
- Do not create hundreds of thin doorway pages
- Do not promise features not in Studio (video = “в разработке”)

---

## Related reports

- `vitrina-ai-route-inventory-2026-05-20.csv`
- `vitrina-ai-article-inventory-2026-05-20.csv`
- `vitrina-ai-i18n-matrix-2026-05-20.csv`
- `vitrina-ai-i18n-audit-2026-05-20.md`
- `vitrina-ai-technical-seo-audit-2026-05-20.md`
- `vitrina-ai-icons-pwa-audit-2026-05-20.md`
- `vitrina-ai-keyword-cluster-audit-2026-05-20.md`
- `vitrina-ai-content-gap-plan-2026-05-20.md`
- `vitrina-ai-master-audit-2026-05-20.md`
