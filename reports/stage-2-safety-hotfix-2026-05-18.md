# Stage 2 Safety Hotfix — 2026-05-18

## 1. Incident summary

During Stage 2 mock smoke, a running dev server on `localhost:3010` was already in real mode and one unintended paid Fal call was triggered:

- Route: `POST /api/ai/generate-model`
- Model: `fal-ai/nano-banana-2`
- Request ID: `019e38a9-dc34-7123-889f-4ddd13d73fa0`

No new real Fal, OpenAI, or Green API calls were run during this hotfix.

## 2. Paid AI guard

Added `lib/ai/paidAiGuard.ts`.

Rules:

- `AI_MOCK_MODE !== "0"` blocks paid provider calls and routes must return mock/dry-run where supported.
- `AI_MOCK_MODE === "0"` plus `ALLOW_PAID_AI_RUNS !== "true"` blocks paid provider calls with `PAID_AI_RUNS_DISABLED`.
- If `MAX_AI_TEST_SPEND_USD` is set and `estimatedCostUsd` is higher than the budget, calls are blocked with `BUDGET_EXCEEDED`.
- Error messages are safe and do not expose provider keys.

## 3. Routes protected

Fal generation routes:

- `POST /api/ai/generate-model`
- `POST /api/ai/tryon`
- `POST /api/ai/product-shot`
- `POST /api/ai/remove-background`
- `POST /api/ai/video/generate`
- `POST /api/ai/scene/generate`

Other paid provider routes:

- `POST /api/ai/prompt/enhance`
- `POST /api/auth/whatsapp/send-code`

System status route:

- `GET /api/system/ai-mode`

The route returns only booleans: `mockMode`, `paidAiRunsAllowed`, `openAiConfigured`, `falConfigured`, `greenApiConfigured`.

## 4. UI safety state

Studio now shows a safe status:

- Demo mode: `Демо-режим` and `Списаний нет.`
- Real mode with paid calls disabled: `Реальный AI-режим` and `Реальный режим настроен, но платные генерации заблокированы.`
- Real mode with paid calls allowed: `Платные генерации разрешены` and `Проверяйте стоимость перед запуском.`

No keys or env values are shown in the UI.

## 5. Mock smoke result

Added `scripts/smoke/mock-ai-routes.ts` and `npm run smoke:ai:mock`.

The script starts isolated Next dev servers with forced env states and calls `/api/system/ai-mode` before any route checks.

Result:

- `forced mock routes`: passed.
- `real mode disabled guard`: passed.
- `budget guard`: passed.
- `AI mock and paid guard checks passed`.

Note: the first smoke attempt detected that Next refused a second dev server because `localhost:3010` was already running. That old dev server was stopped, then the isolated smoke passed. The smoke did not call the old real-mode server.

## 6. Budget guard result

Checked:

- `AI_MOCK_MODE=0`
- `ALLOW_PAID_AI_RUNS=true`
- `MAX_AI_TEST_SPEND_USD=0`
- dummy provider key

`POST /api/ai/generate-model` returned `BUDGET_EXCEEDED` before provider access.

## 7. Supabase migration QA

Migration reviewed statically:

- File: `supabase/migrations/202605180001_stage2_saas.sql`
- `DATABASE_URL` was not present in the shell environment, so no migration was applied.
- No destructive SQL was run.

Tables present:

- `profiles`
- `studio_projects`
- `studio_assets`
- `generation_jobs`
- `auth_codes`

Storage buckets present:

- `user-uploads`
- `generated-assets`

RLS review:

- Profiles: own read/update.
- Projects: own all.
- Assets: own all.
- Jobs: own read/insert.
- Auth codes: no user policies, service-role only by design.
- Storage: user-folder policies for both buckets.

## 8. WhatsApp auth QA

Checked statically and via smoke:

- Invalid phone validation exists.
- Send-code rate limit exists.
- Codes are stored as `code_hash`, not plain code.
- Phone and code are not logged together.
- Real Green API send is guarded by `assertPaidAiAllowed`.
- In real mode with Green API credentials and `ALLOW_PAID_AI_RUNS=false`, send-code returns `PAID_AI_RUNS_DISABLED`.
- Verify route handles missing/expired/wrong/too many attempts/consumed code paths.

No real WhatsApp message was sent.

## 9. OpenAI prompt enhance QA

Checked:

- `AI_MOCK_MODE=1`: returns mock enhanced prompt, no OpenAI call.
- `AI_MOCK_MODE=0` and `ALLOW_PAID_AI_RUNS=false`: returns `PAID_AI_RUNS_DISABLED`.
- `OPENAI_API_KEY` is used only server-side.
- The OpenAI request keeps `store: false`.
- The UI requires user confirmation before applying enhanced prompts.

