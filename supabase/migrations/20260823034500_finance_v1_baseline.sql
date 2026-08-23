-- Finance v1: a trustworthy reporting baseline and explicit settlement timestamps.

alter table public.financial_transactions
  add column if not exists settled_at timestamptz;

update public.financial_transactions
set settled_at = coalesce(created_at, occurred_at)
where settlement_status = 'settled'
  and settled_at is null;

create or replace function public.sync_financial_settled_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.settlement_status = 'settled' then
    if old is null or old.settlement_status is distinct from 'settled' or new.settled_at is null then
      new.settled_at := coalesce(new.settled_at, now());
    end if;
  else
    new.settled_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists financial_transactions_sync_settled_at on public.financial_transactions;
create trigger financial_transactions_sync_settled_at
before insert or update of settlement_status, settled_at
on public.financial_transactions
for each row
execute function public.sync_financial_settled_at();

create index if not exists financial_transactions_settled_at_idx
  on public.financial_transactions(settled_at)
  where settlement_status = 'settled';

create table if not exists public.finance_settings (
  id smallint primary key default 1 check (id = 1),
  reporting_start_at timestamptz not null,
  cash_baseline_at timestamptz not null,
  cash_baseline_cents integer not null check (cash_baseline_cents >= 0),
  updated_at timestamptz not null default now()
);

alter table public.finance_settings enable row level security;
revoke all on table public.finance_settings from anon, authenticated;
grant all on table public.finance_settings to service_role;

comment on table public.finance_settings is
  'Singleton finance configuration. reporting_start_at starts the trusted reporting era; cash_baseline anchors the real free cash reported by the owner.';
