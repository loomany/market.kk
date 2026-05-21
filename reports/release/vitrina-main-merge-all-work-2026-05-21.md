# Vitrina main merge — all work — 2026-05-21

## Verdict

**MAIN PUSH: YES** — snapshot scope on `origin/main` @ `29a2a61`

Deploy may follow CI/CD automatically. Test payment: **not done**.

---

## Merge

| Item | Value |
|------|--------|
| Source branch | `origin/snapshot/vitrina-all-work-2026-05-21` @ `91d01fa` |
| Target branch | `main` |
| Worktree | `C:\dev\kaspi-main-merge` |
| Merge commit | `8037f5a` — `merge: release Vitrina tokens, studio i18n, SEO audience and assets` |
| Post-merge fix | `29a2a61` — remove duplicate `app/[locale]/examples` (main vs marketing route clash) |
| **HEAD pushed** | `29a2a61` |

### Snapshot HEAD verified

- `91d01fa` docs(release): snapshot checks green after token billing modal i18n
- includes `a67e6fc` fix(studio): localize token billing modal

---

## Conflicts

**39 files** — resolved by taking **snapshot version** (`git checkout --theirs`) for all conflicted paths:

- Studio components (Shell, panels, i18n-related UI)
- SEO: `staticPages`, `blogArticles`, `trustPages`, `sitemap`, metadata, smoke scripts
- Icons: `app/icon.png`, `apple-icon.png`, `public/icon-*.png`
- `package.json`, `LanguageSwitcher`, landing components, `refine-product-mask`, etc.

**Post-merge build fix:** deleted legacy `app/[locale]/examples/` (2 pages) — duplicate of `(marketing)/examples` after merge left both trees.

---

## Scope in main (from snapshot)

| Scope | In main |
|-------|---------|
| Tokens / Lemon billing | yes |
| Studio i18n RU/EN/KK (536 keys) | yes |
| SEO audience (`dlya-kogo`, `kimge`, `who-it-is-for`) | yes |
| Icons / manifest / OG assets | yes |
| Token migration (`drop policy if exists`) | yes (via snapshot; prod already applied by owner) |

---

## Secrets / noise excluded

| Path | In git? |
|------|---------|
| `.env.local` | **no** |
| `backup/**` | **no** |
| `.cursor/**` | **no** |
| `reports/ai/*.json` | **no** |
| `node_modules` / `.next` | **no** |

`git ls-files` grep: clean.

---

## Checks (`C:\dev\kaspi-main-merge` @ `29a2a61`)

| Command | Result |
|---------|--------|
| `npm run test:tokens` | **PASS** |
| `npm run check:studio:i18n` | **PASS** |
| `npm run build` | **PASS** (1282 static pages) |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `npm run smoke:seo:prelaunch` | **PASS** (`NEXT_PUBLIC_SITE_URL=https://vitrina.help`) |

---

## Push

| Item | Value |
|------|--------|
| `git push origin main` | **yes** (`da461f2..29a2a61`) |
| Main touched | **yes** (intentional per owner) |
| Snapshot branch | **not modified** |
| `C:\dev\kaspi` dirty source | **not deleted** — still backup/source |

---

## Post-deploy checks (owner / after CI)

Verify live when deploy completes:

- https://vitrina.help/ru
- https://vitrina.help/ru/studio
- https://vitrina.help/ru/tokens
- https://vitrina.help/ru/cost
- https://vitrina.help/sitemap.xml
- https://vitrina.help/robots.txt

**Test payment ($10):** not performed — explicit owner OK required.

---

## Clean local work (recommended)

After owner confirms live site:

```bash
cd C:\dev
git clone https://github.com/loomany/market.kk.git kaspi-clean
```

Keep `C:\dev\kaspi` and backups until confirmed. Do not `git clean` / delete source tree yet.

---

## Related branches (unchanged on remote)

- `feat/vitrina-tokens` @ `e3f73cf` — can close or merge superseded by main snapshot
- `snapshot/vitrina-all-work-2026-05-21` @ `91d01fa` — merged into main
