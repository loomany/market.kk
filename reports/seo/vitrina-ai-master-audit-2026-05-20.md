# Vitrina AI — Master SEO/i18n/Content Audit

**Date:** 2026-05-20  
**Stage:** 0 — Audit only (no code changes, no Studio changes, no commits)  
**Product:** Vitrina AI Studio — AI product photo/video for marketplaces

---

## 1. Executive summary

### Is the site ready for SEO?

**No.** Architecture is strong, but **indexation is fully disabled**, **92% of blog content is missing (404)**, **18/20 locales are English placeholders**, and **brand assets (favicon/OG) are absent**.

### Top blockers to traffic

1. Global `noindex` + `robots.txt Disallow: /`
2. Only 16 published blog URLs vs 2,000 planned topic-locale combinations
3. Thin template SEO pages (60–350 words)
4. hreflang overreach (20 locales without real translations)
5. Missing social/SERP icons and OG image

### Quick wins (after approval)

1. Set production `NEXT_PUBLIC_SITE_URL`, add favicon + OG image
2. Remove site-wide noindex for **ru/en only**; keep noindex on other locales
3. Expand + publish remaining **12 P0 blog articles** in Russian
4. Fix language switcher to preserve route
5. Add public pricing page or remove `/cost` slug until ready

---

## 2. Route inventory summary

| Metric | Value |
|--------|------:|
| Public route×locale rows | 3,003 |
| Locales | 20 |
| Marketing templates / locale | 49 |
| Published blog URLs | 16 |
| 404 blog URLs | 1,984 |
| Missing pages | 20 (`/cost`) |
| Thin template pages | ~430 |
| Studio routes (out of scope) | 2 entry points |

**CSV:** `vitrina-ai-route-inventory-2026-05-20.csv`

---

## 3. Content / article status

| Metric | Value |
|--------|------:|
| Topics in plan | 100 |
| Published (ru+en body) | 8 |
| Draft / 404 | 92 |
| Needs generation (ru or en) | 92 articles |
| Needs translation (18 locales × published) | 144 combos |
| Needs SEO rewrite (length) | 8 published + all thin LPs |

**CSV:** `vitrina-ai-article-inventory-2026-05-20.csv`  
**Plan:** `vitrina-ai-content-gap-plan-2026-05-20.md`

---

## 4. i18n / hreflang status

| Works | Broken |
|-------|--------|
| URL structure `/{locale}/…` | 18 locales EN duplicate in hreflang |
| ru + en full landing | Language switcher drops path |
| CIS localized slugs (features) | kk/uz/ky/tg body not translated |
| Quality gate / noindex draft | Legal RU pages English titles |
| x-default → ru | Schema inLanguage ru/en only |

**CSV:** `vitrina-ai-i18n-matrix-2026-05-20.csv`  
**Report:** `vitrina-ai-i18n-audit-2026-05-20.md`

---

## 5. Technical SEO

| Area | Grade | Notes |
|------|-------|-------|
| Sitemap | B | Good builder; not in robots |
| Robots | F | Blocks entire site |
| Canonical | B+ | Env-dependent |
| hreflang | D | Over-declared |
| Metadata | C | Templates OK; duplicates |
| Schema | B- | Good base; FAQ quality issues |
| Internal links | B | CTA strong |
| OG / social | F | No image |

**Report:** `vitrina-ai-technical-seo-audit-2026-05-20.md`

---

## 6. Icons / PWA / mobile

**Grade: F** — no favicon, manifest, apple-icon, or OG image.

**Report:** `vitrina-ai-icons-pwa-audit-2026-05-20.md`

---

## 7. Keyword / content gaps

- **Strong:** platform pages (13), use cases (20), core feature LPs
- **Weak:** blog depth, pricing, kk/CIS localization, video cluster (pre-product)
- **Report:** `vitrina-ai-keyword-cluster-audit-2026-05-20.md`

---

## 8. OpenAI content generation plan (NOT executed)

### Environment variables (proposed)

```env
OPENAI_SEO_MODEL=gpt-4o-mini
OPENAI_TRANSLATION_MODEL=gpt-4o-mini
OPENAI_SEO_MAX_TOKENS_PER_ARTICLE=3500
OPENAI_SEO_DAILY_BUDGET_USD=5
OPENAI_SEO_DRY_RUN=true
```

Use **mini/nano class** for drafts; stronger model only for spot QA after approval. Never hardcode model in app code — scripts read env.

### Pipeline

```
1. Source: ru (primary)
2. audit-content-i18n.ts → gap report JSON
3. generate-missing-articles.ts --dry-run → drafts in reports/seo/drafts/
4. Human review checklist
5. translate-articles.ts --locales kk,uz,ky,tg --dry-run
6. validate-i18n-content.ts → mixed-language / placeholder detection
7. check-seo-metadata.ts → title/desc length, duplicates
8. check-hreflang-sitemap.ts → reciprocity + locale policy
9. Apply to data/seo/*.ts only after diff approval
```

