-- Soft-delete de mesas + duración estimada por comensal.

alter table restaurant_tables
  add column if not exists deleted boolean not null default false;

create index if not exists restaurant_tables_deleted_idx
  on restaurant_tables (deleted, is_active);

create table if not exists restaurant_settings (
  id integer primary key default 1 check (id = 1),
  minutes_per_person integer not null default 45,
  min_duration_minutes integer not null default 60,
  max_duration_minutes integer not null default 180,
  buffer_minutes integer not null default 15,
  updated_at timestamptz not null default now(),
  constraint restaurant_settings_minutes_positive check (
    minutes_per_person > 0
    and min_duration_minutes > 0
    and max_duration_minutes >= min_duration_minutes
    and buffer_minutes >= 0
  )
);

insert into restaurant_settings (id, minutes_per_person, min_duration_minutes, max_duration_minutes, buffer_minutes)
values (1, 45, 60, 180, 15)
on conflict (id) do nothing;

alter table reservations
  add column if not exists duration_minutes integer;

update reservations
set duration_minutes = greatest(60, least(180, number_of_people * 45))
where duration_minutes is null;

alter table reservations
  alter column duration_minutes set default 90;

alter table reservations
  alter column duration_minutes set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reservations_duration_positive'
  ) then
    alter table reservations
      add constraint reservations_duration_positive check (duration_minutes > 0);
  end if;
end $$;
