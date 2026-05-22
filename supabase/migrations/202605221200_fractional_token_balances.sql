-- Fractional token balances (align billing with USD-based cost estimates, e.g. 0.52 tokens)

alter table public.user_token_balances
  alter column balance_tokens type numeric(14, 4) using balance_tokens::numeric(14, 4);

alter table public.token_transactions
  alter column tokens type numeric(14, 4) using tokens::numeric(14, 4),
  alter column balance_after type numeric(14, 4) using balance_after::numeric(14, 4);

create or replace function public.credit_purchased_tokens(
  p_user_id uuid,
  p_tokens numeric,
  p_amount_cents integer,
  p_currency text,
  p_provider text,
  p_provider_order_id text,
  p_provider_checkout_id text,
  p_provider_event_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (credited boolean, balance_after numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
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

create or replace function public.spend_user_tokens(
  p_user_id uuid,
  p_tokens numeric,
  p_type text default 'spend',
  p_metadata jsonb default '{}'::jsonb
)
returns table (spent boolean, balance_after numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_debit numeric;
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
