# Vitrina AI — Stage 8 Production SEO Launch Verification

**Date:** 2026-05-20  
**Production domain:** `https://vitrina.help`  
**Status:** Live verification **FAILED** — do not submit sitemap  
**Commit / push / deploy / GSC / Yandex / IndexNow submit:** Not performed

---

## Executive summary

Local codebase with `NEXT_PUBLIC_SITE_URL=https://vitrina.help` passes all pre-deploy SEO checks (163 sitemap URLs, 0 prelaunch failures). **Live production at vitrina.help does not match Stages 1–7** — it appears to be an older deploy with placeholder `your-domain.com`, site-wide crawl block in `robots.txt`, and missing Stage 6 kk index policy.

**Final recommendation: not ready** — owner must fix hosting env, redeploy latest SEO tree, fix Cloudflare `robots.txt`, then re-run Stage 8 live checks before manual GSC/Yandex sitemap submit.

**URL correction:** Requested value `https://http://vitrina.help` is invalid (double scheme). Correct value: `https://vitrina.help`.

---

## 1. Production domain & env readiness

| Item | Status |
|------|--------|
| Intended production URL | `https://vitrina.help` |
| Local `.env.local` | `NEXT_PUBLIC_SITE_URL=https://vitrina.help` added (for local build/smoke only) |
| **Hosting production env** | **BLOCKER** — live HTML/sitemap still emit `https://your-domain.com` |
| `NEXT_PUBLIC_SITE_INDEXABLE` | Not used in codebase (policy via `qualityGate` + `indexableLocales`) |

### Env checklist (names only)

| Env name | Required | Local | Hosting (live inference) |
|----------|----------|-------|---------------------------|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Set → `https://vitrina.help` | **Not applied** (placeholder on live) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Recommended | Optional | Unknown |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Recommended | Optional | Unknown |
| `INDEXNOW_ENABLED` | Must stay `false` until approval | Safe default | Assume false |

**Owner action before next deploy:** In Vercel/hosting dashboard set:

```env
NEXT_PUBLIC_SITE_URL=https://vitrina.help
```

Redeploy after saving. Do **not** use `https://http://vitrina.help`.

---

## 2. Pre-deploy command results (local, `NEXT_PUBLIC_SITE_URL=https://vitrina.help`)

| Command | Result |
|---------|--------|
| `npm run check:seo:ru-content` | **PASS** |
| `npm run check:seo:en-content` | **PASS** |
| `npm run check:seo:kk-content` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run smoke:seo:public` | **PASS** (`siteUrl=https://vitrina.help`) |
| `npm run smoke:seo:hreflang` | **PASS** (20 ru/en pairs, 10 triads) |
| `npm run smoke:seo:prelaunch` | **PASS** (Failures: 0, Warnings: 0; 163 URLs, ru=70 en=70 kk=23) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** (1105 static pages) |
| `npm run lint` | Not blocking (pre-existing auth/studio debt) |

Local generated sitemap policy matches Stage 7 expectations when env is correct.

---

## 3. Deploy status

| Item | Status |
|------|--------|
| Deploy in this session | **Not done** (no owner approval) |
| Live site reachable | **Yes** — `https://vitrina.help` responds |
| Deploy matches Stages 1–7 | **No** — evidence below |

---

## 4. Live `robots.txt` — **FAIL**

**URL:** `https://vitrina.help/robots.txt`

| Expected (app/robots.ts) | Live |
|--------------------------|------|
| `Allow: /` | Partial — Cloudflare block allows `/` for some agents |
| `Disallow: /api/` | **Missing** |
| `Disallow: /studio` | **Missing** |
| `Sitemap: https://vitrina.help/sitemap.xml` | **Missing** |
| No blanket `Disallow: /` | **FAIL** — trailing rule: `User-Agent: *` / `Disallow: /` |

Live file is dominated by **Cloudflare Managed content** plus a final **site-wide disallow**. Crawlers may treat the site as non-crawlable.

**Blocker:** Fix Cloudflare / origin `robots.txt` before sitemap submit.

---

## 5. Live `sitemap.xml` — **FAIL**

**URL:** `https://vitrina.help/sitemap.xml`

| Check | Expected (post Stage 6–7) | Live |
|-------|---------------------------|------|
| Host | `vitrina.help` | **`your-domain.com`** (0 vitrina.help URLs) |
| Total URLs | ~163 | **112** |
| ru / en / kk | ~70 / ~70 / ~23 | kk **0** in sitemap |
| localhost / placeholder | None | **448× your-domain.com** |
| `/studio`, `/api` | Absent | Absent |
| uz/ky/tg/global | Absent | Absent |
| `/kk/onim-video-generator` | Absent | Absent |

