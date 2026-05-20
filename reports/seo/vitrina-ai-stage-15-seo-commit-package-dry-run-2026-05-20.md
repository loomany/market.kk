# Vitrina AI — Stage 15 SEO-only Commit Package Dry Run / Hygiene

**Date:** 2026-05-20  
**Mode:** DRY RUN ONLY — no code, content, commit, push, deploy  
**Baseline:** Stage 14 freeze gate PASS (sitemap 220, checks PASS)

---

## 1. Executive summary

Stage 15 prepares a **safe SEO-only commit package** for the owner. Nothing was staged, committed, or pushed.

| Finding | Impact |
|---------|--------|
| **Uncommitted SEO delta** | 11 modified + 8 untracked SEO files — safe for immediate add |
| **vs `origin/main`** | **117** SEO-safe paths, **60** must exclude (Studio/AI/diagnose) |
| **Local HEAD `aac3016`** | Message: `feat(studio): product card workflow, session restore, and SEO batch` — **already mixes Studio + SEO** |
| **Recommended push strategy** | Branch from `origin/main` → restore **only** bucket A files → commit → PR (**not** blind `git push main`) |

**Verdict:** Package is **ready to execute** using **strict explicit file list** (Variant B). Owner must not `git push` local `main` as-is if Studio/AI must stay off remote until a separate PR.

---

## 2. Dirty tree summary

### 2.1 `git status --short` (working tree now)

| Status | Count | Bucket |
|--------|------:|--------|
| Modified (`M`) | 11 | A (SEO) |
| Untracked SEO | 8 | A |
| Untracked AI JSON | 5 | D — **exclude** |

### 2.2 `git diff --name-only main` (uncommitted vs local HEAD)

Same **11** modified files (branch **is** `main`; Stages 1–13 mostly **already committed** locally).

### 2.3 `git diff --name-only origin/main` (local main vs remote)

| Category | Files |
|----------|------:|
| **Total different** | **177** |
| **SEO-safe (bucket A)** | **117** |
| **Studio + AI (bucket B)** | **54** |
| **Fal diagnose scripts (bucket B)** | **6** |
| **Auth / Supabase / billing** | **0** in diff |

---

## 3. Full file classification

### 3.1 Uncommitted — line-by-line

| File | Status | Bucket | Include | Reason |
|------|--------|--------|---------|--------|
| `data/seo/blogArticles.ts` | M | A | **yes** | Stage 13 KK merge / articles |
| `data/seo/blogTopics.ts` | M | A | **yes** | KK published topics |
| `data/seo/kkFeatureLandingEnhancements.ts` | M | A | **yes** | KK LP copy |
| `data/seo/trustPages.ts` | M | A | **yes** | Stage 13.1 KK trust index |
| `lib/seo/kkIndexPolicy.ts` | M | A | **yes** | Trust approval policy |
| `package.json` | M | A | **yes*** | *Diff vs origin is **SEO scripts only** (+11 npm scripts)* |
| `scripts/seo/check-seo-kk-content.ts` | M | A | **yes** | KK + trust QA |
| `scripts/seo/check-seo-trust.ts` | M | A | **yes** | KK trust indexable |
| `scripts/seo/smoke-hreflang-pairs.ts` | M | A | **yes** | 3 trust triads |
| `scripts/seo/smoke-prelaunch-gate.ts` | M | A | **yes** | Sitemap 220 gate |
| `scripts/seo/smoke-public-routes.ts` | M | A | **yes** | KK trust smoke |
| `data/seo/kkBlogStage13Wave2.ts` | ?? | A | **yes** | Stage 13 wave2 content |
| `scripts/seo/build-kk-blog-stage13-wave2.mjs` | ?? | A | **yes** | Generator |
| `scripts/seo/check-seo-kk-wave2.ts` | ?? | A | **yes** | Wave2 QA |
| `scripts/seo/kk-blog-stage13-wave2-articles.mjs` | ?? | A | **yes** | Generator source |
| `reports/seo/vitrina-ai-stage-13-1-kk-trust-qa-2026-05-20.md` | ?? | A | **yes** | Audit trail |
| `reports/seo/vitrina-ai-stage-13-kk-wave2-subset-2026-05-20.md` | ?? | A | **yes** | Audit trail |
| `reports/seo/vitrina-ai-stage-14-main-ready-audit-2026-05-20.md` | ?? | A | **yes** | Stage 14 |
| `reports/seo/vitrina-ai-stage-14-route-inventory-2026-05-20.csv` | ?? | A | **yes** | Stage 14 inventory |
| `reports/ai/fal-*.json` (×5) | ?? | D | **no** | Generated AI run artifacts |

