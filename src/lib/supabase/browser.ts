"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabasePublishableKey, supabaseUrl } = getSupabaseConfig();

  browserClient = createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
  return browserClient;
}
