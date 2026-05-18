# Stage 2 Final QA — 2026-05-18

## Build / Lint

- `npm run build`: passed.
- `npm run lint`: passed with 3 existing warnings:
  - `app/api/ai/product-shot/route.ts` unused placeholder args.
  - `lib/ai/productShotPrompts.ts` unused placeholder arg.

## Browser QA

Target used: `http://localhost:3010`.

Desktop:

- `/ru`: hero title, modules, trust block visible.
- `/studio`: three top modes visible: “Одежда на модели”, “Товарная карточка”, “Проработка”.
- “Удалить фон” is not a top mode.
- WhatsApp login modal opens.
- “Проработка” empty state works.

Mobile viewport checks:

- 360×740: no horizontal overflow on `/ru` or `/studio`.
- 390×844: no horizontal overflow on `/ru` or `/studio`.
- 430×932: no horizontal overflow on `/ru` or `/studio`.
- 768×1024: no horizontal overflow on `/ru` or `/studio`.

## API / Paid Calls

Live mock API smoke was stopped after detecting the running server was in real mode.

One unintended real Fal call occurred:

- `POST /api/ai/generate-model`
- Model: `fal-ai/nano-banana-2`
- Request ID: `019e38a9-dc34-7123-889f-4ddd13d73fa0`

No real try-on, product-shot, remove-background, video, scene, or OpenAI prompt calls were run.

Safe non-generation smoke:

- `GET /api/studio/assets` returned `ok: true`, empty assets.
- `POST /api/ai/pricing` for Kling 5 sec returned `$0.42` local estimate.

## Security Grep

Checked server-only key names:

- `FAL_KEY`
- `OPENAI_API_KEY`
- `GREEN_API_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

Expected occurrences are in `.env.example`, server-side routes/libs, and reports. No client component exposes secret values.

## What Was Not Done

- No push.
- No payments.
- No Stripe/Lemon Squeezy.
- No destructive Supabase SQL.
- No batch queue.
- No full production session revocation.
- No generated file upload-to-storage pipeline yet.

## Risks

- Current `.env.local` may put existing dev servers into real mode; future smoke tests need an isolated mock server.
- Video pricing estimates must be confirmed through Fal pricing API before any paid batch.
- In-memory WhatsApp rate limiting is not production-grade.
- Supabase migrations were created but not applied in a live project during this task.