### 3.2 vs `origin/main` — bucket A (117 files, would stage in full SEO push)

**Infra & assets:** `.env.example`, `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`, `app/(default)/layout.tsx`, `public/og/vitrina-ai-og.png`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `public/examples/.gitkeep`, `public/examples/README.md`

**App routes (no `app/api/ai`, no `app/**/studio` in diff):**  
`app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/[slug]/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`, `app/[locale]/examples/page.tsx`, `app/[locale]/examples/[slug]/page.tsx`

**Components:** `components/i18n/*` (2), `components/landing/*` (2), `components/examples/*` (7)

**Data / lib:** `data/seo/**` (17 tracked + uncommitted `kkBlogStage13Wave2.ts`), `lib/seo/**` (5), `lib/i18n/**` (5), `lib/blog/blogResolve.ts`

**Scripts / reports:** `scripts/seo/**` (44 tracked + 4 uncommitted), `reports/seo/**` (stages 1–12 on origin diff + 13–14 uncommitted)

**package.json:** SEO npm scripts only (see §3.4)

**Regenerate strict list:**

```bash
git diff --name-only origin/main -- \
  .env.example \
  app/robots.ts app/sitemap.ts app/manifest.ts app/icon.png app/apple-icon.png \
  "app/(default)/layout.tsx" \
  "app/[locale]/" \
  components/i18n/ components/landing/ components/examples/ \
  data/seo/ lib/seo/ lib/i18n/ lib/blog/ \
  scripts/seo/ reports/seo/ \
  public/og/ public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/examples/ \
  package.json
```

### 3.3 vs `origin/main` — bucket B (must NOT stage)

**`app/api/ai/` (3):**

- `app/api/ai/analyze-product-angles/route.ts`
- `app/api/ai/generate-model/route.ts`
- `app/api/ai/refine-product-mask/route.ts`

**`components/studio/` (17):**  
`AspectRatioSelectField`, `ClothingPreviewPanel`, `GenerationResultGrid`, `ModelPresetSelector`, `ModelReadyCard`, `PreviewImageCarousel`, `ProductCardDualExportPanel`, `ProductCardPreviewPanel`, `ProductMaskEditor`, `ProductPhotosUploader`, `ProductSelectionPanel`, `ProductSetProgressRail`, `ProductShotSettingsPanel`, `StudioSaaSPreviewChrome`, `StudioShell`, `TryOnResultActions`, `types.ts`

**`lib/ai/` (10):**  
`analyzeProductAngle`, `extractModelIdentityFromHero`, `modelAngles`, `modelCustomParams`, `modelGenerationSchemas`, `modelIdentityLock`, `productShotSchemas`, `refineGarmentSelectionSchemas`, `refineGarmentSelectionVision`, `runFalModelGeneration`

**`lib/studio/` (22):**  
(all session/pipeline/product-card files listed in `git diff origin/main -- components/studio/ lib/studio/ lib/ai/`)

**`scripts/diagnose-fal-*` (6):**  
identity-matrix, instantid-5-poses, lingerie-5-edits, lingerie-production, nano-bible-via-api-3, nano-t2i-identity-bible-3

