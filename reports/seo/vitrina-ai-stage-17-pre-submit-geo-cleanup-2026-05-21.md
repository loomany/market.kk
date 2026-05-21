# Stage 17 — Pre-submit SEO + GEO Cleanup

**Date:** 2026-05-21  
**Site:** https://vitrina.help  
**Branch:** main (local changes, not committed)

---

## Summary

| Item | Status |
|------|--------|
| **Ready for Google submit (after deploy)** | Yes — RU/EN full; KK approved subset |
| **Ready for Yandex submit (after deploy)** | Yes — same sitemap policy |
| **GEO readiness after cleanup** | Improved in code (~68/100); production GEO still needs **Cloudflare AI crawler** owner action |
| **Deploy required** | Yes — llms/ai-summary/sitemap changes are local until Railway deploy |

### What changed

- `llms.txt` / `llms-full.txt` rewritten via `lib/seo/llmsContent.ts` — no `/studio` URLs; cost + disclaimers + Kaspi; crawl exclusions documented.
- `/ai-summary` expanded for RU/EN/KK (`data/seo/aiSummaryContent.ts`); KK **published/indexable** with native Kazakh copy.
- `websiteJsonLd.inLanguage` → `["ru", "en", "kk"]`.
- **`/tokens` → Variant A:** added to sitemap (RU/EN/KK) as commercial pricing page.
- Internal links: feature LPs + footer → ai-summary + comparison blog (`blog_074`).
- New check: `npm run check:seo:llms`.
- Sitemap: **253 URLs** (was 250): +3 `/tokens`, KK `/ai-summary` now aligned with index policy.

### What did not change

- Studio routes/UI, AI pipeline, auth, billing, Supabase.
- Cloudflare Managed robots (AI bots still blocked on **live** until owner changes dashboard).
- `.env.local` / verification token values (still empty).
- No new comparison **landing** page — existing blog covers intent (see §7).
- Examples, KK legal, 60 dormant blog topics, KK platforms/use-cases — still excluded.

---

## Changes made

| Area | File | Change | Why |
|------|------|--------|-----|
| llms.txt | `app/llms.txt/route.ts`, `lib/seo/llmsContent.ts` | Structured plain-text; cost URLs; no studio link | GEO + robots consistency |
| llms-full.txt | `app/llms-full.txt/route.ts`, `lib/seo/llmsContent.ts` | Sections: pricing, languages, Kaspi disclaimer, limitations, best URLs, do-not-crawl | AI RAG / citations |
| ai-summary | `data/seo/aiSummaryContent.ts`, `app/.../ai-summary/page.tsx` | Full RU/EN/KK sections + trust/cost links | Entity page for AI + search |
| KK policy | `lib/seo/kkIndexPolicy.ts` | `isKkAiSummaryApproved()` | KK sitemap inclusion |
| Sitemap | `app/sitemap.ts` | `tokens` + conditional KK ai-summary | Close index/sitemap gaps |
| JSON-LD | `lib/seo/jsonLd.ts` | `inLanguage` includes `kk` | Matches indexable KK subset |
| Internal links | `ru/enFeatureLandingEnhancements.ts`, `marketingFooterProps.ts` | ai-summary + blog_074 | Crawl depth to money/trust pages |
| Validator | `scripts/seo/check-seo-llms.ts`, `package.json` | `check:seo:llms` | Regression guard |
| Smoke | `scripts/seo/smoke-public-routes.ts` | Assert tokens in sitemap source | CI parity |

---

## llms.txt / llms-full.txt

### Before

- `llms.txt` linked to `https://vitrina.help/studio` while `robots.txt` disallows `/studio`.
- Short file; missing cost, languages, structured limitations.
- `llms-full.txt` included studio canonical + minimal sections.

### After

- **No** `https://.../studio`, `/api/`, auth, billing, account URLs.
- Cost: `/ru/cost`, `/en/cost`, `/kk/cost`.
- Disclaimers: not official Kaspi/marketplace partner; no moderation/sales guarantees; manual QA.
- `llms-full.txt`: Pricing/tokens, Languages, Kaspi disclaimer, AI limitations, Do-not-crawl, Best URLs for AI answers.

### Remaining risk

- **Live** `https://vitrina.help/llms.txt` still serves old content until deploy.
- Cloudflare may still block AI bots from fetching llms (see manual steps).

---

## ai-summary

| Locale | Status | Notes |
|--------|--------|-------|
| **RU** | indexable | 8 sections + links to cost, tokens, how-it-works, quality, faq, Kaspi platform, blog_074 |
| **EN** | indexable | Same structure; comparison blog EN slug |
| **KK** | **indexable (published)** | Native Kazakh copy (not EN/RU fallback); Kaspi via `/kk/blog/kaspi-ushin-onim-fotosy` |

**Index/noindex decision:** KK published — quality comparable to KK trust pages; approved in `kkIndexPolicy`.

---

## /tokens policy

| Field | Decision |
|-------|----------|
| **Choice** | **Variant A — index + sitemap** |
| **Why** | Public commercial page: token pricing ($1/task, 10 for $10), linked from `/cost`, not auth dashboard; supports BOFU queries |
| **Sitemap** | Yes — `/ru/tokens`, `/en/tokens`, `/kk/tokens` (priority 0.68) |
| **Robots** | index, follow (via `createSeoMetadata`, `status: published`) |
| **Relation to /cost** | `/cost` = tariffs overview; `/tokens` = top-up CTA — complementary |

