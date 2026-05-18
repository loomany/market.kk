# Supabase + WhatsApp Auth Plan — 2026-05-18

## Sources

- Supabase SSR client docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control docs: https://supabase.com/docs/guides/storage/security/access-control

## Added Files

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `lib/auth/session.ts`
- `lib/auth/whatsapp.ts`
- `components/auth/WhatsAppLoginModal.tsx`
- `app/api/auth/whatsapp/send-code/route.ts`
- `app/api/auth/whatsapp/verify-code/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/studio/assets/route.ts`
- `supabase/migrations/202605180001_stage2_saas.sql`

## Supabase Schema

Tables:

- `profiles`
- `studio_projects`
- `studio_assets`
- `generation_jobs`
- `auth_codes`

Storage buckets:

- `user-uploads`
- `generated-assets`

RLS:

- profiles: own read/update.
- studio_projects: own all.
- studio_assets: own all.
- generation_jobs: own read/insert.
- auth_codes: service-role only.
- storage objects: user-folder policies for upload/read/update/delete.

## WhatsApp Flow

1. User enters WhatsApp phone.
2. Server normalizes phone and rate-limits send attempts in memory.
3. Server generates a 6-digit code.
4. Code is hashed; plaintext code is never stored.
5. If Supabase admin is configured, hash is stored in `auth_codes`; otherwise memory fallback is used.
6. Green API sends the code if credentials are present and real mode is enabled.
7. User submits code.
8. Server verifies expiry, attempts, and hash.
9. Server creates or finds a profile and sets an httpOnly app session cookie.

## Security Notes

- `GREEN_API_TOKEN` stays server-side.
- `SUPABASE_SERVICE_ROLE_KEY` stays server-side.
- OTP code is not logged.
- Phone+code are not logged together.
- Current rate limit is in-memory and suitable for MVP/dev only.

## Remaining Production Hardening

- Persistent rate limiting by phone/IP.
- Stronger session revocation.
- Optional Supabase Auth custom token strategy.
- Storage upload pipeline for generated remote URLs.
- Audit logs for auth attempts.
