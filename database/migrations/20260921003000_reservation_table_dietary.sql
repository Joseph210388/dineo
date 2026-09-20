-- 2026-09-21 — mesa y dietética en reservas del cliente
alter table reservations
  add column if not exists table_type text not null default 'salon';

alter table reservations
  add column if not exists dietary_note text not null default 'none';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reservations_table_type_allowed'
  ) then
    alter table reservations
      add constraint reservations_table_type_allowed
      check (table_type in ('salon', 'ventana', 'reservada', 'barra'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reservations_dietary_note_allowed'
  ) then
    alter table reservations
      add constraint reservations_dietary_note_allowed
      check (dietary_note in ('none', 'gluten', 'lactosa', 'marisco', 'frutos_secos', 'otra'));
  end if;
end $$;
