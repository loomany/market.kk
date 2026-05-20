# Vitrina AI — Stage 14 Full SEO Main-Ready Audit / Freeze Gate

**Date:** 2026-05-20  
**Mode:** AUDIT ONLY — no code, content, deploy, commit, push, GSC/Yandex/IndexNow, OpenAI  
**Production launch:** paused until **Stage 16**  
**OpenAI:** not used

---

## 1. Executive summary

Stages **1–13.1** SEO core in the working tree is **policy-consistent and gate-clean**: automated checks pass, sitemap **220** URLs (ru=93, en=93, kk=34), hreflang triads (18 blog + 3 trust), examples remain noindex, uz/ky/tg/global closed.

**Verdict for SEO-only push to `main`:** **READY WITH CONDITIONS**

| Gate | Result |
|------|--------|
| SEO policy / checks / build | **PASS** |
| Dirty tree separation | **PASS** (plan required; see §3, §11) |
| Live production (`vitrina.help`) | **NOT READY** (old deploy; Stage 8 finding still applies) |
| Studio / AI mixed in branch vs `main` | **BLOCKER for blind commit** — must use path-filtered add |
| `npm run lint` | **FAIL** (pre-existing auth + studio; not SEO regressions) |

**Freeze meaning:** No new SEO content, locales, or index expansion. Current tree is the baseline for a future **selective SEO commit** (Stage 15) and **launch** (Stage 16).

---

## 2. Ready / not ready verdict

### SEO-only selective commit to `main`

**READY WITH CONDITIONS** when owner:

1. Commits **only** bucket A paths (§3, §11) — never studio/ai/auth in the same commit.
2. Includes **uncommitted** Stage 13 / 13.1 delta (see §3.1).
3. Re-runs §9 check suite on the commit branch before merge.
4. Accepts that **merge to main ≠ live SEO** until Stage 16 redeploy.

### Production SEO launch

**NOT READY** — live site may still reflect pre–Stage 6–13 deploy (placeholder canonical, robots). Local policy is correct; **redeploy + live verification** remain Stage 16.

---

## 3. Dirty tree separation

### 3.1 Uncommitted delta (`git status --short` at audit time)

| File | Bucket | SEO commit? | Reason |
|------|--------|-------------|--------|
| `data/seo/blogArticles.ts` | A | yes | Stage 13 merge order / KK articles |
| `data/seo/blogTopics.ts` | A | yes | KK published topics |
| `data/seo/kkFeatureLandingEnhancements.ts` | A | yes | KK LP copy |
| `data/seo/trustPages.ts` | A | yes | Stage 13.1 KK trust published |
| `lib/seo/kkIndexPolicy.ts` | A | yes | Trust approval keys |
| `package.json` | A | yes* | SEO scripts only — **review diff** for non-SEO script lines |
| `scripts/seo/check-seo-kk-content.ts` | A | yes | Trust QA |
| `scripts/seo/check-seo-trust.ts` | A | yes | KK trust indexable |
| `scripts/seo/smoke-hreflang-pairs.ts` | A | yes | 3 trust triads |
| `scripts/seo/smoke-prelaunch-gate.ts` | A | yes | 220 sitemap + trust |
| `scripts/seo/smoke-public-routes.ts` | A | yes | KK trust smoke |
| `data/seo/kkBlogStage13Wave2.ts` | A | yes | Stage 13 KK wave2 content |
| `scripts/seo/build-kk-blog-stage13-wave2.mjs` | A | yes | Generator |
| `scripts/seo/check-seo-kk-wave2.ts` | A | yes | Wave2 QA |
| `scripts/seo/kk-blog-stage13-wave2-articles.mjs` | A | yes | Generator source |
| `reports/seo/vitrina-ai-stage-13-*.md` | A | yes | Stage reports |
| `reports/seo/vitrina-ai-stage-14-*.md` | A | yes | This audit |
| `reports/ai/fal-*.json` | B/D | **no** | AI run artifacts |

