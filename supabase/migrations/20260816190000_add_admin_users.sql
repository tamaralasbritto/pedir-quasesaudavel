create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant all on public.admin_users to service_role;

comment on table public.admin_users is
  'Usuários autorizados a acessar a área administrativa. Acesso somente via server functions autenticadas.';
