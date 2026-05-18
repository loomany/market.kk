# Stage 2 Real Runs — 2026-05-18

## Important Incident

One real Fal call was unintentionally executed during API smoke verification because the already-running dev server on `http://localhost:3010` was in real mode, not mock mode.

Further live API smoke calls were stopped immediately after this was detected.

## Real Calls

| # | Endpoint | Provider | Model | Request ID | Result URL | Status |
|---|---|---|---|---|---|---|
| 1 | `POST /api/ai/generate-model` | Fal | `fal-ai/nano-banana-2` | `019e38a9-dc34-7123-889f-4ddd13d73fa0` | `https://v3b.fal.media/files/b/0a9aa417/xwfL4f3d7XQ7zG_WkVpRj_goSozcRP.png` | completed |

## Payload Summary

- gender: female
- bodyType: plus-size
- ageGroup: adult
- pose: front
- crop: full-body
- background: studio
- categoryContext: lingerie
- numImages: 1

## Visual QA

Not used as a product-quality pass/fail test. This was only a generated model call, not a try-on transfer.

## Cost

Actual cost was not available from the local response. Treat as a paid Fal call.

## Safety

- `FAL_KEY` was not printed.
- `.env.local` was not read or committed.
- No further paid Fal/OpenAI calls were run after detection.

## Follow-up

Use an isolated mock server or explicit environment guard for future smoke tests. Do not point smoke tests at an already-running dev server unless its mode is verified in UI first.
