# Vitrina token worktree packaging — 2026-05-21

## Verdict

**READY FOR TOKEN PR**

Token scope собран в отдельном worktree; dirty source и backup не трогали.

---

## Worktree

| Item | Result |
|------|--------|
| Worktree создан | **да** — `C:\dev\kaspi-vitrina-tokens` |
| Команда | `git worktree add -b feat/vitrina-tokens ../kaspi-vitrina-tokens origin/main` |
| База | `origin/main` @ `da461f2` |
| Ветка | `feat/vitrina-tokens` |

---

## Source dirty tree

| Правило | Соблюдено |
|---------|-----------|
| `C:\dev\kaspi` = SOURCE / DIRTY | **да** |
| `git reset --hard` / `git clean -fd` | **нет** |
| `git add -A` в source | **нет** |
| Удаление untracked / backup | **нет** |
| Коммит `.env.local` | **нет** |

Все не-token изменения (Studio i18n pass-2, SEO audience, icons, try-on max и т.д.) **остались** в `C:\dev\kaspi`.

---

## ZERO-LOSS: Studio / SEO / icons не потеряны

Перед packaging сделан inventory (см. `reports/release/vitrina-zero-loss-inventory-2026-05-21.md` в source).

| Артефакт | Путь | Статус |
|----------|------|--------|
| In-repo backup | `backup/vitrina-zero-loss-2026-05-21/` | на месте в source |
| Full tree mirror | `C:\dev\backup\vitrina-working-tree-2026-05-21\` | robocopy mirror |
| Studio i18n (RU/EN/KK pass-2) | `lib/studio/i18n/**`, ~40 `components/studio/*` | **только в source**, не в token branch |
| SEO audience pages | `data/seo/audiencePages.ts`, routes, `scripts/seo/**` | **только в source** |
| Icons / brand assets | `app/icon.png`, `public/icons/**`, `assets/brand/**` | **только в source** |
| Studio reports | `reports/studio/**` | **только в source** |
| SEO reports (non-billing) | `reports/seo/**` | **только в source** |
| AI JSON reports | `reports/ai/*.json` | **только в source**, не коммитились |

Token worktree **не заменял** dirty tree; follow-up ветки (icons → studio i18n → SEO audience) собираются из source/backup по плану.

---

## Перенесённые token files

### Целиком

- `lib/tokens/**`
- `lib/payments/**`
- `lib/images/applyVitrinaWatermark.ts`
- `app/api/tokens/**`
- `app/api/webhooks/**`
- `app/[locale]/(marketing)/tokens/page.tsx` (единственная marketing-страница в scope)
- `components/auth/TokenBalancePill.tsx`
- `components/tokens/**`
- `components/studio/TokenBillingModal.tsx`
- `components/studio/TokenChargeHint.tsx` (без `StudioLocaleContext`)
- `components/landing/SaasHeader.tsx`
- `supabase/migrations/202605210001_token_ledger.sql`
- `scripts/test-tokens-ledger.ts`
- `scripts/billing/**`, `scripts/db/**`
- `reports/billing/**` (billing/token readiness reports)

### Patch-only / минимальные пересечения

- `app/api/ai/*` — 11 routes с `wrapAiPost` (см. таблицу ниже)
- `components/studio/StudioShell.tsx` — pill + billing modal/handlers, **без** i18n pass-2
- `components/studio/ProcessedAssetsPanel.tsx` — `onTokenBillingError`
- `lib/studio/generateSingleStudioModel.ts` — `throwIfTokenBillingError`
- `data/seo/staticPages.ts` — только `pricingPage` (/cost token copy)
- `next.config.ts` — redirects `/pricing` → `/:locale/cost`
- `package.json` — script `test:tokens`
- `.env.example` — Lemon/token placeholders
- `lib/i18n/localeConfig.ts` — `indexableLocales` (для pill/tokens UI)
- `lib/seo/metadata.ts`, `lib/seo/site.ts` — `Partial` pathByLocale для `/tokens`
- `lib/studio/productPhotos.ts` — `MAX_CLOTHING_PRODUCT_SET` (angles API)
- `lib/ai/refineGarmentSelectionSchemas.ts`, `refineGarmentSelectionVision.ts` (deps для wrapped mask route)

### AI routes wrapped (11/11)

| Route | Wrapped |
|-------|---------|
| `tryon` | yes |
| `remove-background` | yes |
| `image/enhance` | yes |
| `generate-model` | yes (main + wrap only) |
| `product-shot` | yes |
| `scene/generate` | yes |
| `video/generate` | yes |
| `prompt/enhance` | yes |
| `refine-product-mask` | yes |
| `image/preservation-analyze` | yes |
| `analyze-product-angles` | yes |
| `pricing` | **no** |
| `analyze-product-description` | **no** |

### TokenBalancePill

- `components/landing/SaasHeader.tsx`
- `components/studio/StudioShell.tsx` (patch-only)

---

## Исключено из token branch

- `.env.local`, `.cursor/**`, `backup/**`
- `reports/studio/**`, `reports/seo/**`, `reports/ai/**` (в т.ч. `*.json`)
- `data/seo/audiencePages.ts`, audience routes, `scripts/seo/**`
- Full `lib/studio/i18n/**`, mass studio i18n UI
- Icons/assets: `app/icon.png`, `apple-icon`, `favicon`, `public/icons/**`, `assets/brand/**`
- Orphan AI copies (удалены из worktree): `app/api/ai/route.ts`, `prompt/route.ts`, `video/route.ts`, `scene/route.ts`, `image/route.ts`

---

## Verification (`C:\dev\kaspi-vitrina-tokens`)

| Check | Result |
|-------|--------|
| `npm run test:tokens` | **PASS** |
| `npm run build` | **PASS** |
| Forbidden paths в feature commit `46af3bf` | **none** |

---

## Git / push

| Item | Value |
|------|--------|
| Feature commit | `46af3bf` — `feat(billing): add Lemon token balance and AI usage gate` |
| Remote branch | `origin/feat/vitrina-tokens` — **pushed** |
| PR | https://github.com/loomany/market.kk/pull/new/feat/vitrina-tokens |
| Этот report commit | _(см. ниже после push)_ |

---

## Owner before deploy (не выполнялось)

1. Production env: `LEMON_*`, Supabase service role, `APP_SESSION_SECRET`
2. Migration `202605210001_token_ledger.sql` на production DB
3. Lemon webhook → `/api/webhooks`
4. Live smoke: `reports/billing/vitrina-token-live-smoke-2026-05-21.md`
5. Test payment — **только по явному разрешению**

---

## Следующие ветки (порядок)

1. `feat/vitrina-tokens` ← этот PR  
2. `fix/vitrina-icons-seo-assets`  
3. `feat/vitrina-studio-i18n-ru-en-kk`  
4. `feat/vitrina-seo-audience-pages`
