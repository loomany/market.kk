create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  whatsapp_phone text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Новый проект',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.studio_projects(id) on delete set null,
  type text not null,
  source_url text,
  result_url text not null,
  storage_path text,
  provider text,
  model text,
  request_id text,
  prompt text,
  enhanced_prompt text,
  settings jsonb not null default '{}'::jsonb,
  estimated_cost numeric,
  actual_cost numeric,
  status text not null default 'ready',
  created_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  asset_id uuid references public.studio_assets(id) on delete set null,
  type text not null,
  provider text,
  model text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb,
  estimated_cost numeric,
  status text not null default 'pending',
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.auth_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.studio_projects enable row level security;
alter table public.studio_assets enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.auth_codes enable row level security;

create policy "profiles own read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles own update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "projects own all" on public.studio_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "assets own all" on public.studio_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "jobs own read" on public.generation_jobs
  for select using (auth.uid() = user_id);

create policy "jobs own insert" on public.generation_jobs
  for insert with check (auth.uid() = user_id);

-- auth_codes is service-role only. No user policies are intentionally created.

insert into storage.buckets (id, name, public)
values
  ('user-uploads', 'user-uploads', false),
  ('generated-assets', 'generated-assets', false)
on conflict (id) do nothing;

create policy "user uploads read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "user uploads write own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "user uploads update own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "user uploads delete own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "generated assets read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "generated assets write own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "generated assets update own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "generated assets delete own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'generated-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
