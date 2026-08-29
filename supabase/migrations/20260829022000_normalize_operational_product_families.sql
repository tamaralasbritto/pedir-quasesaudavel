-- Product availability represents the product family.
-- Size-specific availability lives under ingredient rows.

insert into public.operational_availability (entity_type, entity_id, available, updated_at)
values (
  'ingredient',
  'acai-200',
  coalesce(
    (
      select available
      from public.operational_availability
      where entity_type = 'product' and entity_id = 'miniAcai'
    ),
    false
  ),
  now()
)
on conflict (entity_type, entity_id)
do update set
  available = excluded.available,
  updated_at = excluded.updated_at;

insert into public.operational_availability (entity_type, entity_id, available, updated_at)
select
  'product',
  'acai',
  coalesce(bool_or(available), false),
  now()
from public.operational_availability
where entity_type = 'product' and entity_id in ('acai', 'miniAcai')
on conflict (entity_type, entity_id)
do update set
  available = excluded.available,
  updated_at = excluded.updated_at;

insert into public.operational_availability (entity_type, entity_id, available, updated_at)
select
  'product',
  'salad',
  coalesce(bool_or(available), false),
  now()
from public.operational_availability
where entity_type = 'product' and entity_id in ('salad', 'miniSalad')
on conflict (entity_type, entity_id)
do update set
  available = excluded.available,
  updated_at = excluded.updated_at;

delete from public.operational_availability
where entity_type = 'product'
  and entity_id in ('miniAcai', 'miniSalad');