**`reports/ai/` (1 tracked in diff):**  
`reports/ai/fal-identity-matrix-2026-05-20.md`  
(+ 5 untracked `*.json` — exclude)

### 3.4 Manual review items (bucket A, review diff)

| File | Review | Notes |
|------|--------|-------|
| `package.json` | **PASS** | Only `check:seo:*` / `smoke:seo:*` script entries added |
| `app/(default)/layout.tsx` | **PASS** | OG/Twitter/icons; root robots still `index:false` (marketing root policy) |
| `app/[locale]/layout.tsx` | **required** | Confirm metadata/hreflang only |
| `components/landing/SaasLanding.tsx` | **required** | No studio internals leaked into SEO copy |
| `scripts/seo/_scratch-kk-match.mjs` | optional | Dev scratch — can omit from commit for hygiene |
| `scripts/seo/_gen-*`, `_*` | optional | Generators — include if reproducibility wanted |

### 3.5 Bucket C / D

| Bucket | In diff? |
|--------|----------|
| C — auth/billing/Supabase | **None** |
| D — `.next/`, `reports/ai/*.json` | Untracked JSON only |

---

## 4. Safe SEO file lists

### 4.1 Immediate commit (uncommitted only) — **19 paths**

```
data/seo/blogArticles.ts
data/seo/blogTopics.ts
data/seo/kkFeatureLandingEnhancements.ts
data/seo/trustPages.ts
data/seo/kkBlogStage13Wave2.ts
lib/seo/kkIndexPolicy.ts
package.json
scripts/seo/check-seo-kk-content.ts
scripts/seo/check-seo-trust.ts
scripts/seo/smoke-hreflang-pairs.ts
scripts/seo/smoke-prelaunch-gate.ts
scripts/seo/smoke-public-routes.ts
scripts/seo/build-kk-blog-stage13-wave2.mjs
scripts/seo/check-seo-kk-wave2.ts
scripts/seo/kk-blog-stage13-wave2-articles.mjs
reports/seo/vitrina-ai-stage-13-1-kk-trust-qa-2026-05-20.md
reports/seo/vitrina-ai-stage-13-kk-wave2-subset-2026-05-20.md
reports/seo/vitrina-ai-stage-14-main-ready-audit-2026-05-20.md
reports/seo/vitrina-ai-stage-14-route-inventory-2026-05-20.csv
```

### 4.2 Full SEO program vs `origin/main` — **117 paths**

Use command in §3.2 to export full list before commit.

---

## 5. Proposed `git add` commands (NOT EXECUTED)

### Variant A — Broad path add (higher risk on mixed branch)

**Do not use** if current branch contains Studio commits you might accidentally re-stage.

```bash
# From repo root — DO NOT RUN until review checklist complete
git add .env.example
git add app/robots.ts app/sitemap.ts app/manifest.ts app/icon.png app/apple-icon.png
git add "app/(default)/layout.tsx"
git add "app/[locale]/"
git add components/i18n/ components/landing/ components/examples/
git add data/seo/
git add lib/seo/ lib/i18n/ lib/blog/
git add scripts/seo/
git add reports/seo/
git add public/og/ public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/examples/
git add package.json
```

**Risks:** Does not add untracked `kkBlogStage13Wave2.ts` unless `data/seo/` is untracked-aware; on a dirty branch could pick up wrong files if paths overlap.

### Variant B — Strict (recommended)

#### B1 — Uncommitted SEO delta only (safest first step)

