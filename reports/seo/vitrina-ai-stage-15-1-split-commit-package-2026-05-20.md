# Vitrina AI — Stage 15.1 Split Commit Package (SEO + Studio/AI)

**Date:** 2026-05-20  
**Working branch:** `release/split-seo-studio` (from `origin/main`)  
**Backup branch:** `backup/mixed-seo-studio-before-split-2026-05-20` → snapshot of mixed `main` @ `aac3016`  
**Mixed commit avoided on push:** local `main` @ `aac3016` still exists; **do not** `git push origin main`

---

## 1. Executive summary

Split completed on **`release/split-seo-studio`**:

| Commit | Hash | Files | Scope |
|--------|------|------:|-------|
| **1 SEO-only** | `7611ea0` | **126** | Stages 1–13.1 marketing SEO |
| **2 Studio/AI** | `6c64179` | **60** | Product card / session / AI pipeline |

- **No** single mixed commit on this branch  
- **No** `git push` (main or branch)  
- **No** deploy / GSC / Yandex / IndexNow  
- SEO checks: **PASS** (before and after Studio commit)  
- `tsc` + `build`: **PASS** after commit 2 (failed mid-split until Studio/AI restored)

**vs `origin/main`:** 2 commits, **186** paths changed total.

**vs `backup/mixed…`:** 20-file delta — mostly Stage 13–14 content that was **uncommitted** on backup tip but is **inside SEO commit** `7611ea0` (split branch is ahead of backup commit for KK wave2/trust).

---

## 2. Safety backup

```text
git branch backup/mixed-seo-studio-before-split-2026-05-20
```

Points to **`aac3016`** (`feat(studio): product card workflow, session restore, and SEO batch`).  
Nothing deleted. Stash `split-wip-seo-uncommitted-2026-05-20` was applied and dropped during split.

---

## 3. Branch workflow

```text
git fetch origin
git checkout -b release/split-seo-studio origin/main
# Commit 1: SEO from backup + uncommitted SEO delta
# Commit 2: Studio/AI from backup
```

**Current branch:** `release/split-seo-studio`  
**Not using:** dirty mixed `main` as commit target.

---

## 4. Commit 1 — SEO-only

### Hash & message

```
7611ea0 seo: prepare RU/EN/KK marketing site for launch
```

### Staged verification (pre-commit)

- `git diff --cached --name-only`: **126** paths  
- **Zero** matches: `studio`, `lib/ai`, `app/api/ai`, `reports/ai/*.json`, `auth`, `supabase`  
- Untracked **excluded** from commit: `reports/ai/fal-*-latest.json` (×5)

### Checks (all PASS before commit)

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
| `smoke:seo:prelaunch` | PASS (220 sitemap) |

**Note:** `npx tsc --noEmit` **failed** on SEO-only tree (Studio on `origin/main` without new `lib/ai` from mixed commit). Expected until commit 2.

### SEO file list (126)

<details>
<summary>Full list (click)</summary>

```
.env.example
app/(default)/layout.tsx
app/[locale]/[slug]/page.tsx
app/[locale]/blog/[slug]/page.tsx
app/[locale]/examples/[slug]/page.tsx
app/[locale]/examples/page.tsx
app/[locale]/layout.tsx
app/[locale]/page.tsx
app/apple-icon.png
app/icon.png
app/manifest.ts
app/robots.ts
app/sitemap.ts
components/examples/* (7)
components/i18n/LanguageSwitcher.tsx
components/i18n/LocaleSwitchLink.tsx
components/landing/SaasFooter.tsx
components/landing/SaasLanding.tsx
data/seo/* (17 + kkBlogStage13Wave2)
lib/blog/blogResolve.ts
lib/i18n/* (5)
lib/seo/* (5)
package.json
public/apple-touch-icon.png
public/examples/*
public/icon-192.png
public/icon-512.png
public/og/vitrina-ai-og.png
reports/seo/* (stages 1–15 dry-run reports)
scripts/seo/* (44)
```

</details>

---

## 5. Commit 2 — Studio/AI-only

### Hash & message

```
6c64179 feat(studio): product card workflow, session restore, and AI pipeline updates
```

### Staged verification (pre-commit)

- `git diff --cached --name-only`: **60** paths  
- **Zero** SEO paths in cache (`data/seo`, `scripts/seo`, `app/sitemap`, etc.)

### Included (60)

