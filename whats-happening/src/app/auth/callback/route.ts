import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/auth-redirect";

function authErrorRedirect(origin: string, message: string) {
  const target = new URL("/auth", origin);
  target.searchParams.set("mode", "signin");
  target.searchParams.set("error", message.slice(0, 240));
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error_description");
  const next = getSafeRedirect(url.searchParams.get("next"));
  if (providerError) return authErrorRedirect(url.origin, providerError);

  const response = NextResponse.redirect(new URL(next, url.origin));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return authErrorRedirect(url.origin, "Authentication isn’t configured yet.");
  }
  if (!code) return authErrorRedirect(url.origin, "The sign-in link is missing or expired.");

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return authErrorRedirect(url.origin, error.message);
  return response;
}
