-- Buckets públicos de imágenes (Supabase Storage).
-- Las subidas las hace el servidor con service_role; aquí solo lectura pública.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dishes',
  'dishes',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read dishes images" on storage.objects;
create policy "Public read dishes images"
on storage.objects
for select
to public
using (bucket_id = 'dishes');

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');
