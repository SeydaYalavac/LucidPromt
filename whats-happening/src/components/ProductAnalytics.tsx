"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import {
  captureProductEvent,
  identifyProductUser,
  resetProductUser,
  stableRouteName,
} from "@/lib/analytics";

let lastPageViewPath: string | null = null;

export function ProductAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (lastPageViewPath === pathname) return;
    lastPageViewPath = pathname;
    captureProductEvent("$pageview", {
      route: stableRouteName(pathname),
      $current_url: `${window.location.origin}${pathname}`,
    });
  }, [pathname]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) identifyProductUser(data.session.user.id);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (session) {
        identifyProductUser(session.user.id);
        if (event === "SIGNED_IN") {
          captureProductEvent("user_authenticated", {
            provider:
              typeof session.user.app_metadata.provider === "string"
                ? session.user.app_metadata.provider
                : "unknown",
          });
        }
      } else if (event === "SIGNED_OUT") {
        resetProductUser();
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}
