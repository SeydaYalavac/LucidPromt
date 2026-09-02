"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  PENDING_AUTH_REDIRECT_KEY,
  readPendingAuthRedirect,
} from "@/lib/pending-auth-redirect";

export function AuthReturnRedirect() {
  const pathname = usePathname();
  const { supabase, session, isLoading } = useAuthSession();
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (
      pathname !== "/" ||
      isLoading ||
      !supabase ||
      !session ||
      isRedirecting.current
    ) {
      return;
    }

    const redirectPath = readPendingAuthRedirect(
      session.user.user_metadata[PENDING_AUTH_REDIRECT_KEY],
    );
    if (!redirectPath) return;

    isRedirecting.current = true;
    void supabase.auth
      .updateUser({ data: { [PENDING_AUTH_REDIRECT_KEY]: null } })
      .finally(() => window.location.replace(redirectPath));
  }, [isLoading, pathname, session, supabase]);

  return null;
}