**Studio / AI / auth:** not in uncommitted short status — good for 13.1 tail.

### 3.2 Branch vs `main` (full SEO program — representative buckets)

`git diff --name-only main` shows **~120+ paths** touched across the SEO program. Grouped for commit planning:

| Bucket | Include in SEO commit? | Representative paths |
|--------|------------------------|----------------------|
| **A — SEO** | **yes** | `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`, `app/[locale]/**`, `components/i18n/**`, `components/landing/**`, `components/examples/**`, `data/seo/**`, `lib/seo/**`, `lib/i18n/**`, `lib/blog/**`, `scripts/seo/**`, `public/og/**`, `public/icon-*.png`, `public/examples/**`, `reports/seo/**`, `.env.example` (SEO comments only) |
| **B — Studio** | **no** | `components/studio/**`, `lib/studio/**`, `app/[locale]/studio` routes if only studio UI |
| **B — AI** | **no** | `lib/ai/**`, `app/api/ai/**`, `scripts/diagnose-fal-*`, `reports/ai/**` |
| **C — Auth** | **no** | `components/auth/**`, `app/api/auth/**` |
| **D — Noise** | **no** | `.next/**`, untracked `reports/ai/*.json` |

**Manual review:** `package.json`, `app/(default)/layout.tsx`, `app/[locale]/layout.tsx` — may touch both SEO and app shell; diff before add.

---

## 4. Route inventory summary

**Artifact:** [`vitrina-ai-stage-14-route-inventory-2026-05-20.csv`](./vitrina-ai-stage-14-route-inventory-2026-05-20.csv)

| Metric | Count |
|--------|------:|
| Total route rows (all locales incl. draft uz/ky/tg) | 516 |
| Rows with `index_policy=index` | 209 |
| Rows with `in_sitemap=yes` | 220 |
| **Sitemap entries (source of truth)** | **220** |

**Indexable rows by locale (inventory model):** ru≈88, en≈88, kk≈33 (section hubs + partial KK; sitemap uses stricter published gates → **93/93/34**).

**Sitemap locale split (prelaunch smoke):** ru=**93**, en=**93**, kk=**34**.

**By kind (indexable, approximate):**

| Kind | ru/en | kk |
|------|-------|-----|
| Blog published | 40 + 40 | 18 |
| Trust | 3 + 3 | 3 |
| Feature LPs (approved) | 5 + 5 | 5 (+ cost) |
| Section hubs + cost | 7 + 7 | 7 |
| Platform / use-case LPs | remainder to 93 | remainder to 34 |

**Noindex (confirmed):**

- Examples: 15 routes (ru×6, en×6, kk×3) + hubs — **noindex**, not in sitemap
- `/kk/onim-video-generator` (product video) — **noindex**, not in sitemap
- uz/ky/tg/global — **needs_review**, not in sitemap
- KK legal static (privacy/terms/AUP/deletion) — **needs_review**
- 82 KK blog topics — non-published
- `/studio`, `/api/*` — disallowed in robots, not in sitemap

**Note:** Locale **home** (`/ru`, `/en`, `/kk`) is **always listed in sitemap** by design; inventory marks home `noindex` when `shouldIndexPage` is run on short hero copy — verify robots/meta on `[locale]/page.tsx` before launch (non-blocking for freeze if intentional since Stage 1).

---

## 5. Sitemap audit

**Generator:** `app/sitemap.ts` (prelaunch smoke + static audit)

| Check | Result |
|-------|--------|
| Total URLs | **220** |
| localhost / your-domain.com | **None** (with `NEXT_PUBLIC_SITE_URL=https://vitrina.help`) |
| `/studio`, `/api` | **Absent** |
| `/examples` | **Absent** |
| uz/ky/tg/global | **Absent** |
| KK video noindex | **Absent** |
| KK trust (3) | **Present** |
| RU+EN blog (40+40) | **Present** (published audit) |
| KK blog (18) | **Present** (approved triads) |
| ru/en/kk split | **93 / 93 / 34** |

