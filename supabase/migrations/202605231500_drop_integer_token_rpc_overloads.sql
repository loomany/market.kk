-- Remove legacy integer overloads so PostgREST can resolve fractional (numeric) RPCs.

drop function if exists public.spend_user_tokens(uuid, integer, text, jsonb);

drop function if exists public.credit_purchased_tokens(
  uuid,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text,
  jsonb
);

grant execute on function public.spend_user_tokens(uuid, numeric, text, jsonb) to service_role;
grant execute on function public.credit_purchased_tokens(
  uuid,
  numeric,
  integer,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to service_role;
