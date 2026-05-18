# Multilingual SEO Architecture ? 2026-05-18

## Decision

Default locale is /ru because the current product, MVP copy, and initial market are RU/CIS. /en is the global locale. / redirects to /ru. x-default points to /ru until a product decision changes the global default.

## Languages

ru, en, kk, ky, uz, tg, tr, az, ar, es, pt, fr, de, it, pl, uk, hi, id, vi, zh (hreflang zh-Hans). Arabic uses dir=rtl.

## URL patterns

- /[locale]
- /[locale]/studio
- /[locale]/features
- /[locale]/platforms and /[locale]/platforms/[slug]
- /[locale]/use-cases and /[locale]/use-cases/[slug]
- /[locale]/blog and /[locale]/blog/[slug]
- /[locale]/ai-summary
- /[locale]/privacy, /terms, /acceptable-use, /data-deletion

## Indexing policy

RU and EN are published/indexable where content is complete. Other locales are available for architecture and html lang/dir QA but are needs_review/noindex until reviewed localization is added.

## Hreflang/canonical

Pages use self canonical and alternate language maps. Sitemap contains only indexable RU/EN canonical URLs and RU/EN alternates to avoid listing noindex translations.

## Quality protection

lib/seo/qualityGate.ts blocks draft, noindex, needs_review, machine_translated, short title/description, missing H1, missing canonical/hreflang, placeholder content, and unsupported claims.
