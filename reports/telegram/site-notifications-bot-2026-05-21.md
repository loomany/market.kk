# Telegram site notifications — implementation report (2026-05-21)

## Summary

Isolated Telegram notification module for site visits, traffic sources, bots, registrations, and important actions. No DB migration; works with env only.

## Files created

| Path | Purpose |
|------|---------|
| `lib/telegram/types.ts` | Event and profile types |
| `lib/telegram/telegramConfig.ts` | Env parsing, silent hours |
| `lib/telegram/trafficClassifier.ts` | UTM/referrer/ad click classification |
| `lib/telegram/botDetector.ts` | Crawler / bot UA detection |
| `lib/telegram/visitorMemory.ts` | In-process visitor profiles (TTL) |
| `lib/telegram/eventDeduper.ts` | Rate limits and dedupe keys |
| `lib/telegram/telegramFormatter.ts` | HTML Telegram messages |
| `lib/telegram/telegramClient.ts` | Bot API send + test helper |
| `lib/telegram/siteEventProcessor.ts` | Notification policy orchestration |
| `lib/telegram/clientEvents.ts` | Client visitor/session + `postSiteEvent` |
| `lib/telegram/uaSummary.ts` | Device/browser/OS line |
| `lib/telegram/siteEventSchema.ts` | Zod API validation |
| `lib/telegram/rateLimit.ts` | API rate limit (60/5min) |
| `app/api/telegram/site-event/route.ts` | `POST` endpoint |
| `components/analytics/SiteTelegramTracker.tsx` | Client tracker |
| `scripts/telegram-test.ts` | `npm run telegram:test` |
| `reports/telegram-bot-setup.md` | Owner setup guide |

## Files modified (minimal)

| Path | Change |
|------|--------|
| `app/(default)/layout.tsx` | Mount `SiteTelegramTracker` |
| `app/[locale]/layout.tsx` | Mount `SiteTelegramTracker` |
| `components/landing/SaasLanding.tsx` | Hero CTA `data-telegram-*` |
| `components/landing/SaasHeader.tsx` | Studio nav CTA attrs |
| `components/landing/Hero.tsx` | Studio CTA attrs |
| `components/tokens/TokensPageClient.tsx` | `checkout_click`, `payment_success` |
| `components/auth/WhatsAppLoginModal.tsx` | `signup_start`, `signup_success` / `login_success` |
| `app/api/auth/whatsapp/verify-code/route.ts` | Add `isNewUser` to JSON (additive) |
| `.env.example` | Telegram env block |
| `package.json` | `telegram:test`, `typecheck` scripts |

## Environment variables

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
TELEGRAM_NOTIFICATIONS_ENABLED=true
TELEGRAM_DEBUG=false
# TELEGRAM_SILENT_HOURS=23:00-08:00
```

If token or chat id is missing → notifications disabled, site unchanged.

## Events sent immediately

- `first_visit` / `return_visit` (human, deduped 24h / 12h)
- Paid traffic visits (Google/Yandex/Meta/TikTok ads)
- `signup_start`, `signup_success`, `login_success`
- `pricing_view`, `tokens_view`, `studio_open` (from path or event)
- `checkout_click`, `payment_success`
- `cta_click`, `lead_action`
- Important bots (max 1 per 6h per bot + path group)

## Suppressed / aggregated

- Ordinary `page_view` (no per-page spam)
- Blog/article-only browsing (counts toward summary, no per-page alerts)
- Duplicate CTAs, pricing/tokens/studio within session windows
- Noise bots (unless `TELEGRAM_DEBUG=true`)
- **Session summary** max 1 per 10 minutes (page count, paths, source, locale)

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |
| `npm run lint` | Fails on pre-existing project debt (e.g. `PhoneCountryInput`, `TokenBalancePill`); only new warning in `eventDeduper` fixed |
| `npm run telegram:test` (no token in env) | Exits with `TELEGRAM_BOT_TOKEN is missing` (expected) |

## Local test

1. Add vars to `.env.local` (see `reports/telegram-bot-setup.md`).
2. `npm run telegram:test` → test message in Telegram.
3. `npm run dev` → open site; first visit should produce one notification.
4. Navigate 10 marketing pages → no 10 messages; optional one summary after activity.
5. `?utm_source=yandex&utm_medium=cpc` → Yandex Direct in message.
6. `?gclid=test` / `?yclid=test` → Google Ads / Yandex Direct.

## Production

Set the same env vars on the host, redeploy, run `npm run telegram:test` in CI or locally with production env if needed.

## Not touched

Studio / AI pipeline, FASHN / Fal / OpenAI routes, Lemon Squeezy webhooks and checkout API, Supabase auth/RLS/migrations, SEO sitemap/hreflang/robots, token ledger, pricing/checkout URL logic.

## Risks

- In-memory dedupe resets on serverless cold starts (may duplicate one notification).
- Multi-instance deploy: per-instance memory (rare duplicate until TTL).
- Country shown only when `x-vercel-ip-country` / `cf-ipcountry` present.
- `isNewUser` on verify-code is a small additive API field for accurate signup events.
