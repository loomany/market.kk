# Supabase Migration Apply Review — 2026-05-18

**Migration file:** `supabase/migrations/202605180001_stage2_saas.sql`  
**Reviewed for:** manual apply via Supabase SQL Editor  
**Reviewer:** automated pre-apply audit (read-only)

---

## Verdict

| Field | Value |
|-------|-------|
| **safe_to_apply** | **yes** |
| **destructive_sql_found** | **no** |

Apply is safe for a **greenfield** Stage 2 schema on a project that does not already have these tables, policies, or bucket IDs. Re-running the full script on an already-applied project will likely fail on duplicate policies (see Risks).

---

## 1. Destructive SQL scan

Full file read (162 lines). Searched for: `DROP TABLE`, `DROP POLICY`, `DELETE`, `TRUNCATE`, broad/destructive `UPDATE`.

| Pattern | Found |
|---------|-------|
| `DROP TABLE` | No |
| `DROP POLICY` | No |
| `DELETE` (DML) | No |
| `TRUNCATE` | No |
| Destructive `UPDATE` (mass row updates) | No |

**Notes (not counted as destructive migration SQL):**

- Foreign keys use `on delete cascade` / `on delete set null` — constraint metadata only; no data is deleted at apply time.
- Storage RLS policies include `for delete` — that defines who may delete **their own** objects later, not a migration-time data wipe.
- `insert into storage.buckets ... on conflict (id) do nothing` — non-destructive; skips if bucket exists.

---

## 2. Tables created

Only the five expected `public` tables are created (all `create table if not exists`):

| Table | Purpose (from schema) |
|-------|------------------------|
| `profiles` | User profile keyed by `auth.users(id)` |
| `studio_projects` | Per-user studio projects |
| `studio_assets` | Generated/uploaded assets per user |
| `generation_jobs` | Async generation job records |
| `auth_codes` | Hashed WhatsApp OTP codes (server-only access) |

No other `public` tables are created in this migration.

---

## 3. RLS enabled

```sql
alter table public.profiles enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_assets enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.auth_codes enable row level security;
```

| Table | RLS enabled |
|-------|-------------|
| `profiles` | yes |
| `studio_projects` | yes |
| `studio_assets` | yes |
| `generation_jobs` | yes |
| `auth_codes` | yes |

### Table policies (authenticated / anon)

| Table | Policies | Client access pattern |
|-------|----------|------------------------|
| `profiles` | `profiles own read`, `profiles own update` | Own row: SELECT, UPDATE only (no INSERT for client) |
| `studio_projects` | `projects own all` | Own rows: ALL |
| `studio_assets` | `assets own all` | Own rows: ALL |
| `generation_jobs` | `jobs own read`, `jobs own insert` | Own rows: SELECT, INSERT only (no client UPDATE/DELETE) |
| `auth_codes` | **none** (intentional) | **No access** for `anon` / `authenticated` |

`auth_codes`: RLS is ON with zero permissive policies → default deny for browser/anon/authenticated clients. Server uses `SUPABASE_SERVICE_ROLE_KEY` via `lib/supabase/admin.ts` (`server-only`), which bypasses RLS — matches `app/api/auth/whatsapp/send-code` and `verify-code`.

---

## 4. Storage buckets (private / safe)

```sql
insert into storage.buckets (id, name, public)
values
  ('user-uploads', 'user-uploads', false),
  ('generated-assets', 'generated-assets', false)
on conflict (id) do nothing;
```

| Bucket | `public` flag | Safe default |
|--------|---------------|--------------|
| `user-uploads` | `false` | yes — private bucket |
| `generated-assets` | `false` | yes — private bucket |

Objects are not world-readable via public bucket URL. Access requires authenticated Storage API + RLS.

**Caveat:** `on conflict do nothing` does **not** downgrade an existing bucket that was already created with `public = true`. Verify in Dashboard → Storage if buckets pre-exist.

---

## 5. Storage policies (user-owned paths)

Eight policies on `storage.objects`, scoped to `authenticated` only (not `anon`).

Path rule (both buckets): first folder segment must equal `auth.uid()::text`:

```sql
(storage.foldername(name))[1] = (select auth.uid())::text
```

| Bucket | Operations | Policy names |
|--------|------------|--------------|
| `user-uploads` | SELECT, INSERT, UPDATE, DELETE | `user uploads read/write/update/delete own` |
| `generated-assets` | SELECT, INSERT, UPDATE, DELETE | `generated assets read/write/update/delete own` |

**Expected object layout:** `{userId}/...` (e.g. `a1b2c3d4-.../file.png`).

Cross-user access to another user’s folder is denied by RLS.

