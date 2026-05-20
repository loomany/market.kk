# Vitrina AI — i18n Audit (Stage 0)

**Date:** 2026-05-20  
**Matrix CSV:** `vitrina-ai-i18n-matrix-2026-05-20.csv`

---

## Supported locales (20)

| Code | hreflang | Market | Landing status | SEO pages status |
|------|----------|--------|----------------|------------------|
| ru | ru | CIS / KZ-RU | **published** | **published** (source) |
| en | en | Global | **published** | **published** |
| kk | kk | Kazakhstan | needs_review (partial headline) | needs_review EN duplicate |
| ky | ky | Kyrgyzstan | needs_review | needs_review EN duplicate |
| uz | uz | Uzbekistan | needs_review | needs_review EN duplicate |
| tg | tg | Tajikistan | needs_review | needs_review EN duplicate |
| tr | tr | Turkey | needs_review | needs_review EN duplicate |
| az | az | Azerbaijan | needs_review | needs_review EN duplicate |
| ar | ar | MENA (RTL) | needs_review (partial hero) | needs_review EN duplicate |
| es | es | Spain/LatAm | needs_review | needs_review EN duplicate |
| pt | pt | PT/BR | needs_review | needs_review EN duplicate |
| fr | fr | France | needs_review | needs_review EN duplicate |
| de | de | Germany | needs_review | needs_review EN duplicate |
| it | it | Italy | needs_review | needs_review EN duplicate |
| pl | pl | Poland | needs_review | needs_review EN duplicate |
| uk | uk | Ukraine | needs_review | needs_review EN duplicate |
| hi | hi | India | needs_review | needs_review EN duplicate |
| id | id | Indonesia | needs_review | needs_review EN duplicate |
| vi | vi | Vietnam | needs_review | needs_review EN duplicate |
| zh | zh-Hans | China | needs_review (partial headline) | needs_review EN duplicate |

---

## Coverage matrix summary

| Status | Route×locale cells | % of 3003 |
|--------|-------------------:|----------:|
| complete (ru/en quality) | ~260 | 8.7% |
| machine draft (EN fallback) | ~1,720 | 57.3% |
| missing (blog 404 / cost) | ~2,003 | 66.7%* |

\*Blog rows dominate missing count (100 topics × ~18 locales + 92 draft ru/en).

---

## What works

- Locale in URL: `/{locale}/...` — clean, crawlable structure
- `html lang` from `getHtmlLanguage()` — correct hreflang codes including `zh-Hans`
- RTL support for `ar` via `dir="rtl"`
- Localized slugs for CIS on key feature pages (kk, ky, uz, tg) in `routeSlugs.ts`
- Quality gate blocks indexing of `needs_review` / `draft` content
- Sitemap correctly limits to ru/en

---

## What is broken / risky

### 1. hreflang over-declaration (P0)

`buildLanguageAlternates()` in `lib/seo/site.ts` emits **all 20 locales** for every page, including URLs with English duplicate content marked `needs_review`.

**Risk:** Google ignores hreflang or treats as low quality.  
**Fix (Stage 1):** Emit hreflang only for locales with `published` content for that URL; or use `noindex` on non-published locale variants.

### 2. x-default

Currently `x-default` → **ru** (`xDefaultLocale = defaultLocale = "ru"`).  
**Assessment:** Correct for KZ/CIS-first product if ru is primary market.

### 3. Language switcher drops path (P0)

`LanguageSwitcher` always navigates to `/{newLocale}` — not equivalent localized path.

**Example:** User on `/ru/platforms/kaspi-foto-tovarov` switches to kk → lands on `/kk` not `/kk/platforms/kaspi-foto-tovarov`.

**Fix:** Map route keys via `routeSlugs` + entity slug resolver.

### 4. Canonical

Per-page canonical via `createSeoMetadata` — **correct path per locale**.  
**Blocker:** `metadataBase` / `siteUrl` depends on `NEXT_PUBLIC_SITE_URL` — must be production domain before indexation.

### 5. html lang vs content language

| Page | html lang | Body language | Match? |
|------|-----------|---------------|--------|
| /ru/* | ru | Russian | ✅ |
| /en/* | en | English | ✅ |
| /kk | kk | KK headline + EN body | ❌ partial |
| /uz, /ky, /tg | uz/ky/tg | English | ❌ bad locale |
| /ar | ar | AR headline + EN body | ❌ partial |

### 6. Open Graph / Twitter localization

OG title/description follow page metadata — **localized where content exists**.  
**Missing:** `og:locale`, `og:locale:alternate`, **og:image** globally.

### 7. Schema.org localization

- Global layout JSON-LD: `inLanguage: ["ru","en"]` only
- Per-page `webPageJsonLd.inLanguage` uses locale code — good
- Organization description always Russian `siteDescription` — not localized

### 8. Blog translations

- **0** blog articles translated beyond ru/en
- Blog index on kk/uz shows empty or EN fallback list (only published ru/en articles)

### 9. Mixed-language artifacts

- `blogTopics.ts` default FAQ: RU question + EN answer
- Legal `privacy`/`terms` on ru: English H1 titles
- Static page section title “Quality checklist” in English on RU pages
- `SaasLanding` platform chip “локальные каталоги” on all locales

---

## Fallback behavior

```
getLandingCopy(locale):
  ru → full RU
  en → full EN
  kk → EN + KK headline override
  ar → EN + partial AR nav/hero
  zh → EN + ZH headline
  others → full EN + status needs_review
```

SEO data files (`platforms.ts`, `useCases.ts`, `staticPages.ts`):
```
ru → RU content
en → EN content
other → EN content + status needs_review
```

---

## Recommended locale rollout

| Phase | Locales | Index? |
|-------|---------|--------|
| 1 | ru | yes |
| 2 | en | yes |
| 3 | kk | yes after human QA |
| 4 | uz, ky, tg | yes after human QA |
| 5 | tr, az | optional |
| 6 | es, pt, fr, de, it, pl, uk, hi, id, vi, zh, ar | defer |

**Do not index** machine-translated CIS pages without review.

---

## kk / KZ-specific notes

- Currency hint KZT in locale config ✅
- Kaspi platform page exists ✅
- No `ru-KZ` separate hreflang (not required; `ru` covers Russian Kazakhstan)
- Kazakh slug paths exist for features ✅
- **Missing:** kk blog, kk platform copy, kk landing body

---

## i18n QA checklist (for Stage 3)

- [ ] No English paragraphs in kk/uz/ky/tg indexed pages
- [ ] Title/meta unique per locale
- [ ] FAQ single language
- [ ] CTA localized
- [ ] hreflang only for published pairs
- [ ] Language switcher preserves page
- [ ] Legal pages translated (including H1)
