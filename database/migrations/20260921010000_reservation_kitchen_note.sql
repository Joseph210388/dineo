-- 2026-09-21 — nota libre para cocina (sin sal, diabetes, etc.)
alter table reservations
  add column if not exists kitchen_note text not null default '';