**Env note:** Local smoke reports `isProductionSiteUrl: true` and host `vitrina.help`. **Live** host may still serve an older build until Stage 16 redeploy — not a code failure.

**GSC/Yandex/IndexNow:** not submitted (per constraints).

---

## 6. Hreflang / canonical audit

| Group | Expected | Actual | Broken | Missing reciprocal |
|-------|----------|--------|--------|-------------------|
| ru/en blog pairs | 40 | 40 | 0 | 0 |
| ru/en/kk blog triads | 18 | 18 | 0 | 0 |
| ru/en/kk trust triads | 3 | 3 | 0 | 0 |
| ru/en-only (no kk) | 22 | 22 | 0 | 0 |
| x-default → ru | all | all | 0 | 0 |
| hreflang → examples | 0 | 0 | 0 | 0 |
| hreflang → uz/ky/tg/global | 0 | 0 | 0 | 0 |

**Smoke:** `smoke:seo:hreflang` — PASS  
**Prelaunch:** trust triads + `blog_008` ru/en-only (no kk) — PASS

---

## 7. Index / noindex policy audit

### Index (intended)

- ru/en: published blog (40), trust (3), feature LPs, platforms, use-cases, hubs, cost
- kk: 18 approved blogs, 3 trust, 6 approved feature LPs + cost, hubs, Kaspi-relevant platforms where published

### Noindex (intended)

- examples (all locales)
- `productVideoGenerator` / kk `onim-video-generator`
- uz, ky, tg, global
- non-approved KK blogs (82)
- KK legal static (`needs_review`)
- studio, api

### Mismatches found

| Issue | Severity | Notes |
|-------|----------|-------|
| Home in sitemap vs `shouldIndexPage` on hero-only fields | low | Sitemap always emits home; confirm robots on landing page at Stage 16 |
| None — sitemap ⊄ examples/noindex/video/closed locales | — | prelaunch PASS |

**Unexpected indexable:** none found in smoke.  
**Accidental noindex on approved KK trust/blog:** none (13.1 closed).

---

## 8. Content QA summary

| Locale | Published | Word/meta/FAQ checks | Fallback / placeholders |
|--------|-----------|----------------------|-------------------------|
| **RU** | 40 blog | `check:seo:ru-content` — **PASS** | None reported |
| **EN** | 40 blog | `check:seo:en-content` — **PASS** | None reported |
| **KK** | 18 blog | `check:seo:kk-content` + `kk-wave2` — **PASS** | No RU/EN fallback flags |
| **Trust** | ru/en/kk ×3 | `check:seo:trust` — **PASS** | KK published; studio CTA |
| **Examples** | scaffold | `check:seo:examples` — **PASS** | `exampleCases` empty; no fake before/after |

**Wave 2 (RU/EN):** `check:seo:wave2` — **PASS** (20 topics).

---

## 9. Commercial landing pages audit

P0 pages after Stage 11 enhancements + KK copy (`ruFeatureLandingEnhancements`, `enFeatureLandingEnhancements`, `kkFeatureLandingEnhancements`):

| Page | ru | en | kk | Issues | Launch-ready |
|------|----|----|-----|--------|--------------|
| AI product photo studio | index | index | index | None; no `/examples` links | **yes** |
| Marketplace photos | index | index | index | None | **yes** |
| Clothing on model (`fashionModelPhotos`) | index | index | index | Text-only example teasers | **yes** |
| Background generator | index | index | index | None | **yes** |
| Jewelry photos | index | index | index | None | **yes** |
| Kaspi platform LP | index | index | index* | *kk if platform kk published | **yes** |
| Pricing (`cost`) | index | index | index | None | **yes** |
| Home | sitemap | sitemap | sitemap | Hero QA note §4 | **yes** (policy) |
| Product video | noindex | noindex | noindex | In dev | **no** (intended) |

