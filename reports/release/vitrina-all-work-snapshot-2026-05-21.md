# Vitrina all-work safety snapshot — 2026-05-21

## Verdict

**READY AS SAFETY SNAPSHOT BRANCH — NOT A PRODUCTION DEPLOY YET**

Один общий коммит со всей работой из dirty tree; deploy / test payment / push в main **не выполнялись**.

---

## Git

| Item | Value |
|------|--------|
| Branch | `snapshot/vitrina-all-work-2026-05-21` |
| Base (до snapshot) | `release/vitrina-seo-audience-pages` @ working tree |
| Commit | `5356110` — `chore: save Vitrina tokens, studio i18n, SEO audience and assets work` |
| Files in commit | **147** (+17300 / −1180 lines) |
| Push | `origin/snapshot/vitrina-all-work-2026-05-21` |
| PR (optional) | https://github.com/loomany/market.kk/pull/new/snapshot/vitrina-all-work-2026-05-21 |
| Main | **не трогали** |

---

## Scopes в коммите

### Tokens / billing

- `lib/tokens/**`, `lib/payments/**`, `lib/images/applyVitrinaWatermark.ts`
- `app/api/tokens/**`, `app/api/webhooks/**`
- `app/api/ai/**` (все изменённые AI routes + billing gate)
- `app/[locale]/(marketing)/tokens/**`
- `components/auth/TokenBalancePill.tsx`, `components/tokens/**`
- `components/studio/TokenBillingModal.tsx`, `TokenChargeHint.tsx`
- `supabase/migrations/202605210001_token_ledger.sql` (с `drop policy if exists`)
- `scripts/test-tokens-ledger.ts`, `scripts/billing/**`, `scripts/db/**`
- `reports/billing/**`

### Studio i18n (RU / EN / KK)

- `lib/studio/i18n/**` (527 keys, pass-2)
- `components/studio/**` (массовая локализация UI)
- `components/studio/StudioLocaleContext.tsx`, `StudioLanguageSwitcher.tsx`
- `scripts/studio/check-studio-i18n.ts`
- `reports/studio/**`

### SEO audience

- `data/seo/audiencePages.ts`, `data/seo/staticPages.ts`
- Audience routes: `/[locale]/dlya-kogo/[slug]`, `/kimge/[slug]`, `/who-it-is-for/[slug]`
- `lib/seo/audiencePathMap.ts`, `lib/seo/jsonLd.ts`, metadata/site helpers
- `scripts/seo/**` (audience build, icon generator, smokes)
- `reports/seo/**` (stage-15-1 package note)

### Icons / assets

- `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `app/manifest.ts`
- `public/favicon.ico`, `public/icon-*.png`, `public/apple-touch-icon.png`
- `assets/brand/icon-source.png`, `icon-source-raw.png`
- `lib/seo/siteIcons.ts`

### Shared / release docs

- `package.json`, `package-lock.json`, `next.config.ts`, `.env.example`
- `reports/release/vitrina-zero-loss-inventory-2026-05-21.md`
- `reports/release/vitrina-token-worktree-packaging-2026-05-21.md`

---

## Исключено (намеренно)

| Path | Причина |
|------|---------|
| `.env.local` | secrets — в коммите **нет** (`.gitignore` `.env*`, кроме `.env.example`) |
| `backup/**` | zero-loss mirror, не VCS |
| `.cursor/**` | IDE/local |
| `reports/ai/*.json` | временные debug JSON (5 файлов) |
| `reports/_verify-256.png` | временный verify screenshot |
| `node_modules/**`, `.next/**` | gitignore |

Подтверждение: `git show HEAD` — **нет** `.env.local`, `backup/`, `.cursor/`.

---

## Осталось untracked после коммита

```
?? .cursor/
?? backup/
?? reports/_verify-256.png
?? reports/ai/*.json (5 files)
```

Локальные backup по-прежнему:

- `backup/vitrina-zero-loss-2026-05-21/`
- `C:\dev\backup\vitrina-working-tree-2026-05-21\`

---

## Проверки (на момент коммита)

| Command | Result |
|---------|--------|
| `npm run test:tokens` | **PASS** |
| `npm run check:studio:i18n` | **FAIL** — `TokenBillingModal.tsx`: hardcoded RU/KK строки (баланс, «Закрыть», CTA); не блокирует snapshot, но нужно до production |
| `npm run build` | **PASS** (1282 static pages) |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |

---

## Можно ли использовать ветку

| Use case | OK? |
|----------|-----|
| Backup / восстановление всей работы | **да** — полный snapshot всех scope |
| Code review «что накопилось» | **да** |
| Production deploy | **нет** — нужен полный smoke, fix `check:studio:i18n`, prod env, migration на DB, Lemon webhook |
| Test payment | **нет** — только по явному OK |

---

## Связь с split-ветками

Отдельно уже есть чистый token PR:

- `feat/vitrina-tokens` @ `46af3bf` (+ docs commits)

Этот snapshot **не заменяет** split PRs — он страховка «всё в одном месте».

Рекомендуемый порядок merge в main позже:

1. `feat/vitrina-tokens`
2. `fix/vitrina-icons-seo-assets`
3. `feat/vitrina-studio-i18n-ru-en-kk`
4. `feat/vitrina-seo-audience-pages`

---

## Owner next steps

1. Держать snapshot branch на remote как страховку.
2. Продолжить split PRs из dirty tree / backup при необходимости.
3. Перед deploy: исправить `TokenBillingModal` i18n, `smoke:seo:prelaunch`, prod secrets, DB migration, live token smoke.