Sitemap is **older ru/en-only** build with wrong canonical host.

**Do not submit** `https://vitrina.help/sitemap.xml` to GSC/Yandex until redeploy confirms `https://vitrina.help/...` locs and ~163 entries.

---

## 6. Live meta robots / canonical / hreflang samples

Fetched HTML (no secrets logged).

| URL | HTTP | meta robots | canonical host | vs expected |
|-----|------|-------------|----------------|-------------|
| `/ru` | 200 | `index, follow` | your-domain.com | Wrong canonical |
| `/en` | 200 | `index, follow` | your-domain.com | Wrong canonical |
| `/kk` | 200 | **noindex**, follow | your-domain.com | **FAIL** — should be index after Stage 6 |
| `/ru/cost` | (not sampled) | — | — | — |
| `/kk/onim-video-generator` | 200 | noindex, follow | your-domain.com | noindex OK; canonical host wrong |
| `/uz` | 200 | noindex, follow | your-domain.com | noindex OK |
| `/ky` | 200 | (same pattern) | — | noindex expected |
| `/tg` | 200 | (same pattern) | — | noindex expected |
| `/ru/blog/foto-tovarov-dlya-kaspi` | 200 | index, follow | your-domain.com | Wrong canonical |
| `/kk/blog/kaspi-ushin-onim-fotosy` | 200 | **noindex** | N/A | **FAIL** — should be index + kk triad |

**Hreflang on `/ru`:** present (~42 tags) but point to **your-domain.com**, not vitrina.help.

**x-default / triads:** Cannot validate on live until redeploy; local smoke PASS.

**Blocker:** Redeploy with `NEXT_PUBLIC_SITE_URL=https://vitrina.help` on hosting.

---

## 7. Icons / manifest / OG (live) — **FAIL**

| Asset | Live HTTP |
|-------|-----------|
| `/icon.png` | **404** |
| `/apple-icon.png` | **404** |
| `/manifest.webmanifest` | **404** |
| `/og/vitrina-ai-og.png` | **404** |

Page source: **0** `og:image` / `twitter:image` matches in `/ru` sample (likely missing or broken on old deploy).

After redeploy, expect 200 on above paths (Next `app/icon.png`, `app/manifest.ts`, `public/og/`).

---

## 8. Hreflang live validation

| Check | Local | Live |
|-------|-------|------|
| 20 ru/en pairs | PASS | **Not verified** (wrong host) |
| 10 ru/en/kk triads | PASS | **FAIL** — `/kk` noindex, kk blog noindex |
| x-default → ru | PASS (local) | Points to your-domain.com |
| No hreflang to uz/ky/tg/global | PASS (local) | Not re-validated on live |
| kk only on approved pages | PASS (local) | Live kk suppressed |

**Do not submit sitemap** until live hreflang uses `https://vitrina.help` and kk approved pages are `index`.

---

## 9. Google Search Console — manual plan (do not run until live green)

1. Add property — **Domain** `vitrina.help` (if DNS) or URL prefix `https://vitrina.help/`.
2. Verify via `NEXT_PUBLIC_GSC_VERIFICATION` meta after redeploy.
3. **Only after live sitemap fix**, submit:  
   `https://vitrina.help/sitemap.xml`
4. URL Inspection samples:
   - `https://vitrina.help/ru`
   - `https://vitrina.help/en`
   - `https://vitrina.help/kk`
   - `https://vitrina.help/ru/blog/foto-tovarov-dlya-kaspi`
   - `https://vitrina.help/en/blog/product-photos-for-kaspi`
   - `https://vitrina.help/kk/blog/kaspi-ushin-onim-fotosy`
5. Confirm excluded: `https://vitrina.help/kk/onim-video-generator`, `https://vitrina.help/uz`

---

## 10. Yandex Webmaster — manual plan

1. Add `https://vitrina.help`.
2. Verify (`NEXT_PUBLIC_YANDEX_VERIFICATION`).
3. Submit sitemap (same URL) **after** live fix.
4. Robots analysis — must not show `Disallow: /` for main crawlers.
5. Check `/ru`, `/kk`, one Kaspi kk article.

---

## 11. IndexNow — manual plan (approval required)

| Rule | Detail |
|------|--------|
| When | After live sitemap + robots verified |
| Enable | `INDEXNOW_ENABLED=true` + `INDEXNOW_KEY` + redeploy |
| Key file | `https://vitrina.help/<key>.txt` |
| Submit | Indexable ru/en/kk URLs only (batch ≤100) |
| Never | noindex, draft, `/studio`, `/api`, uz/ky/tg/global |