| Area | Count | Paths |
|------|------:|-------|
| `components/studio/` | 17 | Shell, product card, mask, uploaders, etc. |
| `lib/studio/` | 22 | pipeline, session, product card, try-on helpers |
| `lib/ai/` | 10 | model gen, identity, garment refine vision |
| `app/api/ai/` | 3 | analyze-product-angles, generate-model, refine-product-mask |
| `scripts/diagnose-fal-*` | 6 | Fal diagnostics |
| `reports/ai/` | 1 | `fal-identity-matrix-2026-05-20.md` |

### Excluded from Studio commit

| Item | Reason |
|------|--------|
| All `reports/seo/**` | Commit 1 |
| `data/seo/**`, `scripts/seo/**` | Commit 1 |
| `reports/ai/*.json` (untracked ×5) | Local run artifacts — **not committed** |
| `components/auth/**`, `app/api/auth/**` | Not in mixed diff |
| `supabase/**`, billing | Not in mixed diff |
| `.env.local` | Gitignored |

### Auth / billing / Supabase

**No changes** in either commit (verified via path lists).

### Checks (after commit 2)

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `smoke:seo:prelaunch` | **PASS** (SEO policy unchanged) |

---

## 6. Final branch state

```text
git log --oneline -3
6c64179 feat(studio): product card workflow, session restore, and AI pipeline updates
7611ea0 seo: prepare RU/EN/KK marketing site for launch
da461f2 fix(studio): remove duplicate result header above product card export  ← origin/main
```

```text
git status --short
?? reports/ai/fal-*-latest.json (×5 only)
```

```text
git diff --name-only origin/main...HEAD  → 186 paths
git rev-list --count origin/main..HEAD   → 2 commits
```

### Separation confirmed

| Check | OK |
|-------|-----|
| SEO and Studio in **different** commits | yes |
| Commit 1 has **no** studio/ai paths | yes |
| Commit 2 has **no** seo scripts/data paths | yes |
| `git push origin main` | **not done** |
| Deploy / GSC / Yandex / IndexNow | **not done** |

---

## 7. Parity vs mixed `aac3016`

| Source | Note |
|--------|------|
| `backup/mixed-seo-studio-before-split-2026-05-20` | Commit `aac3016` + old uncommitted SEO |
| `release/split-seo-studio` HEAD | `aac3016` content ≈ split commits **plus** Stage 13–14 uncommitted SEO now in `7611ea0` |

`git diff --shortstat backup/mixed… HEAD` → 20 files (KK wave2/trust/audit only on split branch).

**Local `main`:** still at `aac3016` (mixed). Owner can later:

```text
git checkout main
git reset --hard release/split-seo-studio   # only if they want main = split (local only)
```

Do **not** push `main` until policy approved.

---

## 8. Push policy

**Not executed:**

```text
git push origin main          # FORBIDDEN for this task
git push origin release/split-seo-studio   # needs explicit owner approval
```

When approved:

```text
git push -u origin release/split-seo-studio
```

Then open PR **into `main`** (or merge via PR), not force-push mixed history.

---

## 9. Rollback

### Undo split commits (branch not pushed)

```text
git checkout release/split-seo-studio
git reset --hard origin/main
```

Restore mixed state:

```text
git checkout backup/mixed-seo-studio-before-split-2026-05-20
```

### After push

```text
git revert 6c64179
git revert 7611ea0
# or revert merge commit on main
```

Redeploy previous stable; re-run `smoke:seo:prelaunch`.

---

## 10. Remaining launch blockers (Stage 16)

SEO split does **not** launch production:

- Studio product readiness (separate track)
- Deploy `release/split-seo-studio` (or merged main) with `NEXT_PUBLIC_SITE_URL=https://vitrina.help`
- Live robots/sitemap/canonical verification
- Cloudflare/cache if old `Disallow: /` persists
- GSC/Yandex manual submit after live PASS
- IndexNow off until approved

---

## 11. Owner commands reference (dry-run from Stage 15)

### Strict SEO add (used via `git checkout backup --` + explicit add)

See Stage 15 report §5 Variant B1/B2 — executed as checkout-from-backup, not `git add .`

### Pre-commit verification (re-run anytime)

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

---

## 12. Confirmations

| Item | Status |
|------|--------|
| Code/content changed in this doc step | Report only (split already done) |
| Commits created | **yes** (2 on `release/split-seo-studio`) |
| Push main | **no** |
| Push branch | **no** |
| Deploy | **no** |
| SEO ⊄ Studio commit | **yes** |
| Studio ⊄ SEO commit | **yes** |
| `.env.local` committed | **no** |

**Stage 15.1 split: COMPLETE.**
