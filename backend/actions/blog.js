"use server";

import { revalidatePath } from "next/cache";
import { sql } from "../db";
import { requireStaff } from "../auth";
import { isPostKind, isPostStatus } from "../../lib/blog";
import { slugify, uniqueSlug } from "../../lib/slug";

function mapPost(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    body: row.body || "",
    coverImageUrl: row.cover_image_url || "",
    kind: row.kind || "news",
    status: row.status || "draft",
    authorId: row.author_id ? String(row.author_id) : null,
    authorName: row.author_name || "",
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = excludeId
      ? await sql`select id from posts where slug = ${candidate} and id <> ${excludeId} limit 1`
      : await sql`select id from posts where slug = ${candidate} limit 1`;
    if (!existing) {
      return candidate;
    }
    attempt += 1;
    candidate = `${baseSlug}-${attempt + 1}`;
  }
  return uniqueSlug(baseSlug, String(Date.now()));
}

export async function listStaffPosts() {
  await requireStaff();
  const rows = await sql`
    select
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.body,
      p.cover_image_url,
      p.kind,
      p.status,
      p.author_id,
      p.published_at,
      p.created_at,
      p.updated_at,
      trim(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) as author_name
    from posts p
    left join users u on u.id = p.author_id
    order by p.updated_at desc
  `;
  return rows.map(mapPost);
}

export async function getStaffPost(id) {
  await requireStaff();
  const postId = Number(id);
  if (!postId) return null;
  const [row] = await sql`
    select
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.body,
      p.cover_image_url,
      p.kind,
      p.status,
      p.author_id,
      p.published_at,
      p.created_at,
      p.updated_at,
      trim(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) as author_name
    from posts p
    left join users u on u.id = p.author_id
    where p.id = ${postId}
    limit 1
  `;
  return mapPost(row);
}

/** Entradas publicadas para la web (sin login). */
export async function listPublishedPosts({ limit = 24 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 50);
  const rows = await sql`
    select
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.body,
      p.cover_image_url,
      p.kind,
      p.status,
      p.author_id,
      p.published_at,
      p.created_at,
      p.updated_at,
      trim(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) as author_name
    from posts p
    left join users u on u.id = p.author_id
    where p.status = 'published'
    order by coalesce(p.published_at, p.created_at) desc
    limit ${safeLimit}
  `;
  return rows.map(mapPost);
}

export async function getPublishedPostBySlug(slug) {
  const clean = String(slug || "").trim();
  if (!clean) return null;
  const [row] = await sql`
    select
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.body,
      p.cover_image_url,
      p.kind,
      p.status,
      p.author_id,
      p.published_at,
      p.created_at,
      p.updated_at,
      trim(concat(coalesce(u.first_name, ''), ' ', coalesce(u.last_name, ''))) as author_name
    from posts p
    left join users u on u.id = p.author_id
    where p.slug = ${clean} and p.status = 'published'
    limit 1
  `;
  return mapPost(row);
}

export async function createPostAction(formData) {
  const user = await requireStaff();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 280);
  const body = String(formData.get("body") || "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") || "").trim() || null;
  const kind = String(formData.get("kind") || "news");
  const status = String(formData.get("status") || "draft");
  const slugInput = String(formData.get("slug") || "").trim();

  if (!title || !body) {
    return { ok: false, error: "Título y contenido son obligatorios" };
  }
  if (!isPostKind(kind) || !isPostStatus(status)) {
    return { ok: false, error: "Tipo o estado no válidos" };
  }

  const baseSlug = slugify(slugInput || title);
  const slug = await ensureUniqueSlug(baseSlug);
  const publishedAt = status === "published" ? new Date() : null;

  const [row] = await sql`
    insert into posts (
      title, slug, excerpt, body, cover_image_url, kind, status, author_id, published_at
    )
    values (
      ${title},
      ${slug},
      ${excerpt},
      ${body},
      ${coverImageUrl},
      ${kind},
      ${status},
      ${user.id},
      ${publishedAt}
    )
    returning id
  `;

  revalidateBlogPaths(slug);
  return { ok: true, id: String(row.id), slug };
}

export async function updatePostAction(formData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 280);
  const body = String(formData.get("body") || "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") || "").trim() || null;
  const kind = String(formData.get("kind") || "news");
  const status = String(formData.get("status") || "draft");
  const slugInput = String(formData.get("slug") || "").trim();

  if (!id || !title || !body) {
    return { ok: false, error: "Datos incompletos" };
  }
  if (!isPostKind(kind) || !isPostStatus(status)) {
    return { ok: false, error: "Tipo o estado no válidos" };
  }

  const [current] = await sql`select id, slug, status, published_at from posts where id = ${id} limit 1`;
  if (!current) {
    return { ok: false, error: "Entrada no encontrada" };
  }

  const baseSlug = slugify(slugInput || title);
  const slug = await ensureUniqueSlug(baseSlug, id);
  let publishedAt = current.published_at;
  if (status === "published" && current.status !== "published") {
    publishedAt = new Date();
  }
  if (status === "draft") {
    publishedAt = current.published_at;
  }

  await sql`
    update posts set
      title = ${title},
      slug = ${slug},
      excerpt = ${excerpt},
      body = ${body},
      cover_image_url = ${coverImageUrl},
      kind = ${kind},
      status = ${status},
      published_at = ${publishedAt}
    where id = ${id}
  `;

  revalidateBlogPaths(slug);
  if (current.slug !== slug) {
    revalidateBlogPaths(current.slug);
  }
  return { ok: true, id: String(id), slug };
}

export async function deletePostAction(formData) {
  await requireStaff();
  const id = Number(formData.get("id"));
  if (!id) {
    return { ok: false, error: "Id no válido" };
  }
  const [current] = await sql`select slug from posts where id = ${id} limit 1`;
  await sql`delete from posts where id = ${id}`;
  if (current?.slug) {
    revalidateBlogPaths(current.slug);
  } else {
    revalidatePath("/blog");
    revalidatePath("/staff/blog");
    revalidatePath("/reservation");
  }
  return { ok: true };
}

function revalidateBlogPaths(slug) {
  revalidatePath("/blog");
  revalidatePath("/staff/blog");
  revalidatePath("/reservation");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}
