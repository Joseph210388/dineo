-- Datos de arranque para un Postgres nuevo (después de schema.sql).
-- Idempotente: se puede ejecutar más de una vez.

insert into ingredients (name)
values ('Papa'), ('Limón'), ('Ají'), ('Cebolla'), ('Ajo'), ('Cilantro'), ('Tomate'), ('Arroz')
on conflict (name) do nothing;

insert into allergens (name)
values ('Gluten'), ('Lácteos'), ('Huevo'), ('Pescado'), ('Marisco'), ('Soja'), ('Frutos secos'), ('Sulfitos')
on conflict (name) do nothing;
