# Kaspi AI Product Photo Studio

AI-студия для создания товарных фото для маркетплейсов:

- одежда на AI-модели (virtual try-on);
- генерация AI-модели;
- product shot для бижутерии и аксессуаров;
- удаление фона;
- QC checklist перед скачиванием.

## Features

- **Landing** — `/` с описанием продукта и CTA в студию
- **Studio** — `/studio` с тремя режимами:
  - **Clothing Try-On** — товар + AI-модель → FASHN try-on
  - **Product Shot** — студийное фото товара без модели (Bria)
  - **Background Remove Only** — удаление фона по URL
- **AI model generation** — текстовая генерация студийной модели
- **Local upload** — файлы на сервере загружаются в Fal Storage (real mode)
- **QC flow** — checklist, Accept / Reject, Regenerate, Download
- **Mock mode** — разработка без `FAL_KEY` и без списаний

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- [@fal-ai/client](https://www.npmjs.com/package/@fal-ai/client)
- Zod

## Environment variables

Скопируйте `.env.example` в `.env.local`:

```env
AI_MOCK_MODE=1
FAL_KEY=
NEXT_PUBLIC_APP_NAME="Kaspi AI Product Studio"
```

| Variable | Description |
|----------|-------------|
| `AI_MOCK_MODE` | `1` (default) — mock, без вызовов Fal. `0` — real mode |
| `FAL_KEY` | Ключ Fal AI (**только server-side**, не `NEXT_PUBLIC_*`) |
| `NEXT_PUBLIC_APP_NAME` | Название приложения в UI |

**Важно:**

- `AI_MOCK_MODE=1` — безопасный mock mode без списаний.
- `AI_MOCK_MODE=0` + `FAL_KEY` — real mode через Fal AI, **платно**.

## How to run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте:

- http://localhost:3000 — landing
- http://localhost:3000/studio — студия

```bash
npm run build
npm run start
```

## Mock mode

При `AI_MOCK_MODE=1` (или если переменная не равна `0`):

- все API routes возвращают демо-изображения;
- `FAL_KEY` не обязателен;
- загрузка локальных файлов валидируется, но в Fal Storage не отправляется.

## Real Fal mode

Только после явного approve и с ключом:

```env
AI_MOCK_MODE=0
FAL_KEY=your_fal_key_here
```

Модели:

| Endpoint | Fal model |
|----------|-----------|
| Try-on | `fal-ai/fashn/tryon/v1.6` |
| Generate model | `fal-ai/nano-banana-2` |
| Product shot | `fal-ai/bria/product-shot` |
| Remove background | `fal-ai/bria/background/remove` |

## API routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/ai/tryon` | Clothing try-on (JSON or multipart) |
| POST | `/api/ai/generate-model` | AI model image (JSON) |
| POST | `/api/ai/product-shot` | Product shot (JSON or multipart) |
| POST | `/api/ai/remove-background` | Background removal (JSON, `imageUrl`) |

## Current MVP limitations

- нет Auth;
- нет Payments;
- нет Supabase / Postgres;
- нет истории генераций;
- нет batch upload;
- нет server-side export resize (1:1 / 4:5 presets только в UI product-shot);
- Background Remove Only — только URL (без upload файла);
- real paid Fal calls в этом MVP **не запускались** без отдельного approve.

## Future Stage 8 (not implemented)

Планируется отдельно, после approve:

- Auth и user accounts
- Credits / payments
- Supabase (Postgres jobs, Storage)
- Queue + webhooks для долгих генераций
- Batch upload 10–100 товаров
- Admin moderation
- Тарифы

## Repository

https://github.com/loomany/market.kk
