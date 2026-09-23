-- Mesas físicas del local + enlace opcional en reservas.

create table if not exists restaurant_tables (
  id bigint generated always as identity primary key,
  number integer not null,
  capacity integer not null default 2,
  label text not null default '',
  zone text not null default 'salon',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint restaurant_tables_number_unique unique (number),
  constraint restaurant_tables_capacity_positive check (capacity > 0),
  constraint restaurant_tables_zone_allowed check (zone in ('salon', 'ventana', 'reservada', 'barra'))
);

create index if not exists restaurant_tables_active_idx on restaurant_tables (is_active, sort_order);

alter table reservations
  add column if not exists table_id bigint references restaurant_tables(id) on delete set null;

create index if not exists reservations_table_id_idx on reservations (table_id);
create index if not exists reservations_date_table_idx on reservations (reservation_date, table_id);

insert into restaurant_tables (number, capacity, label, zone, sort_order)
values
  (1, 2, 'Mesa 1', 'ventana', 1),
  (2, 2, 'Mesa 2', 'ventana', 2),
  (3, 4, 'Mesa 3', 'salon', 3),
  (4, 4, 'Mesa 4', 'salon', 4),
  (5, 6, 'Mesa 5', 'salon', 5),
  (6, 2, 'Mesa 6', 'barra', 6),
  (7, 4, 'Mesa 7', 'salon', 7),
  (8, 2, 'Mesa 8', 'reservada', 8),
  (9, 8, 'Mesa 9', 'salon', 9),
  (10, 4, 'Mesa 10', 'salon', 10)
on conflict (number) do update set
  capacity = excluded.capacity,
  label = excluded.label,
  zone = excluded.zone,
  sort_order = excluded.sort_order,
  is_active = true;
