# Stage 17.1 — Final SEO Diff Audit + Push Readiness

**Date:** 2026-05-21  
**Branch:** `main` (uncommitted Stage 17 work)  
**Auditor:** read-only + automated checks (no commit/push/deploy)

---

## 1. Verdict

| Gate | Result |
|------|--------|
| **Accepted (Stage 17 diff)** | **Yes** — SEO/GEO only, no forbidden areas |
| **Ready for commit** | **Yes** — include untracked SEO files (see §2) |
| **Ready for push** | **Yes** — after commit |
| **Ready for deploy** | **Yes** — Railway/production |
| **Google sitemap submit** | **After deploy** + optional GSC verification env |
| **Yandex sitemap submit** | **After deploy** + optional Yandex verification env |

**Option A — ready to commit/push/deploy** (no P0 fixes required in 17.1)

### Remaining manual owner steps (post-deploy)

1. Deploy to Railway (`NEXT_PUBLIC_SITE_URL=https://vitrina.help`).
2. Verify live: `curl -s https://vitrina.help/sitemap.xml` → expect **253** `<loc>` (live today: **250**, pre-Stage-17).
3. Verify live: `curl -s https://vitrina.help/llms.txt` — no `/studio` URL, includes `/kk/cost`.
4. Set `NEXT_PUBLIC_GSC_VERIFICATION` / `NEXT_PUBLIC_YANDEX_VERIFICATION` on Railway.
5. Submit `https://vitrina.help/sitemap.xml` in GSC and Yandex.
6. Cloudflare: review AI crawler blocks (GEO; does not block classic Google/Yandex SEO crawl).

### P1 notes (non-blocking)

- Short `llms.txt` lists RU/EN ai-summary but not `/kk/ai-summary` (present in `llms-full.txt`). Optional follow-up.
- Footer still links KK home → platform/use-case URLs that remain **noindex** (pre-Stage-17 behaviour; not introduced by Stage 17).

---

## 2. Git diff summary

### Before audit

```
 M  11 tracked files
??  data/seo/aiSummaryContent.ts
??  lib/seo/llmsContent.ts
??  scripts/seo/check-seo-llms.ts
??  reports/seo/vitrina-ai-stage-17-pre-submit-geo-cleanup-2026-05-21.md
```

`git diff --stat`: 11 files, +116 / −143 lines.

### Category table

