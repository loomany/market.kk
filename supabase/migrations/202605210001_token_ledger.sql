-- Token balances and purchase/spend ledger (Lemon Squeezy one-time top-ups)

create table if not exists public.user_token_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_token_balances_non_negative check (balance_tokens >= 0)
);

create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  tokens integer not null,
  balance_after integer,
  amount_cents integer,
  currency text,
  provider text,
  provider_order_id text,
  provider_checkout_id text,
  provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint token_transactions_tokens_nonzero check (tokens <> 0),
  constraint token_transactions_amount_cents_non_negative check (amount_cents is null or amount_cents >= 0),
  constraint token_transactions_type_check check (
    type in ('purchase', 'spend', 'refund', 'adjustment', 'guest_free')
  )
);

create unique index if not exists token_transactions_provider_order_id_unique
  on public.token_transactions (provider_order_id)
  where provider_order_id is not null;

create unique index if not exists token_transactions_provider_event_id_unique
  on public.token_transactions (provider_event_id)
  where provider_event_id is not null;

create index if not exists token_transactions_user_created_idx
  on public.token_transactions (user_id, created_at desc);

alter table public.user_token_balances enable row level security;
alter table public.token_transactions enable row level security;

create policy "token balances own read" on public.user_token_balances
  for select using (auth.uid() = user_id);

create policy "token transactions own read" on public.token_transactions
  for select using (auth.uid() = user_id);

-- Atomic credit (idempotent on provider_order_id / provider_event_id)
create or replace function public.credit_purchased_tokens(
  p_user_id uuid,
  p_tokens integer,
  p_amount_cents integer,
  p_currency text,
  p_provider text,
  p_provider_order_id text,
  p_provider_checkout_id text,
  p_provider_event_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (credited boolean, balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_existing uuid;
begin
  if p_tokens is null or p_tokens <= 0 then
    raise exception 'invalid token amount';
  end if;

  if p_provider_order_id is not null then
    select id into v_existing from public.token_transactions
    where provider_order_id = p_provider_order_id limit 1;
    if found then
      select balance_tokens into v_balance from public.user_token_balances where user_id = p_user_id;
      return query select false, coalesce(v_balance, 0);
      return;
    end if;
  end if;

  if p_provider_event_id is not null then
    select id into v_existing from public.token_transactions
    where provider_event_id = p_provider_event_id limit 1;
    if found then
      select balance_tokens into v_balance from public.user_token_balances where user_id = p_user_id;
      return query select false, coalesce(v_balance, 0);
      return;
    end if;
  end if;

  insert into public.user_token_balances (user_id, balance_tokens)
  values (p_user_id, p_tokens)
  on conflict (user_id) do update
    set balance_tokens = public.user_token_balances.balance_tokens + excluded.balance_tokens,
        updated_at = now()
  returning balance_tokens into v_balance;

  insert into public.token_transactions (
    user_id, type, tokens, balance_after, amount_cents, currency,
    provider, provider_order_id, provider_checkout_id, provider_event_id, metadata
  ) values (
    p_user_id, 'purchase', p_tokens, v_balance, p_amount_cents, p_currency,
    p_provider, p_provider_order_id, p_provider_checkout_id, p_provider_event_id, coalesce(p_metadata, '{}'::jsonb)
  );

  return query select true, v_balance;
end;
$$;

-- Atomic spend (fails if insufficient balance)
create or replace function public.spend_user_tokens(
  p_user_id uuid,
  p_tokens integer,
  p_type text default 'spend',
  p_metadata jsonb default '{}'::jsonb
)
returns table (spent boolean, balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_debit integer;
begin
  if p_tokens is null or p_tokens <= 0 then
    raise exception 'invalid token amount';
  end if;

  v_debit := -abs(p_tokens);

  update public.user_token_balances
  set balance_tokens = balance_tokens + v_debit,
      updated_at = now()
  where user_id = p_user_id
    and balance_tokens >= abs(p_tokens)
  returning balance_tokens into v_balance;

  if not found then
    return query select false, (
      select coalesce(balance_tokens, 0) from public.user_token_balances where user_id = p_user_id
    );
    return;
  end if;

  insert into public.token_transactions (
    user_id, type, tokens, balance_after, metadata
  ) values (
    p_user_id, coalesce(nullif(p_type, ''), 'spend'), v_debit, v_balance, coalesce(p_metadata, '{}'::jsonb)
  );

  return query select true, v_balance;
end;
$$;

revoke all on function public.credit_purchased_tokens from public;
revoke all on function public.spend_user_tokens from public;

grant execute on function public.credit_purchased_tokens to service_role;
grant execute on function public.spend_user_tokens to service_role;
