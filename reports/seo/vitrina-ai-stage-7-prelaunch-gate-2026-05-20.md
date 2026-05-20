# Vitrina AI — Stage 7 Pre-Production SEO Launch Gate

**Date:** 2026-05-20  
**Status:** Gate complete — code/policy ready; production env is the blocker  
**Commit / push / deploy / GSC / Yandex / IndexNow submit:** Not performed (by design)

---

## Executive summary

Stages 1–6 remain intact in the working tree: ru/en SEO core, 20+20 articles, controlled kk index (10 triads), uz/ky/tg/global stay noindex. All SEO content and policy scripts pass. `npx tsc --noEmit` and `npm run build` pass (1105 static pages).

**Recommendation: launch ready after env fix** — set `NEXT_PUBLIC_SITE_URL` to the real production origin on the deploy host before go-live. Until then, sitemap/robots/canonical/hreflang absolute URLs resolve to `http://localhost:3000` locally (expected); the prelaunch gate correctly flags this as **not ready for live SEO**.

No Studio, AI pipeline, auth, billing, or Supabase changes were made for Stage 7.

---

## 1. Dirty tree summary (`git status --short`)

Working tree mixes SEO stages (A–G) with unrelated Studio/AI work (H). **Risk:** a single commit could bundle marketing SEO launch with studio experiments — prefer staged commits or `git add -p` by path.

### A. Stage 1 — SEO infra
`app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`, `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/seo/qualityGate.ts`, `lib/i18n/localeConfig.ts`, `lib/i18n/locales.ts`, `components/i18n/LanguageSwitcher.tsx`, `components/i18n/LocaleSwitchLink.tsx`, `public/og/`, `public/icon-*.png`, `public/apple-touch-icon.png`, `.env.example`, `package.json` (SEO scripts), `reports/seo/vitrina-ai-stage-1-seo-infra-2026-05-20.md`, audit reports.

### B. Stage 2 — RU content
`data/seo/ruBlogStage2Content.ts`, `data/seo/ruFeatureLandingEnhancements.ts`, `reports/seo/vitrina-ai-stage-2-ru-content-2026-05-20.md`.

### C. Stage 2.1 — Build gate
`reports/seo/vitrina-ai-stage-2-1-build-gate-2026-05-20.md`, routing/locale fixes in `app/[locale]/**`, `lib/blog/blogResolve.ts`.

### D. Stage 3 — EN content
`data/seo/enBlogStage3Content.ts`, `data/seo/enFeatureLandingEnhancements.ts`, `reports/seo/vitrina-ai-stage-3-en-translation-2026-05-20.md`.

### E. Stage 4 — EN polish
`data/seo/enBlogStage4LegacyContent.ts`, `scripts/seo/smoke-hreflang-pairs.ts`, `reports/seo/vitrina-ai-stage-4-en-quality-polish-2026-05-20.md`.

### F. Stage 5 — KK foundation
`data/seo/kkBlogStage5Content.ts`, `data/seo/kkFeatureLandingEnhancements.ts`, `scripts/seo/check-seo-kk-content.ts`, `scripts/seo/kk-blog-*.mjs`, `reports/seo/vitrina-ai-stage-5-kk-localization-2026-05-20.md`, `reports/seo/vitrina-ai-kk-glossary-2026-05-20.md`.

### G. Stage 6 — KK index enable
`lib/seo/kkIndexPolicy.ts`, `lib/i18n/switchLocalePath.ts`, `data/seo/blogTopics.ts`, `data/seo/staticPages.ts`, `lib/i18n/translations.ts`, sitemap/hreflang/switcher updates, `reports/seo/vitrina-ai-stage-6-kk-qa-index-enable-2026-05-20.md`.

### G+. Stage 7 — Launch gate (this task)
`scripts/seo/smoke-prelaunch-gate.ts`, `package.json` → `smoke:seo:prelaunch`, this report.

