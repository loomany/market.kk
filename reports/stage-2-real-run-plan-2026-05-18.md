# Stage 2 Real Run Plan — 2026-05-18

## Status

Real batch runs are not approved and were not executed.

## Required Guards Before Any Batch

```env
AI_MOCK_MODE=0
ALLOW_PAID_AI_RUNS=true
MAX_AI_TEST_SPEND_USD=<approved budget>
FAL_KEY=<server-side only>
OPENAI_API_KEY=<server-side only, if prompt tests are included>
```

Before running, confirm pricing through server-side pricing checks. Do not rely only on local estimates.

## Proposed 10 Runs

1. Одежда на модели — basic clothing try-on.
2. Одежда на модели — lingerie/on-model reference.
3. Товарная карточка — exact card earrings.
4. Товарная карточка — creative jewelry scene.
5. Проработка — replace background exact.
6. Проработка — creative scene.
7. Video — Kling medium.
8. Video — Kling high / longer duration.
9. Video — MiniMax 6 sec.
10. Video — Veo 3.1 4s or 6s.

## Estimated Cost Policy

- Use `POST /api/ai/pricing` for local estimate.
- Query Fal pricing API before paid execution.
- Store estimated cost in `generation_jobs`.
- Stop if cumulative estimated cost approaches `MAX_AI_TEST_SPEND_USD`.

## Pass/Fail

Pass:

- product identity is preserved;
- image/video loads;
- no random unrelated objects;
- no text/watermark;
- result can pass manual QC.

Fail:

- product color/shape/pattern changes materially;
- generated result is clearly unrelated;
- video warps the product;
- result URL is broken;
- pricing or request payload is unknown.

## Approval Needed

Do not run this plan until the user explicitly approves paid calls and budget.
