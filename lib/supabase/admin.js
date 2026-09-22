import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Storage solo en el servidor (service role).
 * Nunca importar esto en componentes "use client".
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Falta SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) en el entorno");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Cópiala en Supabase → Project Settings → API → service_role"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabasePublicUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
}
