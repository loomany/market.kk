# Vitrina AI — Stage 10 Trust Pages + Examples Scaffold

**Date:** 2026-05-20  
**Status:** Complete (offline)  
**Production deploy / commit / push / GSC / Yandex / IndexNow:** Not performed  
**OpenAI:** Not used

---

## Executive summary

Stage 10 adds **trust/conversion** pages (how-it-works, quality, FAQ) for ru/en/kk and an **examples hub scaffold** (text-only, no fake images). Trust ru/en are **indexable**; kk trust is **ready_for_review / noindex**; all examples are **noindex** and excluded from hreflang until real assets ship.

Production launch remains **paused** (Stage 8/8.1). Studio / AI / auth / billing were **not modified**.

---

## 1. Dirty tree (Stage 10 scope)

### Stage 10 files (SEO only)

| File | Purpose |
|------|---------|
| `data/seo/trustPages.ts` | Trust page content |
| `data/seo/examplesPages.ts` | Examples scaffold content |
| `data/seo/staticPages.ts` | Merge trust pages; pricing relatedLinks |
| `lib/i18n/routeSlugs.ts` | `howItWorks`, `quality`, `faq` slugs |
| `app/[locale]/[slug]/page.tsx` | Hreflang only for indexable locales |
| `app/[locale]/examples/page.tsx` | Examples hub |
| `app/[locale]/examples/[slug]/page.tsx` | Example categories |
| `lib/i18n/switchLocalePath.ts` | Examples locale switch |
| `components/landing/SaasLanding.tsx` | Footer trust links (no examples) |
| `scripts/seo/check-seo-trust.ts` | QA script |
| `scripts/seo/smoke-public-routes.ts` | Trust + examples checks |
| `package.json` | `check:seo:trust` script |

### Still separate (do not mix in SEO-only commit)

`components/studio/**`, `lib/ai/**`, `app/api/ai/**`, `lib/studio/**`, `reports/ai/**`

---

## 2. Trust pages created

| Page | RU | EN | KK |
|------|----|----|-----|
| How it works | `/ru/how-it-works` index | `/en/how-it-works` index | `/kk/how-it-works` **noindex** (`ready_for_review`) |
| Quality / AI limits | `/ru/quality` index | `/en/quality` index | `/kk/quality` **noindex** |
| FAQ hub | `/ru/faq` index | `/en/faq` index | `/kk/faq` **noindex** |

**Content:** steps, audiences, honest AI limits, marketplace disclaimers, 3–14 FAQ each, CTA `/studio`, internal links to pricing/blog/features.

**Schema:** `WebPage`, `BreadcrumbList`, `FAQPage` (where FAQ present) via existing `JsonLdScript` on `[slug]/page.tsx`.

**KK hreflang:** Not emitted until kk status → `published` and QA approved (pathMap filters non-indexable locales).

---

## 3. Examples scaffold created

| Page | RU | EN | KK |
|------|----|----|-----|
| Hub | `/ru/examples` | `/en/examples` | `/kk/examples` |
| Product photos | `/ru/examples/product-photos` | `/en/...` | — |
| Clothing on model | `/ru/examples/clothing-on-model` | `/en/...` | `/kk/examples/clothing-on-model` |
| Background removal | `/ru/examples/background-removal` | `/en/...` | — |
| Kaspi cards | `/ru/examples/kaspi-product-cards` | `/en/...` | `/kk/examples/kaspi-product-cards` |
| Lingerie on model | `/ru/examples/lingerie-on-ai-model` | `/en/...` | — |

**Assets:** None connected. `public/demo/*.svg` exist but are **not used** (no fake before/after). Dashed placeholder blocks with text only.

**Policy:** `status: noindex`, `hasHreflang: false`, **not in sitemap** (not in `staticSeoPages`).

**Footer:** Examples **not** linked from indexable home footer (per Stage 10 SEO rule).

---

## 4. Index / noindex summary

| URL group | robots | sitemap | hreflang |
|-----------|--------|---------|----------|
| Trust ru/en | index, follow | yes (~+6 URLs) | ru↔en |
| Trust kk | noindex, follow | no | no |
| Examples * | noindex, follow | no | no |
| Existing kk approved | unchanged | unchanged | unchanged |

---

## 5. Internal links added

- **Home footer:** How it works, Quality, FAQ, Blog, Pricing (no examples)
- **Pricing ru/en/kk:** → how-it-works, faq, quality
- **Trust pages:** cross-links + studio CTA + pricing/blog

---

## 6. QA scripts

| Script | Result |
|--------|--------|
| `npm run check:seo:trust` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run check:seo:ru/en/kk-content` | (included in content gate) |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** (blog pairs unchanged) |
| `npm run smoke:seo:prelaunch` | **PASS** (0 failures with `NEXT_PUBLIC_SITE_URL`) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

New script: `npm run check:seo:trust`

---

## 7. What was NOT done

- Deploy, commit, push
- GSC / Yandex / IndexNow
- OpenAI content generation
- Wave 2 articles
- uz/ky/tg/global
- Studio / AI / auth / billing changes
- Fake or copyrighted example images
- Examples index enablement

---

## 8. Remaining for Stage 11+

1. **Content Wave 2** — 20 RU + 20 EN articles (Stage 9 plan)
2. **Owned example assets** — then flip examples to `published` + selective index
3. **KK trust QA** — publish kk how-it-works / quality / faq → optional kk hreflang
4. **Stage 16** — production deploy + live verification + manual sitemap submit

---

## 9. Acceptance criteria

| # | Criterion | Met |
|---|-----------|-----|
| 1 | Stages 1–9 not rolled back | Yes |
| 2 | Studio not touched | Yes |
| 3 | AI pipeline not touched | Yes |
| 4 | Auth/billing not touched | Yes |
| 5 | RU/EN trust pages ready | Yes |
| 6 | KK trust ready or noindex | Yes (ready_for_review, noindex) |
| 7 | Examples scaffold without fake assets | Yes |
| 8 | Examples noindex | Yes |
| 9 | Examples not in sitemap/hreflang | Yes |
| 10 | Trust title/meta/h1/FAQ/CTA/links | Yes |
| 11 | No false promises | Yes |
| 12–15 | Content/smoke/tsc/build PASS | Yes |
| 16 | OpenAI not used | Yes |
| 17–18 | No deploy/commit/push | Yes |
| 19 | Stage 10 report | Yes |

---

## Related

- [Stage 9 growth backlog](./vitrina-ai-stage-9-growth-backlog-audit-2026-05-20.md)
- [Stage 7 pre-launch gate](./vitrina-ai-stage-7-prelaunch-gate-2026-05-20.md)