```bash
git add data/seo/blogArticles.ts data/seo/blogTopics.ts data/seo/kkFeatureLandingEnhancements.ts data/seo/trustPages.ts data/seo/kkBlogStage13Wave2.ts
git add lib/seo/kkIndexPolicy.ts
git add package.json
git add scripts/seo/check-seo-kk-content.ts scripts/seo/check-seo-trust.ts
git add scripts/seo/smoke-hreflang-pairs.ts scripts/seo/smoke-prelaunch-gate.ts scripts/seo/smoke-public-routes.ts
git add scripts/seo/build-kk-blog-stage13-wave2.mjs scripts/seo/check-seo-kk-wave2.ts scripts/seo/kk-blog-stage13-wave2-articles.mjs
git add reports/seo/vitrina-ai-stage-13-1-kk-trust-qa-2026-05-20.md
git add reports/seo/vitrina-ai-stage-13-kk-wave2-subset-2026-05-20.md
git add reports/seo/vitrina-ai-stage-14-main-ready-audit-2026-05-20.md
git add reports/seo/vitrina-ai-stage-14-route-inventory-2026-05-20.csv
```

#### B2 — Full SEO-only push to remote (branch from `origin/main`)

```bash
git fetch origin
git checkout -b seo/main-ready origin/main

# Restore SEO tree from local main without switching branches
git checkout main -- .env.example
git checkout main -- app/robots.ts app/sitemap.ts app/manifest.ts app/icon.png app/apple-icon.png
git checkout main -- "app/(default)/layout.tsx"
git checkout main -- "app/[locale]/"
git checkout main -- components/i18n/ components/landing/ components/examples/
git checkout main -- data/seo/ lib/seo/ lib/i18n/ lib/blog/
git checkout main -- scripts/seo/ reports/seo/
git checkout main -- public/og/ public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/examples/
git checkout main -- package.json

# Then explicit add + review
git add -A
git reset HEAD -- components/studio/ lib/studio/ lib/ai/ app/api/ai/ scripts/diagnose-fal-*.mjs reports/ai/ 2>/dev/null || true
git diff --cached --name-only   # MUST match bucket A only
```

**Note:** `git checkout main -- path` after branching from `origin/main` copies **committed** files from local `main`; run **B1** files afterward if still uncommitted.

---

## 6. Staged diff simulation (dry-run)

| Set | Count | Source |
|-----|------:|--------|
| Would stage (full SEO vs `origin/main`) | **117** | `git diff --name-only origin/main -- <bucket A paths>` |
| Must NOT stage | **60** | Studio 54 + diagnose 6 |
| Uncommitted SEO only | **19** | §4.1 |

**Excluded from simulation (never add):**

```
components/studio/**
lib/studio/**
lib/ai/**
app/api/ai/**
scripts/diagnose-fal-*.mjs
reports/ai/**
.env.local
.next/**
```

**No `git add` / `git stash` was executed** in Stage 15.

---

## 7. Manual diff review checklist (before real commit)

- [ ] `git diff --cached --name-only` — empty until owner runs add; then re-check
- [ ] **Zero** paths under `components/studio/`, `lib/studio/`, `lib/ai/`, `app/api/ai/`
- [ ] **Zero** `components/auth/`, `app/api/auth/`, `supabase/`, billing paths
- [ ] **Zero** `reports/ai/*.json`, `scripts/diagnose-fal-*`
- [ ] **No** `.env.local`, `.next/`
- [ ] `package.json` diff = SEO scripts only (confirmed vs `origin/main`)
- [ ] `app/[locale]/**` — no studio route files (none in SEO diff set)
- [ ] `examplesIndexPolicy.allowIndex` still `false`
- [ ] `indexableLocales` still `ru`, `en`, `kk` only (no uz/ky/tg/global)
- [ ] `npm run smoke:seo:prelaunch` → **220** URLs, kk=34
- [ ] `npx tsc --noEmit` + `npm run build` PASS
- [ ] `npm run lint` — optional; expect auth/studio FAIL (pre-existing)

---

## 8. Final verification commands (owner runs before commit)

```bash
npm run check:seo:ru-content
npm run check:seo:en-content
npm run check:seo:kk-content
npm run check:seo:content
npm run check:seo:trust
npm run check:seo:examples
npm run check:seo:kk-wave2
npm run smoke:seo:public
npm run smoke:seo:hreflang
npm run smoke:seo:prelaunch
npx tsc --noEmit
npm run build
```

