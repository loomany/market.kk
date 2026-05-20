# Vitrina AI — Stage 8.1 Production env + redeploy fix

**Date:** 2026-05-20  
**Domain:** `https://vitrina.help`  
**Verification:** Live re-check after owner/hosting fix instructions  
**Commit / push / deploy / GSC / Yandex / IndexNow:** Not performed

---

## Summary

Live production **still matches Stage 8 failures** — env/redeploy/cache fix **not yet effective** on `https://vitrina.help`.

| Area | Status |
|------|--------|
| Production hosting env | **Not applied** (canonical/sitemap still `your-domain.com`) |
| Redeploy Stages 1–7 | **Not reflected on live** |
| Cloudflare robots / cache | **Still blocking** (`Disallow: /`; stale sitemap/assets) |
| **Recommendation** | **Not ready** to submit sitemap |

Local repo: `NEXT_PUBLIC_SITE_URL=https://vitrina.help` in `.env.local` (correct format). Hosting must mirror this and redeploy.

---

## 1. Production env status

| Check | Expected | Live |
|-------|----------|------|
| `NEXT_PUBLIC_SITE_URL` | `https://vitrina.help` | **Not active** — HTML/sitemap use `https://your-domain.com` |
| Invalid `https://http://...` | Absent | N/A |
| localhost | Absent on live | OK |

**Owner:** Set env on **hosting dashboard** (Vercel/Netlify/etc.), save, trigger **production redeploy**.

---

## 2. Redeploy status

| Item | Status |
|------|--------|
| Redeploy with Stages 1–7 tree | **Not done** (or not propagated) |
| Evidence | Sitemap 112 URLs (not 163), 0 kk, placeholder host, kk home `noindex` |

---

## 3. Cloudflare robots / cache status

| Check | Result |
|-------|--------|
| Cloudflare Managed block in `robots.txt` | Present |
| Trailing `User-Agent: *` + `Disallow: /` | **Still present** — site-wide crawl block |
| App `robots.ts` rules (Allow `/`, Disallow `/api/`, `/studio`, Sitemap) | **Not visible on live** |
| Sitemap/assets cache | Appears **stale** (placeholder sitemap, icon/manifest/OG 404) |

**Owner:** Review Workers/Rules; purge cache for `/robots.txt`, `/sitemap.xml`, `/icon.png`, `/manifest.webmanifest`, `/og/vitrina-ai-og.png` after redeploy.

---

## 4. Live robots.txt

**URL:** `https://vitrina.help/robots.txt`

| Expected | Live |
|----------|------|
| `Allow: /` | Partial (CF block only) |
| `Disallow: /api/` | **Missing** |
| `Disallow: /studio` | **Missing** |
| `Sitemap: https://vitrina.help/sitemap.xml` | **Missing** |
| No `Disallow: /` for `*` | **FAIL** — final rule blocks `/` |

---

## 5. Live sitemap.xml

**URL:** `https://vitrina.help/sitemap.xml`

| Metric | Expected | Live |
|--------|----------|------|
| Total URLs | ~163 | **112** |
| ru / en / kk | ~70 / ~70 / ~23 | **56 / 56 / 0** (path-based count) |
| Host `vitrina.help` | All locs | **0** |
| `your-domain.com` | 0 | **448** references |
| localhost | 0 | 0 |
| `/studio`, `/api`, uz/ky/tg/global | 0 | 0 |
| `/kk/onim-video-generator` | 0 | 0 |

---

## 6. Live canonical / hreflang (samples)

| URL | HTTP | robots | canonical |
|-----|------|--------|-----------|
| `/ru` | 200 | index, follow | `https://your-domain.com/ru` **FAIL** |
| `/en` | 200 | index, follow | `https://your-domain.com/en` **FAIL** |
| `/kk` | 200 | **noindex**, follow | `https://your-domain.com/kk` **FAIL** (should be index) |
| `/kk/onim-video-generator` | 200 | noindex, follow | your-domain **FAIL host** |
| `/uz` | 200 | noindex, follow | your-domain **FAIL host** |

Hreflang on live still points at **your-domain.com** (not re-validated line-by-line; host alone is blocker).

---

## 7. Live noindex checks

| URL | Expected | Live |
|-----|----------|------|
| `/kk/onim-video-generator` | noindex | **PASS** |
| `/uz` | noindex | **PASS** |
| `/kk` (home) | index | **FAIL** (noindex) |

---

## 8. Live icons / manifest / OG

| Path | Expected | Live HTTP |
|------|----------|-----------|
| `/icon.png` | 200 | **404** |
| `/apple-icon.png` | 200 | **404** |
| `/manifest.webmanifest` | 200 | **404** |
| `/og/vitrina-ai-og.png` | 200 | **404** |

---

## 9. Final recommendation

| Verdict | |
|---------|---|
| **Ready to submit sitemap** | **No** |
| **Not ready** | **Yes** — complete hosting env + redeploy + Cloudflare robots/cache purge, then re-run this checklist |

### Owner checklist (unchanged)

1. Hosting env: `NEXT_PUBLIC_SITE_URL=https://vitrina.help`
2. Redeploy production from current Stages 1–7 tree
3. Cloudflare: remove blanket `Disallow: /`; purge robots/sitemap/assets cache
4. Re-verify live (same URLs as Stage 8)
5. Only then submit `https://vitrina.help/sitemap.xml` in GSC/Yandex (manual)

### Pass criteria for next verification

- `robots.txt`: Allow `/`, Disallow `/api/`, `/studio`, Sitemap `https://vitrina.help/sitemap.xml`, **no** `Disallow: /`
- `sitemap.xml`: ~163 URLs, all `https://vitrina.help`, kk≈23
- `/ru`, `/en`, `/kk`: `index, follow`, canonical on vitrina.help
- `/kk/onim-video-generator`, `/uz`: noindex
- Icons/manifest/OG: **200**

---

## Related

- [Stage 8 verification](./vitrina-ai-stage-8-production-launch-verification-2026-05-20.md)
- [Stage 7 pre-launch gate](./vitrina-ai-stage-7-prelaunch-gate-2026-05-20.md)
