# SEO/SaaS Landing Audit — 2026-05-18

Проект: Vitrina AI Studio  
Scope: audit-only перед реализацией SEO / Landing / i18n / Blog / Search readiness.

## 1. Текущая URL-структура

- `/` — текущий landing на русском языке, без locale prefix.
- `/studio` — рабочая студия генерации товарных изображений.
- `/api/ai/tryon` — AI try-on API route.
- `/api/ai/generate-model` — AI model API route.
- `/api/ai/product-shot` — product shot API route.
- `/api/ai/remove-background` — background removal API route.

Других публичных SEO routes сейчас нет.

## 2. Locale routes

`app/[locale]` отсутствует. Поддержки `/ru`, `/en`, `/kk`, `/ar`, `/zh` и других locale-prefixed URL нет.

## 3. Sitemap

`app/sitemap.ts`, `app/sitemap.xml`, `app/sitemap.xml/route.ts` отсутствуют. Search engines не получают явную карту canonical URL.

## 4. Robots

`app/robots.ts`, `app/robots.txt`, `app/robots.txt/route.ts` отсутствуют. Нет явных правил для `/api/`, query duplicates и sitemap location.

## 5. Hreflang

Hreflang отсутствует. Сейчас сайт выглядит как single-language RU landing без alternate language graph.

## 6. Canonical

Self canonical отсутствует. `metadataBase` не задан. Риск: при появлении query params, locale aliases или будущих зеркал поисковики не увидят preferred URL.

## 7. HTML lang

`app/layout.tsx` задаёт `<html lang="ru">`. Для будущих locale routes это недостаточно: `/en`, `/kk`, `/ar`, `/zh` должны получать собственный `lang`, а Arabic — `dir="rtl"`.

## 8. Structured data

JSON-LD отсутствует. Нет Organization, WebSite, SoftwareApplication, BreadcrumbList, BlogPosting, FAQPage или Service schema.

## 9. Blog

Блога нет: отсутствуют `data/seo/blogTopics.ts`, `data/seo/blogArticles.ts`, `lib/blog/blogResolve.ts`, `/[locale]/blog`, `/[locale]/blog/[slug]`.

## 10. Platform / use-case pages

Platform pages и use-case pages отсутствуют. Нет data-driven SEO страниц для Kaspi, Wildberries, Ozon, Amazon, eBay, Etsy, Shopify, Instagram Shop, TikTok Shop и use cases вроде clothing on model, jewelry photos, background replacement.

## 11. Что мешает Google/Yandex/Bing индексации

- Нет sitemap и robots.
- Нет canonical и hreflang.
- Нет locale-prefixed architecture.
- Нет index/noindex quality gate.
- Нет разделения published/draft/needs_review.
- Нет structured data.
- Нет SSR internal links на SEO страницы, потому что самих страниц нет.
- `/` сейчас не задаёт x-default strategy.

## 12. Что мешает AI-поисковикам понять продукт

- Нет `/llms.txt`, `/llms-full.txt`, `/[locale]/ai-summary`.
- Landing объясняет продукт, но не даёт компактного machine-readable summary с ограничениями, платформами, safety caveats и CTA.
- Нет structured data SoftwareApplication / WebSite / FAQ.
- Нет явной карты возможностей, платформ и use cases.

## 13. Index / noindex сейчас

Явных `robots` meta нет. По умолчанию indexable:

- `/`
- `/studio`

API routes не являются HTML pages, но robots сейчас их явно не закрывает.

## 14. Старое Kaspi-only позиционирование

В текущем публичном коде бренд уже переименован в Vitrina AI Studio. Kaspi встречается как пример площадки в `components/landing/UseCases.tsx`, README и старых reports. Это допустимо, но будущие platform pages должны иметь disclaimer: Vitrina AI Studio не является официальным партнёром площадок.

## 15. P0 / P1 / P2 изменения

P0:

- Ввести `/ru` как default locale для СНГ и redirect `/` → `/ru`.
- Добавить 20-locale architecture с correct `html lang` и `dir="rtl"` для `ar`.
- Добавить canonical, hreflang, sitemap, robots.
- Переработать landing в международный SaaS, CTA → `/studio`.
- Добавить quality gate, чтобы drafts / weak translations / noindex pages не попадали в sitemap.
- Добавить platform/use-case/blog architecture.

P1:

- Добавить JSON-LD Organization, WebSite, SoftwareApplication, BreadcrumbList, BlogPosting, FAQPage, Service where appropriate.
- Добавить `/llms.txt`, `/llms-full.txt`, `/[locale]/ai-summary`.
- Добавить IndexNow route disabled by default.
- Добавить analytics events foundation без персональных данных.
- Добавить legal/trust pages.

P2:

- Подключить настоящую ручную keyword validation через Google Keyword Planner, Yandex Wordstat, Bing Webmaster Tools.
- Довести переводы остальных локалей до reviewed/published.
- Расширить published blog articles после content review.

## Решение по default locale

Выбрано `/ru` как default locale: текущий продукт, тексты, MVP-аудитория и существующий landing уже русскоязычные, а ТЗ ориентирует СНГ как важный стартовый рынок. `/en` добавляется как global locale. `/` будет вести на `/ru`, а x-default — на `/ru` до отдельного product decision о global default.