No real OpenAI call was run.

## 10. Video config status

Video route is now guarded before any Fal call.

`POST /api/ai/video/generate`:

- returns mock video in demo mode;
- blocks with `PAID_AI_RUNS_DISABLED` in real mode without approval;
- blocks with `BUDGET_EXCEEDED` if estimated cost exceeds `MAX_AI_TEST_SPEND_USD`;
- uses server-side Fal only after guard passes.

No real video call was run.

## 11. Security grep

Checked:

- `FAL_KEY`
- `OPENAI_API_KEY`
- `GREEN_API_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `APP_SESSION_SECRET`

Result:

- No real secret values were printed.
- References are limited to `.env.example`, server-side code, smoke dummy placeholders, README, and reports.
- No service role key is imported in client components.
- `git ls-files .env.local` returned no tracked file.
- `git check-ignore -v .env.local` confirms `.env.local` is ignored by `.gitignore`.

## 12. Build and lint

- `npm run build`: passed.
- `npm run lint`: passed.

Build warning:

- Next.js reports the `middleware` file convention is deprecated and recommends `proxy`. This was not changed in the hotfix.

Smoke warning:

- Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning for running the `.ts` smoke script with ESM syntax. It does not affect the guard result.

## 13. What was not done

- No new product features.
- No design changes beyond the safety status indicator.
- No real Fal calls.
- No real OpenAI calls.
- No real Green API messages.
- No payments.
- No destructive Supabase SQL.
- No `.env.local` changes.
- No push.

## 14. Remaining risks

- An old dev server can still block isolated smoke startup because Next allows one dev server per project. The smoke script fails safe instead of calling the existing server.
- Video model schemas and pricing still need controlled approval before any real generation run.
- WhatsApp rate limiting is in-memory and should be hardened for production.
- Supabase migration was statically reviewed but not applied to a live database in this hotfix.

## 15. Next safe real-run plan

Before any future real run:

1. Stop old dev servers.
2. Confirm `/api/system/ai-mode` shows `mockMode=false` and `paidAiRunsAllowed=true`.
3. Set `MAX_AI_TEST_SPEND_USD` to the approved budget.
4. Run one explicit route at a time.
5. Record endpoint, estimated cost, request ID, and visual pass/fail.
6. Disable `ALLOW_PAID_AI_RUNS` immediately after the test.

## 16. Finalization check — 2026-05-18

Git before final report commit:

- `git status --short`: current working tree contains unrelated uncommitted Studio/Auth WIP files. They were not staged for this safety finalization.
- `git diff --stat`: current WIP diff is outside the original safety hotfix and includes Studio UI/model workflow changes.

Build / lint:

- `npm run build`: passed on the current working tree.
- `npm run lint`: failed on current uncommitted WIP files:
  - `components/auth/PhoneCountryInput.tsx`
  - `components/auth/WhatsAppLoginModal.tsx`
  - `components/studio/ModelPromptComposer.tsx`
  - `components/ui/Select.tsx`
  - plus several unused-variable warnings.

Safety smoke:

- First `npm run smoke:ai:mock` attempt failed safe because another Next dev server was already running on `localhost:3010`.
- `GET http://localhost:3010/api/system/ai-mode` returned only boolean fields and no keys:
  - `mockMode: false`
  - `paidAiRunsAllowed: true`
  - `openAiConfigured: true`
  - `falConfigured: true`
  - `greenApiConfigured: true`
- Because that existing server was real-enabled and paid-enabled, it was stopped before running smoke.
- Second `npm run smoke:ai:mock`: passed.

Smoke result:

- `forced mock routes`: ok.
- `real mode disabled guard`: ok.
- `budget guard`: ok.
- `AI mock and paid guard checks passed`.

Security grep:

- Checked `FAL_KEY`, `OPENAI_API_KEY`, `GREEN_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `APP_SESSION_SECRET`.
- No real secret values were printed.
- Occurrences are expected in `.env.example`, README/reports, server-side code, and smoke dummy placeholders.
- `SUPABASE_SERVICE_ROLE_KEY` is not used in client components.
- `.env.local` is ignored by `.gitignore` and not tracked by git.

Real paid calls after hotfix:

- None.

Final remaining risks:

- A real-enabled dev server can still be left running by a developer; the smoke script fails safe instead of using it.
- Current uncommitted WIP has lint errors unrelated to the safety guard.
- Node prints `MODULE_TYPELESS_PACKAGE_JSON` for the TypeScript smoke script; this is noisy but does not affect guard behavior.
