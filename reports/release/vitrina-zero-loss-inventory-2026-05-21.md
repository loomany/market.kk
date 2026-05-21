# Vitrina — ZERO-LOSS inventory (2026-05-21)

**Purpose:** Full snapshot of dirty working tree before splitting into separate commits/branches.  
**Actions taken:** backup only — no reset, clean, commit, push, deploy, or file deletion.

---

## 1. Safety backup

| Artifact | Location | Status |
|----------|----------|--------|
| Git snapshots | `backup/vitrina-zero-loss-2026-05-21/` | **Created** |
| `git-status-short.txt` | same | yes |
| `current-branch.txt` | same | yes |
| `git-log-20.txt` | same | yes |
| `tracked-diff-name-only.txt` | same | yes |
| `tracked-working-tree.patch` | same | yes (~384 KB) |
| `staged.patch` | same | yes (empty if nothing staged) |
| `untracked-files.txt` | same | yes |
| Full tree copy | `C:\dev\backup\vitrina-working-tree-2026-05-21\` | **Created** (robocopy exit code 1 = files copied) |

**Robocopy excludes:** `node_modules`, `.next`, `.git`, `.vercel`  
**Robocopy excludes file:** `.env.local` (not copied — secrets stay only in working tree)

**Do not commit** `backup/` into product branches unless you explicitly want inventory artifacts in git (currently untracked under `backup/`).

---

## 2. Current git state

| Item | Value |
|------|--------|
| **Branch** | `release/vitrina-seo-audience-pages` |
| **Recent commits** | `e4dd268` docs SEO 16.2 packaging · `a9df2eb` audience landing RU/EN/KK · `6c64179` studio product card / AI |
| **Staged changes** | none observed (verify `staged.patch` before commit) |
| **Modified tracked** | 76 files |
| **Untracked (excl. self-backup)** | 75 paths |
| **Total inventory paths** | **118** (modified + untracked, excluding `backup/*` mirror files) |

**Note:** Audience route **pages** (`dlya-kogo`, `who-it-is-for`, `kimge`) are largely **already on branch** from `a9df2eb`. Dirty SEO-related work is mostly **regenerated** `data/seo/audiencePages.ts`, path map, scripts, and site metadata/icons — not whole new route trees.

---

## 3. File counts by scope (primary assignment)

Counts are **primary bucket** (a file may appear in overlap list below).

| Scope | ~Count | Notes |
|-------|--------|--------|
| **A. Tokens / Lemon billing** | **28** | New `lib/tokens`, payments, webhooks, migration, AI route wrappers, token UI |
| **B. Studio i18n RU/EN/KK** | **49** | `lib/studio/i18n/**`, most `components/studio/**`, `scripts/studio/check-studio-i18n.ts` |
| **C. SEO audience / metadata** | **12** | `audiencePages.ts`, `audiencePathMap`, audience build scripts, `jsonLd`/`metadata`/`staticPages` |
| **D. Icons / assets** | **15** | `app/icon.png`, favicons, PWA icons, `assets/brand/icon-source*.png`, `siteIcons`, generator script |
| **E. Reports & helper scripts** | **18** | `reports/billing/**`, `reports/studio/**`, billing/seo/db scripts |
| **F. Noise / not for commit** | **7** | `.cursor/**`, `reports/ai/*.json` (5), `reports/_verify-256.png` |

---

## 4. A — Vitrina Tokens / Lemon billing

### New (untracked)

```
app/[locale]/(marketing)/tokens/page.tsx
app/api/tokens/balance/route.ts
app/api/tokens/checkout/route.ts
app/api/webhooks/route.ts
components/auth/TokenBalancePill.tsx
components/studio/TokenBillingModal.tsx
components/studio/TokenChargeHint.tsx
components/tokens/TokensPageClient.tsx
lib/images/applyVitrinaWatermark.ts
lib/payments/lemonSqueezy.ts
lib/tokens/billingErrorPayload.ts
lib/tokens/config.ts
lib/tokens/formatTokens.ts
lib/tokens/generationBilling.ts
lib/tokens/generationCostConfig.ts
lib/tokens/guestGeneration.ts
lib/tokens/tokenChargeLabel.ts
lib/tokens/tokenLedger.ts
lib/tokens/wrapAiPost.ts
supabase/migrations/202605210001_token_ledger.sql
scripts/test-tokens-ledger.ts
scripts/billing/test-webhook-hmac.mjs
scripts/billing/verify-lemon-checkout-preview.mjs
scripts/billing/verify-lemon-variant.mjs
scripts/db/apply-migrations.mjs
scripts/db/check-db-state.mjs
reports/billing/*.md (9 files)
```

### Modified (tracked)

```
.env.example
app/api/ai/analyze-product-angles/route.ts
app/api/ai/generate-model/route.ts
app/api/ai/image/enhance/route.ts
app/api/ai/image/preservation-analyze/route.ts
app/api/ai/product-shot/route.ts
app/api/ai/prompt/enhance/route.ts
app/api/ai/refine-product-mask/route.ts
app/api/ai/remove-background/route.ts
app/api/ai/scene/generate/route.ts
app/api/ai/tryon/route.ts
app/api/ai/video/generate/route.ts
components/landing/SaasHeader.tsx
data/seo/staticPages.ts          ← token/cost copy + SEO (OVERLAP)
package.json
package-lock.json
next.config.ts                   ← OVERLAP
```

---

## 5. B — Studio i18n RU/EN/KK (Pass 1 + Pass 2)

### New (untracked)

```
lib/studio/i18n/** (14 files: Ru/En/Kk, Pass2, Pass2Remainder, index, types, helpers)
components/studio/StudioLanguageSwitcher.tsx
components/studio/StudioLocaleContext.tsx
scripts/studio/check-studio-i18n.ts
reports/studio/vitrina-ai-studio-i18n-ru-en-kk-2026-05-21.md
reports/studio/vitrina-ai-studio-i18n-pass-2-ru-en-kk-2026-05-21.md
```

### Modified (tracked) — `components/studio/`

```
AiEditorPicker.tsx, AspectRatioSelectField.tsx, BeforeAfterPreview.tsx,
ClothingPreviewPanel.tsx, GarmentSettingsPanel.tsx, GenerationResultGrid.tsx,
ImageSettingsForm.tsx, ImageUploader.tsx, ModelAnglesField.tsx,
ModelInputModeSelector.tsx, ModelPresetSelector.tsx, ModelPromptComposer.tsx,
ModelReadyCard.tsx, ModelScenarioSelector.tsx, ModelSourcePanel.tsx,
PostProcessingActions.tsx, PreviewCard.tsx, PreviewImageCarousel.tsx,
ProcessedAssetsPanel.tsx, ProductCardDualExportPanel.tsx, ProductCardPreviewPanel.tsx,
ProductCheckPanel.tsx, ProductMaskEditor.tsx, ProductPhotosUploader.tsx,
ProductPoseFromPhotoCard.tsx, ProductSelectionPanel.tsx, ProductSetProgressRail.tsx,
ProductShotChecklist.tsx, ProductShotSettingsPanel.tsx, QualityChecklist.tsx,
SaasPipelineCountdown.tsx, StudioAssetPreview.tsx, StudioFilesList.tsx,
StudioFilesPagination.tsx, StudioModeSelector.tsx, StudioSaaSPreviewChrome.tsx,
StudioShell.tsx, StudioWorkflowStep.tsx, TryOnResultActions.tsx, VideoSettingsForm.tsx,
useStudioLocale.ts
```

### Modified — `lib/studio/` (non-i18n path, i18n-related)

```
lib/studio/assetDisplayLabels.ts    ← thin wrapper → lib/studio/i18n/assetDisplayLabels.ts
lib/studio/lingerieCropUiCopy.ts
lib/studio/tryOnMaxToggle.ts
lib/studio/generateSingleStudioModel.ts
```

**`package.json` scripts added:** `check:studio:i18n`, `test:tokens`, `audience:build`, etc. — **OVERLAP**.

---

## 6. C — SEO audience pages

### On branch already (committed)

- `app/[locale]/(marketing)/dlya-kogo/[slug]/page.tsx`
- `app/[locale]/(marketing)/who-it-is-for/[slug]/page.tsx`
- `app/[locale]/(marketing)/kimge/[slug]/page.tsx`
- Related components from commit `a9df2eb`

### Dirty in working tree

```
data/seo/audiencePages.ts          ← modified (may be LF-only; rebuild output)
data/seo/staticPages.ts            ← OVERLAP with tokens/cost copy
lib/seo/audiencePathMap.ts         ← untracked
lib/seo/jsonLd.ts                  ← modified
lib/seo/metadata.ts                ← modified
scripts/seo/_merge-audience-copy.mjs
scripts/seo/audience-pages-copy.mjs
scripts/seo/audience-pages-en-kk-full.mjs
scripts/seo/complete-audience-pages-build.mjs
scripts/seo/generate-en-kk-copy.mjs
reports/seo/vitrina-ai-stage-15-1-split-commit-package-2026-05-20.md
```

---

## 7. D — Icons / assets (CRITICAL — do not delete or regenerate without owner OK)

| File | Status |
|------|--------|
| `app/icon.png` | **modified** — required for `smoke:seo:prelaunch` |
| `app/apple-icon.png` | modified |
| `app/favicon.ico` | modified |
| `app/manifest.ts` | modified |
| `public/apple-touch-icon.png` | modified |
| `public/icon-192.png` | modified |
| `public/icon-512.png` | modified |
| `public/favicon.ico` | **untracked** |
| `public/icon-16.png` | untracked |
| `public/icon-32.png` | untracked |
| `public/icon-48.png` | untracked |
| `assets/brand/icon-source.png` | untracked |
| `assets/brand/icon-source-raw.png` | untracked |
| `lib/seo/siteIcons.ts` | untracked |
| `scripts/seo/generate-site-icons.mjs` | untracked |
| `scripts/seo/smoke-prelaunch-gate.ts` | modified |

**Verified in robocopy backup:** `C:\dev\backup\vitrina-working-tree-2026-05-21\app\icon.png` exists.

---

## 8. E — Reports / scripts (cross-cutting)

| Path | Scope |
|------|--------|
| `reports/billing/**` | Tokens |
| `reports/studio/**` | Studio i18n |
| `reports/seo/vitrina-ai-stage-15-1-split-commit-package-2026-05-20.md` | SEO packaging |
| `scripts/seo/smoke-prelaunch-gate.ts` | SEO + icons |

---

## 9. F — Noise / do NOT commit

```
.cursor/settings.json
reports/ai/fal-identity-matrix-latest.json
reports/ai/fal-instantid-5-poses-latest.json
reports/ai/fal-lingerie-5-edits-latest.json
reports/ai/fal-lingerie-production-latest.json
reports/ai/fal-nano-t2i-bible-3-latest.json
reports/_verify-256.png
.env.local                    ← never commit (not in git status = good)
```

Optional: exclude `backup/vitrina-zero-loss-2026-05-21/` from any product commit (keep local only).

---

## 10. Cross-scope overlaps (split carefully)

| File | Scopes | How to commit |
|------|--------|----------------|
| **`components/studio/StudioShell.tsx`** | Tokens + Studio i18n | `git add -p` or token branch first, then i18n rebase; **must keep** `TokenBalancePill`, `TokenBillingModal`, `useStudioCopy` |
| **`package.json`** / **`package-lock.json`** | All | Add scripts per branch (`test:tokens`, `check:studio:i18n`, `audience:build`) or one chore commit last |
| **`next.config.ts`** | Tokens? SEO? | Review diff before scope pick |
| **`data/seo/staticPages.ts`** | Tokens (/cost copy) + SEO | Likely split hunks or tokens-first |
| **`components/landing/SaasHeader.tsx`** | Tokens (+ nav to /tokens) | Token branch |
| **`app/(default)/layout.tsx`** | Site chrome | Decide with icons or tokens |
| **`components/i18n/LanguageSwitcher.tsx`** | Marketing i18n | Separate or with SEO |
| **`components/auth/WhatsAppLoginModal.tsx`** | Auth UX | Separate small commit |
| **`lib/studio/assetDisplayLabels.ts`** | Studio i18n | With i18n branch |
| **`SaasFooter.tsx`** | Marketing | Low risk, any marketing commit |

---

## 11. Must preserve (owner constraints)

- All **icon PNG/ICO** listed in §7 — owner remade icons; **no delete, no regen without explicit command**
- Entire **`lib/studio/i18n/**`** tree — Pass 2 work
- **`supabase/migrations/202605210001_token_ledger.sql`**
- **`lib/tokens/**`**, **`lib/payments/**`**
- **`.env.local`** — never commit; keep only on machine
- **`tracked-working-tree.patch`** — full rollback reference

---

## 12. Recommended branch order (no commits until owner approves)

### Branch 1: `feat/vitrina-tokens`

- Lemon checkout, ledger, migration, webhooks, AI billing wrappers, TokenBalancePill, `/tokens`, cost/static copy in `staticPages`, SaasHeader, `.env.example`
- **Exclude:** full Studio i18n dictionaries, audience regen scripts (unless needed for build)

**Checks:** `npm run test:tokens`, `npm run build`

### Branch 2: `feat/vitrina-studio-i18n-ru-en-kk`

- `lib/studio/i18n/**`, studio components i18n, `scripts/studio/check-studio-i18n.ts`, `reports/studio/**`
- **StudioShell:** merge/rebase on top of token branch or patch only i18n hunks

**Checks:** `npm run check:studio:i18n`, `npx tsc --noEmit`, `npm run build`

### Branch 3: `feat/vitrina-seo-audience-pages`

- `data/seo/audiencePages.ts`, `audiencePathMap`, audience build scripts, `jsonLd`/`metadata` if audience-only
- May already be mostly on `release/vitrina-seo-audience-pages` — diff vs `main` before splitting

**Checks:** `npm run audience:build`, `npm run check:seo:audience-pages`, content/trust/examples smokes

### Branch 4: `fix/vitrina-icons-seo-assets`

- All icon/favicon/manifest files + `siteIcons.ts` + `generate-site-icons.mjs`
- Can merge with Branch 3 if prelaunch smoke is priority

**Checks:** `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` (needs `app/icon.png`)

### Branch 5 (optional): `chore/reports-and-packaging`

- `reports/billing/**`, `reports/release/**`, non-runtime scripts

---

## 13. What was NOT done

- `git reset --hard` / `git clean` / `git add -A`
- Branch switch
- Commit / push / deploy
- Test payment
- Deleting untracked files or icons

---

## 14. Next step for owner

1. Confirm backup paths OK (`backup/...` + `C:\dev\backup\vitrina-working-tree-2026-05-21\`).
2. Choose **first scope to package** (recommended: **tokens**, then **studio i18n**).
3. Use **`git add -p`** on overlap files (especially `StudioShell.tsx`, `package.json`, `staticPages.ts`).

**Waiting for owner decision before any commit.**