### H. Unrelated — must NOT ship in SEO-only commit
| Area | Paths |
|------|--------|
| Studio UI | `components/studio/**` (ClothingPreviewPanel, ModelReadyCard, StudioShell, ProductSetProgressRail, etc.) |
| AI pipeline | `lib/ai/**`, `app/api/ai/**` |
| Studio lib | `lib/studio/**` |
| AI reports | `reports/ai/**`, `scripts/diagnose-fal-*.mjs` |

### SEO-adjacent (review before commit)
`components/landing/SaasFooter.tsx`, `SaasLanding.tsx`, `app/(default)/layout.tsx` — marketing shell; OK in SEO commit if changes are i18n/SEO only.

---

## 2. SEO vs unrelated separation

| Category | Safe for SEO launch commit | Exclude from SEO-only commit |
|----------|---------------------------|------------------------------|
| Public marketing | `app/sitemap.ts`, `robots.ts`, `[locale]/**`, `data/seo/**`, `lib/seo/**`, `scripts/seo/**` | — |
| Studio / paid AI | — | `components/studio/**`, `lib/ai/**`, `app/api/ai/**`, `lib/studio/**` |
| Auth / billing | — | `components/auth/**`, Supabase/Lemon (unchanged this stage) |

**Mixing risk:** High if owner commits entire dirty tree. Mitigation: two PRs — (1) SEO Stages 1–7, (2) Studio/AI when ready.

---

## 3. Env readiness

Checked by name only; **no secret values read or logged**. Local `.env.local`: SEO keys absent → dev falls back to `http://localhost:3000` per `lib/seo/site.ts`.

There is **no** `NEXT_PUBLIC_SITE_INDEXABLE` in codebase; index policy is `qualityGate` + `indexableLocales`.

| Env name | Required for launch | Status (local gate run) | Action |
|----------|---------------------|-------------------------|--------|
| `NEXT_PUBLIC_SITE_URL` | **Yes — BLOCKER** | MISSING / dev → localhost | Set on production host: `https://<your-production-domain>` (no trailing slash). Must not be `localhost` or `https://your-domain.com`. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Recommended before GSC | EMPTY | After creating GSC property, set verification meta content string; wired in `app/[locale]/layout.tsx` → `metadata.verification.google`. |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Recommended before Yandex | EMPTY | Set Yandex meta verification; wired as `metadata.verification.yandex`. |
| `NEXT_PUBLIC_BING_VERIFICATION` | Optional | EMPTY | Bing Webmaster if used. |
| `INDEXNOW_KEY` | Only if IndexNow enabled | EMPTY | Generate UUID/key; serve at `https://<host>/<key>.txt` via `app/[indexnowKey].txt/route.ts`. |
| `INDEXNOW_HOST` | With IndexNow | EMPTY | Production hostname (defaults to `siteUrl` host). |
| `INDEXNOW_ENABLED` | Must stay `false` until approval | `false` (safe) | Keep `false` until owner approves post-deploy submit. |
| `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Optional analytics | Not audited | Empty = scripts disabled. |

**Expected format:** `NEXT_PUBLIC_SITE_URL=https://example.com` (HTTPS, production domain, no path).

---

## 4. Robots status

Source: `app/robots.ts`

| Check | Status |
|-------|--------|
| `Allow: /` | OK |
| No blanket `Disallow: /` | OK |
| `Disallow: /api/` | OK |
| `Disallow: /studio` | OK |
| `Sitemap:` directive present | OK |
| Sitemap URL uses production base | **WARN locally** — resolves to `http://localhost:3000/sitemap.xml` until `NEXT_PUBLIC_SITE_URL` set on deploy |

**After deploy:** `GET https://<domain>/robots.txt` must show production sitemap URL.

---

## 5. Sitemap status

Generated via `app/sitemap.ts` + `shouldIndexPage` / `indexableLocales`.

