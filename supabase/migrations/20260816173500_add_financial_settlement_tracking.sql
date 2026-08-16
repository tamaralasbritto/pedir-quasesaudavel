alter table public.financial_transactions
  add column if not exists settlement_status text not null default 'settled'
    check (settlement_status in ('pending','settled','cancelled')),
  add column if not exists account_scope text not null default 'business'
    check (account_scope in ('business','external'));

create index if not exists financial_transactions_settlement_status_idx
  on public.financial_transactions (settlement_status);

create index if not exists financial_transactions_account_scope_idx
  on public.financial_transactions (account_scope);

comment on column public.financial_transactions.settlement_status is
  'pending = pedido lançado mas pagamento ainda não confirmado; settled = dinheiro confirmado; cancelled = não entra nos cálculos';

comment on column public.financial_transactions.account_scope is
  'business = movimentou a conta da QUASE!; external = ocorreu fora da conta da QUASE!';