---

## 6. Service role on client

| Check | Result |
|-------|--------|
| Browser client (`utils/supabase/client.ts`) | Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only |
| Service role env | `SUPABASE_SERVICE_ROLE_KEY` — **no** `NEXT_PUBLIC_` prefix |
| Admin client (`lib/supabase/admin.ts`) | `import "server-only"` + service role; used from API routes only |
| `auth_codes` / asset writes | Server routes: `send-code`, `verify-code`, `studio/assets` |

**Conclusion:** Migration does not require exposing service role in the frontend. App code already keeps service role server-side; ensure production env never adds `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Risks

1. **Not idempotent for policies** — `create policy` has no `if not exists`. Second full apply fails with “policy already exists”. Use one-time apply or drop policies manually before re-run.
2. **Pre-existing buckets** — If `user-uploads` / `generated-assets` already exist as **public**, `on conflict do nothing` leaves them public. Fix manually in Dashboard or run `update storage.buckets set public = false where id in (...)`.
3. **Policy name collisions** — Same policy names on `storage.objects` from another migration will block apply.
4. **`profiles` no INSERT policy** — Users cannot insert their own profile via anon/authenticated client; app uses admin `upsert` in `verify-code` route. OK if all profile creation stays server-side.
5. **`generation_jobs` limited client write** — Users can INSERT own jobs; UPDATE/completion must stay on server (admin). Matches current `app/api/studio/assets/route.ts`.
6. **`auth_codes` service role required in production** — Without `SUPABASE_SERVICE_ROLE_KEY`, WhatsApp auth falls back to in-memory codes (dev only per `reports/supabase-whatsapp-auth-plan-2026-05-18.md`).
7. **No indexes** — Migration adds no indexes on `user_id`, `project_id`, `phone`, `expires_at`. Performance risk at scale, not a security blocker.
8. **`pgcrypto` extension** — `create extension if not exists "pgcrypto"` — usually fine on Supabase; requires sufficient DB privileges (normally granted).

---

## 8. Exact manual steps (Supabase SQL Editor)

### Before apply

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Confirm target project (URL matches `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`).
3. Optional: **Database → Backups** — note last backup time / trigger backup if production.
4. In **Table Editor** / **Storage**, check whether these already exist:
   - Tables: `profiles`, `studio_projects`, `studio_assets`, `generation_jobs`, `auth_codes`
   - Buckets: `user-uploads`, `generated-assets`
   - If partially applied, do **not** paste the full file again without resolving duplicates (see Risks).

### Apply

5. Go to **SQL Editor** → **New query**.
6. Copy the **entire** contents of `supabase/migrations/202605180001_stage2_saas.sql` from the repo (162 lines).
7. Paste into the editor. Do not run fragments.
8. Click **Run** (or Ctrl+Enter).
9. Expect: success with no errors. If error mentions duplicate policy/bucket, stop and inspect existing objects.

### After apply — verification queries

Run in a **new** SQL Editor query:

```sql
-- Tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'studio_projects', 'studio_assets',
    'generation_jobs', 'auth_codes'
  )
order by table_name;

-- RLS on
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles', 'studio_projects', 'studio_assets',
    'generation_jobs', 'auth_codes'
  );

-- auth_codes: no user policies
select policyname, tablename
from pg_policies
where schemaname = 'public' and tablename = 'auth_codes';

-- Buckets private
select id, name, public
from storage.buckets
where id in ('user-uploads', 'generated-assets');

-- Storage policy count (expect 8)
select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like '%upload%' or policyname like '%generated%'
order by policyname;
```

**Expected results:**

- 5 tables listed.
- All 5 with `rls_enabled = true`.
- `auth_codes`: **0 rows** in `pg_policies`.
- Both buckets: `public = false`.
- 8 storage policies on `storage.objects`.

### App env (after DB apply)

10. In project **Settings → API**, copy:
    - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
    - Publishable (anon) key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    - Service role key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never in client bundle)
11. Restart Next.js dev server so `.env.local` is picked up.
12. Smoke: WhatsApp send/verify flow and studio asset API with real Supabase (not mock session).

---

## 9. Summary checklist

- [x] No destructive DDL/DML in migration file
- [x] Only five intended `public` tables
- [x] RLS enabled on all five
- [x] `auth_codes` blocked for client roles (RLS on, no policies)
- [x] Storage buckets created with `public = false`
- [x] Storage policies scoped to `authenticated` + first path segment = `auth.uid()`
- [x] Service role not required in browser; app uses publishable key on client

**Recommendation:** Safe to apply manually once on the intended Supabase project, then run the verification queries above.