| Check | Status |
|-------|--------|
| Total indexable entries | **163** (ru=70, en=70, kk=23) |
| Only ru / en / approved kk | OK |
| No uz / ky / tg / global | OK |
| No `/studio`, no `/api` | OK |
| KK video (`/kk/onim-video-generator`) excluded | OK |
| No draft-only blog topics in kk count | OK (90 non-published kk topics excluded) |
| Aligns with published/indexable policy | OK (static audit) |
| Absolute URLs production-shaped | **FAIL locally** — all 163 entries use localhost base (env blocker, not policy bug) |

**Production expectation:** same 163 paths under `https://<domain>/...`.

---

## 6. Hreflang / canonical status

| Check | Local smoke | Production after `NEXT_PUBLIC_SITE_URL` |
|-------|-------------|----------------------------------------|
| 20 ru/en blog pairs | PASS | Same alternates on production origin |
| 10 ru/en/kk triads | PASS | Same |
| 10 ru/en-only pairs (no kk hreflang) | PASS (e.g. blog_008) | Same |
| x-default → ru | PASS | Same |
| No hreflang to uz/ky/tg/global | PASS | Same |
| No kk hreflang without approved kk content | PASS | Same |
| Canonical = absolute production URL | WARN (localhost base) | PASS when env set |

Scripts: `npm run smoke:seo:hreflang`, prelaunch gate static checks.

---

## 7. Route smoke status

Static/routing checks (no HTTP server required for most). Dedicated `smoke:seo:routes` script not present; coverage in `smoke:seo:public` + `smoke:seo:prelaunch`.

| Route / check | Status |
|---------------|--------|
| `/ru`, `/en`, `/kk` | OK (routing) |
| `/ru/cost`, `/en/cost`, `/kk/cost` | OK |
| RU blogs ×3 (kaspi, ai-foto, marketplace how-to) | OK |
| EN blogs ×3 | OK |
| KK approved blogs ×3 | OK |
| ru/en-only pair without kk hreflang | OK |
| `/kk/onim-video-generator` | Exists; **noindex**, not in sitemap |
| `/uz` (sample noindex locale) | Exists; not in sitemap |
| Studio | Excluded via robots + sitemap policy (not entered) |

**Post-deploy HTTP checks:** see §10 After deploy.

---

## 8. Icons / manifest / OG status

| Asset | Path | Status |
|-------|------|--------|
| App icon (favicon via Next) | `app/icon.png` | OK |
| Apple icon | `app/apple-icon.png` | OK |
| PWA 192 / 512 | `public/icon-192.png`, `public/icon-512.png` | OK |
| Apple touch | `public/apple-touch-icon.png` | OK |
| OG image | `public/og/vitrina-ai-og.png` | OK |
| `public/favicon.ico` | Absent | **Acceptable** — Next `app/icon.png` serves favicon |
| Manifest | `app/manifest.ts` → `/manifest.webmanifest` | OK |
| `theme_color` | `#0f766e` | OK |
| `background_color` | `#ffffff` | OK |
| `short_name` | `Vitrina AI` | OK |
| OG / Twitter image path | `/og/vitrina-ai-og.png` via `defaultOgImageUrl()` | OK (paths; HTTP 200 verify after deploy) |

Metadata uses `siteUrl` for absolute OG URLs — will point to production once env is set.

---

## 9. GSC / Yandex / IndexNow plan (instructions only — nothing submitted)

### Google Search Console

1. **Property type:** Prefer **Domain property** (`example.com`) if DNS verification is available — covers all protocols/subdomains. Otherwise **URL prefix** `https://<production-domain>/`.
2. **Verification:** Set `NEXT_PUBLIC_GSC_VERIFICATION` to the meta tag `content` value from GSC; redeploy; confirm tag in page source on `/ru`.
3. **Sitemap URL to add (manual, after deploy approval):**  
   `https://<production-domain>/sitemap.xml`
4. **URL Inspection (sample after deploy):**
   - `https://<domain>/ru`
   - `https://<domain>/en`
   - `https://<domain>/kk`
   - `https://<domain>/ru/blog/foto-tovarov-dlya-kaspi`
   - `https://<domain>/en/blog/product-photos-for-kaspi`
   - `https://<domain>/kk/blog/kaspi-ushin-onim-fotosy`
   - Confirm **not indexed:** `https://<domain>/kk/onim-video-generator`, `https://<domain>/uz/...`

