-- EatTime / Taipei — esquema relacional (PostgreSQL)
-- Pensado para pegarlo en el SQL Editor de Supabase o en cualquier Postgres.
-- No usa auth.users ni Supabase Auth: las cuentas viven en public.users.
-- El backend de Next.js se conecta con DATABASE_URL (rol postgres / pooler).

-- ---------------------------------------------------------------------------
-- Utilidad: actualizar updated_at en cada UPDATE
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Usuarios (auth propia: email + hash de contraseña)
-- ---------------------------------------------------------------------------
create table if not exists users (
  id bigint generated always as identity primary key,
  email text not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  photo_url text,
  role text not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email),
  constraint users_email_format check (position('@' in email) > 1),
  constraint users_role_allowed check (role in ('customer', 'employee', 'admin'))
);

create trigger users_set_updated_at
before update on users
for each row
execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Sesiones (cookie httpOnly en el backend; no JWT suelto en localStorage)
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint sessions_token_hash_unique unique (token_hash)
);

create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);

-- ---------------------------------------------------------------------------
-- Platillos
-- ---------------------------------------------------------------------------
create table if not exists dishes (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null,
  -- numeric evita el error actual de Mongo: price como string
  price numeric(10, 2) not null,
  image_url text not null,
  category text not null,
  stock integer not null default 0,
  is_available boolean not null default true,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dishes_price_non_negative check (price >= 0),
  constraint dishes_stock_non_negative check (stock >= 0)
);

create trigger dishes_set_updated_at
before update on dishes
for each row
execute function set_updated_at();

create index if not exists dishes_category_idx on dishes (category);
create index if not exists dishes_is_available_idx on dishes (is_available);

-- Catálogo compartido: un ingrediente o alérgeno se crea una vez y se relaciona a varios platos
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

create index if not exists dish_ingredient_links_ingredient_idx on dish_ingredient_links (ingredient_id);
create index if not exists dish_allergen_links_allergen_idx on dish_allergen_links (allergen_id);

create table if not exists dish_images (
  id bigint generated always as identity primary key,
  dish_id bigint not null references dishes(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create index if not exists dish_images_dish_id_idx on dish_images (dish_id);

-- ---------------------------------------------------------------------------
-- Carrito: un carrito por usuario (en Mongo cartId era un array innecesario)
-- ---------------------------------------------------------------------------
create table if not exists carts (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_user_id_unique unique (user_id)
);

create trigger carts_set_updated_at
before update on carts
for each row
execute function set_updated_at();

create table if not exists cart_items (
  id bigint generated always as identity primary key,
  cart_id bigint not null references carts(id) on delete cascade,
  dish_id bigint not null references dishes(id) on delete cascade,
  quantity integer not null default 1,
  -- Precio al añadir: si el plato cambia de precio, el carrito no miente
  unit_price numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  constraint cart_items_quantity_positive check (quantity > 0),
  constraint cart_items_unit_price_non_negative check (unit_price >= 0),
  constraint cart_items_cart_dish_unique unique (cart_id, dish_id)
);

create index if not exists cart_items_cart_id_idx on cart_items (cart_id);
create index if not exists cart_items_dish_id_idx on cart_items (dish_id);

-- ---------------------------------------------------------------------------
-- Reservas (un usuario puede tener muchas)
-- ---------------------------------------------------------------------------
create table if not exists reservations (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  reservation_date date not null,
  reservation_time time not null,
  number_of_people integer not null default 1,
  total_price numeric(10, 2) not null default 0,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_people_positive check (number_of_people > 0),
  constraint reservations_total_non_negative check (total_price >= 0),
  constraint reservations_status_allowed check (
    status in ('pending', 'confirmed', 'cancelled', 'completed')
  )
);

create trigger reservations_set_updated_at
before update on reservations
for each row
execute function set_updated_at();

create index if not exists reservations_user_id_idx on reservations (user_id);
create index if not exists reservations_date_idx on reservations (reservation_date);
create index if not exists reservations_status_idx on reservations (status);

-- Líneas de la reserva: copiamos nombre y precio por si el plato se borra o cambia
create table if not exists reservation_items (
  id bigint generated always as identity primary key,
  reservation_id bigint not null references reservations(id) on delete cascade,
  dish_id bigint references dishes(id) on delete set null,
  dish_name text not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  constraint reservation_items_quantity_positive check (quantity > 0),
  constraint reservation_items_unit_price_non_negative check (unit_price >= 0)
);

create index if not exists reservation_items_reservation_id_idx on reservation_items (reservation_id);
create index if not exists reservation_items_dish_id_idx on reservation_items (dish_id);

-- ---------------------------------------------------------------------------
-- Cerrar la API pública de Supabase (PostgREST) si esos roles existen.
-- En un Postgres normal (Neon, VPS, local) este bloque no hace nada.
-- El frontend NO habla con Supabase: solo el backend Next.js con DATABASE_URL.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon')
     and exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table users from anon, authenticated;
    revoke all on table sessions from anon, authenticated;
    revoke all on table dishes from anon, authenticated;
    revoke all on table ingredients from anon, authenticated;
    revoke all on table allergens from anon, authenticated;
    revoke all on table dish_ingredient_links from anon, authenticated;
    revoke all on table dish_allergen_links from anon, authenticated;
    revoke all on table dish_images from anon, authenticated;
    revoke all on table carts from anon, authenticated;
    revoke all on table cart_items from anon, authenticated;
    revoke all on table reservations from anon, authenticated;
    revoke all on table reservation_items from anon, authenticated;
  end if;
end $$;

alter table users enable row level security;
alter table sessions enable row level security;
alter table dishes enable row level security;
alter table ingredients enable row level security;
alter table allergens enable row level security;
alter table dish_ingredient_links enable row level security;
alter table dish_allergen_links enable row level security;
alter table dish_images enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table reservations enable row level security;
alter table reservation_items enable row level security;
