-- 2026-09-04 — aplicada en Supabase como dish_popup_details
-- Copia fiel de supabase_migrations.schema_migrations

alter table dishes add column if not exists recommendation text;

create table if not exists dish_allergens (
  id bigint generated always as identity primary key,
  dish_id bigint not null references dishes(id) on delete cascade,
  name text not null,
  constraint dish_allergens_unique unique (dish_id, name)
);

create index if not exists dish_allergens_dish_id_idx on dish_allergens (dish_id);

create table if not exists dish_images (
  id bigint generated always as identity primary key,
  dish_id bigint not null references dishes(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create index if not exists dish_images_dish_id_idx on dish_images (dish_id);

alter table dish_allergens enable row level security;
alter table dish_images enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table dish_allergens from anon, authenticated;
    revoke all on table dish_images from anon, authenticated;
  end if;
end $$;