### Yandex Webmaster

1. Add site `https://<production-domain>`.
2. **Verification:** `NEXT_PUBLIC_YANDEX_VERIFICATION` meta (same layout as GSC).
3. **Sitemap:** `https://<production-domain>/sitemap.xml` (manual add after approval).
4. **Recrawl samples:** same core + kk triad URLs as GSC.

### IndexNow (disabled until owner approval)

| Item | Detail |
|------|--------|
| Key required? | Yes, when `INDEXNOW_ENABLED=true` |
| Key file URL | `https://<host>/<INDEXNOW_KEY>.txt` (dynamic route `app/[indexnowKey].txt/route.ts`) |
| API route | `/api/indexnow/submit` (server-only; respects `INDEXNOW_ENABLED`) |
| **Submit after deploy (manual approval):** | Production sitemap URL; newly indexable ru/en/kk page URLs (batch ≤100 per call) |
| **Never submit** | noindex pages, draft/needs_review, `/studio`, `/api/*`, uz/ky/tg/global, kk video page |

Keep `INDEXNOW_ENABLED=false` until explicit owner sign-off.

---

## 10. Production deploy checklist (owner)

### Before deploy

- [ ] Set `NEXT_PUBLIC_SITE_URL=https://<production-domain>` on hosting (Vercel/etc.)
- [ ] Confirm domain DNS/TLS live
- [ ] Confirm no secrets in client bundles (only `NEXT_PUBLIC_*` for SEO verification)
- [ ] Run locally with production URL (optional): `NEXT_PUBLIC_SITE_URL=... npm run build && npm run smoke:seo:prelaunch`
- [ ] `npm run check:seo:content` + kk + `smoke:seo:*` + `npx tsc --noEmit` + `npm run build` — all PASS
- [ ] Plan SEO-only commit (exclude §1-H paths) or split PRs
- [ ] Owner approval for deploy

### After deploy (manual verification)

- [ ] `GET /robots.txt` — Allow `/`, Disallow `/api/`, `/studio`, production Sitemap URL
- [ ] `GET /sitemap.xml` — 163 URLs, production host, no uz/ky/tg/global, no studio
- [ ] View-source `/ru`, `/en`, `/kk` — `robots` indexable where expected
- [ ] `/kk/onim-video-generator` — noindex
- [ ] `/uz/...` — noindex, not in sitemap
- [ ] OG image `GET /og/vitrina-ai-og.png` → 200
- [ ] `/manifest.webmanifest`, `/icon.png`, `/apple-icon.png` → 200
- [ ] Add GSC + Yandex verification env if not done pre-deploy; redeploy once
- [ ] **Manual** sitemap submit in GSC and Yandex (not done in Stage 7)
- [ ] Monitor Coverage / Indexing for 7–14 days

### Rollback

| Scenario | Action |
|----------|--------|
| Emergency de-index all marketing | Temporarily set all locales to noindex in `qualityGate` / revert `indexableLocales` to `["ru","en"]`; redeploy |
| KK issue only | Remove `"kk"` from `indexableLocales` in `lib/i18n/localeConfig.ts`; set kk blog/static back to `ready_for_review` in data files; redeploy |
| Bad URL in sitemap | Fix content status / `shouldIndexPage`; exclude via `kkIndexPolicy` or topic publish flags; redeploy |
| Wrong domain in sitemap | Fix `NEXT_PUBLIC_SITE_URL`; redeploy; resubmit sitemap in GSC/Yandex |
| IndexNow misfire | Set `INDEXNOW_ENABLED=false`; remove key from env |

---

## 11. Command results

