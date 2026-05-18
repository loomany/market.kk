# SEO Quality Gate ? 2026-05-18

Implemented in lib/seo/qualityGate.ts.

## Indexable page requirements

- unique title and description;
- H1 present;
- useful sections;
- visible internal links;
- canonical and hreflang;
- content status published;
- no placeholder content;
- no unsupported claims, fake reviews, fake ratings, or guaranteed marketplace acceptance.

## Noindex statuses

- draft
- noindex
- index_when_content_ready
- machine_translated
- needs_review

## Sitemap integration

app/sitemap.ts calls shouldIndexPage before adding static, platform, use-case, and blog URLs. Current expected sitemap count: 112 URLs.
