insert into public.operational_availability (entity_type, entity_id, available)
values ('ingredient', 'acai-750-pais', true)
on conflict (entity_type, entity_id) do nothing;