| Command | Result |
|---------|--------|
| `npm run check:seo:ru-content` | **PASS** (20 RU articles) |
| `npm run check:seo:en-content` | **PASS** (20 EN articles) |
| `npm run check:seo:kk-content` | **PASS** (10 kk + static policy) |
| `npm run check:seo:content` | **PASS** |
| `npm run smoke:seo:public` | **PASS** (`siteUrl=http://localhost:3000`) |
| `npm run smoke:seo:hreflang` | **PASS** (20 pairs + 10 triads) |
| `npm run smoke:seo:prelaunch` | **Policy PASS**; 163 localhost URL flags + 3 WARN (expected without production URL) |
| `npx tsc --noEmit` | **PASS** (no errors) |
| `npm run build` | **PASS** (1105 static pages) |
| `npm run lint` | **FAIL** — pre-existing unrelated debt (auth `PhoneCountryInput`, `WhatsAppLoginModal`; studio `ModelPresetSelector`, `ModelPromptComposer`; AI `prompt/enhance` unused var). **Not fixed** per Stage 7 scope. |

No `smoke:seo:routes` script in `package.json`; route coverage via `smoke:seo:public` + `smoke:seo:prelaunch`.

---

## 12. Blockers before launch

| # | Blocker | Severity |
|---|---------|----------|
| 1 | `NEXT_PUBLIC_SITE_URL` not set to real production domain on deploy host | **BLOCKER** |
| 2 | Sitemap/robots/canonical absolute URLs still localhost until #1 fixed | **BLOCKER** (resolves with #1) |
| 3 | GSC/Yandex verification env empty | Warning — needed before webmaster tools, not before deploy |
| 4 | IndexNow key unset | OK — disabled by default |
| 5 | Dirty tree mixes SEO + Studio/AI | Process — split commit before push |
| 6 | ESLint failures in auth/studio | Non-blocking for SEO launch |

---

## 13. Final recommendation

| Verdict | |
|---------|---|
| **Code & SEO policy** | Ready for production deploy after owner approval |
| **Live SEO launch** | **Launch ready after env fix** — set production `NEXT_PUBLIC_SITE_URL`, deploy, then run post-deploy checks and **manual** GSC/Yandex sitemap submit |
| **Not** | `launch ready` (unqualified) — production URL not configured in this environment |
| **Not** | `not ready` — all stage gates and builds pass |

**Stages 1–6:** Not rolled back.  
**Studio / AI / auth / billing:** Not modified in Stage 7.  
**Commit / push / deploy / sitemap submit / IndexNow:** Not done.

---

## 14. Acceptance criteria (Stage 7)

| # | Criterion | Met |
|---|-----------|-----|
| 1 | Stages 1–6 not rolled back | Yes |
| 2 | Studio not touched (Stage 7) | Yes |
| 3 | AI pipeline not touched (Stage 7) | Yes |
| 4 | Auth/billing/Supabase not touched | Yes |
| 5 | Dirty tree split documented | Yes |
| 6 | `NEXT_PUBLIC_SITE_URL` readiness checked | Yes (BLOCKER documented) |
| 7 | Robots policy verified | Yes |
| 8 | Sitemap policy verified | Yes |
| 9 | Hreflang/canonical verified | Yes (local); production pending env |
| 10 | ru/en/approved kk index policy | Yes |
| 11 | uz/ky/tg/global noindex / no sitemap | Yes |
| 12 | Icons/manifest/OG verified | Yes |
| 13 | GSC/Yandex/IndexNow instructions | Yes |
| 14 | Rollback checklist | Yes |
| 15 | All SEO checks PASS | Yes |
| 16 | tsc PASS | Yes |
| 17 | build PASS | Yes |
| 18 | No deploy/submit/commit/push | Yes |
| 19 | Stage 7 report exists | Yes (this file) |

---

## Related reports

- [Stage 1 SEO infra](./vitrina-ai-stage-1-seo-infra-2026-05-20.md)
- [Stage 6 KK index enable](./vitrina-ai-stage-6-kk-qa-index-enable-2026-05-20.md)
- [Master audit](./vitrina-ai-master-audit-2026-05-20.md)
