create table if not exists public.operational_availability (
  entity_type text not null check (entity_type in ('store','product','ingredient')),
  entity_id text not null,
  available boolean not null,
  updated_at timestamptz not null default now(),
  primary key (entity_type, entity_id)
);

alter table public.operational_availability enable row level security;

revoke all on public.operational_availability from anon, authenticated;
grant select on public.operational_availability to anon, authenticated;
grant all on public.operational_availability to service_role;

drop policy if exists "Public can read operational availability" on public.operational_availability;
create policy "Public can read operational availability"
on public.operational_availability
for select
to anon, authenticated
using (true);

insert into public.operational_availability (entity_type, entity_id, available) values
  ('store','store',true),
  ('product','miniSalad',false),
  ('product','salad',false),
  ('product','acai',true),
  ('product','miniAcai',true),
  ('product','fruitSalad',false),
  ('product','sandwich',false),
  ('ingredient','salada-300',true),
  ('ingredient','salada-500',true),
  ('ingredient','salada-750',true),
  ('ingredient','comp-alface',false),
  ('ingredient','comp-cebola-roxa',false),
  ('ingredient','comp-pepino',false),
  ('ingredient','comp-tomate',false),
  ('ingredient','comp-cenoura',false),
  ('ingredient','comp-ovo-codorna',false),
  ('ingredient','comp-milho',false),
  ('ingredient','comp-manga',false),
  ('ingredient','comp-tomate-cereja',false),
  ('ingredient','comp-rucula',false),
  ('ingredient','comp-brocolis',false),
  ('ingredient','prot-frango-desfiado',false),
  ('ingredient','prot-ovo',false),
  ('ingredient','prot-soja',false),
  ('ingredient','molho-creme-milho',false),
  ('ingredient','molho-iogurte-ervas',false),
  ('ingredient','molho-vinagrete-classico',false),
  ('ingredient','molho-mostarda-mel',false),
  ('ingredient','extra-croutons',false),
  ('ingredient','extra-queijo-parmesao',false),
  ('ingredient','extra-castanhas',false),
  ('ingredient','extra-sementes',false),
  ('ingredient','acai-300',true),
  ('ingredient','acai-400',true),
  ('ingredient','acai-500',true),
  ('ingredient','acai-fruta-morango',false),
  ('ingredient','acai-fruta-banana',true),
  ('ingredient','acai-fruta-uva',false),
  ('ingredient','acai-fruta-melancia',false),
  ('ingredient','acai-fruta-melao',false),
  ('ingredient','acai-fruta-mamao',false),
  ('ingredient','calda-morango',true),
  ('ingredient','calda-leite-condensado',true),
  ('ingredient','calda-chocolate',true),
  ('ingredient','acai-leite-po',true),
  ('ingredient','acai-sucrilhos',true),
  ('ingredient','acai-cereal-nescau',true),
  ('ingredient','acai-amendoim',true),
  ('ingredient','acai-jujuba',true),
  ('ingredient','acai-farinha-lactea',false),
  ('ingredient','acai-pacoca',false),
  ('ingredient','acai-maria-mole',true),
  ('ingredient','acai-mms',true),
  ('ingredient','acai-gotas-chocolate',true),
  ('ingredient','acai-canudinho',false),
  ('ingredient','acai-granola',true),
  ('ingredient','frutas-500',true),
  ('ingredient','sf-banana',false),
  ('ingredient','sf-melao',false),
  ('ingredient','sf-mamao',false),
  ('ingredient','sf-maca',false),
  ('ingredient','sf-uva',false),
  ('ingredient','sf-manga',false),
  ('ingredient','sf-kiwi',false),
  ('ingredient','sf-abacaxi',false),
  ('ingredient','sf-morango',false),
  ('ingredient','sf-granola',false),
  ('ingredient','sf-leite-condensado',false),
  ('ingredient','sf-leite-po',false)
on conflict (entity_type, entity_id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'operational_availability'
  ) then
    alter publication supabase_realtime add table public.operational_availability;
  end if;
end $$;
