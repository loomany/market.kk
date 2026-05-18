# Google / Yandex / Bing / AI Readiness ? 2026-05-18

## Google

- NEXT_PUBLIC_GSC_VERIFICATION placeholder added to .env.example.
- /sitemap.xml generates canonical indexable URLs only.
- Canonical and hreflang metadata added for localized pages.
- No localhost or query URLs are generated in sitemap.

## Yandex

- NEXT_PUBLIC_YANDEX_VERIFICATION and NEXT_PUBLIC_YANDEX_METRIKA_ID placeholders added.
- robots.txt allows YandexBot and includes sitemap.
- IndexNow server route is present, disabled by default.

## Bing

- NEXT_PUBLIC_BING_VERIFICATION placeholder added.
- IndexNow API route: POST /api/indexnow/submit.
- Own-domain validation and simple in-memory rate limit are implemented.

## AI readiness

- /llms.txt provides compact product summary.
- /llms-full.txt provides full platform/use-case/blog map.
- /[locale]/ai-summary provides an indexable RU/EN summary and noindex needs_review for other locales.

## Caveats

Set NEXT_PUBLIC_SITE_URL to the final production domain before launch. llms.txt is an extra AI discoverability file, not a Google requirement.