| Category | Files | Verdict |
|----------|-------|---------|
| **SEO/GEO allowed** | `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `lib/seo/llmsContent.ts`, `data/seo/aiSummaryContent.ts`, `app/[locale]/(marketing)/ai-summary/page.tsx`, `app/sitemap.ts`, `lib/seo/jsonLd.ts`, `lib/seo/kkIndexPolicy.ts`, `data/seo/ruFeatureLandingEnhancements.ts`, `data/seo/enFeatureLandingEnhancements.ts`, `lib/landing/marketingFooterProps.ts`, `scripts/seo/check-seo-llms.ts`, `scripts/seo/smoke-public-routes.ts`, `package.json` | **OK** |
| **Reports** | `reports/seo/vitrina-ai-stage-17-*.md` | **OK** (untracked) |
| **Forbidden / risky** | — | **None** |

**Commit reminder:** `git add` must include **new** files `aiSummaryContent.ts`, `llmsContent.ts`, `check-seo-llms.ts` — they are not in the 11 modified tracked files alone.

---

## 3. Forbidden area check

| Area | Touched? |
|------|----------|
| Studio (`components/studio/**`, `app/**/studio/**`, `lib/studio/**`) | **no** |
| AI pipeline (`lib/ai/**`, `app/api/ai/**`) | **no** |
| Auth (`app/api/auth/**`) | **no** |
| Billing / Lemon (`app/api/billing/**`, webhooks, `lib/payments/**`) | **no** |
| Supabase / RLS / migrations | **no** |
| `.env*` | **no** |

---

## 4. llms check

| Check | Result |
|-------|--------|
| `npm run check:seo:llms` | **PASS** |
| `/studio` URL in llms output | **None** |
| `/api/`, auth, billing, account URLs | **None** |
| localhost / your-domain | **None** |
| `/ru/cost`, `/en/cost`, `/kk/cost` | **Yes** |
| Kaspi disclaimer | **Yes** (NOT official partner) |
| Limitations | **Yes** |
| Languages | **Yes** |
| Pricing/tokens | **Yes** |
| Do-not-crawl section | **Yes** (`llms-full.txt`; short file has prose block) |

**Live `https://vitrina.help/llms.txt`:** still pre-Stage-17 until deploy (expected).

---

## 5. ai-summary check

| Locale | URL | Indexable | Language quality | Verdict |
|--------|-----|-----------|------------------|---------|
| **RU** | `/ru/ai-summary` | Yes (`published`) | Native RU, 8 sections | **PASS** |
| **EN** | `/en/ai-summary` | Yes (`published`) | Native EN | **PASS** |
| **KK** | `/kk/ai-summary` | Yes (`published`) | Native KK (Cyrillic Kazakh, not EN/RU fallback) | **PASS** |

**Content spot-check (KK):** sections use Kazakh headings («Vitrina AI деген не», «Кімге арналған», «Шектеулер»); Kaspi disclaimer «ресми серіктесі емес»; no moderation guarantee.

**Internal links (KK):** `/kk/cost`, `/kk/tokens`, `/kk/how-it-works`, `/kk/quality`, `/kk/faq`, `/kk/blog/kaspi-ushin-onim-fotosy` (approved blog — not noindex KK platform slug).

**Metadata:** `pathByLocale` tri-locale + `createSeoMetadata` → canonical `https://vitrina.help/{locale}/ai-summary`, hreflang ru/en/kk + x-default→ru (via `buildLanguageAlternates`).

**Claims:** No guaranteed sales, moderation, or official Kaspi partnership.

---

## 6. tokens policy check

| Field | Result |
|-------|--------|
| **Decision** | **Variant A confirmed** — index + sitemap |
| **Sitemap** | `/ru/tokens`, `/en/tokens`, `/kk/tokens` in generated sitemap (prelaunch) |
| **Hreflang** | Tri-locale `pathByLocale` in `tokens/page.tsx` |
| **Canonical** | Via `createSeoMetadata` |
| **Public access** | Page renders pricing copy without login; buy CTA calls auth only on action |
| **Risk** | Low — marketing pricing page, linked from `/cost` `relatedLinks` |

**Not a private billing dashboard** — acceptable for index.

---

## 7. Sitemap / hreflang

| Metric | Local (prelaunch) | Live production |
|--------|-------------------|-----------------|
| **Total URLs** | **253** | **250** (not deployed yet) |
| **RU** | 104 | — |
| **EN** | 104 | — |
| **KK** | 45 | — |

**Delta vs live:** +3 `/tokens` (ru/en/kk); KK `/ai-summary` aligned with index policy.

**Sitemap garbage grep (live):** no matches for `localhost`, `your-domain`, `/studio`, `/api/`, `auth`, `billing`, `undefined`, `null` in URL paths (false positives from slug `ai-product-photo-studio` absent in grep pattern used).

**Hreflang smoke:** `npm run smoke:seo:hreflang` — **PASS** (40 ru/en pairs, 18 blog triads, 3 trust triads).

**ai-summary / tokens:** Included in `sectionPaths` for all `indexableLocales`; hreflang built per sitemap entry alternates.

**Problems:** None blocking. Live count updates after deploy only.

---

## 8. JSON-LD

| Item | Result |
|------|--------|
| `websiteJsonLd.inLanguage` | `["ru", "en", "kk"]` |
| Fake Kaspi partner | **None** |
| localhost / your-domain | **None** in schema URLs (uses `absoluteUrl`) |
| Fake social profiles | **None** |

---

## 9. Internal linking (Stage 17 deltas)

| Link | Target status |
|------|----------------|
| Footer → `/{locale}/ai-summary` | Indexable all 3 locales |
| RU/EN feature LP → `/ru|en/ai-summary` | OK |
| RU/EN feature LP → blog_074 | Published |
| ai-summary → cost/tokens/trust/faq | OK per locale |
| KK ai-summary → Kaspi blog | Published KK triad |

**No new links** to `/examples` as primary CTA. **No** Stage-17 links to missing slugs.

---

## 9. Commands run

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
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | **PASS** (253 URLs, 0 failures) |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |

---

## 10. Recommended next step

### Option A — ready to commit/push/deploy

**Stage 18 suggested scope:**

1. `git add` all Stage 17 SEO files (including untracked `aiSummaryContent.ts`, `llmsContent.ts`, `check-seo-llms.ts`).
2. Single commit: `feat(seo): Stage 17 pre-submit GEO cleanup (llms, ai-summary, tokens sitemap)`.
3. Push `main` (or PR branch per team process).
4. Deploy Railway.
5. Post-deploy smoke: sitemap 253, llms.txt content, `/kk/ai-summary` robots index.
6. Manual: GSC + Yandex + Cloudflare checklist from Stage 17 report.

---

## 11. Final confirmation

**STAGE 17.1 CONFIRMED:**
- Code changed in this stage: **no** (audit only)
- Studio touched: **no**
- AI pipeline touched: **no**
- Auth/billing touched: **no**
- Supabase/RLS touched: **no**
- Env changed: **no**
- Commit: **no**
- Push: **no**
- Deploy: **no**