### Cost estimate (rough, dry-run first)

| Task | Units | Tokens est. | Model | USD est. |
|------|------:|------------:|-------|----------:|
| Generate 92 ru articles (~1200 words) | 92 | ~220K in + 550K out | mini | $15–40 |
| Expand 8 existing articles | 8 | ~40K out | mini | $2–5 |
| Expand 6 feature LPs ru | 6 | ~30K out | mini | $1–3 |
| Translate to en (semantic) | 106 pages | ~400K out | mini | $10–25 |
| Translate to kk,uz,ky,tg (top 30 pages) | 120 | ~350K out | mini | $8–20 |
| QA spot-check (stronger model, 10%) | 12 | ~50K | gpt-4o | $5–10 |
| **Total batch** | | | | **$41–103** |

Daily budget cap `$5` → ~2–3 weeks staged generation.

### Safety rules

- `OPENAI_SEO_DRY_RUN=true` writes to `reports/seo/drafts/` only
- Never overwrite published content without diff report
- No auto-publish to production
- No invented features (video = in development)
- QA gate before indexation

### Proposed scripts (Stage 2+ — not implemented)

| Script | Purpose |
|--------|---------|
| `scripts/seo/audit-content-i18n.ts` | Inventory + gap JSON |
| `scripts/seo/generate-missing-articles.ts` | Draft articles from topics |
| `scripts/seo/translate-articles.ts` | ru → target locales |
| `scripts/seo/validate-i18n-content.ts` | Mixed lang / placeholders |
| `scripts/seo/check-seo-metadata.ts` | Title/desc/h1 validation |
| `scripts/seo/check-hreflang-sitemap.ts` | hreflang + sitemap consistency |

---

## 9. Implementation plan

### Stage 1 — Critical SEO/i18n infra (1–2 days)

- [ ] Set `NEXT_PUBLIC_SITE_URL` production value
- [ ] Remove site-wide noindex; restore robots allow + sitemap link
- [ ] Restrict hreflang to published locales only (ru/en initially)
- [ ] Fix language switcher path preservation
- [ ] Remove or implement `/cost` route
- [ ] Add default og:image + favicon set (minimal)

**Risk:** High — indexation goes live. Requires owner approval of domain + index policy.

### Stage 2 — Source language content (ru) (1–2 weeks)

- [ ] Expand 8 published articles to 1000+ words
- [ ] Generate + human review 12 remaining P0 blogs in ru
- [ ] Expand 6 feature SEO pages + top 5 use cases
- [ ] Fix mixed-language FAQ seeds, legal RU titles

**Risk:** Medium — content quality affects rankings

### Stage 3 — en + CIS translation (2–3 weeks)

- [ ] Semantic en translation of Stage 2 outputs
- [ ] kk full landing + Kaspi/clothing/white-bg cluster
- [ ] uz, ky, tg — top 10 commercial pages each
- [ ] Enable index for locale only after validate-i18n pass

**Risk:** Medium — bad machine translation hurts trust

### Stage 4 — Metadata / schema polish (3–5 days)

- [ ] Unique meta for template pages
- [ ] Fix home FAQ schema questions
- [ ] Dynamic sitemap lastmod
- [ ] Localized Organization schema
- [ ] IndexNow enable

**Risk:** Low

### Stage 5 — Icons / PWA / OG (2–3 days)

- [ ] Full icon set + manifest + theme_color
- [ ] OG images per major section (optional)
- [ ] Lighthouse + social debugger QA

**Risk:** Low

### Stage 6 — Smoke tests (1 day)

- [ ] `npm run build`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] Manual crawl: sitemap URLs, hreflang, CTA /studio, no 404 in nav
- [ ] Run proposed seo validation scripts

---

## 10. Files likely to change (implementation)

| File | Risk | Why |
|------|------|-----|
| `app/robots.ts` | **High** | Index policy |
| `app/(default)/layout.tsx` | **High** | Global robots meta |
| `app/[locale]/layout.tsx` | **High** | Global robots meta |
| `lib/seo/site.ts` | **High** | hreflang alternates logic |
| `components/i18n/LanguageSwitcher.tsx` | Medium | Path preservation |
| `lib/i18n/translations.ts` | Medium | kk/uz/ky/tg copy |
| `data/seo/blogArticles.ts` | Medium | New content |
| `data/seo/blogTopics.ts` | Low | Status published |
| `data/seo/staticPages.ts` | Medium | Expand LPs |
| `data/seo/useCases.ts` | Medium | Expand copy |
| `data/seo/platforms.ts` | Medium | Expand copy |
| `app/sitemap.ts` | Medium | lastmod, locales |
| `lib/seo/metadata.ts` | Low | Default OG image |
| `lib/seo/jsonLd.ts` | Low | inLanguage |
| `lib/i18n/routeSlugs.ts` | Low | cost slug fix |
| `app/[locale]/[slug]/page.tsx` | Low | CTA i18n |
| `public/*` icons | Low | New assets |
| `app/manifest.ts` | Low | PWA |
| `.env.example` | Low | OPENAI_SEO_* vars |

