-- Blog del local: entradas publicables por el staff.
-- Bucket Storage `blog` para portadas.

create table if not exists posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body text not null,
  cover_image_url text,
  kind text not null default 'news',
  status text not null default 'draft',
  author_id bigint references users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_unique unique (slug),
  constraint posts_kind_allowed check (kind in ('news', 'promo', 'dish', 'event')),
  constraint posts_status_allowed check (status in ('draft', 'published')),
  constraint posts_title_not_empty check (char_length(trim(title)) > 0),
  constraint posts_body_not_empty check (char_length(trim(body)) > 0)
);

create trigger posts_set_updated_at
before update on posts
for each row
execute function set_updated_at();

create index if not exists posts_status_published_at_idx
  on posts (status, published_at desc);

create index if not exists posts_kind_idx on posts (kind);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog',
  'blog',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images"
on storage.objects
for select
to public
using (bucket_id = 'blog');
