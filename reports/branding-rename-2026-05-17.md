# Branding Rename — Vitrina AI Studio

**Дата:** 2026-05-17  
**Новое полное название:** Vitrina AI Studio  
**Короткое название:** Vitrina AI  
**Tagline:** AI-студия товарных фото для маркетплейсов  
**Real Fal calls:** не запускались

## Что заменено

- `Kaspi AI Product Photo Studio` заменён на `Vitrina AI Studio` в публичной документации и UI.
- `Kaspi AI Product Studio` заменён на `Vitrina AI Studio` в metadata и env example.
- `Kaspi AI Studio` убран из landing header.
- Старое позиционирование “для Kaspi” заменено на универсальное: маркетплейсы, интернет-магазины, Instagram-витрины и каталоги.
- `NEXT_PUBLIC_APP_NAME` в `.env.example` обновлён на `Vitrina AI Studio`.
- `package.json` обновлён:
  - `name`: `vitrina-ai-studio`;
  - `description`: `AI product photo studio for marketplaces`.

## Изменённые файлы

- `app/layout.tsx`
- `app/page.tsx`
- `app/studio/page.tsx`
- `components/landing/Hero.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/UseCases.tsx`
- `.env.example`
- `package.json`
- `README.md`

## Где Kaspi оставлен как пример

- `components/landing/UseCases.tsx`: в списке аудиторий есть “продавцы Kaspi”.
- `components/landing/UseCases.tsx`: текст объясняет, что Kaspi — только один из примеров площадки.
- `README.md`: Kaspi упомянут только как пример площадки, не как бренд продукта.

## Подтверждения

- Backend/API logic не менялась.
- Существующие API routes не переименовывались и не удалялись:
  - `POST /api/ai/tryon`
  - `POST /api/ai/generate-model`
  - `POST /api/ai/product-shot`
  - `POST /api/ai/remove-background`
- AI provider logic не менялась.
- `.env.local` не трогался.
- Real Fal paid calls не запускались.
- Supabase/Auth/Payments/DB не добавлялись.
