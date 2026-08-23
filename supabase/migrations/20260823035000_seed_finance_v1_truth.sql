-- Instance truth for the QUASE! finance v1 reset.
-- Reporting starts on 21/08/2026. The owner-reported free cash balance was R$22.18
-- immediately before order #28 was created.

insert into public.finance_settings (
  id,
  reporting_start_at,
  cash_baseline_at,
  cash_baseline_cents,
  updated_at
)
values (
  1,
  '2026-08-21 03:00:00+00'::timestamptz,
  '2026-08-23 00:17:00+00'::timestamptz,
  2218,
  now()
)
on conflict (id) do update set
  reporting_start_at = excluded.reporting_start_at,
  cash_baseline_at = excluded.cash_baseline_at,
  cash_baseline_cents = excluded.cash_baseline_cents,
  updated_at = now();

-- R$350 for the computer was third-party money, already moved out of the
-- operating account. It must not affect QUASE! finance indicators.
update public.financial_transactions
set
  account_scope = 'external',
  metadata = metadata || jsonb_build_object(
    'finance_v1_excluded', true,
    'finance_v1_reason', 'third_party_computer_money'
  )
where id = 'e2c7ca05-628b-492b-b31d-3343bf857268';

update public.financial_reserves
set
  status = 'released',
  released_at = coalesce(released_at, '2026-08-23 00:17:00+00'::timestamptz),
  notes = coalesce(notes, '') || ' Encerrada no reset financeiro v1: valor de terceiros já transferido para outra conta.'
where id = '78e2a801-c466-40dd-b26a-0edfa3c5a274';
