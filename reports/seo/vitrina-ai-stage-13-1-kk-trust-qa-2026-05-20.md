# Vitrina AI — Stage 13.1 KK Trust Pages QA + Index Enable

**Date:** 2026-05-20  
**Scope:** `/kk/how-it-works`, `/kk/quality`, `/kk/faq` — QA, approve, index, sitemap, hreflang  
**Out of scope (not touched):** Studio, AI pipeline, auth/billing/Supabase, deploy, commit/push, GSC/Yandex/IndexNow, uz/ky/tg/global, examples index, new articles, OpenAI

---

## 1. Dirty tree (before work)

`git status --short` at start of Stage 13.1 (representative):

| Bucket | Paths | Notes |
|--------|-------|-------|
| **A — SEO Stages 1–13 + 13.1** | `data/seo/trustPages.ts`, `lib/seo/kkIndexPolicy.ts`, `scripts/seo/check-seo-*.ts`, `scripts/seo/smoke-*.ts`, Stage 13 KK blog files, `package.json` | In scope |
| **B — Studio/AI** | Not present in working tree at 13.1 execution time | Out of scope |
| **C — Auth/billing** | Not present | Out of scope |
| **D — Noise** | `reports/ai/*.json` (untracked run artifacts) | Ignored |

**After Stage 13.1** (SEO-only delta for this stage):

- `data/seo/trustPages.ts` — KK copy + `published` + studio CTAs
- `lib/seo/kkIndexPolicy.ts` — `KK_APPROVED_TRUST_PAGE_KEYS`
- `scripts/seo/check-seo-trust.ts`, `check-seo-kk-content.ts`
- `scripts/seo/smoke-hreflang-pairs.ts`, `smoke-prelaunch-gate.ts`, `smoke-public-routes.ts`

---

## 2. QA — KK trust pages

| Page | Title / H1 | Meta (≥55) | Sections | FAQ | CTA «Студияны ашу» | KK prose | Claims |
|------|------------|------------|----------|-----|-------------------|----------|--------|
| `/kk/how-it-works` | OK | OK (Kaspi workflow) | 7 | 5 | `/studio` | No RU/EN fallback; Kaspi seller focus | No fake Kaspi partnership; no perfect-AI guarantee |
| `/kk/quality` | OK | OK (limitations) | 6 | 3 | `/studio` | Expanded sections; honest limits | Moderation not guaranteed; not official partner |
| `/kk/faq` | OK | OK (seller FAQ) | 2 + 14 FAQ | 14 | `/studio` | Kaspi/WB/Ozon/lingerie/video/pricing | «Идеал кепілдік жоқ»; studio CTA in FAQ |

**Placeholders:** none (`TODO` / `lorem` absent).  
**Glossary:** consistent with existing KK feature/blog copy (студия, сатушы, Kaspi, маркетплейс).

---

## 3. Index policy outcome

| Page | Status | In `KK_APPROVED_TRUST_PAGE_KEYS` | Sitemap | Hreflang ru/en/kk |
|------|--------|-----------------------------------|---------|-------------------|
| `/kk/how-it-works` | **approved / published / index** | yes | yes | yes |
| `/kk/quality` | **approved / published / index** | yes | yes | yes |
| `/kk/faq` | **approved / published / index** | yes | yes | yes |

**Still noindex (unchanged):**

- KK examples (`/kk/examples/*`)
- `/kk/onim-video-generator` (product video LP)
- uz/ky/tg/global locales
- Legal pages on KK (`needs_review`)
- Non-approved KK blog topics (82)

---

## 4. Counts

| Metric | Before (Stage 13) | After (Stage 13.1) | Δ |
|--------|-------------------|---------------------|---|
| Sitemap URLs | 217 | **220** | +3 |
| KK URLs in sitemap | 31 | **34** | +3 |
| ru/en blog pairs | 40 | 40 | 0 |
| ru/en/kk **blog** triads | 18 | 18 | 0 |
| ru/en/kk **trust** triads | 0 | **3** | +3 |

Locale split in sitemap (post): ru=93, en=93, kk=34.

---

## 5. Policy verification

- ru/en/approved kk index: OK  
- KK trust index only when approved: OK (`isKkTrustPageApproved` + `published`)  
- Examples noindex / not in sitemap / no hreflang: OK  
- `/kk/onim-video-generator` not in sitemap: OK  
- uz/ky/tg/global not in sitemap: OK  
- No draft/noindex URLs in sitemap (static audit): OK  
- Hreflang only to indexable pages: OK (blog + trust triads; ru/en-only pairs without kk)

**Language switcher:** `/ru/how-it-works` → `/kk/how-it-works` (prelaunch smoke).

---

## 6. Checks

| Command | Result |
|---------|--------|
| `npm run check:seo:kk-wave2` | PASS |
| `npm run check:seo:kk-content` | PASS (trust triads logged) |
| `npm run check:seo:ru-content` | PASS |
| `npm run check:seo:en-content` | PASS |
| `npm run check:seo:content` | PASS |
| `npm run check:seo:trust` | PASS (kk indexable ×3) |
| `npm run check:seo:examples` | PASS |
| `npm run smoke:seo:public` | PASS |
| `npm run smoke:seo:hreflang` | PASS (18 blog + 3 trust triads) |
| `npm run smoke:seo:prelaunch` | PASS (220 sitemap, kk=34) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

`npm run lint` — not run (per task: avoid unrelated debt).

---

## 7. OpenAI

**Not used.** All copy is hand-authored in `data/seo/trustPages.ts`.

---

## 8. Deliverables / constraints

| Item | Status |
|------|--------|
| Deploy | **Not done** |
| Commit / push | **Not done** |
| GSC / Yandex / IndexNow | **Not sent** |
| Stage 1–13 regression | No rollback observed |
| Studio / AI / auth | **Not touched** |

---

## 9. Acceptance (Stage 13.1)

1. Stage 1–13 intact — **yes**  
2. Studio untouched — **yes**  
3. AI pipeline untouched — **yes**  
4. Auth/billing untouched — **yes**  
5. KK trust QA completed — **yes**  
6. Approved KK trust indexable — **yes (3/3)**  
7. Noindex trust not in sitemap/hreflang — **n/a (none left)**  
8. Examples remain noindex — **yes**  
9. uz/ky/tg/global closed — **yes**  
10. Sitemap indexable-only — **yes**  
11. Hreflang to real indexable pages — **yes**  
12. SEO checks PASS — **yes**  
13. tsc PASS — **yes**  
14. build PASS — **yes**  
15. No deploy/commit/push — **yes**

**Ready for Stage 14 — Full SEO Main-Ready Audit** (KK trust tail closed).
