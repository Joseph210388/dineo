# Base de datos DINEO / Taipei

Supabase es solo el **host de Postgres** de ahora. La app no usa Auth, Storage ni la API de Supabase. El backend se conecta con `DATABASE_URL`.

Cuando toque mudarse a otro servidor (Neon, Railway, un VPS, Postgres local), este folder es la copia de seguridad del diseño.

## Qué archivo usar

| Archivo | Para qué |
|---|---|
| `schema.sql` | **Estado actual.** Postgres vacío en cualquier host. |
| `seed.sql` | Nombres de ejemplo de ingredientes y alérgenos. |
| `migrations/` | **Historia** de lo que se aplicó en Supabase. No hace falta para un host nuevo. |

Un host nuevo = `schema.sql` + `seed.sql`.  
Una base que ya existe = el siguiente `.sql` de `migrations/`, y luego actualizar `schema.sql`.

## Proyecto Supabase actual (2026-09-05)

- Nombre: `taipei`
- Id: `tpyygppuszvhpupnvmxp`
- Región: `eu-west-1` (Irlanda)
- Postgres: 17
- Host directo: `db.tpyygppuszvhpupnvmxp.supabase.co:5432`
- Migraciones ya aplicadas en ese proyecto:
  1. `20260904231251_dish_popup_details`
  2. `20260905001016_add_ingredient_allergen_catalogs`

La primera instalación (usuarios, platos, carrito, reservas) se hizo a mano el 2026-09-03/04. Quedó reconstruida en `migrations/20260903_initial_public_schema.sql`.

## Tablas que usa la app

- `users`, `sessions` — cuentas propias (bcrypt + cookie)
- `dishes`, `dish_images` — carta
- `ingredients`, `allergens` — catálogos
- `dish_ingredient_links`, `dish_allergen_links` — plato ↔ catálogo
- `carts`, `cart_items`
- `reservations`, `reservation_items`

## Tablas viejas (solo en Supabase, no crearlas en un host nuevo)

Siguen en el proyecto `taipei`, vacías, y el código ya no las toca:

- `dish_ingredients` (nombre suelto por plato)
- `dish_allergens` (nombre suelto por plato)

Cuando se confirme que nadie las necesita: `drop table dish_ingredients, dish_allergens;`

## Cómo copiar los datos a otro Postgres

1. En el host nuevo, crea una base vacía (Postgres 15 o 17).
2. Ejecuta `schema.sql` y `seed.sql`.
3. Exporta solo el esquema `public` de Supabase (sin `auth`, `storage`, `realtime`):

```bash
pg_dump --schema=public --data-only --no-owner --no-privileges ^
  "postgresql://postgres:CLAVE@db.tpyygppuszvhpupnvmxp.supabase.co:5432/postgres" ^
  -f taipei-data.sql
```

4. Importa `taipei-data.sql` en el host nuevo.
5. Cambia `DATABASE_URL` en `.env.local` y en Vercel.
6. No copies roles `anon` / `authenticated`: son de Supabase. El bloque del final de `schema.sql` no hace nada si esos roles no existen.

## Cada vez que cambie la base

1. Escribir un archivo nuevo en `migrations/` con fecha `YYYYMMDDHHMMSS_nombre.sql`.
2. Actualizar `schema.sql` para que un Postgres vacío quede igual.
3. Si hay datos de ejemplo, tocar `seed.sql`.
4. Anotar el día en `CHANGE.md` (local) y una línea aquí abajo.

## Diario de la base

- **2026-09-03** — Proyecto Supabase `taipei`. Tablas: users, sessions, dishes, dish_ingredients, carts, cart_items, reservations, reservation_items.
- **2026-09-04** — `recommendation` en dishes; tablas `dish_allergens` y `dish_images`.
- **2026-09-05** — Catálogos `ingredients` y `allergens` + tablas de enlace. Las tablas viejas de nombres sueltos se dejan, pero la app ya no las usa.
