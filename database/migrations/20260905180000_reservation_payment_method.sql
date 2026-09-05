-- 2026-09-05 — forma de pago en reservas (local por defecto; tarjeta y Bizum son demo)

alter table reservations
  add column if not exists payment_method text not null default 'local';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reservations_payment_method_allowed'
  ) then
    alter table reservations
      add constraint reservations_payment_method_allowed
      check (payment_method in ('local', 'card', 'bizum'));
  end if;
end $$;