Optional (known failures outside SEO scope):

```bash
npm run lint
```

**Stage 14 last run:** all SEO checks + tsc + build **PASS** (2026-05-20). Re-run after staging.

---

## 9. Suggested commit message (NOT EXECUTED)

### Option A — Full SEO program (vs `origin/main`)

```
seo: RU/EN/KK marketing site Stages 1–13.1

- robots, sitemap (220 URLs), hreflang, qualityGate index policy
- 40 RU + 40 EN blog articles; 18 approved KK articles
- KK trust pages indexed (how-it-works, quality, faq)
- examples scaffold (noindex); commercial LP enhancements
- icons, manifest, OG assets; SEO check/smoke scripts

Studio, AI pipeline, and auth unchanged in this PR.
```

### Option B — Uncommitted delta only (Stages 13–14)

```
seo: KK wave2 subset + trust index enable (Stage 13–13.1)

- 8 KK wave2 topics; kkBlogStage13Wave2 merge
- KK trust pages published + kkIndexPolicy
- prelaunch/hreflang gates: 220 sitemap, 3 trust triads
- Stage 13–14 audit reports
```

---

## 10. Rollback plan

### Before push

```bash
git restore --staged <file>   # unstage single file
git restore --staged .        # unstage all
git checkout -- <file>        # discard working tree change (careful)
```

If commit created but not pushed:

```bash
git reset --soft HEAD~1       # undo commit, keep changes staged
# or
git reset --mixed HEAD~1      # undo commit, keep changes unstaged
```

### After push / merge

```bash
git revert <seo_commit_sha>   # preferred on shared main
# redeploy previous stable build
npm run smoke:seo:prelaunch   # confirm sitemap/robots restored
```

### Bad index policy

1. Revert `lib/seo/kkIndexPolicy.ts` / `lib/i18n/localeConfig.ts` changes  
2. Rebuild; confirm sitemap drops bad URLs  
3. Re-run `smoke:seo:hreflang` + `smoke:seo:prelaunch`

---

## 11. Remaining launch blockers (Stage 16)

Even after SEO-only commit/merge:

| Blocker | Owner action |
|---------|----------------|
| Studio not launch-ready | Separate Studio PR / QA |
| Live deploy stale | Redeploy with `NEXT_PUBLIC_SITE_URL=https://vitrina.help` |
| Live robots / Cloudflare | Fix `Disallow: /` if still present (Stage 8) |
| Live sitemap/canonical | HTTP verify 220 URLs, hreflang |
| GSC / Yandex | Manual property + sitemap submit **after** live PASS |
| IndexNow | Keep disabled until approved |
| Lint debt | Auth + studio — separate from SEO |

**Do not launch** until Stage 16 checklist complete.

---

## 12. Confirmations

| Item | Status |
|------|--------|
| Code changed in Stage 15 | **No** |
| Content changed | **No** |
| `git commit` | **No** |
| `git push` | **No** |
| Deploy | **No** |
| Studio / AI / auth touched | **No** |
| `.env.local` read/logged | **No** |
| Stage 15 report | **Yes** (this file) |

---

## 13. Acceptance criteria

| # | Criterion | Met |
|---|-----------|-----|
| 1 | Code not changed | yes |
| 2 | Content not changed | yes |
| 3 | No commit | yes |
| 4 | No push | yes |
| 5 | No deploy | yes |
| 6 | Studio not touched | yes |
| 7 | AI not touched | yes |
| 8 | Auth/billing not touched | yes |
| 9 | Full classification | yes (§3) |
| 10 | Safe SEO list | yes (§4) |
| 11 | Exclusion list | yes (§3.3) |
| 12 | git add commands | yes (§5, not run) |
| 13 | Diff checklist | yes (§7) |
| 14 | Verification commands | yes (§8) |
| 15 | Rollback plan | yes (§10) |
| 16 | Stage 15 report | yes |

**Stage 15 dry run: COMPLETE.**
