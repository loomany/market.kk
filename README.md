# Vitrina AI Studio

AI-студия для создания товарных фото и коротких видео для маркетплейсов.

## Features

- одежда, бельё и комплекты на AI-модели;
- генерация взрослой AI-модели для коммерческой каталожной съёмки;
- точная товарная карточка без перерисовки товара;
- ручное выделение товара для точной карточки;
- проработка готовых изображений: фон, сцена, Reels / Stories, видео;
- удаление фона как внутренний инструмент, не отдельный верхний режим;
- усиление промта через server-side OpenAI route;
- чеклист качества перед скачиванием;
- accept / reject / regenerate;
- WhatsApp-вход через Green API;
- Supabase architecture для профилей, истории, файлов и jobs;
- demo mode без списаний.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Fal AI
- OpenAI Responses API
- Supabase SSR client / admin client
- Zod
- Green API for WhatsApp code delivery
- No Payments in this stage

## Environment

Скопируйте `.env.example` в `.env.local` и заполните только нужные ключи.

```env
AI_MOCK_MODE=1
FAL_KEY=
OPENAI_API_KEY=
OPENAI_PROMPT_MODEL=gpt-5.5
ALLOW_PAID_AI_RUNS=false
MAX_AI_TEST_SPEND_USD=5

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GREEN_API_INSTANCE_ID=
GREEN_API_TOKEN=
WHATSAPP_AUTH_CODE_TTL_MINUTES=10
APP_SESSION_SECRET=

NEXT_PUBLIC_APP_NAME="Vitrina AI Studio"
```

`AI_MOCK_MODE=1` — демо-режим без списаний.

`AI_MOCK_MODE=0` + `FAL_KEY` — реальный AI-режим через Fal. Это платно. Не запускайте real paid calls без явного approval и включённого budget guard.

`ALLOW_PAID_AI_RUNS=false` — безопасное значение по умолчанию. Video/scene real calls должны быть заблокированы, пока не утверждён бюджет.

## How To Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте:

- `http://localhost:3000` — landing;
- `http://localhost:3000/studio` — студия.

Production-проверка:

```bash
npm run build
npm run lint
```

## API Routes

Existing AI routes:

- `POST /api/ai/tryon`
- `POST /api/ai/generate-model`
- `POST /api/ai/product-shot`
- `POST /api/ai/remove-background`
- `POST /api/ai/pricing`

Stage 2 routes:

- `POST /api/ai/prompt/enhance`
- `POST /api/ai/video/generate`
- `POST /api/ai/scene/generate`
- `GET /api/auth/me`
- `POST /api/auth/whatsapp/send-code`
- `POST /api/auth/whatsapp/verify-code`
- `POST /api/auth/logout`
- `GET /api/studio/assets`
- `POST /api/studio/assets`
- `DELETE /api/studio/assets`

## Supabase

Migration:

- `supabase/migrations/202605180001_stage2_saas.sql`

Tables:

- `profiles`
- `studio_projects`
- `studio_assets`
- `generation_jobs`
- `auth_codes`

Storage buckets:

- `user-uploads`
- `generated-assets`

RLS policies are included. Service role is used only server-side.

## Current Limitations

- Payments are not implemented.
- Video and creative scene real calls are budget-guarded and should not run without approval.
- WhatsApp auth is app-level code flow; production hardening still needs persistent rate limits and full session revocation strategy.
- Supabase Storage upload from generated remote URLs is planned; current implementation saves metadata/history and keeps anonymous mode session-only.
- No batch upload.
- No server-side export resize pipeline.

## Safety Notes

- Do not commit `.env.local`.
- Do not print `FAL_KEY`, `OPENAI_API_KEY`, `GREEN_API_TOKEN`, or `SUPABASE_SERVICE_ROLE_KEY`.
- Kaspi is only an example marketplace. The product brand is Vitrina AI Studio.
