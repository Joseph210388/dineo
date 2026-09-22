"use server";

import { randomUUID } from "node:crypto";
import { requireStaff, requireUser } from "../auth";
import { getSupabaseAdmin } from "../../lib/supabase/admin";

const BUCKETS = {
  dishes: {
    maxBytes: 5 * 1024 * 1024,
    require: "staff",
  },
  avatars: {
    maxBytes: 2 * 1024 * 1024,
    require: "user",
  },
  blog: {
    maxBytes: 5 * 1024 * 1024,
    require: "staff",
  },
};

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Sube una imagen a Supabase Storage y devuelve la URL pública.
 * formData: file (File), folder ("dishes" | "avatars")
 */
export async function uploadImage(formData) {
  const folder = String(formData.get("folder") || "dishes").trim();
  const config = BUCKETS[folder];
  if (!config) {
    return { ok: false, error: "Carpeta de subida no válida" };
  }

  let user;
  try {
    user = config.require === "staff" ? await requireStaff() : await requireUser();
  } catch (error) {
    return { ok: false, error: error.message || "No autorizado" };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return { ok: false, error: "No se recibió ninguna imagen" };
  }

  const mime = String(file.type || "").toLowerCase();
  if (!ALLOWED_TYPES.has(mime)) {
    return { ok: false, error: "Solo se admiten JPEG, PNG, WebP o GIF" };
  }
  if (file.size > config.maxBytes) {
    return {
      ok: false,
      error: `La imagen supera el límite (${Math.round(config.maxBytes / 1024 / 1024)} MB)`,
    };
  }

  const extension = extensionFromMime(mime);
  const path = `${user.id}/${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(folder).upload(path, buffer, {
      contentType: mime,
      upsert: false,
      cacheControl: "31536000",
    });

    if (error) {
      return { ok: false, error: error.message || "No se pudo subir la imagen" };
    }

    const { data } = supabase.storage.from(folder).getPublicUrl(path);
    if (!data?.publicUrl) {
      return { ok: false, error: "Subida ok, pero no se obtuvo la URL pública" };
    }

    return { ok: true, url: data.publicUrl, path, bucket: folder };
  } catch (error) {
    return { ok: false, error: error.message || "Error al subir la imagen" };
  }
}

function extensionFromMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}
