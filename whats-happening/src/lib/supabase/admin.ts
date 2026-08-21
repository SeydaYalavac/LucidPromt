import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | undefined;

function getSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!rawUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  // Supabase client'a yalnızca proje URL'sini ver.
  // Eğer secret yanlışlıkla /rest/v1/ içeriyorsa temizle.
  const url = rawUrl
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      `Invalid Supabase project URL: ${url}. Expected format: https://<project-ref>.supabase.co`,
    );
  }

  return url;
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();

  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is not configured",
    );
  }

  admin ??= createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return admin;
}
