# Stage 18 — SEO-only commit + push + deploy smoke

**Date:** 2026-05-21  
**Production:** https://vitrina.help  
**Commit:** `27eb2ec`

---

## 1. Verdict

| Gate | Result |
|------|--------|
| **Commit** | **Yes** — `27eb2ec` |
| **Push** | **Yes** — `origin/main` (`1591150..27eb2ec`) |
| **Deploy** | **Yes** — live updated (~60s after push; sitemap 250→253) |
| **Live sitemap** | **253 URLs** (ru=104, en=104, kk=45) |
| **Ready for Google sitemap submit** | **Yes** (after optional verification meta) |
| **Ready for Yandex sitemap submit** | **Yes** (after optional verification meta) |
| **Ready for Cloudflare GEO setting** | **Owner decision** — manual only |

---

## 2. Commit info

| Field | Value |
|-------|-------|
| **Branch** | `main` |
| **Commit hash** | `27eb2ec` |
| **Commit message** | `seo: prepare llms and ai summary for sitemap submission` |
| **Files committed** | 16 (SEO/GEO only) |

### Files committed

- `app/[locale]/(marketing)/ai-summary/page.tsx`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`
- `app/sitemap.ts`
- `data/seo/aiSummaryContent.ts` (new)
- `data/seo/enFeatureLandingEnhancements.ts`
- `data/seo/ruFeatureLandingEnhancements.ts`
- `lib/landing/marketingFooterProps.ts`
- `lib/seo/jsonLd.ts`
- `lib/seo/kkIndexPolicy.ts`
- `lib/seo/llmsContent.ts` (new)
- `package.json`
- `scripts/seo/check-seo-llms.ts` (new)
- `scripts/seo/smoke-public-routes.ts`
- `reports/seo/vitrina-ai-stage-17-pre-submit-geo-cleanup-2026-05-21.md`
- `reports/seo/vitrina-ai-stage-17-1-final-diff-audit-2026-05-21.md`

### Left untracked (intentional)

`.cursor/`, `backup/`, `reports/ai/**`, `reports/release/**`, other non-SEO artifacts.

---

## 3. Forbidden area check

| Area | Touched? |
|------|----------|
| Studio | **no** |
| AI pipeline | **no** |
| Auth | **no** |
| Billing | **no** |
| Supabase/RLS | **no** |
| Env (repo) | **no** |

Pre-push diff: **no forbidden paths**.

---

## 4. Local checks (pre-commit)

| Command | Result |
|---------|--------|
| `npm run check:seo:llms` | **PASS** |
| `npm run check:seo:content` | **PASS** |
| `npm run check:seo:trust` | **PASS** |
| `npm run check:seo:examples` | **PASS** |
| `npm run check:seo:audience-pages` | **PASS** |
| `npm run check:seo:kk-content` | **PASS** |
| `npm run smoke:seo:public` | **PASS** |
| `npm run smoke:seo:hreflang` | **PASS** |
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | **PASS** (253 URLs) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

---

## 5. Live checks

| URL / Check | Expected | Actual | Result |
|-------------|----------|--------|--------|
| `/robots.txt` | 200 | HTTP/1.1 200 OK | **PASS** |
| `/sitemap.xml` | 200 | HTTP/1.1 200 OK | **PASS** |
| **sitemap count** | 253 | **253** | **PASS** |
| `/llms.txt` | 200 | HTTP/1.1 200 OK | **PASS** |
| `/llms-full.txt` | 200 | HTTP/1.1 200 OK | **PASS** |
| `/ru/ai-summary` | 200 indexable | 200, `robots: index, follow` | **PASS** |
| `/en/ai-summary` | 200 indexable | 200 | **PASS** |
| `/kk/ai-summary` | 200 indexable | 200, canonical + hreflang triad | **PASS** |
| `/ru/tokens` | 200 indexable | 200, canonical + hreflang | **PASS** |
| `/en/tokens` | 200 indexable | 200 | **PASS** |
| `/kk/tokens` | 200 indexable | 200 | **PASS** |

**Deploy timing:** First poll at T+45s still showed 250 URLs; at T+~105s live sitemap showed **253** (deploy complete).

---

## 6. Sitemap content

| Check | Result |
|-------|--------|
| **total URLs** | 253 |
| **ru** | 104 |
| **en** | 104 |
| **kk** | 45 |
| contains `/ru/tokens` | **Yes** |
| contains `/en/tokens` | **Yes** |
| contains `/kk/tokens` | **Yes** |
| contains `/ru/ai-summary` | **Yes** |
| contains `/en/ai-summary` | **Yes** |
| contains `/kk/ai-summary` | **Yes** |
| **private garbage** (localhost, your-domain, `/studio`, `/api/`, auth, billing paths in `<loc>`) | **None** |

---

## 7. llms content

| Check | Result |
|-------|--------|
| `/studio` URL in llms | **Not found** |
| `/api/` URL in llms | **Not found** |
| auth/billing **URLs** | **Not found** (prose mentions “billing checkout” in do-not-crawl section only) |
| **cost URLs** | **Yes** — `/ru/cost`, `/en/cost`, `/kk/cost` on live |
| **disclaimers** | **Yes** — “NOT an official partner”, limitations block |

---

## 8. Canonical / hreflang sample (live HTML)

### `/kk/ai-summary`

- `canonical`: `https://vitrina.help/kk/ai-summary`
- `hreflang`: ru, en, kk
- `x-default`: `https://vitrina.help/ru/ai-summary`
- `robots`: `index, follow`

### `/ru/tokens`

- `canonical`: `https://vitrina.help/ru/tokens`
- `hreflang`: ru, en, kk + x-default→ru
- `robots`: `index, follow`

---

## 9. Remaining owner manual tasks

### Google Search Console

1. Add property `https://vitrina.help`
2. HTML meta verification → copy `content` value
3. Railway env: `NEXT_PUBLIC_GSC_VERIFICATION=<google_token>`
4. Redeploy
5. Confirm meta in page source on `/ru`
6. Submit sitemap: `https://vitrina.help/sitemap.xml`

### Yandex Webmaster

1. Add site `https://vitrina.help`
2. Meta verification token
3. Railway env: `NEXT_PUBLIC_YANDEX_VERIFICATION=<yandex_token>`
4. Redeploy
5. Confirm meta on live
6. Submit sitemap: `https://vitrina.help/sitemap.xml`

### Cloudflare AI bots / GEO

- Production `robots.txt` may still include **Cloudflare Managed** blocks for GPTBot, ClaudeBot, Google-Extended, CCBot, etc.
- Classic Google/Yandex SEO crawl is **not** blocked by this for main indexing.
- For **GEO / AI visibility**, owner may allow crawl of public marketing pages only.
- **Do not open:** `/studio`, `/api`, auth, billing, account/private routes.

Suggested bots to allow (if product policy allows): GPTBot, ClaudeBot, Google-Extended, CCBot, PerplexityBot.

Verify after change:

```bash
curl -s https://vitrina.help/robots.txt
curl -I https://vitrina.help/llms.txt
```

---

## 10. Next steps (post–Stage 18)

1. Add GSC + Yandex verification env → redeploy  
2. Submit sitemap in both consoles  
3. Decide Cloudflare AI crawler policy  
4. Wait 2–4 weeks for indexing data — **no new articles / KK mass publish yet**

---

## 11. Final confirmation

**STAGE 18 CONFIRMED:**
- **Commit:** yes (`27eb2ec`)
- **Push:** yes
- **Deploy smoke:** **pass**
- Studio touched: **no**
- AI pipeline touched: **no**
- Auth/billing touched: **no**
- Supabase/RLS touched: **no**
- Env changed in repo: **no**
- **Sitemap live count:** **253**
- **Ready for Google submit:** **yes**
- **Ready for Yandex submit:** **yes**
