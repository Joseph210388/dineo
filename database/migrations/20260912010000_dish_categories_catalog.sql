-- Categorías de carta (catálogo). Los platos siguen guardando el nombre en dishes.category.
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint categories_name_unique unique (name)
);

insert into categories (name)
select distinct trim(category)
from dishes
where trim(category) <> ''
on conflict (name) do nothing;

insert into categories (name)
values ('Entradas'), ('Principales'), ('Postres'), ('Bebidas')
on conflict (name) do nothing;

create index if not exists categories_name_idx on categories (name);

alter table categories enable row level security;