**Checks:** no unsupported Kaspi partnership claims in enhancement FAQ; no indexable LP links to `/examples`; `check:seo:examples` confirms feature LPs clean.

---

## 10. Assets / manifest / OG audit

| Asset | Local | Notes |
|-------|-------|-------|
| `app/icon.png` | present | prelaunch OK |
| `app/apple-icon.png` | present | OK |
| `public/icon-192.png`, `icon-512.png` | present | OK |
| `public/apple-touch-icon.png` | present | OK |
| `public/og/vitrina-ai-og.png` | present | OK |
| `app/manifest.ts` | present | theme/background/short_name OK |
| `defaultOgImagePath` | `/og/vitrina-ai-og.png` | OK |
| `public/examples/` | README + `.gitkeep` | no unsafe demo SVG in registry |

**Live:** icons/OG require **redeploy** (Stage 16) to replace old production assets.

---

## 11. Scripts / checks results

### package.json SEO scripts (present)

`check:seo:ru-content`, `en-content`, `kk-content`, `content`, `trust`, `examples`, `kk-wave2`, `wave2`, `smoke:seo:public`, `hreflang`, `prelaunch` — all present.

### Run results (2026-05-20)

| Command | Result |
|---------|--------|
| `check:seo:ru-content` | PASS |
| `check:seo:en-content` | PASS |
| `check:seo:kk-content` | PASS |
| `check:seo:content` | PASS |
| `check:seo:trust` | PASS |
| `check:seo:examples` | PASS |
| `check:seo:kk-wave2` | PASS |
| `smoke:seo:public` | PASS |
| `smoke:seo:hreflang` | PASS |
| `smoke:seo:prelaunch` | PASS (0 failures, 0 warnings) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npm run lint` | **FAIL** (pre-existing, out of SEO scope) |

### Lint (not fixed — audit only)

| Area | Sample findings |
|------|-----------------|
| **Auth** | `PhoneCountryInput.tsx` — setState-in-effect; `WhatsAppLoginModal.tsx` — hooks order / setState-in-effect |
| **Studio** | `ModelPresetSelector.tsx` — conditional `useMemo` |
| **SEO-adjacent** | `examples/page.tsx` — unused `Locale` import (warning only) |

**Conclusion:** Lint debt does not block SEO policy freeze; do not mix lint fixes into SEO-only commit unless owner chooses separate PR.

---

## 12. Risk table (pre–SEO-only push)

| Risk | Severity | Mitigation | Owner action |
|------|----------|------------|--------------|
| Dirty tree mixes SEO + Studio/AI on branch vs `main` | **high** | Path-filtered `git add`; two-phase commits | Stage 15: selective add only bucket A |
| Uncommitted 13/13.1 files lost | **medium** | Commit 13.1 delta with SEO batch | Include §3.1 files |
| Live `vitrina.help` old robots/canonical | **high** | Stage 16 redeploy + live smoke | Do not submit sitemap until live PASS |
| `NEXT_PUBLIC_GSC/YANDEX` empty | **low** | Add at deploy | Post-deploy verification |
| INDEXNOW off | **low** | Keep disabled until approval | Stage 16+ |
| Examples accidentally indexed | **medium** | `check:seo:examples` in CI | Re-run before merge |
| uz/ky/tg opened early | **medium** | `indexableLocales` gate | No locale expansion until roadmap stage |
| Home robots vs sitemap | **low** | Verify metadata Stage 16 | Optional targeted check |
| Studio launch unknown | **medium** | Keep studio out of SEO commit | Stage 16 bundles product + SEO deploy |
| Cloudflare/cache stale robots | **high** | Purge after deploy | Stage 8 playbook |

---

## 13. SEO-only commit plan (NOT EXECUTED)

### 13.1 Before commit

```bash
git status --short
git diff --name-only main
npm run check:seo:ru-content
npm run check:seo:en-content
npm run check:seo:kk-content
npm run check:seo:trust
npm run check:seo:examples
npm run check:seo:kk-wave2
npm run smoke:seo:prelaunch
npx tsc --noEmit
npm run build
```

### 13.2 Safe to add (bucket A)

- All paths in §3.2 bucket A
- All §3.1 uncommitted SEO files
- `reports/seo/**` (optional but recommended for audit trail)

### 13.3 Exclude (never `git add` in SEO-only commit)

- `components/studio/**`, `lib/studio/**`
- `lib/ai/**`, `app/api/ai/**`
- `components/auth/**`, `app/api/auth/**`
- `scripts/diagnose-fal-*`, `reports/ai/**`
- `.next/**`, `reports/ai/*.json`

### 13.4 Manual diff review

- `package.json` — only SEO scripts / deps
- `app/(default)/layout.tsx`, `app/[locale]/layout.tsx` — metadata vs studio imports
- Any `app/api/ai/*` hunks accidentally staged — **unstage**

### 13.5 Suggested commit message (when owner runs Stage 15)

```
seo: Stages 1–13.1 — RU/EN/KK content, trust, examples scaffold, sitemap 220

Freeze gate passed (Stage 14). Studio/AI not included.
```

### 13.6 After commit (still pre-launch)

- PR review with path list
- Re-run §9 on CI/local
- **Do not** deploy until Stage 16
- **Do not** GSC/Yandex until live verification

### 13.7 Rollback

```bash
git revert <seo-commit-sha>
# or reset branch if unpushed — owner discretion
```

Re-run smoke prelaunch after revert.

---

## 14. What must stay out of commit

- Entire Studio UI and workspace session stack
- AI routes, FASHN/Fal diagnostics, `reports/ai/*`
- Auth/billing/Supabase
- Accidental `.env.local` (never commit secrets)

---

## 15. What remains for Stage 15

- Execute **SEO-only selective commit** per §13
- PR to `main` with reviewer checklist (paths only)
- Optional: add CI job running `smoke:seo:prelaunch` on SEO paths
- Resolve uncommitted §3.1 delta in same PR

---

## 16. What remains for Stage 16 (launch)

- Studio/product readiness review (separate track)
- Production deploy with `NEXT_PUBLIC_SITE_URL=https://vitrina.help`
- Live robots/sitemap/canonical verification (refresh Stage 8)
- GSC + Yandex property verification + manual sitemap submit
- IndexNow only after explicit approval
- Optional: home robots alignment, lint fixes (auth/studio)

---

## 17. Constraints confirmation

| Constraint | Status |
|------------|--------|
| Code changed in Stage 14 | **No** |
| Content changed | **No** |
| Deploy / commit / push | **No** |
| GSC / Yandex / IndexNow | **No** |
| OpenAI | **No** |
| Studio / AI / auth touched | **No** |
| Stage 14 report + route CSV | **Yes** |

---

## 18. Acceptance criteria (Stage 14)

| # | Criterion | Met |
|---|-----------|-----|
| 1 | Code not changed | yes |
| 2 | Content not changed | yes |
| 3 | Studio not touched | yes |
| 4 | AI pipeline not touched | yes |
| 5 | Auth/billing not touched | yes |
| 6 | Full route inventory | yes (CSV) |
| 7 | Sitemap audit | yes |
| 8 | Hreflang/canonical audit | yes |
| 9 | Index/noindex audit | yes |
| 10 | Content QA summary | yes |
| 11 | Commercial LP audit | yes |
| 12 | Assets/manifest/OG audit | yes |
| 13 | Dirty tree separated | yes |
| 14 | SEO-only commit plan | yes (§13) |
| 15 | All SEO checks PASS | yes |
| 16 | tsc PASS | yes |
| 17 | build PASS | yes |
| 18 | Risks documented | yes |
| 19 | Stage 14 report exists | yes |
| 20 | No deploy/commit/push | yes |

**Stage 14 freeze gate: COMPLETE.**
