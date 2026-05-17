# Vitrina AI Studio

AI-студия для создания товарных фото для маркетплейсов.

## Features

- одежда на AI-модели;
- генерация AI-модели;
- product shot для бижутерии и аксессуаров;
- удаление фона;
- чеклист качества;
- accept / reject / regenerate;
- demo mode без списаний.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Fal AI
- Zod
- No Supabase/Auth/Payments in MVP

## Environment

Скопируйте `.env.example` в `.env.local`:

```env
AI_MOCK_MODE=1
FAL_KEY=
NEXT_PUBLIC_APP_NAME="Vitrina AI Studio"
```

`AI_MOCK_MODE=1` — демо-режим без списаний. API routes возвращают демо-изображения, `FAL_KEY` не нужен.

`AI_MOCK_MODE=0` + `FAL_KEY` — реальный AI-режим через Fal. Это платно, поэтому real paid calls нельзя запускать без отдельного approve.

## How To Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте:

- `http://localhost:3000` — landing;
- `http://localhost:3000/studio` — студия.

Для production-проверки:

```bash
npm run build
npm run start
```

## API Routes

- `POST /api/ai/tryon`
- `POST /api/ai/generate-model`
- `POST /api/ai/product-shot`
- `POST /api/ai/remove-background`

## MVP Limitations

- нет Auth;
- нет Payments;
- нет Supabase;
- нет истории генераций;
- нет batch upload;
- нет server-side export resize;
- standalone удаление фона в UI работает по URL;
- real paid calls не запускались без approve.

## Notes

Vitrina AI Studio — универсальный SaaS-инструмент для продавцов маркетплейсов, интернет-магазинов и каталогов. Kaspi может быть одним из примеров площадки, но не является брендом продукта.