**Out of scope (do not touch):** `app/**/studio/**`, `components/studio/**`, `lib/ai/**`, `app/api/**`, Supabase, billing, auth

---

## 11. Commands to run (Stage 6)

```bash
npm run build
npx tsc --noEmit
npm run lint
# After scripts exist:
npx tsx scripts/seo/check-seo-metadata.ts
npx tsx scripts/seo/check-hreflang-sitemap.ts
npx tsx scripts/seo/validate-i18n-content.ts
```

No dedicated route smoke script exists today — recommend adding in Stage 1.

---

## 12. P0 / P1 / P2 consolidated

### P0 (8)

1. Site-wide noindex + robots disallow
2. NEXT_PUBLIC_SITE_URL placeholder
3. No favicon / OG / manifest
4. hreflang 20 locales without real content
5. Language switcher path loss
6. /cost 404
7. 92 draft blogs → 404
8. Sitemap vs hreflang locale mismatch

### P1 (12)

1. Thin SEO templates
2. Blog articles under word target
3. Legal pages English on RU
4. Mixed FAQ languages in seeds
5. CTA hardcoded ru/en on inner pages
6. Schema inLanguage limited
7. No public pricing
8. Dead Hero.tsx
9. Artificial home FAQ schema
10. CIS locales not translated
11. No analytics on CTA
12. Static sitemap lastmod

### P2 (7)

1. platformNames RU fragment global
2. IndexNow disabled
3. No FAQ hub
4. No before/after gallery page
5. HowTo schema opportunity
6. Image LCP optimization
7. Global locale deferral

---

## 13. Cost / risk summary

| Item | Estimate |
|------|----------|
| OpenAI content batch | $41–103 (staged) |
| Human review (owner/editor) | 20–40 hours |
| Icon design | External or Figma — not in scope |
| SEO risk if mass index too early | **High** — thin/duplicate content |
| SEO risk if Stage 1 done correctly | **Low** — controlled ru/en launch |

---

## 14. Approval checklist (ask owner before Stage 1)

- [ ] Production domain for `NEXT_PUBLIC_SITE_URL`?
- [ ] Enable indexation for ru/en now or wait for content?
- [ ] Which CIS locales to index in v1 (kk only vs kk+uz+ky+tg)?
- [ ] Public pricing page — yes/no/coming soon?
- [ ] Remove `/cost` slug or implement pricing page?
- [ ] OpenAI budget cap and model approval?
- [ ] Brand assets for favicon/OG — existing or need design?
- [ ] GSC + Yandex verification codes ready?
- [ ] Video feature messaging — keep “in development” on SEO pages?
- [ ] Who does human QA on generated Russian content?

---

## 15. Acceptance criteria — Stage 0

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Code not changed (product code) | ✅ |
| 2 | Studio not touched | ✅ |
| 3 | Route inventory | ✅ CSV |
| 4 | Article inventory | ✅ CSV |
| 5 | i18n matrix | ✅ CSV |
| 6 | Technical SEO audit | ✅ MD |
| 7 | Icons/PWA audit | ✅ MD |
| 8 | Keyword cluster audit | ✅ MD |
| 9 | OpenAI plan with dry-run | ✅ This doc |
| 10 | Staged implementation plan | ✅ |
| 11 | P0/P1/P2 lists | ✅ |
| 12 | Files-to-change list | ✅ |
| 13 | Cost/risk estimate | ✅ |
| 14 | No commit/push | ✅ |
| 15 | Master report | ✅ This file |

---

## Report index

| File | Description |
|------|-------------|
| `vitrina-ai-master-audit-2026-05-20.md` | This document |
| `vitrina-ai-public-site-audit-2026-05-20.md` | Public site findings |
| `vitrina-ai-route-inventory-2026-05-20.csv` | 3,003 route rows |
| `vitrina-ai-article-inventory-2026-05-20.csv` | 2,000 article rows |
| `vitrina-ai-i18n-matrix-2026-05-20.csv` | Locale matrix |
| `vitrina-ai-i18n-audit-2026-05-20.md` | i18n detail |
| `vitrina-ai-technical-seo-audit-2026-05-20.md` | Technical SEO |
| `vitrina-ai-icons-pwa-audit-2026-05-20.md` | Icons/PWA |
| `vitrina-ai-keyword-cluster-audit-2026-05-20.md` | Keyword clusters |
| `vitrina-ai-content-gap-plan-2026-05-20.md` | Content plan |

**Next step:** Owner review → explicit approval for Stage 1. **Do not implement automatically.**