**Not executed in Stage 8.**

---

## 12. Rollback plan

| Scenario | Action |
|----------|--------|
| Bad URLs in sitemap | Revert `indexableLocales` or kk approval; redeploy; re-fetch sitemap |
| kk quality issue | Remove `kk` from `indexableLocales`; kk → noindex; redeploy |
| Wrong domain in canonical | Fix hosting `NEXT_PUBLIC_SITE_URL`; redeploy |
| robots blocks site | Remove Cloudflare `Disallow: /`; ensure app `robots.ts` served |
| Premature GSC submit | Remove sitemap in GSC; fix site; resubmit |

---

## 13. Dirty tree / commit safety

**Do not commit** until live verification passes after redeploy.

### Safe for SEO-only commit (Stages 1–8)

`app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`, `app/[locale]/**`, `components/i18n/**`, `components/landing/**` (if SEO-only diffs), `data/seo/**`, `lib/seo/**`, `lib/i18n/localeConfig.ts`, `switchLocalePath.ts`, `lib/blog/blogResolve.ts`, `scripts/seo/**`, `public/og/**`, `public/icon-*.png`, `.env.example`, `package.json` (SEO scripts), `reports/seo/**`

### Exclude from SEO-only commit

`components/studio/**`, `lib/ai/**`, `app/api/ai/**`, `lib/studio/**`, `reports/ai/**`, `scripts/diagnose-fal-*`, auth/billing paths

**Note:** `.env.local` is local only — set `NEXT_PUBLIC_SITE_URL` on **hosting**, not only in git.

---

## 14. Blockers

| # | Blocker | Severity |
|---|---------|----------|
| 1 | Hosting `NEXT_PUBLIC_SITE_URL` not applied — live uses `your-domain.com` | **Critical** |
| 2 | Live `robots.txt` ends with `Disallow: /` | **Critical** |
| 3 | Live deploy stale — kk not indexed, sitemap 112 not 163 | **Critical** |
| 4 | Live OG/icons/manifest 404 | **High** |
| 5 | Sitemap submit to GSC/Yandex | **Blocked** until 1–4 fixed |

---

## 15. Final recommendation

| Verdict | |
|---------|---|
| **ready to submit sitemap** | **No** |
| **ready after fix** | **Yes** — after hosting env + redeploy latest SEO branch + fix Cloudflare robots |
| **not ready** | **Yes (current live state)** |

### Owner checklist (ordered)

1. Set `NEXT_PUBLIC_SITE_URL=https://vitrina.help` on **production hosting** (not `https://http://...`).
2. Deploy latest working tree with Stages 1–7 (SEO-only or full, per commit policy).
3. Fix `robots.txt` at edge (remove blanket `Disallow: /`; ensure app rules: Allow `/`, Disallow `/api/`, `/studio`, Sitemap line).
4. Re-run live checks: robots, sitemap (163, vitrina.help host), `/kk` index, `/kk/blog/kaspi-ushin-onim-fotosy` index, assets 200.
5. Then manually submit `https://vitrina.help/sitemap.xml` in GSC and Yandex.

---

## 16. Acceptance criteria (Stage 8)

| # | Criterion | Met |
|---|-----------|-----|
| 1 | `NEXT_PUBLIC_SITE_URL` checked | Yes (local OK; hosting **not**) |
| 2 | Build/tsc/content/smoke PASS | Yes (local) |
| 3 | Production robots.txt | **No** |
| 4 | Production sitemap.xml | **No** |
| 5 | No localhost/placeholder on live | **No** |
| 6 | No junk URLs in live sitemap | Partial (no uz/studio; wrong host) |
| 7 | ru/en/approved kk live index | **No** (kk noindex on live) |
| 8 | `/kk/onim-video-generator` noindex live | Yes |
| 9 | hreflang/canonical live correct | **No** |
| 10 | icons/manifest/OG live | **No** |
| 11 | GSC/Yandex instructions | Yes |
| 12 | IndexNow instructions | Yes |
| 13 | Rollback plan | Yes |
| 14 | SEO vs unrelated split | Yes |
| 15 | No automatic submit | Yes |
| 16 | Stage 8 report | Yes (this file) |

---

## Related

- [Stage 7 pre-launch gate](./vitrina-ai-stage-7-prelaunch-gate-2026-05-20.md)
- [Stage 6 KK index enable](./vitrina-ai-stage-6-kk-qa-index-enable-2026-05-20.md)