---

## JSON-LD

| Schema | Change |
|--------|--------|
| **WebSite `inLanguage`** | `["ru", "en", "kk"]` |
| **Organization** | Unchanged — no fake socials or partner claims |
| **Risks** | `inLanguage: kk` reflects approved KK marketing URLs only; does not auto-index legal KK or platforms |

---

## §7 Comparison / About — decision

**No new comparison landing page.**

Existing published articles already cover intent:

| Locale | URL |
|--------|-----|
| RU | `/ru/blog/ai-foto-ili-fotosessiya-chto-vybrat` (blog_074) |
| EN | `/en/blog/ai-product-photos-or-a-photoshoot-what-to-choose` |

**Action taken:** internal links from feature LPs + `/ai-summary` → these articles.

**About / “What is Vitrina AI”:** covered by `/ai-summary` + home + blog_001 — no duplicate page added.

---

## GSC / Yandex verification (code ready, env empty)

Wired in `app/[locale]/layout.tsx`:

```typescript
verification: {
  google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
}
```

### Manual steps for owner (Railway)

1. **Google Search Console**
   - Add property `https://vitrina.help`
   - Choose HTML tag verification → copy `content="..."` value only
   - Railway → Variables → `NEXT_PUBLIC_GSC_VERIFICATION=<paste content value>`
   - Redeploy → View source on `/ru` → confirm `<meta name="google-site-verification" content="...">`
   - Submit sitemap: `https://vitrina.help/sitemap.xml`

2. **Yandex Webmaster**
   - Add site `https://vitrina.help`
   - Meta tag verification → copy content
   - Railway → `NEXT_PUBLIC_YANDEX_VERIFICATION=<content>`
   - Redeploy → confirm meta on `/ru`
   - Submit same sitemap URL

**No hardcoded tokens in repo.**

---

## Cloudflare manual steps for owner

### Current state (live, 2026-05-21)

Production `robots.txt` includes **Cloudflare Managed** blocks for:

- GPTBot, ClaudeBot, Google-Extended, CCBot, meta-externalagent, Amazonbot, Applebot-Extended, Bytespider, CloudflareBrowserRenderingCrawler

App-level `robots.ts` allows `/` and disallows `/api/`, `/studio` only.

### Why it matters

- Hurts **GEO / AI visibility** — bots cannot fetch `/llms.txt` or marketing pages even after deploy.
- Does **not** block Google Search or Yandex web crawlers for classic SEO.

### Recommended owner action

1. Cloudflare Dashboard → site `vitrina.help` → **Security / Bots** or **Scrape Shield** (product name may vary).
2. Review **Managed robots** / **AI Crawl Control** / Content Signals.
3. For **public marketing** allow (or remove Disallow for):
   - GPTBot, ClaudeBot, Google-Extended, CCBot, PerplexityBot (if listed)
4. **Keep blocked** (app + Cloudflare):
   - `/studio`, `/api/*`, auth, billing, account areas
5. After change, verify:
   ```bash
   curl -s https://vitrina.help/robots.txt
   curl -I https://vitrina.help/llms.txt
   ```

**Code was not changed** — instruction only.

---

## Noindex pages confirmed (unchanged)

| Pattern | Status |
|---------|--------|
| `/examples/**` | noindex, not in sitemap |
| `/studio` | robots disallow |
| `/api/**` | robots disallow |
| auth / billing flows | not in sitemap |
| KK legal (privacy, terms, …) | needs_review |
| KK platforms / use-cases | needs_review / not in sitemap |
| `productVideoGenerator` KK | noindex |
| 82 KK + 60 RU/EN dormant blog topics | not published |
| `/uz`, `/ky`, `/tg`, … | needs_review, not in sitemap |

---

## Commands run

| Command | Result |
|---------|--------|
| `npm run check:seo:content` | PASS |
| `npm run check:seo:trust` | PASS |
| `npm run check:seo:examples` | PASS |
| `npm run check:seo:audience-pages` | PASS |
| `npm run check:seo:kk-content` | PASS |
| `npm run check:seo:llms` | PASS |
| `npm run smoke:seo:public` | PASS |
| `npm run smoke:seo:hreflang` | PASS |
| `NEXT_PUBLIC_SITE_URL=https://vitrina.help npm run smoke:seo:prelaunch` | PASS (253 URLs, 0 failures) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

**Post-deploy HTTP checks (owner):** `curl` llms.txt, ai-summary, sitemap grep for forbidden paths.

---

## Final verdict

| Question | Answer |
|----------|--------|
| Submit sitemap to **Google**? | **Yes**, after deploy + optional GSC verification env |
| Submit sitemap to **Yandex**? | **Yes**, after deploy + optional Yandex verification env |
| Open **KK** indexing further? | **Only approved subset** (+1 ai-summary URL); do not mass-publish 82 KK blogs yet |
| Owner manual only? | Cloudflare AI bots, GSC/Yandex env, deploy, sitemap submit |
| Next stage? | Deploy → verify live llms → submit sitemaps → 2–4 weeks GSC data → native KK review for next blog wave |

**GEO score estimate after deploy (without Cloudflare fix):** ~68/100  
**GEO score with Cloudflare AI allow on marketing:** ~78/100

---

**STAGE 17 CONFIRMED:**
- Studio touched: **no**
- AI pipeline touched: **no**
- Auth/billing touched: **no**
- Supabase/RLS touched: **no**
- Production writes: **no**
- Commit: **no**
- Push: **no**
