# Stage 12 — Examples assets system + before/after components

**Date:** 2026-05-20  
**Status:** PASS (local checks + build)  
**Scope:** SEO-only examples data model, marketing components, LP teasers, asset audit. **No** deploy, commit, push, Studio/AI, OpenAI/Fal.

## Preconditions

| Item | Status |
|------|--------|
| Stage 11 accepted | 40 RU + 40 EN blog, commercial LP teasers |
| Examples scaffold (Stage 10) | Active, **noindex** |
| Studio / `lib/ai` / `app/api/ai` | Out of scope — not modified |
| Production launch | Paused until Stage 16 |
| Examples index in Stage 12 | **Not enabled** (owner approval → Stage 12.1+) |

## Dirty tree

| Bucket | Notes |
|--------|--------|
| **A — SEO 1–12** | `data/seo/exampleCases.ts`, `examplesAssetRegistry.ts`, `featureExamplesTeaser.ts`, `components/examples/*`, `app/[locale]/examples/*`, `app/[locale]/[slug]/page.tsx` (teaser), `public/examples/`, `scripts/seo/check-seo-examples.ts`, this report |
| **B — Studio/AI** | Unchanged for Stage 12 |
| **C — Auth/billing** | Unchanged |
| **D — noise** | `.next/`, unrelated studio diffs in working tree |

## Asset audit

**`public/examples/`** — empty except `.gitkeep` + `README.md` (owner instructions). **No** before/after files yet.

| asset | path | source | safe_for_public | recommended_use |
|-------|------|--------|-----------------|-----------------|
| OG brand | `/og/vitrina-ai-og.png` | project branding (~1.1 MB) | unknown (verify license) | OG/social only |
| PWA icons | `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` | project icons | unknown | icons only |
| Studio mock SVGs | `/demo/*.svg` (7 files) | in-repo placeholders | **no** (unsafe) | Studio mock only — **never** SEO before/after |
| video placeholder | `/demo/video-placeholder.svg` | API mock | **no** | API mock only |
| Next template | `/file.svg`, `/window.svg`, `/vercel.svg` | template / Vercel brand | **no** | do not use |
| Future owned | `/examples/**` | owner-provided | yes when registered in `exampleCases.ts` | before/after after QA + index approval |

Full registry: `data/seo/examplesAssetRegistry.ts` (14 rows).

## Data model

**`data/seo/exampleCases.ts`**

- 5 categories: `product-photos`, `clothing-on-model`, `background-removal`, `kaspi-product-cards`, `lingerie-on-ai-model`
- Per-category `plannedChecklist` (ru/en/kk where applicable)
- `exampleCases: []` — **no fake cases**
- `examplesIndexPolicy`: `allowIndex: false`, no sitemap, no hreflang
- Helpers: `canRenderBeforeAfter`, `getRenderableCasesForCategory`

**`data/seo/featureExamplesTeaser.ts`** — maps indexable feature LPs → category checklists (text-only).

## Components (`components/examples/`)

| Component | Role |
|-----------|------|
| `ExampleDisclaimer` | Amber disclaimer bar |
| `AssetMissingNotice` | Text + checklist when images missing |
| `BeforeAfterCard` | Renders **only** if `canRenderBeforeAfter()` — otherwise `null` |
| `ExampleCategoryGrid` | Hub links to category pages (noindex section) |
| `ExamplesHubSection` | Hub sections + global checklist |
| `ExamplesCaseSection` | Category page: cases or missing notice |
| `CommercialExamplesTeaser` | Indexable LP block — **no** `/examples` links |

Copy helpers: `lib/seo/examplesCopy.ts`.

## Pages updated

- `app/[locale]/examples/page.tsx` — uses hub components
- `app/[locale]/examples/[slug]/page.tsx` — `ExamplesCaseSection` per category
- `app/[locale]/[slug]/page.tsx` — `CommercialExamplesTeaser` on feature LPs

## Index policy (unchanged)

| Rule | Stage 12 |
|------|----------|
| Examples pages | **noindex** |
| Sitemap | **0** `/examples` URLs (209 total unchanged) |
| hreflang | **none** for examples |
| ru/en/kk blog & trust | unchanged |
| uz/ky/tg/global | unchanged |

## Commercial LP teasers

`CommercialExamplesTeaser` on feature pages (ru/en):

| LP | Category checklist |
|----|-------------------|
| AI product studio | product-photos |
| Marketplace photos | kaspi-product-cards |
| Background generator | background-removal |
| Fashion model photos | clothing-on-model + lingerie-on-ai-model |
| Jewelry | product-photos |

- Links only to `/how-it-works` and `/quality` — **no** links to noindex `/examples` from indexable LPs
- Removed duplicate “examples” prose sections from `ruFeatureLandingEnhancements` / `enFeatureLandingEnhancements`

## Internal links review

- Indexable feature `relatedLinks` / sections: **no** `/examples` hrefs (verified by `check:seo:examples`)
- Examples hub/category pages (noindex): link to trust, blog, platforms, studio — OK
- Cross-links between `/ru/examples/*` pages: OK (all noindex)

## QA

```text
npm run check:seo:examples   # NEW — PASS
npm run check:seo:ru-content
npm run check:seo:en-content
npm run check:seo:kk-content
npm run check:seo:content
npm run check:seo:trust
npm run smoke:seo:public
npm run smoke:seo:hreflang
npm run smoke:seo:prelaunch
npx tsc --noEmit (via build)
npm run build                # 1221 pages — PASS
```

**OpenAI / FASHN / Fal:** not used.

## Owner checklist for real index (Stage 12.1+)

1. Export before/after pairs from Studio (stable product) or shoot owned sources
2. Place files under `public/examples/<category>/` (see `public/examples/README.md`)
3. Add rows to `exampleCases` with `assetStatus: "owned"|"licensed"`, `isRealOwnedAsset: true`, alt + dimensions
4. Set `indexEligible: true` per case only after manual QA
5. Owner explicitly approves `examplesIndexPolicy.allowIndex` + sitemap/hreflang enablement in a follow-up stage
6. Confirm commercial license for any third-party product shown

## Stage 13+ (not done)

- KK Wave 2 content (Stage 13)
- Examples index enable after assets + approval
- Remaining RU/EN blog backlog
- Production deploy / GSC / Yandex (Stage 16)

## Commit / deploy

**Not performed** (per owner policy).
