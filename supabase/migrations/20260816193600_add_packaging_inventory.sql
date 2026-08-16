create table if not exists public.packaging_inventory (
  size_ml integer primary key check (size_ml > 0),
  cups_count integer not null default 0 check (cups_count >= 0),
  lids_count integer not null default 0 check (lids_count >= 0),
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.packaging_inventory enable row level security;

comment on table public.packaging_inventory is
  'Estoque operacional de copos e tampas da QUASE!. A quantidade de embalagens completas é o menor valor entre cups_count e lids_count.';
