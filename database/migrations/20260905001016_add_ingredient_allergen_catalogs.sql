-- 2026-09-05 — aplicada en Supabase como add_ingredient_allergen_catalogs
-- Copia fiel de supabase_migrations.schema_migrations

create table if not exists ingredients (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint ingredients_name_unique unique (name)
);

create table if not exists allergens (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint allergens_name_unique unique (name)
);

create table if not exists dish_ingredient_links (
  dish_id bigint not null references dishes(id) on delete cascade,
  ingredient_id bigint not null references ingredients(id) on delete cascade,
  primary key (dish_id, ingredient_id)
);

create table if not exists dish_allergen_links (
  dish_id bigint not null references dishes(id) on delete cascade,
  allergen_id bigint not null references allergens(id) on delete cascade,
  primary key (dish_id, allergen_id)
);

insert into ingredients (name)
select distinct trim(name)
from dish_ingredients
where trim(name) <> ''
on conflict (name) do nothing;

insert into allergens (name)
select distinct trim(name)
from dish_allergens
where trim(name) <> ''
on conflict (name) do nothing;

insert into ingredients (name)
values ('Papa'), ('Limón'), ('Ají'), ('Cebolla'), ('Ajo'), ('Cilantro'), ('Tomate'), ('Arroz')
on conflict (name) do nothing;

insert into allergens (name)
values ('Gluten'), ('Lácteos'), ('Huevo'), ('Pescado'), ('Marisco'), ('Soja'), ('Frutos secos'), ('Sulfitos')
on conflict (name) do nothing;

insert into dish_ingredient_links (dish_id, ingredient_id)
select distinct di.dish_id, i.id
from dish_ingredients di
inner join ingredients i on lower(i.name) = lower(trim(di.name))
on conflict do nothing;

insert into dish_allergen_links (dish_id, allergen_id)
select distinct da.dish_id, a.id
from dish_allergens da
inner join allergens a on lower(a.name) = lower(trim(da.name))
on conflict do nothing;

create index if not exists dish_ingredient_links_ingredient_idx on dish_ingredient_links (ingredient_id);
create index if not exists dish_allergen_links_allergen_idx on dish_allergen_links (allergen_id);

alter table ingredients enable row level security;
alter table allergens enable row level security;
alter table dish_ingredient_links enable row level security;
alter table dish_allergen_links enable row level security;
