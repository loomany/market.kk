-- Telegram visitor timeline (admin view from bot link)

create table if not exists public.telegram_visitors (
  visitor_id text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  first_traffic_source text,
  last_traffic_source text,
  first_traffic_kind text,
  locale text,
  country text,
  user_agent_summary text,
  is_bot boolean not null default false,
  bot_name text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.telegram_visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null references public.telegram_visitors(visitor_id) on delete cascade,
  session_id text not null,
  event_type text not null,
  path text not null,
  label text,
  traffic_source text,
  locale text,
  referrer text,
  user_id text,
  masked_email text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists telegram_visitor_events_visitor_created_idx
  on public.telegram_visitor_events (visitor_id, created_at desc);

create index if not exists telegram_visitor_events_session_idx
  on public.telegram_visitor_events (session_id, created_at desc);

alter table public.telegram_visitors enable row level security;
alter table public.telegram_visitor_events enable row level security;
